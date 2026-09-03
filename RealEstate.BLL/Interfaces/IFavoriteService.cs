using RealEstate.BLL.DTOs.Favorite;

namespace RealEstate.BLL.Interfaces
{
    public interface IFavoriteService
    {
        // Add property to favorites
        Task<FavoriteResponseDto>
            AddAsync(
                int userId,
                int propertyId);
        // Remove property from favorites
        Task<bool>
            RemoveAsync(
                int userId,
                int propertyId);
        // Check whether property is favorite
        Task<bool>
            ExistsAsync(
                int userId,
                int propertyId);
        // Get all favorites of user
        Task<List<FavoriteResponseDto>>
            GetByUserIdAsync(int userId);
    }
}
