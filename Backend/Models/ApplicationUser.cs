using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        // New properties for user details
        public string FirstName { get; set; }
        public string LastName { get; set; }        
        public bool MustChangePassword { get; set; } = true;
    }
}