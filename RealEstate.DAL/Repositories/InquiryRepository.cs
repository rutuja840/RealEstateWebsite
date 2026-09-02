using Microsoft.EntityFrameworkCore;
using RealEstate.DAL.Data;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.DAL.Repositories
{
    public class InquiryRepository : IInquiryRepository
    {
        private readonly ApplicationDbContext _context;

        public InquiryRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // -----------------------------------------
        // Add Inquiry
        // -----------------------------------------

        public async Task<Inquiry> AddAsync(
            Inquiry inquiry)
        {
            await _context.Inquiries.AddAsync(inquiry);

            await _context.SaveChangesAsync();

            return inquiry;
        }

        // -----------------------------------------
        // Get Inquiry By Id
        // -----------------------------------------

        public async Task<Inquiry?> GetByIdAsync(
            int id)
        {
            return await _context.Inquiries

                .Include(x => x.Property)

                .ThenInclude(x => x.Agent)

                .Include(x => x.User)

                .FirstOrDefaultAsync(x => x.Id == id);
        }

        // -----------------------------------------
        // Get Inquiries For Agent
        // -----------------------------------------

        public async Task<List<Inquiry>>
            GetByAgentIdAsync(int agentId)
        {
            return await _context.Inquiries

                .Include(x => x.Property)

                .Include(x => x.User)

                .Where(x =>
                    x.Property.AgentId == agentId)

                .OrderByDescending(x => x.CreatedAt)

                .ToListAsync();
        }

        // -----------------------------------------
        // Update Inquiry
        // -----------------------------------------

        public async Task UpdateAsync(
            Inquiry inquiry)
        {
            _context.Inquiries.Update(inquiry);

            await _context.SaveChangesAsync();
        }
    }
}