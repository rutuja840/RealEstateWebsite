using RealEstate.BLL.DTOs.Visit;
using RealEstate.BLL.Interfaces;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;

namespace RealEstate.BLL.Services
{
    public class VisitService : IVisitService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IPropertyRepository _propertyRepository;

        public VisitService(
            IVisitRepository visitRepository,
            IPropertyRepository propertyRepository)
        {
            _visitRepository = visitRepository;
            _propertyRepository = propertyRepository;
        }

      
        // CREATE / SCHEDULE VISIT
       
        public async Task<VisitResponseDto> CreateAsync(
            CreateVisitDto request)
        {
           
            // Validation
            

            if (request.PropertyId <= 0)
            {
                throw new ArgumentException(
                    "Property is required.");
            }

            if (request.UserId <= 0)
            {
                throw new ArgumentException(
                    "User is required.");
            }

            if (request.VisitDate <= DateTime.Now)
            {
                throw new ArgumentException(
                    "Visit date must be in the future.");
            }

           
            // Get Property
            

            var property =
                await _propertyRepository
                    .GetByIdAsync(request.PropertyId);

            if (property == null)
            {
                throw new ArgumentException(
                    "Property not found.");
            }

          
            // Create Visit
          

            var visit = new VisitSchedule
            {
                PropertyId = request.PropertyId,

                UserId = request.UserId,

                AgentId = property.AgentId,

                VisitDate = request.VisitDate,

                // IMPORTANT:
                // Database allows Requested, not Pending
                Status = "Requested",

                Notes = request.Notes,

                CreatedAt = DateTime.UtcNow
            };

           
            // Save
           
            var createdVisit =
                await _visitRepository
                    .AddAsync(visit);

            // Get Complete Visit

            var result =
                await _visitRepository
                    .GetByIdAsync(createdVisit.Id);

            if (result == null)
            {
                throw new InvalidOperationException(
                    "Visit could not be retrieved after creation.");
            }

            return MapToDto(result);
        }

        // =====================================================
        // GET VISIT BY ID
        // =====================================================

        public async Task<VisitResponseDto?>
            GetByIdAsync(int id)
        {
            var visit =
                await _visitRepository
                    .GetByIdAsync(id);

            if (visit == null)
            {
                return null;
            }

            return MapToDto(visit);
        }

       
        // GET VISITS BY USER
        
        public async Task<List<VisitResponseDto>>
            GetByUserIdAsync(int userId)
        {
            var visits =
                await _visitRepository
                    .GetByUserIdAsync(userId);

            return visits
                .Select(MapToDto)
                .ToList();
        }

        // GET VISITS BY AGENT
        public async Task<List<VisitResponseDto>>
            GetByAgentIdAsync(int agentId)
        {
            var visits =
                await _visitRepository
                    .GetByAgentIdAsync(agentId);

            return visits
                .Select(MapToDto)
                .ToList();
        }

        // UPDATE VISIT
       
        public async Task<bool> UpdateAsync(
            int id,
            string status,
            string? notes)
        {
            var visit =
                await _visitRepository
                    .GetByIdAsync(id);

            if (visit == null)
            {
                return false;
            }

            // IMPORTANT:
            // These must match SQL Server CHECK constraint

            var allowedStatuses = new[]
            {
                "Requested",
                "Confirmed",
                "Completed",
                "Cancelled"
            };

            if (!allowedStatuses.Contains(
                    status,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "Invalid visit status.");
            }

            visit.Status = status;
            visit.Notes = notes;

            await _visitRepository
                .UpdateAsync(visit);

            return true;
        }

        // MAP ENTITY TO DTO
        private static VisitResponseDto MapToDto(
            VisitSchedule visit)
        {
            return new VisitResponseDto
            {
                Id = visit.Id,

                PropertyId = visit.PropertyId,

                PropertyTitle =
                    visit.Property?.Title
                    ?? string.Empty,

                UserId = visit.UserId,

                UserName =
                    visit.User?.FullName
                    ?? string.Empty,

                UserEmail =
                    visit.User?.Email
                    ?? string.Empty,

                // IMPORTANT:
                // Your Users table uses Phone
                UserPhone =
                    visit.User?.Phone
                    ?? string.Empty,

                VisitDate = visit.VisitDate,

                Status = visit.Status,

                Notes = visit.Notes,

                CreatedAt = visit.CreatedAt
            };
        }
    }
}
