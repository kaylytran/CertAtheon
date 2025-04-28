#nullable disable
using Xunit;
using Backend.Models;

namespace Backend.Tests.Models
{
    public class ApplicationUserTests
    {
        [Fact]
        public void Can_Create_ApplicationUser_With_AllProperties()
        {
            // Arrange
            var user = new ApplicationUser
            {
                Id = "user-123",
                UserName = "user@example.com",
                Email = "user@example.com",
                FirstName = "John",
                LastName = "Doe",
                ProfilePictureUrl = "https://example.com/profile.jpg",
                JobTitle = "Developer",
                AppRole = "Employee",
                MustChangePassword = true,
                PhoneNumber = "1234567890"
            };

            // Assert
            Assert.Equal("user-123", user.Id);
            Assert.Equal("user@example.com", user.UserName);
            Assert.Equal("user@example.com", user.Email);
            Assert.Equal("John", user.FirstName);
            Assert.Equal("Doe", user.LastName);
            Assert.Equal("https://example.com/profile.jpg", user.ProfilePictureUrl);
            Assert.Equal("Developer", user.JobTitle);
            Assert.Equal("Employee", user.AppRole);
            Assert.True(user.MustChangePassword);
            Assert.Equal("1234567890", user.PhoneNumber);
        }
    }
}
