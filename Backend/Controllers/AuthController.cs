using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;


namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly IMessageSenderService _messageSender;  
        
        public AuthController(UserManager<ApplicationUser> userManager, 
                              SignInManager<ApplicationUser> signInManager,
                              IConfiguration configuration,
                              ILogger<AuthController> logger,
                              IMessageSenderService messageSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _messageSender = messageSender; 
        }
        
        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
                return BadRequest("Invalid registration request.");
            
            var user = new ApplicationUser 
            { 
                UserName = request.Email, 
                Email = request.Email, 
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                JobTitle = request.JobTitle,
                MustChangePassword = true,
                AppRole = "Employee"
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);

                // Build JSON payload for Service Bus with new schema.
                var payload = new 
                {
                    type = "registration",
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    mobile = user.PhoneNumber,
                    role = user.JobTitle,
                    grade = user.JobTitle,
                    userType = user.AppRole,
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

                return Ok(new { message = "Registration successful." });
            }
            return BadRequest(result.Errors);
        }
        
        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest("Invalid login request.");
            
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed: user not found for email {Email}", request.Email);
                return Unauthorized(new { message = "Invalid login attempt." });
            }
            
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed for email {Email}: invalid credentials", request.Email);
                return Unauthorized(new { message = "Invalid login attempt." });
            }
            
            // Generate JWT token
            var token = GenerateJwtToken(user);
            
            _logger.LogInformation("User {Email} logged in successfully.", request.Email);
            return Ok(new 
            { 
                message = "Login successful", 
                token = token,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                appRole = user.AppRole,
                mustChangePassword = user.MustChangePassword
            });
        }
        
        // POST: api/auth/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();
            
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (result.Succeeded)
            {
                user.MustChangePassword = false;
                await _userManager.UpdateAsync(user);
                return Ok(new { message = "Password changed successfully." });
            }
            return BadRequest(result.Errors);
        }
        
        // POST: api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out successfully." });
        }
        
        private string GenerateJwtToken(ApplicationUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
            
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName),
                new Claim("AppRole", user.AppRole),
                new Claim(ClaimTypes.Role, user.AppRole)
            };
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(30),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
    
    // DTO classes for authentication requests
    public class RegisterRequest
    {
        public string? FirstName { get; set; }
        public string? LastName  { get; set; }
        public string? Email     { get; set; }
        public string? Password  { get; set; }
        public string? Grade  { get; set; }
        public string? PhoneNumber  { get; set; }
        public string? JobTitle  { get; set; }
        
    }
    
    public class LoginRequest
    {
        public string? Email    { get; set; }
        public string? Password { get; set; }
    }
    
    public class ChangePasswordRequest
    {
        public string? CurrentPassword { get; set; }
        public string? NewPassword     { get; set; }
    }
}
