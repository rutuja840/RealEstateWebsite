using RealEstate.DAL.Entities;

namespace RealEstate.DAL.Interfaces
{
    public interface IPropertyRepository
    {
        Task<List<Property>> GetAllAsync();

        Task<Property?> GetByIdAsync(int id);

        Task<List<Property>> GetByAgentIdAsync(
            int agentId);

        Task<List<Property>> SearchAsync(
            string? city,
            decimal? minPrice,
            decimal? maxPrice,
            int? propertyTypeId,
            int? bedrooms,
            int? bathrooms,
            decimal? minArea,
            decimal? maxArea,
            bool? isFurnished,
            bool? isReadyToMove);

        Task<Property> AddAsync(
            Property property);

        Task UpdateAsync(
            Property property);

        Task DeleteAsync(
            Property property);
        Task<bool> ExistsAsync(int propertyId);

        Task AddImageAsync(PropertyImage image);

        Task<PropertyImage?> GetImageAsync(int propertyId, int imageId);

        Task DeleteImageAsync(PropertyImage image);
    }
}