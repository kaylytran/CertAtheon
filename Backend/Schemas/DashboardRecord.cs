using System;

namespace Backend.Schemas
{
    public class DashboardRecord
    {
        public string EmployeeId { get; set; }
        public string FullName { get; set; }
        // Role is taken from the user's AppRole
        public string Role { get; set; }
        // Grade is taken from the user's JobTitle
        public string Grade { get; set; }
        public string Email { get; set; }
        public string CertificateName { get; set; }
        public string CertificateLevel { get; set; }
        // Dates as strings so we can show "No Certificate" if missing
        public string CertifiedDate { get; set; }
        public string ExpiryDate { get; set; }
    }
}
//                     return new[] { new DashboardRecord