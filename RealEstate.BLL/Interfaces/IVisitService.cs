using RealEstate.BLL.DTOs.Visit;

namespace RealEstate.BLL.Interfaces
{
    public interface IVisitService
    {
        Task<VisitResponseDto> CreateAsync(
            CreateVisitDto request);

        Task<VisitResponseDto?> GetByIdAsync(
            int id);

        Task<List<VisitResponseDto>>
            GetByUserIdAsync(int userId);

        Task<List<VisitResponseDto>>
            GetByAgentIdAsync(int agentId);

        Task<bool> UpdateAsync(
            int id,
            string status,
            string? notes);
    }
}