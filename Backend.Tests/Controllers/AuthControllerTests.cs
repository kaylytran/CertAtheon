#nullable disable
using Xunit;
using Moq;
using Backend.Controllers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Json;

namespace Backend.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<SignInManager<ApplicationUser>> _signInManagerMock;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly Mock<ILogger<AuthController>> _loggerMock;
        private readonly Mock<IMessageSenderService> _messageSenderMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                Mock.Of<IUserStore<ApplicationUser>>(), null, null, null, null, null, null, null, null);

            _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(
                _userManagerMock.Object,
                Mock.Of<IHttpContextAccessor>(),
                Mock.Of<IUserClaimsPrincipalFactory<ApplicationUser>>(),
                null, null, null, null);

            _configurationMock = new Mock<IConfiguration>();
            _loggerMock = new Mock<ILogger<AuthController>>();
            _messageSenderMock = new Mock<IMessageSenderService>();

            _controller = new AuthController(
                _userManagerMock.Object,
                _signInManagerMock.Object,
                _configurationMock.Object,
                _loggerMock.Object,
                _messageSenderMock.Object
            );
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenRegistrationSuccessful()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Email = "test@example.com",
                Password = "Password@123",
                FirstName = "John",
                LastName = "Doe",
                PhoneNumber = "1234567890",
                JobTitle = "Developer"
            };

            _userManagerMock
                .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), request.Password))
                .ReturnsAsync(IdentityResult.Success);

            _signInManagerMock
                .Setup(sm => sm.SignInAsync(It.IsAny<ApplicationUser>(), false, null))
                .Returns(Task.CompletedTask);

            _messageSenderMock
                .Setup(ms => ms.SendMessageAsync(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Register(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            var json = JsonSerializer.Serialize(okResult.Value);
            var response = JsonSerializer.Deserialize<Dictionary<string, string>>(json);

            Assert.NotNull(response);
            Assert.True(response.ContainsKey("message"));
            Assert.Equal("Registration successful.", response["message"]);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenUserNotFound()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "nonexistent@example.com",
                Password = "wrongpassword"
            };

            _userManagerMock
                .Setup(um => um.FindByEmailAsync(request.Email))
                .ReturnsAsync((ApplicationUser?)null);

            // Act
            var result = await _controller.Login(request);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordInvalid()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = "wrongpassword"
            };

            var user = new ApplicationUser { Email = request.Email };

            _userManagerMock
                .Setup(um => um.FindByEmailAsync(request.Email))
                .ReturnsAsync(user);

            _signInManagerMock
                .Setup(sm => sm.CheckPasswordSignInAsync(user, request.Password, false))
                .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Failed);

            // Act
            var result = await _controller.Login(request);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task ChangePassword_ReturnsUnauthorized_WhenUserNotLoggedIn()
        {
            // Arrange
            _userManagerMock
                .Setup(um => um.GetUserAsync(It.IsAny<ClaimsPrincipal>()))
                .ReturnsAsync((ApplicationUser?)null);

            var request = new ChangePasswordRequest
            {
                CurrentPassword = "oldpassword",
                NewPassword = "newpassword"
            };

            // Act
            var result = await _controller.ChangePassword(request);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task Logout_ReturnsOk()
        {
            // Act
            var result = await _controller.Logout();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            var json = JsonSerializer.Serialize(okResult.Value);
            var response = JsonSerializer.Deserialize<Dictionary<string, string>>(json);

            Assert.NotNull(response);
            Assert.True(response.ContainsKey("message"));
            Assert.Equal("Logged out successfully.", response["message"]);

            _signInManagerMock.Verify(sm => sm.SignOutAsync(), Times.Once);
        }
    }
}
