using RealEstate.BLL.DTOs.Property;

namespace RealEstate.BLL.Interfaces
{
    public interface IPropertyService
    {
        Task<List<PropertyResponseDto>> GetAllAsync();

        Task<PropertyResponseDto?> GetByIdAsync(int id);

        Task<List<PropertyResponseDto>> GetByAgentIdAsync(
            int agentId);

        Task<List<PropertyResponseDto>> SearchAsync(
            PropertySearchDto request);

        Task<PropertyResponseDto> CreateAsync(
            CreatePropertyDto request);

        Task<PropertyResponseDto> UpdateAsync(
            int id,
            UpdatePropertyDto request);

        Task<bool> DeleteAsync(int id);
        Task AddImageAsync(int propertyId, string imageUrl);

        Task<string> DeleteImageAsync(int propertyId, int imageId);
    }
}