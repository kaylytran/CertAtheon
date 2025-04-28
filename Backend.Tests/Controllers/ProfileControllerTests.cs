#nullable disable
using Xunit;
using Moq;
using Backend.Controllers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.IO;
using System;

namespace Backend.Tests.Controllers
{
    public class ProfileControllerTests
    {
        private readonly ProfileController _controller;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<IBlobService> _blobServiceMock;

        public ProfileControllerTests()
        {
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                Mock.Of<IUserStore<ApplicationUser>>(), null, null, null, null, null, null, null, null);

            _blobServiceMock = new Mock<IBlobService>();

            _controller = new ProfileController(
                _userManagerMock.Object,
                _blobServiceMock.Object
            );

            // Mock HttpContext with Claims
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id")
            };
            var identity = new ClaimsIdentity(userClaims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async Task GetProfile_ReturnsOk_WhenUserExists()
        {
            // Arrange
            var user = new ApplicationUser
            {
                Id = "test-user-id",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                PhoneNumber = "1234567890",
                UserName = "john_doe",
                AppRole = "Employee",
                MustChangePassword = false,
                JobTitle = "Developer",
                ProfilePictureUrl = "https://example.com/pic.jpg"
            };

            _userManagerMock
                .Setup(um => um.FindByIdAsync("test-user-id"))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProfile();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetProfile_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            _userManagerMock
                .Setup(um => um.FindByIdAsync("test-user-id"))
                .ReturnsAsync((ApplicationUser?)null);

            // Act
            var result = await _controller.GetProfile();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UploadProfilePicture_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            var content = "Fake file content";
            var fileName = "test.jpg";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            fileMock.Setup(f => f.OpenReadStream()).Returns(ms);
            fileMock.Setup(f => f.FileName).Returns(fileName);
            fileMock.Setup(f => f.Length).Returns(ms.Length);
            fileMock.Setup(f => f.ContentType).Returns("image/jpeg");

            _blobServiceMock
                .Setup(bs => bs.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
                .ReturnsAsync("https://fakeurl.com/test.jpg");

            var user = new ApplicationUser { Id = "test-user-id" };

            _userManagerMock
                .Setup(um => um.FindByIdAsync("test-user-id"))
                .ReturnsAsync(user);

            _userManagerMock
                .Setup(um => um.UpdateAsync(user))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _controller.UploadProfilePicture(fileMock.Object);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task UploadProfilePicture_ReturnsBadRequest_WhenNoFileUploaded()
        {
            // Act
            var result = await _controller.UploadProfilePicture(null);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No file uploaded.", badRequest.Value);
        }

        [Fact]
        public async Task UploadProfilePicture_ReturnsUnauthorized_WhenUserNotFound()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.Length).Returns(100);
            fileMock.Setup(f => f.FileName).Returns("test.jpg");

            _userManagerMock
                .Setup(um => um.FindByIdAsync("test-user-id"))
                .ReturnsAsync((ApplicationUser?)null);

            // Act
            var result = await _controller.UploadProfilePicture(fileMock.Object);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }
    }
}
