#nullable disable
using Xunit;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Backend.Tests.Data
{
    public class ApplicationDbContextTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Can_Add_And_Retrieve_Certificate()
        {
            // Arrange
            var context = GetDbContext();
            var certificate = new Certificate
            {
                CertificateCatalogId = 1,
                CertifiedDate = System.DateTime.UtcNow,
                ValidTill = System.DateTime.UtcNow.AddYears(1),
                UserId = "user123",
                DocumentUrl = "https://example.com/cert1"
            };

            // Act
            context.Certificates.Add(certificate);
            await context.SaveChangesAsync();

            var savedCertificate = await context.Certificates.FirstOrDefaultAsync(c => c.UserId == "user123");

            // Assert
            Assert.NotNull(savedCertificate);
            Assert.Equal("user123", savedCertificate.UserId);
        }

        [Fact]
        public async Task Can_Add_And_Retrieve_CertificateCatalog()
        {
            // Arrange
            var context = GetDbContext();
            var catalog = new CertificateCatalog
            {
                CertificateName = "Azure Developer",
                CertificateLevel = "Associate",
                Category = "Cloud",
                Description = "Certification for Azure Developers."
            };

            // Act
            context.CertificateCatalogs.Add(catalog);
            await context.SaveChangesAsync();

            var savedCatalog = await context.CertificateCatalogs.FirstOrDefaultAsync(c => c.CertificateName == "Azure Developer");

            // Assert
            Assert.NotNull(savedCatalog);
            Assert.Equal("Azure Developer", savedCatalog.CertificateName);
        }
    }
}
