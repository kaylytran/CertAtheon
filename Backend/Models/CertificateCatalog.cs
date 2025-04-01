using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class CertificateCatalog
    {
        public int Id { get; set; }

        [Required]
        public string CertificateName { get; set; }

        public string Category { get; set; }
        
        public string CertificateLevel { get; set; }
        
        public string Description { get; set; }
    }
}
