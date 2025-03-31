using Backend.Models;
using Backend.Schemas;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // No role restriction applied here.
    public class ManagerController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<ManagerController> _logger;

        public ManagerController(UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager,
            ILogger<ManagerController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        // POST: api/manager/register
        [HttpPost("register")]
        public async Task<IActionResult> CreateManager([FromBody] ManagerCreateRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                _logger.LogWarning("Manager create request missing required fields.");
                return BadRequest("Missing required fields.");
            }

            // Create a new ApplicationManager instance.
            var manager = new ApplicationManager
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                MustChangePassword = true,
                AppRole = "Manager"  // Assuming this property is defined in your ApplicationUser if needed.
            };

            var result = await _userManager.CreateAsync(manager, request.Password);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Manager creation failed: {Errors}", result.Errors);
                return BadRequest(result.Errors);
            }

            // Ensure that the "Manager" role exists.
            if (!await _roleManager.RoleExistsAsync("Manager"))
            {
                var roleResult = await _roleManager.CreateAsync(new IdentityRole("Manager"));
                if (!roleResult.Succeeded)
                {
                    _logger.LogWarning("Failed to create Manager role: {Errors}", roleResult.Errors);
                    return BadRequest("Failed to create Manager role.");
                }
            }

            // Add the manager to the "Manager" role.
            var addToRoleResult = await _userManager.AddToRoleAsync(manager, "Manager");
            if (!addToRoleResult.Succeeded)
            {
                _logger.LogWarning("Failed to assign Manager role: {Errors}", addToRoleResult.Errors);
                return BadRequest(addToRoleResult.Errors);
            }

            _logger.LogInformation("Manager {Email} created successfully.", manager.Email);
            return Ok(new { message = "Manager created successfully. The manager must change the password on first login." });
        }
    }
}
