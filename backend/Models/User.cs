// Models/User.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        
        public string? Avatar { get; set; }
        
        // Navigation property
        public virtual ICollection<Recognition> Recognitions { get; set; } = new List<Recognition>();
    }
}