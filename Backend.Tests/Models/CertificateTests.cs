#nullable disable
using Xunit;
using Backend.Models;
using System;

namespace Backend.Tests.Models
{
    public class CertificateTests
    {
        [Fact]
        public void Can_Create_Certificate_With_All_Properties()
        {
            // Arrange
            var certificate = new Certificate
            {
                Id = 1,
                CertificateCatalogId = 100,
                CertifiedDate = new DateTime(2024, 1, 1),
                ValidTill = new DateTime(2026, 1, 1),
                UserId = "user-123",
                DocumentUrl = "https://example.com/certificate.pdf"
            };

            // Assert
            Assert.Equal(1, certificate.Id);
            Assert.Equal(100, certificate.CertificateCatalogId);
            Assert.Equal(new DateTime(2024, 1, 1), certificate.CertifiedDate);
            Assert.Equal(new DateTime(2026, 1, 1), certificate.ValidTill);
            Assert.Equal("user-123", certificate.UserId);
            Assert.Equal("https://example.com/certificate.pdf", certificate.DocumentUrl);
        }

        [Fact]
        public void Certificate_NavigationProperty_Can_Be_Assigned()
        {
            // Arrange
            var catalog = new CertificateCatalog
            {
                Id = 100,
                CertificateName = "Azure Developer",
                CertificateLevel = "Associate",
                Category = "Cloud",
                Description = "Microsoft Azure Developer Certification"
            };

            var certificate = new Certificate
            {
                CertificateCatalogId = 100,
                CertificateCatalog = catalog
            };

            // Assert
            Assert.NotNull(certificate.CertificateCatalog);
            Assert.Equal("Azure Developer", certificate.CertificateCatalog.CertificateName);
        }
    }
}
