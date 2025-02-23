using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
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
        // Use Case 1: Display all certificates for the Home Screen
        [HttpGet]
        public async Task<IActionResult> GetCertificates()
        {
            var certificates = await _context.Certificates.ToListAsync();
            return Ok(certificates);
        }

        // POST: api/Certificates
        // Use Case 2: Add a new certificate
        [HttpPost]
        public async Task<IActionResult> AddCertificate([FromBody] Certificate certificate)
        {
            if (certificate == null)
                return BadRequest();

            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();

            // Optionally: push a message to a service bus queue here

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
        // Use Case 2: Modify an existing certificate
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCertificate(int id, [FromBody] Certificate updatedCertificate)
        {
            if (id != updatedCertificate.Id)
                return BadRequest();

            _context.Entry(updatedCertificate).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                
                // Optionally: push an update message to a service bus queue here
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertificateExists(id))
                    return NotFound();
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
