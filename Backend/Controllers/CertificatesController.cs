using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Azure;
using Azure.AI.FormRecognizer.DocumentAnalysis;
using Backend.Data;
using Backend.Models;
using Backend.Schemas;
using Backend.Services;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using System.Text.Json;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CertificatesController> _logger;
        private readonly IMessageSenderService _messageSender;
        private readonly DocumentAnalysisClient _analysisClient;
        private readonly IBlobService _blobService;
        private readonly IConfiguration _configuration;

        public CertificatesController(
            IBlobService blobService,
            ApplicationDbContext context, 
            ILogger<CertificatesController> logger, 
            IMessageSenderService messageSender,
            DocumentAnalysisClient analysisClient,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _messageSender = messageSender;
            _analysisClient = analysisClient;
            _blobService    = blobService;
            _configuration = configuration; 
        }
        
        // GET: api/certificates?offset=0&limit=10
        [HttpGet]
        public async Task<IActionResult> GetCertificates(
            [FromQuery] int offset = 0,
            [FromQuery] int? limit = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("User ID not found in claims.");
                return Unauthorized("User ID not found.");
            }

            // Base query: only this user's certificates, include catalog for Name
            var query = _context.Certificates
                .Include(c => c.CertificateCatalog)
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Id)    // ensure deterministic paging
                .AsQueryable();

            // total before paging
            var totalCertificates = await query.CountAsync();

            // apply paging
            var paged = query.Skip(offset);
            if (limit.HasValue)
                paged = paged.Take(limit.Value);

            var certificates = await paged.ToListAsync();

            // project results
            var items = certificates.Select(c => new 
            {
                c.Id,
                c.CertificateCatalogId,
                c.CertifiedDate,
                c.ValidTill,
                c.UserId,
                CertificateName = c.CertificateCatalog?.CertificateName,
                c.DocumentUrl
            });

            return Ok(new
            {
                TotalCertificates = totalCertificates,
                Offset = offset,
                Limit = limit,
                Records = items
            });
        }

        
        // GET: api/certificates/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCertificateById(int id)
        {
            var certificate = await _context.Certificates
                .Include(c => c.CertificateCatalog)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (certificate == null)
            {
                _logger.LogWarning("Certificate with id {Id} not found.", id);
                return NotFound();
            }
            
            var result = new 
            {
                certificate.Id,
                certificate.CertificateCatalogId,
                certificate.CertifiedDate,
                certificate.ValidTill,
                certificate.UserId,
                CertificateName = certificate.CertificateCatalog != null ? certificate.CertificateCatalog.CertificateName : null
            };
            
            return Ok(result);
        }
        
        // POST: api/certificates/add
        // Employee adds a certificate by selecting a catalog entry.
        [HttpPost("add")]
        public async Task<IActionResult> AddCertificate([FromBody] EmployeeCertificateCreateRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid certificate creation request.");
                return BadRequest(ModelState);
            }

            // Verify the catalog entry exists.
            var catalogEntry = await _context.CertificateCatalogs.FindAsync(request.CertificateCatalogId);
            if (catalogEntry == null)
            {
                _logger.LogWarning("Catalog entry with id {Id} not found.", request.CertificateCatalogId);
                return BadRequest("Invalid certificate catalog ID.");
            }

            var certificate = new Certificate
            {
                CertificateCatalogId = request.CertificateCatalogId,
                CertifiedDate = request.CertifiedDate,
                ValidTill = request.ValidTill,
                UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            };

            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Certificate created for user {UserId} using catalog entry {CatalogId}.", certificate.UserId, request.CertificateCatalogId);

            // Build JSON payload for the Service Bus message.
            // Retrieve user's email from the claims.
            var payload = new 
            { 
                type = "certificate",
                firstName = User.FindFirstValue("FirstName"),
                lastName = User.FindFirstValue("LastName"),
                email = User.FindFirstValue(ClaimTypes.Email),
                certificate = catalogEntry.CertificateName 
            };
            var messageContent = JsonSerializer.Serialize(payload);
            
            try
            {
                await _messageSender.SendMessageAsync(messageContent);
                _logger.LogInformation("Service Bus message sent: {MessageContent}", messageContent);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Failed to send Service Bus message, but certificate stored.");
            }

            return CreatedAtAction(nameof(GetCertificateById), new { id = certificate.Id }, certificate);
        }

        // POST: api/certificates/upload
        [HttpPost("upload")]
        [RequestSizeLimit(10_000_000)] // 10 MB max
        public async Task<IActionResult> ExtractCertificateText(IFormFile file)
        {
            // 1) validation
            if (file == null || file.Length == 0)
                return BadRequest("Please upload a non-empty PDF file.");

            if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)
                || Path.GetExtension(file.FileName).ToLower() != ".pdf")
            {
                return BadRequest("Only PDF files are allowed.");
            }

            // 2) figure out who owns this file
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (String.IsNullOrEmpty(userId))
                return Unauthorized("User not identified.");

            // 3) upload it into blob storage under a per‑user folder                        
            var ext       = Path.GetExtension(file.FileName);
            var blobName  = $"certificates/{userId}/{Guid.NewGuid()}{ext}";
            var container = _configuration["AzureBlobStorage:CertificateFilesContainer"];
            if (string.IsNullOrWhiteSpace(container))
                return StatusCode(StatusCodes.Status500InternalServerError, "CertificateFilesContainer is not configured.");
            
            string blobUrl;
            try
            {
                blobUrl = await _blobService.UploadFileAsync(file, blobName, container);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file to blob storage.");
                // fail the request or proceed without analysis?
                return StatusCode(500, "Failed to store file.");
            }

            // 4) copy into a memory stream so we can both upload AND analyze
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;

            // 5) run the FormRecognizer “prebuilt-read” model and wait for completion
            AnalyzeDocumentOperation operation;
            try
            {
                operation = await _analysisClient
                    .AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-read", ms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Form‐recognizer analysis failed.");
                // but we already stored the blob ok, so return the blob url to the client
                return Ok(new {
                  fileName = file.FileName,
                  blobUrl,
                  lines = Array.Empty<string>(), 
                  pageCount = 0,
                  warning = "Analysis failed, but file was stored."
                });
            }

            var result = operation.Value;

            // 6) pull out all lines of text
            var lines = result.Pages
                              .SelectMany(p => p.Lines)
                              .Select(l => l.Content)
                              .ToList();

            // heuristics to pick out the three fields
            // 1) CertificateName: look for the line containing "Microsoft Certified"
            var certName = lines.FirstOrDefault(l => l.StartsWith("Microsoft Certified", StringComparison.OrdinalIgnoreCase))
                        ?? "Unknown Certificate";

            // 2) IssueDate: look for "Earned on:" or similar
            var issueLine = lines.FirstOrDefault(l => l.StartsWith("Earned on", StringComparison.OrdinalIgnoreCase));
            // split on ':' to get date portion
            var issueDate = issueLine?.Split(':', 2)[1].Trim() ?? "Unknown";

            // 3) ExpiryDate: look for "Expires on:" or similar
            var expiryLine = lines.FirstOrDefault(l =>
                l.StartsWith("Expires on", StringComparison.OrdinalIgnoreCase) ||
                l.StartsWith("Expired on",  StringComparison.OrdinalIgnoreCase));
            var expiryDate = expiryLine?.Split(':', 2)[1].Trim() ?? "Unknown";                        

            // 7) return both the URL and the extracted text
            return Ok(new
            {
                documentUrl = blobUrl,
                CertificateName = certName,
                IssueDate       = issueDate,
                ExpiryDate      = expiryDate
            });
        }
        
        // PUT: api/certificates/{id}
        // Update the certificate dates and/or catalog reference.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCertificate(int id, [FromBody] EmployeeCertificateCreateRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid certificate update request.");
                return BadRequest(ModelState);
            }

            var certificate = await _context.Certificates.FindAsync(id);
            if (certificate == null)
            {
                _logger.LogWarning("Certificate with id {Id} not found.", id);
                return NotFound();
            }

            // Ensure the certificate belongs to the current user.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (certificate.UserId != userId)
            {
                _logger.LogWarning("User {UserId} is not authorized to update certificate {Id}.", userId, id);
                return Forbid();
            }

            // Verify new catalog entry exists.
            var catalogEntry = await _context.CertificateCatalogs.FindAsync(request.CertificateCatalogId);
            if (catalogEntry == null)
            {
                _logger.LogWarning("Catalog entry with id {Id} not found.", request.CertificateCatalogId);
                return BadRequest("Invalid certificate catalog ID.");
            }

            certificate.CertificateCatalogId = request.CertificateCatalogId;
            certificate.CertifiedDate = request.CertifiedDate;
            certificate.ValidTill = request.ValidTill;

            _context.Entry(certificate).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Certificate {Id} updated successfully.", certificate.Id);

                var payload = new 
                {
                    type = "update",
                    firstName = User.FindFirstValue("FirstName"),
                    lastName = User.FindFirstValue("LastName"),
                    email = User.FindFirstValue(ClaimTypes.Email),
                    certificate = catalogEntry.CertificateName 
                };
                var messageContent = JsonSerializer.Serialize(payload);
                try
                {
                    await _messageSender.SendMessageAsync(messageContent);
                    _logger.LogInformation("Service Bus message sent: {MessageContent}", messageContent);
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Service Bus message on update, but certificate stored.");
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertificateExists(id))
                {
                    _logger.LogWarning("Certificate {Id} not found during update.", id);
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }
        
        // DELETE: api/certificates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCertificate(int id)
        {
            var certificate = await _context.Certificates.FindAsync(id);
            if (certificate == null)
            {
                _logger.LogWarning("Certificate {Id} not found for deletion.", id);
                return NotFound();
            }

            // Ensure the certificate belongs to the current user.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (certificate.UserId != userId)
            {
                _logger.LogWarning("User {UserId} is not authorized to delete certificate {Id}.", userId, id);
                return Forbid();
            }

            _context.Certificates.Remove(certificate);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Certificate {Id} deleted successfully.", id);
            return NoContent();
        }
        
        private bool CertificateExists(int id)
        {
            return _context.Certificates.Any(e => e.Id == id);
        }
    }
}
