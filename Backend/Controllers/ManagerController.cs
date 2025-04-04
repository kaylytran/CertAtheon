using Backend.Models;
using Backend.Schemas;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Text.Json;

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
        private readonly IMessageSenderService _messageSender;  


        public ManagerController(UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager,
            ILogger<ManagerController> logger,
            IMessageSenderService messageSender)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _messageSender = messageSender; 
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
                AppRole = "Manager",
                PhoneNumber = request.PhoneNumber,
            };

            var result = await _userManager.CreateAsync(manager, request.Password);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Manager creation failed: {Errors}", result.Errors);
                return BadRequest(result.Errors);
            }
            else
            {
                // Buid JSON payload for Service Bus with new schema.
                var payload = new 
                {
                    type = "registration",
                    firstName = manager.FirstName,
                    lastName = manager.LastName,
                    email = manager.Email,
                    mobile = manager.PhoneNumber,
                    userType = manager.AppRole,
                    tempPassword = request.Password
                };
                
                var messageContent = JsonSerializer.Serialize(payload);
                try
                {
                    await _messageSender.SendMessageAsync(messageContent);
                    _logger.LogInformation("Registration Service Bus message sent: {MessageContent}", messageContent);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send registration message to Service Bus, but user was registered.");
                }
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
