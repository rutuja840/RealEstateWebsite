using RealEstate.DAL.Entities;

namespace RealEstate.DAL.Interfaces
{
    public interface IInquiryRepository
    {
        Task<Inquiry> AddAsync(
            Inquiry inquiry);

        Task<List<Inquiry>> GetByAgentIdAsync(
            int agentId);

        Task<Inquiry?> GetByIdAsync(
            int id);

        Task UpdateAsync(
            Inquiry inquiry);
    }
}