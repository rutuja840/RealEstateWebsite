using RealEstate.BLL.DTOs.Auth;
using RealEstate.BLL.Helpers;
using RealEstate.BLL.Interfaces;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.BLL.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtHelper _jwtHelper;

        public AuthService(
            IUserRepository userRepository,
            JwtHelper jwtHelper)
        {
            _userRepository = userRepository;
            _jwtHelper = jwtHelper;
        }

      
        // REGISTER


        public async Task<LoginResponseDto> RegisterAsync(
      RegisterRequestDto request)
        {
            if (request == null)
            {
                throw new ArgumentException(
                    "Registration data is required.");
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                throw new ArgumentException(
                    "Full name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                throw new ArgumentException(
                    "Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException(
                    "Password is required.");
            }

            var existingUser =
                await _userRepository.GetByEmailAsync(
                    request.Email);

            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "Email is already registered.");
            }

            var passwordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password);

            var user = new User
            {
                FullName = request.FullName.Trim(),

                Email = request.Email.Trim().ToLower(),

                Phone = request.PhoneNumber?.Trim()
                        ?? string.Empty,

                PasswordHash = passwordHash,

                // Public registration always User
                Role = "User",

                ProfileImage = null,

                CreatedAt = DateTime.UtcNow,

                IsActive = true
            };

            await _userRepository.AddAsync(user);

            var token =
                _jwtHelper.GenerateToken(
                    user.Id,
                    user.Email,
                    user.Role,
                    user.FullName);

            return new LoginResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            };
        }

        // LOGIN
        public async Task<LoginResponseDto> LoginAsync(
            LoginRequestDto request)
        {
            // Find user
            var user =
                await _userRepository
                    .GetByEmailAsync(request.Email);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            // Verify password
            var passwordValid =
                PasswordHelper.VerifyPassword(
                    request.Password,
                    user.PasswordHash);

            if (!passwordValid)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            // Generate JWT
            var token =
                _jwtHelper.GenerateToken(
                    user.Id,
                    user.Email,
                    user.Role,
                    user.FullName);

            // Return response
            return new LoginResponseDto
            {
                UserId = user.Id,

                FullName = user.FullName,

                Email = user.Email,

                Role = user.Role,

                Token = token
            };
        }
    }
}
