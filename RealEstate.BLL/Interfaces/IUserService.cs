using RealEstate.BLL.DTOs.User;

namespace RealEstate.BLL.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDto?> GetByIdAsync(int id);

        Task<UserResponseDto?> GetByEmailAsync(
            string email);

        Task<UserResponseDto> UpdateAsync(
            int id,
            UpdateUserDto request);
    }
}