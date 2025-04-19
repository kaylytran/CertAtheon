using Backend.Data;
using Backend.Models;
using Backend.Schemas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager")] // Only managers can access the dashboard.
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/dashboard?year=2025&offset=0&limit=20&nameFilter=John
        [HttpGet]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] int? year,
            [FromQuery] int offset = 0,
            [FromQuery] int? limit = null,
            [FromQuery] string? nameFilter = null)
        {
            var report = await BuildDashboardReport(year, offset, limit, nameFilter);
            return Ok(report);
        }

        // GET: api/dashboard/csv?year=2025&offset=0&limit=20&nameFilter=John
        [HttpGet("csv")]
        public async Task<IActionResult> GetDashboardCsv(
            [FromQuery] int? year,
            [FromQuery] int offset = 0,
            [FromQuery] int? limit = null,
            [FromQuery] string? nameFilter = null)
        {
            var report = await BuildDashboardReport(year, offset, limit, nameFilter);

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("EmployeeId,FullName,Role,Grade,Email,CertificateName,CertificateLevel,CertifiedDate,ExpiryDate");

            foreach (var record in report.Records)
            {
                csvBuilder.AppendLine(
                    $"{record.EmployeeId}," +
                    $"{record.FullName}," +
                    $"{record.Role}," +
                    $"{record.Grade}," +
                    $"{record.Email}," +
                    $"{record.CertificateName}," +
                    $"{record.CertificateLevel}," +
                    $"{record.CertifiedDate}," +
                    $"{record.ExpiryDate}"
                );
            }

            byte[] csvBytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(csvBytes, "text/csv", "DashboardReport.csv");
        }
        
        // Helper to build, filter, paginate, and return the dashboard data.
        private async Task<dynamic> BuildDashboardReport(
            int? year,
            int offset,
            int? limit,
            string? nameFilter)
        {
            int targetYear = year ?? DateTime.UtcNow.Year;
            
            // 1) load employees (non-managers)
            var employees = await _context.Users
                                          .Where(u => u.AppRole != "Manager")
                                          .ToListAsync();
            int totalEmployees = employees.Count;

            // 2) load catalog + certificates for that year
            var catalogEntries = await _context.CertificateCatalogs.ToListAsync();
            var certificates   = await _context.Certificates
                .Where(c => c.CertifiedDate.Year == targetYear)
                .ToListAsync();
            
            // 3) build full in‑memory dashboard list
            var allRecords = employees
                .SelectMany(emp => catalogEntries, (emp, catalog) =>
                {
                    var cert = certificates.FirstOrDefault(c =>
                        c.UserId == emp.Id &&
                        c.CertificateCatalogId == catalog.Id);

                    return new DashboardRecord
                    {
                        EmployeeId       = emp.Id,
                        FullName         = $"{emp.FirstName} {emp.LastName}",
                        Role             = emp.AppRole,
                        Grade            = emp.JobTitle,
                        Email            = emp.Email,
                        CertificateName  = catalog.CertificateName,
                        CertificateLevel = catalog.CertificateLevel,
                        CertifiedDate    = cert != null
                            ? cert.CertifiedDate.ToString("yyyy-MM-dd")
                            : "No Certificate",
                        ExpiryDate       = cert != null
                            ? cert.ValidTill.ToString("yyyy-MM-dd")
                            : "No Certificate"
                    };
                })
                .ToList();
            
            // 4) name filter
            if (!string.IsNullOrWhiteSpace(nameFilter))
            {
                allRecords = allRecords
                    .Where(r => r.FullName
                        .Contains(nameFilter, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }
            
            // 5) pagination
            var paged = allRecords.Skip(offset);
            if (limit.HasValue)
                paged = paged.Take(limit.Value);
            var pagedRecords = paged.ToList();
            
            // 6) adoption rate (based on all employees, not just paged/filtered)
            int employeesWithCertificate = certificates
                .Where(c => employees.Any(e => e.Id == c.UserId))
                .Select(c => c.UserId)
                .Distinct()
                .Count();
            double adoptionRate = totalEmployees > 0
                ? (employeesWithCertificate / (double)totalEmployees) * 100
                : 0;
            
            // 7) return meta + paged records
            return new 
            {
                TotalEmployees            = totalEmployees,
                EmployeesWithCertificate  = employeesWithCertificate,
                OverallAdoptionRate       = adoptionRate,
                TotalRecords              = allRecords.Count,
                Offset                    = offset,
                Limit                     = limit,           // null if not supplied
                Records                   = pagedRecords
            };
        }
    }
}
