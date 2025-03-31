using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class CertificateCatalog
    {
        public int Id { get; set; }

        // Optional description.
        public string Description { get; set; }

        [Required]
        public string CertificateName { get; set; }

        // Category: e.g., Developer, Architect, etc.
        public string Category { get; set; }

        // Optionally, the level of the certificate: e.g., Fundamental, Professional.
        public string CertificateLevel { get; set; }

    }
}
