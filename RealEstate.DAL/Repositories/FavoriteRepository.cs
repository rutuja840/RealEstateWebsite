using Microsoft.EntityFrameworkCore;
using RealEstate.DAL.Data;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.DAL.Repositories
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly ApplicationDbContext _context;

        public FavoriteRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // -----------------------------------------
        // Check Favorite Exists
        // -----------------------------------------

        public async Task<bool> ExistsAsync(
            int userId,
            int propertyId)
        {
            return await _context.Favorites
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.PropertyId == propertyId);
        }

        // -----------------------------------------
        // Add Favorite
        // -----------------------------------------

        public async Task<Favorite> AddAsync(
            Favorite favorite)
        {
            await _context.Favorites.AddAsync(favorite);

            await _context.SaveChangesAsync();

            return favorite;
        }

        // -----------------------------------------
        // Remove Favorite
        // -----------------------------------------

        public async Task RemoveAsync(
            int userId,
            int propertyId)
        {
            var favorite =
                await _context.Favorites
                    .FirstOrDefaultAsync(x =>
                        x.UserId == userId &&
                        x.PropertyId == propertyId);

            if (favorite != null)
            {
                _context.Favorites.Remove(favorite);

                await _context.SaveChangesAsync();
            }
        }

        // -----------------------------------------
        // Get My Favorites
        // -----------------------------------------

        public async Task<List<Favorite>>
            GetByUserIdAsync(int userId)
        {
            return await _context.Favorites

                .Include(x => x.Property)

                .ThenInclude(x => x.Images)

                .Include(x => x.Property.PropertyType)

                .Where(x => x.UserId == userId)

                .OrderByDescending(x => x.CreatedAt)

                .ToListAsync();
        }
    }
}