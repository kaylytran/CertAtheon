using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public CertificatesController(ApplicationDbContext context, ILogger<CertificatesController> logger, IMessageSenderService messageSender)
        {
            _context = context;
            _logger = logger;
            _messageSender = messageSender;
        }
        
        // GET: api/certificates
        [HttpGet]
        public async Task<IActionResult> GetCertificates()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("User ID not found in claims.");
                return Unauthorized("User ID not found.");
            }
            
            // Include CertificateCatalog to obtain CertificateName.
            var certificates = await _context.Certificates
                .Include(c => c.CertificateCatalog)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            // Project each certificate to include CertificateName.
            var result = certificates.Select(c => new 
            {
                c.Id,
                c.CertificateCatalogId,
                c.CertifiedDate,
                c.ValidTill,
                c.UserId,
                CertificateName = c.CertificateCatalog != null ? c.CertificateCatalog.CertificateName : null
            });

            return Ok(result);
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
