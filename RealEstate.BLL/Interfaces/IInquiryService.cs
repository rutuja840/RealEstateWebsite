using RealEstate.BLL.DTOs.Inquiry;

namespace RealEstate.BLL.Interfaces
{
    public interface IInquiryService
    {
        Task<InquiryResponseDto> CreateAsync(
            CreateInquiryDto request);

        Task<InquiryResponseDto?> GetByIdAsync(
            int id);

        Task<List<InquiryResponseDto>>
            GetByAgentIdAsync(int agentId);

        Task<bool> MarkAsReadAsync(int id);
    }
}