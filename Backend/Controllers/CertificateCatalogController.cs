using Backend.Data;
using Backend.Models;
using Backend.Schemas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

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

        // GET: api/CertificateCatalog?offset=0&limit=20
        // Open to all users.
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetCatalogItems(
            [FromQuery] int offset = 0,
            [FromQuery] int? limit = null)
        {
            var query = _context.CertificateCatalogs.AsQueryable();

            var totalItems = await query.CountAsync();

            if (offset > 0)
                query = query.Skip(offset);
            if (limit.HasValue)
                query = query.Take(limit.Value);

            var items = await query.ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                Offset = offset,
                Limit = limit,
                Records = items
            });
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

        // GET: api/CertificateCatalog/search?q=somePhrase&offset=0&limit=20
        // Open to all users.
        [HttpGet("search")]
        [Authorize]
        public async Task<IActionResult> SearchCertificateCatalog(
            [FromQuery] string q,
            [FromQuery] int offset = 0,
            [FromQuery] int? limit = null)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("Query parameter 'q' is required.");

            var query = _context.CertificateCatalogs
                                .Where(c => EF.Functions.Like(c.CertificateName, $"%{q}%"));

            var totalItems = await query.CountAsync();

            if (offset > 0)
                query = query.Skip(offset);
            if (limit.HasValue)
                query = query.Take(limit.Value);

            var results = await query.ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                Offset = offset,
                Limit = limit,
                Records = results
            });
        }

        // POST: api/CertificateCatalog/add
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
            return CreatedAtAction(nameof(GetCatalogItem),
                                   new { id = newCertificateCatalog.Id },
                                   newCertificateCatalog);
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
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CatalogItemExists(id))
                    return NotFound();
                throw;
            }
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
            => _context.CertificateCatalogs.Any(e => e.Id == id);
    }
}
