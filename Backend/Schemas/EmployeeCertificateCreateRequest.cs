using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Schemas
{
    public class EmployeeCertificateCreateRequest
    {
        [Required]
        public int CertificateCatalogId { get; set; }

        [Required]
        public DateTime CertifiedDate { get; set; }

        [Required]
        public DateTime ValidTill { get; set; }
    }
}
