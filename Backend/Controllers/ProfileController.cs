using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IBlobService _blobService;
        
        public ProfileController(UserManager<ApplicationUser> userManager, IBlobService blobService)
        {
            _userManager = userManager;
            _blobService = blobService;
        }
        
        // GET: api/profile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            // Retrieve the currently logged-in user's unique identifier from claims.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User identifier not found.");
            }
            
            // Fetch the user details from the database.
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            
            // Construct a profile view model (or anonymous object) with the necessary details.
            var profile = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                user.UserName,
                user.MustChangePassword,
                user.AppRole,
                user.JobTitle,
                user.ProfilePictureUrl
            };
            
            return Ok(profile);
        }

        // POST: api/profile/upload-profile-picture
        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Retrieve the current user's id.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Generate a unique blob name using the user's id and a GUID.
            string extension = Path.GetExtension(file.FileName);
            string blobName = $"profile_{userId}_{Guid.NewGuid()}{extension}";

            // Upload the file to Azure Blob Storage.
            string blobUrl = await _blobService.UploadFileAsync(file, blobName);

            // Update the user's profile with the new picture URL.
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            user.ProfilePictureUrl = blobUrl;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "Profile picture uploaded successfully.", url = blobUrl });
        }
    }
}
