using RealEstate.BLL.DTOs.User;
using RealEstate.BLL.Interfaces;
using RealEstate.DAL.Interfaces;

namespace RealEstate.BLL.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

      
        // GET USER BY ID
        
        public async Task<UserResponseDto?> GetByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                return null;
            }

            return new UserResponseDto
            {
                Id = user.Id,

                FullName = user.FullName,

                Email = user.Email,

                Phone = user.Phone,

                Role = user.Role,

                CreatedAt = user.CreatedAt
            };
        }

        // GET USER BY EMAIL
       
        public async Task<UserResponseDto?> GetByEmailAsync(
            string email)
        {
            var user =
                await _userRepository.GetByEmailAsync(email);

            if (user == null)
            {
                return null;
            }

            return new UserResponseDto
            {
                Id = user.Id,

                FullName = user.FullName,

                Email = user.Email,

                Phone = user.Phone,

                Role = user.Role,

                CreatedAt = user.CreatedAt
            };
        }

        // UPDATE USER PROFILE
       
        public async Task<UserResponseDto> UpdateAsync(
            int id,
            UpdateUserDto request)
        {
            // Get existing user
            var user =
                await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "User not found.");
            }

            // Update allowed profile fields
            user.FullName = request.FullName;

            user.Phone = request.Phone;

            // Save changes
            await _userRepository.UpdateAsync(user);

            // Return updated user
            return new UserResponseDto
            {
                Id = user.Id,

                FullName = user.FullName,

                Email = user.Email,

                Phone = user.Phone,

                Role = user.Role,

                CreatedAt = user.CreatedAt
            };
        }
    }
}
