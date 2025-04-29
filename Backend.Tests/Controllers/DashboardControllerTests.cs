// #nullable disable
// using Xunit;
// using Moq;
// using Backend.Controllers;
// using Backend.Data;
// using Backend.Models;
// using Backend.Services;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Http;
// using Microsoft.Extensions.Configuration;
// using System.Threading.Tasks;
// using System.Collections.Generic;
// using System.IO;
// using System;

// namespace Backend.Tests.Controllers
// {
//     public class DashboardControllerTests
//     {
//         private readonly ApplicationDbContext _context;
//         private readonly DashboardController _controller;
//         private readonly Mock<IBlobService> _blobServiceMock;
//         private readonly Mock<IConfiguration> _configurationMock;

//         public DashboardControllerTests()
//         {
//             var options = new DbContextOptionsBuilder<ApplicationDbContext>()
//                 .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
//                 .Options;

//             _context = new ApplicationDbContext(options);

//             _blobServiceMock = new Mock<IBlobService>();
//             _configurationMock = new Mock<IConfiguration>();

//             _controller = new DashboardController(
//                 _context,
//                 _blobServiceMock.Object,
//                 _configurationMock.Object
//             );

//             // Seed test data
//             _context.Users.Add(new ApplicationUser
//             {
//                 Id = "user123",
//                 FirstName = "John",
//                 LastName = "Doe",
//                 Email = "john.doe@example.com",
//                 AppRole = "Employee",
//                 JobTitle = "Developer"
//             });

//             _context.CertificateCatalogs.Add(new CertificateCatalog
//             {
//                 Id = 1,
//                 CertificateName = "Azure Fundamentals",
//                 CertificateLevel = "Beginner",
//                 Category = "Cloud",
//                 Description = "Azure Certification"
//             });

//             _context.Certificates.Add(new Certificate
//             {
//                 CertificateCatalogId = 1,
//                 CertifiedDate = DateTime.UtcNow,
//                 ValidTill = DateTime.UtcNow.AddYears(1),
//                 UserId = "user123",
//                 DocumentUrl = "https://fakeurl.com/certificate.pdf"
//             });

//             _context.SaveChanges();
//         }

//         [Fact]
//         public async Task GetDashboard_ReturnsDashboardData()
//         {
//             // Act
//             var result = await _controller.GetDashboard(2025);

//             // Assert
//             var okResult = Assert.IsType<OkObjectResult>(result);
//             Assert.NotNull(okResult.Value);
//         }

//         [Fact]
//         public async Task GetDashboardCsv_ReturnsFile()
//         {
//             // Act
//             var result = await _controller.GetDashboardCsv(2025);

//             // Assert
//             var fileResult = Assert.IsType<FileContentResult>(result);
//             Assert.Equal("text/csv", fileResult.ContentType);
//         }

//         [Fact]
//         public async Task UploadEmployeeFeed_ReturnsOk_WhenUploadSucceeds()
//         {
//             // Arrange
//             var fileMock = new Mock<IFormFile>();
//             var fileName = "test.xlsx";
//             var content = "Test file content";
//             var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));
//             fileMock.Setup(f => f.OpenReadStream()).Returns(stream);
//             fileMock.Setup(f => f.FileName).Returns(fileName);
//             fileMock.Setup(f => f.Length).Returns(stream.Length);
//             fileMock.Setup(f => f.ContentType).Returns("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

//             _configurationMock.Setup(c => c["AzureBlobStorage:EmployeeFeedContainer"]).Returns("employee-feeds");
//             _blobServiceMock.Setup(b => b.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), "employee-feeds"))
//                 .ReturnsAsync("https://fakeblobstorage.com/employee-feed.xlsx");

//             // Act
//             var result = await _controller.UploadEmployeeFeed(fileMock.Object);

//             // Assert
//             var okResult = Assert.IsType<OkObjectResult>(result);
//             Assert.NotNull(okResult.Value);
//         }

//         [Fact]
//         public async Task UploadCertificateFeed_ReturnsOk_WhenUploadSucceeds()
//         {
//             // Arrange
//             var fileMock = new Mock<IFormFile>();
//             var fileName = "certificates.xlsx";
//             var content = "Test file content";
//             var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));
//             fileMock.Setup(f => f.OpenReadStream()).Returns(stream);
//             fileMock.Setup(f => f.FileName).Returns(fileName);
//             fileMock.Setup(f => f.Length).Returns(stream.Length);
//             fileMock.Setup(f => f.ContentType).Returns("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

//             _configurationMock.Setup(c => c["AzureBlobStorage:CertificateFeedContainer"]).Returns("certificate-feeds");
//             _blobServiceMock.Setup(b => b.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), "certificate-feeds"))
//                 .ReturnsAsync("https://fakeblobstorage.com/certificate-feed.xlsx");

//             // Act
//             var result = await _controller.UploadCertificateFeed(fileMock.Object);

//             // Assert
//             var okResult = Assert.IsType<OkObjectResult>(result);
//             Assert.NotNull(okResult.Value);
//         }
//     }
// }
