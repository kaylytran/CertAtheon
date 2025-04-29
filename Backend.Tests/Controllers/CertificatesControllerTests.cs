// #nullable disable
// using Xunit;
// using Moq;
// using Backend.Controllers;
// using Backend.Data;
// using Backend.Models;
// using Backend.Services;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.Extensions.Logging;
// using Azure.AI.FormRecognizer.DocumentAnalysis;
// using Microsoft.Extensions.Configuration;
// using System.Security.Claims;
// using System.Collections.Generic;
// using Microsoft.AspNetCore.Http;
// using System.Threading.Tasks;
// using System.Text.Json;
// using System.IO;
// using System.Linq;

// namespace Backend.Tests.Controllers
// {
//     public class CertificatesControllerTests
//     {
//         private readonly ApplicationDbContext _context;
//         private readonly CertificatesController _controller;
//         private readonly Mock<ILogger<CertificatesController>> _loggerMock;
//         private readonly Mock<IMessageSenderService> _messageSenderMock;
//         private readonly Mock<IBlobService> _blobServiceMock;
//         private readonly Mock<DocumentAnalysisClient> _documentClientMock;
//         private readonly Mock<IConfiguration> _configurationMock;

//         public CertificatesControllerTests()
//         {
//             var options = new DbContextOptionsBuilder<ApplicationDbContext>()
//                 .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
//                 .Options;

//             _context = new ApplicationDbContext(options);

//             _loggerMock = new Mock<ILogger<CertificatesController>>();
//             _messageSenderMock = new Mock<IMessageSenderService>();
//             _blobServiceMock = new Mock<IBlobService>();
//             _documentClientMock = new Mock<DocumentAnalysisClient>();
//             _configurationMock = new Mock<IConfiguration>();

//             _controller = new CertificatesController(
//                 _blobServiceMock.Object,
//                 _context,
//                 _loggerMock.Object,
//                 _messageSenderMock.Object,
//                 _documentClientMock.Object,
//                 _configurationMock.Object
//             );

//             // Fake authenticated user
//             var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
//             {
//                 new Claim(ClaimTypes.NameIdentifier, "user123"),
//                 new Claim(ClaimTypes.Email, "test@example.com"),
//                 new Claim("FirstName", "Test"),
//                 new Claim("LastName", "User")
//             }, "mock"));

//             _controller.ControllerContext = new ControllerContext
//             {
//                 HttpContext = new DefaultHttpContext { User = user }
//             };

//             // Seed a CertificateCatalog
//             _context.CertificateCatalogs.Add(new CertificateCatalog
//             {
//                 Id = 1,
//                 CertificateName = "Azure Fundamentals",
//                 Category = "Cloud",
//                 CertificateLevel = "Beginner",
//                 Description = "Azure intro course"
//             });

//             _context.SaveChanges();
//         }

//         [Fact]
//         public async Task GetCertificates_ReturnsCertificates()
//         {
//             // Arrange
//             _context.Certificates.Add(new Certificate
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow,
//                 ValidTill = DateTime.UtcNow.AddYears(1),
//                 UserId = "user123"
//             });
//             _context.SaveChanges();

//             // Act
//             var result = await _controller.GetCertificates();

//             // Assert
//             var okResult = Assert.IsType<OkObjectResult>(result);
//             Assert.NotNull(okResult.Value);
//         }

//         [Fact]
//         public async Task GetCertificateById_ReturnsCertificate_WhenFound()
//         {
//             // Arrange
//             var certificate = new Certificate
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow,
//                 ValidTill = DateTime.UtcNow.AddYears(1),
//                 UserId = "user123"
//             };
//             _context.Certificates.Add(certificate);
//             _context.SaveChanges();

//             // Act
//             var result = await _controller.GetCertificateById(certificate.Id);

//             // Assert
//             var okResult = Assert.IsType<OkObjectResult>(result);
//             Assert.NotNull(okResult.Value);
//         }

//         [Fact]
//         public async Task AddCertificate_CreatesNewCertificate()
//         {
//             // Arrange
//             var request = new Backend.Schemas.EmployeeCertificateCreateRequest
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow,
//                 ValidTill = DateTime.UtcNow.AddYears(1),
//                 DocumentUrl = "http://fakeurl.com"
//             };

//             _messageSenderMock.Setup(ms => ms.SendMessageAsync(It.IsAny<string>()))
//                 .Returns(Task.CompletedTask);

//             // Act
//             var result = await _controller.AddCertificate(request);

//             // Assert
//             var createdResult = Assert.IsType<CreatedAtActionResult>(result);
//             var certificate = Assert.IsType<Certificate>(createdResult.Value);
//             Assert.Equal("user123", certificate.UserId);
//         }

//         [Fact]
//         public async Task UpdateCertificate_UpdatesSuccessfully()
//         {
//             // Arrange
//             var cert = new Certificate
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow,
//                 ValidTill = DateTime.UtcNow.AddYears(1),
//                 UserId = "user123"
//             };
//             _context.Certificates.Add(cert);
//             _context.SaveChanges();

//             var request = new Backend.Schemas.EmployeeCertificateCreateRequest
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow.AddDays(-10),
//                 ValidTill = DateTime.UtcNow.AddYears(2),
//                 DocumentUrl = cert.DocumentUrl
//             };

//             _messageSenderMock.Setup(ms => ms.SendMessageAsync(It.IsAny<string>()))
//                 .Returns(Task.CompletedTask);

//             // Act
//             var result = await _controller.UpdateCertificate(cert.Id, request);

//             // Assert
//             Assert.IsType<NoContentResult>(result);
//         }

//         [Fact]
//         public async Task DeleteCertificate_DeletesSuccessfully()
//         {
//             // Arrange
//             var cert = new Certificate
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow,
//                 ValidTill = DateTime.UtcNow.AddYears(1),
//                 UserId = "user123"
//             };
//             _context.Certificates.Add(cert);
//             _context.SaveChanges();

//             // Act
//             var result = await _controller.DeleteCertificate(cert.Id);

//             // Assert
//             Assert.IsType<NoContentResult>(result);
//         }
//     }
// }
