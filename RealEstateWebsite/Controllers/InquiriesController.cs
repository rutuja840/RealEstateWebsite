using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.BLL.DTOs.Inquiry;
using RealEstate.BLL.Interfaces;
using System.Security.Claims;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InquiriesController : ControllerBase
    {
        private readonly IInquiryService _inquiryService;

        public InquiriesController(
            IInquiryService inquiryService)
        {
            _inquiryService = inquiryService;
        }

      
        // CREATE INQUIRY
        // POST: api/Inquiries
       

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateInquiryDto request)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });
            }

            // The logged-in user's ID comes from JWT.
            // Do not trust UserId sent from frontend.
            request.UserId = userId.Value;

            try
            {
                var inquiry =
                    await _inquiryService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = inquiry.Id },
                    new
                    {
                        success = true,
                        message = "Inquiry submitted successfully.",
                        data = inquiry
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // GET INQUIRY BY ID
        // GET: api/Inquiries/1

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var inquiry =
                await _inquiryService.GetByIdAsync(id);

            if (inquiry == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Inquiry not found."
                });
            }

            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });
            }

            // Admin can view any inquiry.
            if (User.IsInRole("Admin"))
            {
                return Ok(new
                {
                    success = true,
                    message = "Inquiry retrieved successfully.",
                    data = inquiry
                });
            }

            // For Agent, verify that the inquiry belongs
            // to one of the agent's properties.
            var agentInquiries =
                await _inquiryService
                    .GetByAgentIdAsync(currentUserId.Value);

            var belongsToAgent =
                agentInquiries.Any(x => x.Id == id);

            if (!belongsToAgent)
            {
                return Forbid();
            }

            return Ok(new
            {
                success = true,
                message = "Inquiry retrieved successfully.",
                data = inquiry
            });
        }

        // GET MY INQUIRIES
        // GET: api/Inquiries/my

        [HttpGet("my")]
        public async Task<IActionResult> GetMyInquiries()
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });
            }

            var inquiries =
                await _inquiryService
                    .GetByAgentIdAsync(userId.Value);

            return Ok(new
            {
                success = true,
                message = "Inquiries retrieved successfully.",
                data = inquiries
            });
        }

        // GET AGENT INQUIRIES
        // GET: api/Inquiries/agent/1

        [HttpGet("agent/{agentId:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> GetByAgent(
            int agentId)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });
            }

            // Agent can only view their own inquiries.
            if (!User.IsInRole("Admin") &&
                currentUserId.Value != agentId)
            {
                return Forbid();
            }

            var inquiries =
                await _inquiryService
                    .GetByAgentIdAsync(agentId);

            return Ok(new
            {
                success = true,
                message = "Agent inquiries retrieved successfully.",
                data = inquiries
            });
        }

       
        // MARK AS READ
        // PUT: api/Inquiries/1/read
       

        [HttpPut("{id:int}/read")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var inquiry =
                await _inquiryService.GetByIdAsync(id);

            if (inquiry == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Inquiry not found."
                });
            }

            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });
            }

            // Admin can mark any inquiry as read.
            if (!User.IsInRole("Admin"))
            {
                var agentInquiries =
                    await _inquiryService
                        .GetByAgentIdAsync(currentUserId.Value);

                var belongsToAgent =
                    agentInquiries.Any(x => x.Id == id);

                if (!belongsToAgent)
                {
                    return Forbid();
                }
            }

            var result =
                await _inquiryService
                    .MarkAsReadAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Inquiry not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Inquiry marked as read."
            });
        }

        
        // GET CURRENT USER ID FROM JWT 
       

        private int? GetCurrentUserId()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return null;
            }

            if (int.TryParse(
                    userIdClaim.Value,
                    out var userId))
            {
                return userId;
            }

            return null;
        }
    }
}
