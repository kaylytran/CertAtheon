using System;

namespace Backend.Models
{
    public class Certificate
    {
        public int Id { get; set; }
        public string CertificateName { get; set; }
        public DateTime CertifiedDate { get; set; }
        public DateTime ValidTill { get; set; }
        
        public string UserId { get; set; }
    }
}