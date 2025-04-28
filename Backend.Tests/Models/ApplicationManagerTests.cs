#nullable disable
using Xunit;
using Backend.Models;

namespace Backend.Tests.Models
{
    public class ApplicationManagerTests
    {
        [Fact]
        public void Can_Create_ApplicationManager_With_InheritedProperties()
        {
            // Arrange
            var manager = new ApplicationManager
            {
                Id = "manager-123",
                UserName = "manager@example.com",
                Email = "manager@example.com",
                FirstName = "Alice",
                LastName = "Smith",
                AppRole = "Manager",
                MustChangePassword = true
            };

            // Assert
            Assert.Equal("manager-123", manager.Id);
            Assert.Equal("manager@example.com", manager.UserName);
            Assert.Equal("manager@example.com", manager.Email);
            Assert.Equal("Alice", manager.FirstName);
            Assert.Equal("Smith", manager.LastName);
            Assert.Equal("Manager", manager.AppRole);
            Assert.True(manager.MustChangePassword);
        }
    }
}
