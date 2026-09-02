using RealEstate.BLL.DTOs.Favorite;
using RealEstate.BLL.Interfaces;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.BLL.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IFavoriteRepository _favoriteRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly IUserRepository _userRepository;

        public FavoriteService(
            IFavoriteRepository favoriteRepository,
            IPropertyRepository propertyRepository,
            IUserRepository userRepository)
        {
            _favoriteRepository = favoriteRepository;
            _propertyRepository = propertyRepository;
            _userRepository = userRepository;
        }

       
        // ADD PROPERTY TO FAVORITES
        
        public async Task<FavoriteResponseDto> AddAsync(
            int userId,
            int propertyId)
        {
            
            // Validate User
            

            var userExists =
                await _userRepository.ExistsAsync(userId);

            if (!userExists)
            {
                throw new InvalidOperationException(
                    "User does not exist.");
            }

            // Validate Property
            

            var propertyExists =
                await _propertyRepository.ExistsAsync(propertyId);

            if (!propertyExists)
            {
                throw new InvalidOperationException(
                    "Property does not exist.");
            }

            
            // Check Duplicate Favorite
            

            var exists =
                await _favoriteRepository
                    .ExistsAsync(userId, propertyId);

            if (exists)
            {
                throw new InvalidOperationException(
                    "Property is already added to favorites.");
            }

           
            // Create Favorite
            

            var favorite = new Favorite
            {
                UserId = userId,
                PropertyId = propertyId,
                CreatedAt = DateTime.UtcNow
            };

           
            // Save
           

            var createdFavorite =
                await _favoriteRepository
                    .AddAsync(favorite);

            
            // Get Created Favorite with Property
            

            var favorites =
                await _favoriteRepository
                    .GetByUserIdAsync(userId);

            var result =
                favorites.FirstOrDefault(x =>
                    x.Id == createdFavorite.Id);

            if (result == null)
            {
                throw new InvalidOperationException(
                    "Favorite could not be retrieved.");
            }

            return MapToDto(result);
        }

        
        // REMOVE FAVORITE
        

        public async Task<bool> RemoveAsync(
            int userId,
            int propertyId)
        {
            var exists =
                await _favoriteRepository
                    .ExistsAsync(userId, propertyId);

            if (!exists)
            {
                return false;
            }

            await _favoriteRepository
                .RemoveAsync(userId, propertyId);

            return true;
        }

        
        // CHECK FAVORITE
        

        public async Task<bool> ExistsAsync(
            int userId,
            int propertyId)
        {
            return await _favoriteRepository
                .ExistsAsync(userId, propertyId);
        }

       
        // GET USER FAVORITES
      

        public async Task<List<FavoriteResponseDto>>
            GetByUserIdAsync(int userId)
        {
            var favorites =
                await _favoriteRepository
                    .GetByUserIdAsync(userId);

            return favorites
                .Select(MapToDto)
                .ToList();
        }

        // =====================================================
        // MAP ENTITY TO DTO
        // =====================================================

        private static FavoriteResponseDto MapToDto(
            Favorite favorite)
        {
            var property = favorite.Property;

            return new FavoriteResponseDto
            {
                Id = favorite.Id,

                UserId = favorite.UserId,

                PropertyId = favorite.PropertyId,

                PropertyTitle =
                    property?.Title ?? string.Empty,

                Price =
                    property?.Price ?? 0,

                City =
                    property?.City ?? string.Empty,

                PropertyType =
                    property?.PropertyType?.Name
                    ?? string.Empty,

                PrimaryImage =
                    property?.Images?
                        .Select(x => x.ImageUrl)
                        .FirstOrDefault(),

                CreatedAt = favorite.CreatedAt
            };
        }
    }
}