#nullable disable
using Xunit;
using Moq;
using Backend.Controllers;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using System;

namespace Backend.Tests.Controllers
{
    public class HomeControllerTests
    {
        private readonly HomeController _controller;

        public HomeControllerTests()
        {
            var loggerMock = new Mock<ILogger<HomeController>>();
            _controller = new HomeController(loggerMock.Object);

            // Mock HttpContext because Error() uses HttpContext.TraceIdentifier
            var httpContext = new DefaultHttpContext();
            httpContext.TraceIdentifier = Guid.NewGuid().ToString();

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        [Fact]
        public void Index_ReturnsView()
        {
            // Act
            var result = _controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.Null(viewResult.ViewName); // will use default view
        }

        [Fact]
        public void Privacy_ReturnsView()
        {
            // Act
            var result = _controller.Privacy();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.Null(viewResult.ViewName); // will use default view
        }

        [Fact]
        public void Error_ReturnsViewWithModel()
        {
            // Act
            var result = _controller.Error();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<ErrorViewModel>(viewResult.Model);
            Assert.False(string.IsNullOrEmpty(model.RequestId));
        }
    }
}
