using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RealEstate.BLL.DTOs.Inquiry;
using RealEstate.BLL.Interfaces;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RealEstate.BLL.Services
{
    public class InquiryService : IInquiryService
    {
        private readonly IInquiryRepository _inquiryRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<InquiryService> _logger;
        private readonly IConfiguration _configuration;

        public InquiryService(
            IInquiryRepository inquiryRepository,
            IPropertyRepository propertyRepository,
            IEmailService emailService,
            ILogger<InquiryService> logger,
            IConfiguration configuration)
        {
            _inquiryRepository = inquiryRepository;
            _propertyRepository = propertyRepository;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
        }

       
        // CREATE INQUIRY
        public async Task<InquiryResponseDto> CreateAsync(
            CreateInquiryDto request)
        {
            // Basic validation
            if (request.PropertyId <= 0)
            {
                throw new ArgumentException(
                    "Property is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException(
                    "Name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                throw new ArgumentException(
                    "Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Phone))
            {
                throw new ArgumentException(
                    "Phone number is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                throw new ArgumentException(
                    "Message is required.");
            }

            // Ensure property exists and load agent info
            var property = await _propertyRepository.GetByIdAsync(request.PropertyId);

            if (property == null)
            {
                throw new ArgumentException($"Property with id {request.PropertyId} was not found.");
            }

            // Create Inquiry entity
            var inquiry = new Inquiry
            {
                PropertyId = request.PropertyId,

                UserId = request.UserId,

                Name = request.Name,

                Email = request.Email,

                PhoneNumber = request.Phone,

                PreferredVisitDate =
                    request.PreferredVisitDate,

                Message = request.Message,

                IsRead = false,

                CreatedAt = DateTime.UtcNow
            };

            // Save inquiry
            var createdInquiry =
                await _inquiryRepository
                    .AddAsync(inquiry);

            // Get complete inquiry
            var result =
                await _inquiryRepository
                    .GetByIdAsync(createdInquiry.Id);

            if (result == null)
            {
                throw new InvalidOperationException(
                    "Inquiry could not be retrieved after creation.");
            }

            // Send notification email to agent if available
            try
            {
                // Prefer agent email from loaded property when available (property includes Agent due to repository GetByIdAsync)
                var agentEmail = result.Property?.Agent?.Email ?? property?.Agent?.Email;

                // Override agent email if Notification:AgentOverrideEmail is set (force all notifications to one address)
                var overrideEmail = _configuration["Notification:AgentOverrideEmail"];

                if (!string.IsNullOrWhiteSpace(overrideEmail))
                {
                    agentEmail = overrideEmail;
                }

                if (string.IsNullOrWhiteSpace(agentEmail))
                {
                    _logger?.LogWarning("No agent email found for PropertyId {PropertyId} (InquiryId {InquiryId}). No notification sent.", result.PropertyId, result.Id);
                }
                else
                {
                    _logger?.LogInformation("Attempting to send inquiry notification to {AgentEmail} for InquiryId {InquiryId} and PropertyId {PropertyId}", agentEmail, result.Id, result.PropertyId);

                    var subject = $"New inquiry for: {result.Property?.Title ?? property?.Title ?? "Property"}";

                    var body = $@"

Hello {result.Property?.Agent?.FullName ?? property?.Agent?.FullName ?? "Agent"},

You have received a new inquiry for your property: {result.Property?.Title ?? property?.Title}

From: {result.Name} ({result.Email})
Phone: {result.PhoneNumber}

Message:
{result.Message}

Preferred Visit Date: {result.PreferredVisitDate?.ToString("u") ?? "N/A"}

Please login to the admin panel to view and respond to this inquiry.
";

                    await _emailService.SendAsync(agentEmail, subject, body, isHtml: false);
                }
            }
            catch (Exception ex)
            {
                // Don't fail the request if email sending fails. Log detailed error via logger.
                _logger?.LogError(ex, "Failed to send inquiry email notification for InquiryId {InquiryId}", result.Id);
            }

            return MapToDto(result);
        }

        
        // GET INQUIRY BY ID
        

        public async Task<InquiryResponseDto?>
            GetByIdAsync(int id)
        {
            var inquiry =
                await _inquiryRepository
                    .GetByIdAsync(id);

            if (inquiry == null)
            {
                return null;
            }

            return MapToDto(inquiry);
        }

        // GET INQUIRIES BY AGENT

        public async Task<List<InquiryResponseDto>>
            GetByAgentIdAsync(int agentId)
        {
            var inquiries =
                await _inquiryRepository
                    .GetByAgentIdAsync(agentId);

            return inquiries
                .Select(MapToDto)
                .ToList();
        }

        
        // MARK INQUIRY AS READ
        

        public async Task<bool>
            MarkAsReadAsync(int id)
        {
            var inquiry =
                await _inquiryRepository
                    .GetByIdAsync(id);

            if (inquiry == null)
            {
                return false;
            }

            inquiry.IsRead = true;

            await _inquiryRepository
                .UpdateAsync(inquiry);

            return true;
        }

       
        // MAP ENTITY TO DTO
        private static InquiryResponseDto MapToDto(
            Inquiry inquiry)
        {
            return new InquiryResponseDto
            {
                Id = inquiry.Id,

                PropertyId = inquiry.PropertyId,

                PropertyTitle =
                    inquiry.Property?.Title
                    ?? string.Empty,

                UserId = inquiry.UserId,

                Name = inquiry.Name,

                Email = inquiry.Email,

                PhoneNumber = inquiry.PhoneNumber,

                PreferredVisitDate =
                    inquiry.PreferredVisitDate,

                Message = inquiry.Message,

                IsRead = inquiry.IsRead,

                CreatedAt = inquiry.CreatedAt
            };
        }
    }
}
