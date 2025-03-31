using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        
        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
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
                MustChangePassword = true,
                AppRole = "Employee"
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
                return Ok(new { message = "Registration successful. Please change your password on first login." });
            }
            return BadRequest(result.Errors);
        }
        
        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest("Invalid login request.");
            
            var result = await _signInManager.PasswordSignInAsync(request.Email, request.Password, false, lockoutOnFailure: false);
            if (result.Succeeded)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                return Ok(new 
                { 
                    message = "Login successful", 
                    mustChangePassword = user.MustChangePassword 
                });
            }
            return Unauthorized(new { message = "Invalid login attempt." });
        }
        
        // POST: api/auth/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // Get the currently signed-in user
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
    }
    
    // DTO classes for authentication requests
    public class RegisterRequest
    {
        public string? FirstName { get; set; }
        public string? LastName  { get; set; }
        public string? Email     { get; set; }
        public string? Password  { get; set; }
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