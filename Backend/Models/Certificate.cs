using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Certificate
    {
        public int Id { get; set; }
        
        [Required]
        public string? CertificateName { get; set; }
        
        [Required]
        public DateTime CertifiedDate { get; set; }
        
        [Required]
        public DateTime ValidTill { get; set; }
        
        // Remove the Required attribute since this will be set server-side.
        public string? UserId { get; set; }
    }
}