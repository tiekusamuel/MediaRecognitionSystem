// DTOs/AuthDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; }
        public string? Avatar { get; set; }
    }

    public class ProfileResponse
    {
        public UserDto User { get; set; } = null!;
        public StatisticsDto Statistics { get; set; } = null!;
    }

    public class StatisticsDto
    {
        public int TotalRecognitions { get; set; }
        public int MovieRecognitions { get; set; }
        public int MusicRecognitions { get; set; }
        public double AverageAccuracy { get; set; }
    }

    public class UpdateProfileRequest
    {
        [StringLength(50, MinimumLength = 3)]
        public string? Username { get; set; }
        
        public string? Avatar { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}