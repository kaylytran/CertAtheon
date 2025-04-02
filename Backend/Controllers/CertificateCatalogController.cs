using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Backend.Schemas;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificateCatalogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CertificateCatalogController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CertificateCatalog
        // Open to all users.
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetCatalogItems()
        {
            var items = await _context.CertificateCatalogs.ToListAsync();
            return Ok(items);
        }

        // GET: api/CertificateCatalog/{id}
        // Open to all users.
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetCatalogItem(int id)
        {
            var item = await _context.CertificateCatalogs.FindAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        // GET: api/CertificateCatalog/search?q=somePhrase
        // Open to all users.
        [HttpGet("search")]
        [Authorize]
        public async Task<IActionResult> SearchCertificateCatalog([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest("Query parameter 'q' is required.");
            }

            var results = await _context.CertificateCatalogs
                .Where(c => EF.Functions.Like(c.CertificateName, $"%{q}%"))
                .ToListAsync();

            return Ok(results);
        }

        // POST: api/CertificateCatalog
        // Restricted to users with the Manager role.
        [HttpPost("add")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> CreateCatalogItem([FromBody] CertificateCatalogAddRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            var newCertificateCatalog = new CertificateCatalog
            {
                CertificateName = request.CertificateName,
                Category = request.Category,
                CertificateLevel = request.CertificateLevel,
                Description = request.Description
            };

            _context.CertificateCatalogs.Add(newCertificateCatalog);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCatalogItem), new { id = newCertificateCatalog.Id }, newCertificateCatalog);
        }

        // PUT: api/CertificateCatalog/{id}
        // Restricted to users with the Manager role.
        [HttpPut("{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> UpdateCatalogItem(int id, [FromBody] CertificateCatalog item)
        {
            if (id != item.Id)
                return BadRequest("Certificate catalog item ID mismatch.");

            _context.Entry(item).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CatalogItemExists(id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        // DELETE: api/CertificateCatalog/{id}
        // Restricted to users with the Manager role.
        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> DeleteCatalogItem(int id)
        {
            var item = await _context.CertificateCatalogs.FindAsync(id);
            if (item == null)
                return NotFound();

            _context.CertificateCatalogs.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool CatalogItemExists(int id)
        {
            return _context.CertificateCatalogs.Any(e => e.Id == id);
        }
    }
}
