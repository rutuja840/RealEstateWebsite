using Microsoft.EntityFrameworkCore;
using RealEstate.DAL.Data;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.DAL.Repositories
{
    public class PropertyRepository : IPropertyRepository
    {
        private readonly ApplicationDbContext _context;

        public PropertyRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // Get All Properties

        public async Task<List<Property>> GetAllAsync()
        {
            return await _context.Properties

                .Include(x => x.Agent)

                .Include(x => x.PropertyType)

                .Include(x => x.Images)

                .Where(x => x.IsActive)

                .OrderByDescending(x => x.CreatedAt)

                .ToListAsync();
        }

        // Get Property By Id
        public async Task<Property?> GetByIdAsync(int id)
        {
            return await _context.Properties

                .Include(x => x.Agent)

                .Include(x => x.PropertyType)

                .Include(x => x.Images)

                .FirstOrDefaultAsync(x => x.Id == id);
        }
       
        // Get Properties By Agent
        
        public async Task<List<Property>>
            GetByAgentIdAsync(int agentId)
        {
            return await _context.Properties

                .Include(x => x.PropertyType)

                .Include(x => x.Images)

                .Where(x => x.AgentId == agentId)

                .OrderByDescending(x => x.CreatedAt)

                .ToListAsync();
        }

        // Advanced Search
        public async Task<List<Property>> SearchAsync(
            string? city,
            decimal? minPrice,
            decimal? maxPrice,
            int? propertyTypeId,
            int? bedrooms,
            int? bathrooms,
            decimal? minArea,
            decimal? maxArea,
            bool? isFurnished,
            bool? isReadyToMove)
        {
            IQueryable<Property> query =
                _context.Properties

                .Include(x => x.Agent)

                .Include(x => x.PropertyType)

                .Include(x => x.Images)

                .Where(x => x.IsActive);

            // City
            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(x =>
                    x.City.Contains(city));
            }

            // Minimum Price
            if (minPrice.HasValue)
            {
                query = query.Where(x =>
                    x.Price >= minPrice.Value);
            }

            // Maximum Price
            if (maxPrice.HasValue)
            {
                query = query.Where(x =>
                    x.Price <= maxPrice.Value);
            }

            // Property Type
            if (propertyTypeId.HasValue)
            {
                query = query.Where(x =>
                    x.PropertyTypeId ==
                    propertyTypeId.Value);
            }

            // Bedrooms
            if (bedrooms.HasValue)
            {
                query = query.Where(x =>
                    x.Bedrooms >= bedrooms.Value);
            }

            // Bathrooms
            if (bathrooms.HasValue)
            {
                query = query.Where(x =>
                    x.Bathrooms >= bathrooms.Value);
            }

            // Minimum Area
            if (minArea.HasValue)
            {
                query = query.Where(x =>
                    x.Area >= minArea.Value);
            }

            // Maximum Area
            if (maxArea.HasValue)
            {
                query = query.Where(x =>
                    x.Area <= maxArea.Value);
            }

            // Furnished / Unfurnished
            if (isFurnished.HasValue)
            {
                query = query.Where(x =>
                    x.IsFurnished ==
                    isFurnished.Value);
            }

            // Ready to Move / Under Construction
            if (isReadyToMove.HasValue)
            {
                query = query.Where(x =>
                    x.IsReadyToMove ==
                    isReadyToMove.Value);
            }

            return await query

                .OrderByDescending(x => x.CreatedAt)

                .ToListAsync();
        }

        // Add Property
        public async Task<Property> AddAsync(
            Property property)
        {
            await _context.Properties.AddAsync(property);

            await _context.SaveChangesAsync();

            return property;
        }

        // Update Property

        public async Task UpdateAsync(
            Property property)
        {
            _context.Properties.Update(property);

            await _context.SaveChangesAsync();
        }

        // Delete Property
        

        public async Task DeleteAsync(
            Property property)
        {
            _context.Properties.Remove(property);

            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int propertyId)
        {
            return await _context.Properties
                .AnyAsync(x => x.Id == propertyId);
        }

        public async Task AddImageAsync(PropertyImage image)
        {
            await _context.PropertyImages.AddAsync(image);
            await _context.SaveChangesAsync();
        }

        public async Task<PropertyImage?> GetImageAsync(int propertyId, int imageId)
        {
            return await _context.PropertyImages
                .Include(image => image.Property)
                .FirstOrDefaultAsync(image =>
                    image.PropertyId == propertyId && image.Id == imageId);
        }

        public async Task DeleteImageAsync(PropertyImage image)
        {
            _context.PropertyImages.Remove(image);
            await _context.SaveChangesAsync();
        }
    }
}
