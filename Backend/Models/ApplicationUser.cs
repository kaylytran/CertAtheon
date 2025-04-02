using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        // New properties for user details
        public string? FirstName { get; set; }
        public string? LastName { get; set; }        
        public string? ProfilePictureUrl { get; set; }
        public string? JobTitle { get; set; }
        public string? AppRole { get; set; }
        public bool MustChangePassword { get; set; }
    }
}