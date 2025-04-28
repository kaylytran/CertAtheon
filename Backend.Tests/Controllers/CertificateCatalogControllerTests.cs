#nullable disable
using Xunit;
using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Tests.Controllers
{
    public class CertificateCatalogControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly CertificateCatalogController _controller;

        public CertificateCatalogControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // 👈 random db name
                .Options;

            _context = new ApplicationDbContext(options);

            // Seed some data
            _context.CertificateCatalogs.AddRange(
                new CertificateCatalog { Id = 1, CertificateName = "Azure Developer", Category = "Cloud", CertificateLevel = "Associate", Description = "AWS Developer cert" },
                new CertificateCatalog { Id = 2, CertificateName = "Azure Fundamentals", Category = "Cloud", CertificateLevel = "Beginner", Description = "Azure intro cert" }
            );
            _context.SaveChanges();

            _controller = new CertificateCatalogController(_context);
        }


        [Fact]
        public async Task GetCatalogItems_ReturnsAllCertificates()
        {
            // Act
            var result = await _controller.GetCatalogItems();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;

            Assert.NotNull(response);
        }

        [Fact]
        public async Task GetCatalogItem_ReturnsCertificate_WhenFound()
        {
            // Act
            var result = await _controller.GetCatalogItem(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var item = Assert.IsType<CertificateCatalog>(okResult.Value);

            Assert.Equal(1, item.Id);
            Assert.Equal("Azure Developer", item.CertificateName);
        }

        [Fact]
        public async Task GetCatalogItem_ReturnsNotFound_WhenNotExist()
        {
            // Act
            var result = await _controller.GetCatalogItem(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task SearchCertificateCatalog_ReturnsMatchingItems()
        {
            // Act
            var result = await _controller.SearchCertificateCatalog("AWS");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;

            Assert.NotNull(response);
        }

        [Fact]
        public async Task SearchCertificateCatalog_ReturnsBadRequest_WhenQueryMissing()
        {
            // Act
            var result = await _controller.SearchCertificateCatalog(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateCatalogItem_AddsNewCertificate()
        {
            // Arrange
            var newItem = new Backend.Schemas.CertificateCatalogAddRequest
            {
                CertificateName = "AZZ-900",
                Category = "Cloud",
                CertificateLevel = "Professional",
                Description = "Cloud Expert"
            };

            // Act
            var result = await _controller.CreateCatalogItem(newItem);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var item = Assert.IsType<CertificateCatalog>(createdResult.Value);

            Assert.Equal("AZZ-900", item.CertificateName);
        }

        [Fact]
        public async Task UpdateCatalogItem_UpdatesCertificate_WhenIdMatches()
        {
            // Arrange
            var existingItem = _context.CertificateCatalogs.First();
            existingItem.Description = "Updated description";

            // Act
            var result = await _controller.UpdateCatalogItem(existingItem.Id, existingItem);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateCatalogItem_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            var existingItem = _context.CertificateCatalogs.First();

            // Act
            var result = await _controller.UpdateCatalogItem(999, existingItem);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteCatalogItem_DeletesCertificate_WhenFound()
        {
            // Arrange
            var existingItem = _context.CertificateCatalogs.First();

            // Act
            var result = await _controller.DeleteCatalogItem(existingItem.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteCatalogItem_ReturnsNotFound_WhenNotExist()
        {
            // Act
            var result = await _controller.DeleteCatalogItem(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
