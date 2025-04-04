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
        
        // GET: api/dashboard?year=2025
        [HttpGet]
        public async Task<IActionResult> GetDashboard([FromQuery] int? year)
        {
            var response = await BuildDashboardReport(year);
            return Ok(response);
        }

        // GET: api/dashboard/csv?year=2025
        // Returns the dashboard report as a CSV file.
        [HttpGet("csv")]
        public async Task<IActionResult> GetDashboardCsv([FromQuery] int? year)
        {
            var report = await BuildDashboardReport(year);
            // Build CSV content.
            var csvBuilder = new StringBuilder();
            // Header row.
            csvBuilder.AppendLine("EmployeeId,FullName,Role,Grade,Email,CertificateName,CertificateLevel,CertifiedDate,ExpiryDate");
            // Dashboard records.
            foreach (var record in report.Records)
            {
                csvBuilder.AppendLine($"{record.EmployeeId},{record.FullName},{record.Role},{record.Grade},{record.Email},{record.CertificateName},{record.CertificateLevel},{record.CertifiedDate},{record.ExpiryDate}");
            }
            byte[] csvBytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(csvBytes, "text/csv", "DashboardReport.csv");
        }
        
        // Helper method to build the dashboard report.
        private async Task<dynamic> BuildDashboardReport(int? year)
        {
            int targetYear = year ?? DateTime.UtcNow.Year;
            
            // Retrieve all employees excluding managers from Identity's Users table.
            var employees = await _context.Users
                                          .Where(u => u.AppRole != "Manager")
                                          .ToListAsync();
            int totalEmployees = employees.Count;
            
            // Retrieve all certificate catalog entries.
            var catalogEntries = await _context.CertificateCatalogs.ToListAsync();
            
            // Retrieve certificates for the target year.
            var certificates = await _context.Certificates
                .Where(c => c.CertifiedDate.Year == targetYear)
                .ToListAsync();
            
            // For each employee (non-manager) and each catalog entry, create a dashboard record.
            var dashboardRecords = employees.SelectMany(emp =>
            {
                return catalogEntries.Select(catalog =>
                {
                    // Find the certificate record for this employee and catalog entry.
                    var cert = certificates.FirstOrDefault(x => x.UserId == emp.Id && x.CertificateCatalogId == catalog.Id);
                    
                    return new DashboardRecord
                    {
                        EmployeeId = emp.Id,
                        FullName = $"{emp.FirstName} {emp.LastName}",
                        Role = emp.AppRole,         // Using AppRole from the user.
                        Grade = emp.JobTitle,       // Using JobTitle as Grade.
                        Email = emp.Email,
                        CertificateName = catalog.CertificateName,
                        CertificateLevel = catalog.CertificateLevel,
                        CertifiedDate = cert != null 
                            ? cert.CertifiedDate.ToString("yyyy-MM-dd") 
                            : "No Certificate",
                        ExpiryDate = cert != null 
                            ? cert.ValidTill.ToString("yyyy-MM-dd") 
                            : "No Certificate"
                    };
                });
            }).ToList();
            
            // Calculate overall adoption rate:
            // Count distinct employees with at least one certificate record in the target year.
            int employeesWithCertificate = certificates
                                               .Where(c => employees.Any(emp => emp.Id == c.UserId))
                                               .Select(c => c.UserId)
                                               .Distinct()
                                               .Count();
            double adoptionRate = totalEmployees > 0 
                ? ((double)employeesWithCertificate / totalEmployees) * 100 
                : 0;
            
            return new 
            {
                TotalEmployees = totalEmployees,
                EmployeesWithCertificate = employeesWithCertificate,
                OverallAdoptionRate = adoptionRate,
                Records = dashboardRecords
            };
        }
    }
}
