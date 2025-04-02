using System.ComponentModel.DataAnnotations;

namespace Backend.Schemas
{
    public class CertificateCatalogAddRequest
    {

        [Required]
        public string CertificateName { get; set; }

        public string Category { get; set; }
        
        public string CertificateLevel { get; set; }
        
        public string Description { get; set; }
    }
}
