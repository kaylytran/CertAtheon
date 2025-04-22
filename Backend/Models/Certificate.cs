using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Certificate
    {
        public int Id { get; set; }

        [Required]
        public int CertificateCatalogId { get; set; }
        
        // Navigation property for EF Core to load catalog details.
        public CertificateCatalog CertificateCatalog { get; set; }

        [Required]
        public DateTime CertifiedDate { get; set; }

        [Required]
        public DateTime ValidTill { get; set; }

        [Required]
        public string UserId { get; set; }
        public string? DocumentUrl { get; set; }
    }
}
