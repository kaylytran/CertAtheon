using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Backend.Data;
using Backend.Models;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public CertificatesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/Certificates
        [HttpGet]
        public async Task<IActionResult> GetCertificates()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _logger.LogInformation("Getting certificates for user {UserId}", userId);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User identifier not found.");
            var certificates = await _context.Certificates
                .Where(c => c.UserId != null && c.UserId == userId)
                .ToListAsync();
            return Ok(certificates);
        }
        
        // POST: api/Certificates
        [HttpPost]
        public async Task<IActionResult> AddCertificate([FromBody] Certificate certificate)
        {
            // Remove any ModelState error for UserId since it is assigned server-side.
            ModelState.Remove("UserId");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            certificate.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCertificateById), new { id = certificate.Id }, certificate);
        }
        
        // GET: api/Certificates/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCertificateById(int id)
        {
            var certificate = await _context.Certificates.FindAsync(id);
            if (certificate == null)
                return NotFound();
            return Ok(certificate);
        }
        
        // PUT: api/Certificates/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCertificate(int id, [FromBody] Certificate updatedCertificate)
        {
            if (id != updatedCertificate.Id)
            {
                _logger.LogWarning("Certificate ID mismatch: {Id} vs {CertificateId}", id, updatedCertificate.Id);
                return BadRequest();
            }

            updatedCertificate.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _context.Entry(updatedCertificate).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertificateExists(id))
                {
                    _logger.LogWarning("Certificate with id {Id} not found", id);
                    return NotFound();
                }
                else
                    throw;
            }
            return NoContent();
        }
        
        // DELETE: api/Certificates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCertificate(int id)
        {
            var certificate = await _context.Certificates.FindAsync(id);
            if (certificate == null)
                return NotFound();

            _context.Certificates.Remove(certificate);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        private bool CertificateExists(int id)
        {
            return _context.Certificates.Any(e => e.Id == id);
        }
    }
}
