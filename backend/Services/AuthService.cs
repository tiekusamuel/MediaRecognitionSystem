// Services/AuthService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Text;
using backend.Configuration;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext context, 
            IOptions<JwtSettings> jwtSettings,
            ILogger<AuthService> logger)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Check if email already exists
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    throw new InvalidOperationException("Email already in use");
                }

                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    throw new InvalidOperationException("Username already taken");
                }

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    Email = request.Email.ToLower(),
                    PasswordHash = HashPassword(request.Password),
                    JoinDate = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User registered successfully: {Email}", user.Email);

                // Generate token
                var token = GenerateJwtToken(user.Id, user.Email);

                return new AuthResponse
                {
                    Token = token,
                    User = MapToUserDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

                if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
                    throw new UnauthorizedAccessException("Invalid email or password");
                }

                var token = GenerateJwtToken(user.Id, user.Email);

                _logger.LogInformation("User logged in successfully: {Email}", user.Email);

                return new AuthResponse
                {
                    Token = token,
                    User = MapToUserDto(user)
                };
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<ProfileResponse> GetProfileAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.Recognitions)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    throw new KeyNotFoundException("User not found");
                }

                var recognitions = user.Recognitions;
                var movieRecognitions = recognitions.Count(r => r.Type.Equals("movie", StringComparison.OrdinalIgnoreCase));
                var musicRecognitions = recognitions.Count(r => r.Type.Equals("music", StringComparison.OrdinalIgnoreCase));

                return new ProfileResponse
                {
                    User = MapToUserDto(user),
                    Statistics = new StatisticsDto
                    {
                        TotalRecognitions = recognitions.Count,
                        MovieRecognitions = movieRecognitions,
                        MusicRecognitions = musicRecognitions,
                        AverageAccuracy = recognitions.Any() 
                            ? Math.Round(recognitions.Average(r => r.Accuracy), 2)
                            : 0
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    throw new KeyNotFoundException("User not found");
                }

                if (!string.IsNullOrEmpty(request.Username) && request.Username != user.Username)
                {
                    // Check if username is already taken by another user
                    if (await _context.Users.AnyAsync(u => u.Username == request.Username && u.Id != userId))
                    {
                        throw new InvalidOperationException("Username already taken");
                    }
                    user.Username = request.Username;
                }

                if (request.Avatar != null)
                {
                    user.Avatar = request.Avatar;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Profile updated for user: {UserId}", userId);

                return MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile for user: {UserId}", userId);
                throw;
            }
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    throw new KeyNotFoundException("User not found");
                }

                if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    throw new UnauthorizedAccessException("Current password is incorrect");
                }

                user.PasswordHash = HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Password changed for user: {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
                throw;
            }
        }

        public string GenerateJwtToken(Guid userId, string email)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Email, email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Using PBKDF2 for better security than SHA256
        private static string HashPassword(string password)
        {
            byte[] salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetNonZeroBytes(salt);
            }

            byte[] hash = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8);

            byte[] hashBytes = new byte[salt.Length + hash.Length];
            Array.Copy(salt, 0, hashBytes, 0, salt.Length);
            Array.Copy(hash, 0, hashBytes, salt.Length, hash.Length);

            return Convert.ToBase64String(hashBytes);
        }

        private static bool VerifyPassword(string password, string storedHash)
        {
            byte[] hashBytes = Convert.FromBase64String(storedHash);
            
            byte[] salt = new byte[128 / 8];
            Array.Copy(hashBytes, 0, salt, 0, salt.Length);

            byte[] hash = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8);

            for (int i = 0; i < hash.Length; i++)
            {
                if (hashBytes[i + salt.Length] != hash[i])
                    return false;
            }

            return true;
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                JoinDate = user.JoinDate,
                Avatar = user.Avatar
            };
        }
    }
}