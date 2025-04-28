#nullable disable
using Xunit;
using Moq;
using Backend.Controllers;
using Backend.Models;
using Backend.Schemas;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace Backend.Tests.Controllers
{
    public class ManagerControllerTests
    {
        private readonly ManagerController _controller;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
        private readonly Mock<ILogger<ManagerController>> _loggerMock;
        private readonly Mock<IMessageSenderService> _messageSenderMock;

        public ManagerControllerTests()
        {
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                Mock.Of<IUserStore<ApplicationUser>>(), null, null, null, null, null, null, null, null);

            _roleManagerMock = new Mock<RoleManager<IdentityRole>>(
                Mock.Of<IRoleStore<IdentityRole>>(), null, null, null, null);

            _loggerMock = new Mock<ILogger<ManagerController>>();
            _messageSenderMock = new Mock<IMessageSenderService>();

            _controller = new ManagerController(
                _userManagerMock.Object,
                _roleManagerMock.Object,
                _loggerMock.Object,
                _messageSenderMock.Object
            );
        }

        [Fact]
        public async Task CreateManager_ReturnsBadRequest_WhenRequestIsInvalid()
        {
            // Act
            var result = await _controller.CreateManager(null);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Missing required fields.", badRequest.Value);
        }

        [Fact]
        public async Task CreateManager_ReturnsBadRequest_WhenUserCreationFails()
        {
            // Arrange
            var request = new ManagerCreateRequest
            {
                Email = "test@company.com",
                FirstName = "John",
                LastName = "Doe",
                Password = "Password123!",
                PhoneNumber = "1234567890"
            };

            _userManagerMock
                .Setup(um => um.CreateAsync(It.IsAny<ApplicationManager>(), request.Password))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error creating user" }));

            // Act
            var result = await _controller.CreateManager(request);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateManager_ReturnsOk_WhenEverythingSucceeds()
        {
            // Arrange
            var request = new ManagerCreateRequest
            {
                Email = "test@company.com",
                FirstName = "Jane",
                LastName = "Smith",
                Password = "Password123!",
                PhoneNumber = "9876543210"
            };

            _userManagerMock
                .Setup(um => um.CreateAsync(It.IsAny<ApplicationManager>(), request.Password))
                .ReturnsAsync(IdentityResult.Success);

            _roleManagerMock
                .Setup(rm => rm.RoleExistsAsync("Manager"))
                .ReturnsAsync(true);

            _userManagerMock
                .Setup(um => um.AddToRoleAsync(It.IsAny<ApplicationManager>(), "Manager"))
                .ReturnsAsync(IdentityResult.Success);

            _messageSenderMock
                .Setup(ms => ms.SendMessageAsync(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreateManager(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var responseJson = JsonSerializer.Serialize(okResult.Value);
            Assert.Contains("Manager created successfully", responseJson);
        }

        [Fact]
        public async Task CreateManager_CreatesRoleIfNotExist()
        {
            // Arrange
            var request = new ManagerCreateRequest
            {
                Email = "manager@test.com",
                FirstName = "Test",
                LastName = "Manager",
                Password = "Test@1234",
                PhoneNumber = "5551234567"
            };

            _userManagerMock
                .Setup(um => um.CreateAsync(It.IsAny<ApplicationManager>(), request.Password))
                .ReturnsAsync(IdentityResult.Success);

            _roleManagerMock
                .Setup(rm => rm.RoleExistsAsync("Manager"))
                .ReturnsAsync(false);

            _roleManagerMock
                .Setup(rm => rm.CreateAsync(It.IsAny<IdentityRole>()))
                .ReturnsAsync(IdentityResult.Success);

            _userManagerMock
                .Setup(um => um.AddToRoleAsync(It.IsAny<ApplicationManager>(), "Manager"))
                .ReturnsAsync(IdentityResult.Success);

            _messageSenderMock
                .Setup(ms => ms.SendMessageAsync(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreateManager(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}
