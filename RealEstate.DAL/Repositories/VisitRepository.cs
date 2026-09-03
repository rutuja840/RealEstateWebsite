using Microsoft.EntityFrameworkCore;
using RealEstate.DAL.Data;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.DAL.Repositories
{
    public class VisitRepository : IVisitRepository
    {
        private readonly ApplicationDbContext _context;

        public VisitRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // Schedule Visit
        public async Task<VisitSchedule>
            AddAsync(VisitSchedule visit)
        {
            await _context.VisitSchedules
                .AddAsync(visit);

            await _context.SaveChangesAsync();

            return visit;
        }

        // Get Visit By Id

        public async Task<VisitSchedule?>
            GetByIdAsync(int id)
        {
            return await _context.VisitSchedules

                .Include(x => x.Property)

                .ThenInclude(x => x.Agent)

                .Include(x => x.User)

                .FirstOrDefaultAsync(x => x.Id == id);
        }

        // Get Visits By User

        public async Task<List<VisitSchedule>>
            GetByUserIdAsync(int userId)
        {
            return await _context.VisitSchedules

                .Include(x => x.Property)

                .ThenInclude(x => x.Images)

                .Include(x => x.Property.PropertyType)

                .Where(x => x.UserId == userId)

                .OrderBy(x => x.VisitDate)

                .ToListAsync();
        }

        // Get Visits For Agent

        public async Task<List<VisitSchedule>>
            GetByAgentIdAsync(int agentId)
        {
            return await _context.VisitSchedules

                .Include(x => x.Property)

                .Include(x => x.User)

                .Where(x =>
                    x.Property.AgentId == agentId)

                .OrderBy(x => x.VisitDate)

                .ToListAsync();
        }

           // Update Visit

        public async Task UpdateAsync(
            VisitSchedule visit)
        {
            _context.VisitSchedules.Update(visit);

            await _context.SaveChangesAsync();
        }
    }
}
