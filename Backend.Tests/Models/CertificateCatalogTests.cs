#nullable disable
using Xunit;
using Backend.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Tests.Models
{
    public class CertificateCatalogTests
    {
        [Fact]
        public void Can_Create_CertificateCatalog_With_AllProperties()
        {
            // Arrange
            var catalog = new CertificateCatalog
            {
                Id = 1,
                CertificateName = "Azure Developer",
                Category = "Cloud",
                CertificateLevel = "Associate",
                Description = "Certification for Azure Developers."
            };

            // Assert
            Assert.Equal(1, catalog.Id);
            Assert.Equal("Azure Developer", catalog.CertificateName);
            Assert.Equal("Cloud", catalog.Category);
            Assert.Equal("Associate", catalog.CertificateLevel);
            Assert.Equal("Certification for Azure Developers.", catalog.Description);
        }

        [Fact]
        public void CertificateCatalog_CertificateName_IsRequired()
        {
            // Arrange
            var catalog = new CertificateCatalog(); // no CertificateName set

            // Act
            var context = new ValidationContext(catalog);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(catalog, context, results, validateAllProperties: true);

            // Assert
            Assert.False(isValid);
            Assert.Contains(results, r => r.MemberNames.Contains("CertificateName"));
        }
    }
}
