using RealEstate.DAL.Entities;

namespace RealEstate.DAL.Interfaces
{
    public interface IVisitRepository
    {
        Task<VisitSchedule> AddAsync(
            VisitSchedule visit);

        Task<List<VisitSchedule>>
            GetByUserIdAsync(int userId);

        Task<List<VisitSchedule>>
            GetByAgentIdAsync(int agentId);

        Task<VisitSchedule?> GetByIdAsync(
            int id);

        Task UpdateAsync(
            VisitSchedule visit);
    }
}