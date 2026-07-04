// Services/IAuthService.cs
using backend.DTOs;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<ProfileResponse> GetProfileAsync(Guid userId);
        Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
        Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
        string GenerateJwtToken(Guid userId, string email);
    }
}