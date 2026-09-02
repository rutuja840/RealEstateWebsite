using RealEstate.DAL.Entities;

namespace RealEstate.DAL.Interfaces
{
    public interface IFavoriteRepository
    {
        Task<bool> ExistsAsync(
            int userId,
            int propertyId);

        Task<Favorite> AddAsync(
            Favorite favorite);

        Task RemoveAsync(
            int userId,
            int propertyId);

        Task<List<Favorite>> GetByUserIdAsync(
            int userId);
    }
}