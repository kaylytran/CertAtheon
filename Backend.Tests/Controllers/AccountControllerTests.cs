#nullable disable
using Xunit;
using Moq;
using Backend.Controllers;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Backend.Tests.Controllers
{
    public class AccountControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<SignInManager<ApplicationUser>> _signInManagerMock;
        private readonly AccountController _controller;

        public AccountControllerTests()
        {
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                Mock.Of<IUserStore<ApplicationUser>>(), null, null, null, null, null, null, null, null);

            _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(
                _userManagerMock.Object,
                Mock.Of<IHttpContextAccessor>(),
                Mock.Of<IUserClaimsPrincipalFactory<ApplicationUser>>(),
                null, null, null, null);

            _controller = new AccountController(_userManagerMock.Object, _signInManagerMock.Object);
        }

        [Fact]
        public void Login_Get_ReturnsLoginView()
        {
            // Act
            var result = _controller.Login();

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public async Task Login_Post_ReturnsView_WhenModelInvalid()
        {
            // Act
            var result = await _controller.Login("", "");

            // Assert
            Assert.IsType<ViewResult>(result);
            Assert.False(_controller.ModelState.IsValid);
        }

        [Fact]
        public async Task Login_Post_RedirectsToChangePassword_WhenMustChangePasswordIsTrue()
        {
            // Arrange
            string email = "test@example.com";
            string password = "Test@123";

            _signInManagerMock
                .Setup(sm => sm.PasswordSignInAsync(email, password, false, false))
                .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);


            var user = new ApplicationUser { Email = email, MustChangePassword = true };
            _userManagerMock
                .Setup(um => um.FindByEmailAsync(email))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.Login(email, password);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("ChangePassword", redirectResult.ActionName);
            Assert.Equal("Account", redirectResult.ControllerName);
        }

        [Fact]
        public async Task Register_Post_Succeeds_AndRedirectsToChangePassword()
        {
            // Arrange
            var email = "user@test.com";
            var password = "Secure@123";
            var firstName = "John";
            var lastName = "Doe";

            _userManagerMock
                .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), password))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _controller.Register(firstName, lastName, email, password);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("ChangePassword", redirectResult.ActionName);
            Assert.Equal("Account", redirectResult.ControllerName);
        }

        [Fact]
        public async Task ChangePassword_Post_ReturnsView_WhenPasswordsAreEmpty()
        {
            // Act
            var result = await _controller.ChangePassword("", "");

            // Assert
            Assert.IsType<ViewResult>(result);
            Assert.False(_controller.ModelState.IsValid);
        }

        [Fact]
        public async Task Logout_Post_RedirectsToLogin()
        {
            // Act
            var result = await _controller.Logout();

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("Login", redirectResult.ActionName);
            Assert.Equal("Account", redirectResult.ControllerName);

            _signInManagerMock.Verify(sm => sm.SignOutAsync(), Times.Once);
        }
    }
}
