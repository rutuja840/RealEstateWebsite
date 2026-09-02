using RealEstate.DAL.Entities;

namespace RealEstate.DAL.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);

        Task<User?> GetByEmailAsync(string email);

        Task<User> AddAsync(User user);

        Task UpdateAsync(User user);
        Task<bool> ExistsAsync(int userId);
    }
}