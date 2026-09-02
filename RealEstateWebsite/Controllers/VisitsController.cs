using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.BLL.DTOs.Visit;
using RealEstate.BLL.Interfaces;
using System.Security.Claims;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitsController : ControllerBase
    {
        private readonly IVisitService _visitService;

        public VisitsController(
            IVisitService visitService)
        {
            _visitService = visitService;
        }

        // =====================================================
        // SCHEDULE VISIT
        // POST: api/Visits
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateVisitDto request)
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

            // Get user ID from JWT
            request.UserId = userId.Value;

            try
            {
                var visit =
                    await _visitService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = visit.Id },
                    new
                    {
                        success = true,
                        message = "Property visit scheduled successfully.",
                        data = visit
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

        // =====================================================
        // GET VISIT BY ID
        // GET: api/Visits/1
        // =====================================================

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var visit =
                await _visitService.GetByIdAsync(id);

            if (visit == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Visit not found."
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

            // Admin can view any visit.
            if (User.IsInRole("Admin"))
            {
                return Ok(new
                {
                    success = true,
                    message = "Visit retrieved successfully.",
                    data = visit
                });
            }

            // User can view only their own visit.
            if (User.IsInRole("User") &&
                visit.UserId != currentUserId.Value)
            {
                return Forbid();
            }

            // Agent can view visits for their properties.
            if (User.IsInRole("Agent"))
            {
                var agentVisits =
                    await _visitService
                        .GetByAgentIdAsync(
                            currentUserId.Value);

                var belongsToAgent =
                    agentVisits.Any(x => x.Id == id);

                if (!belongsToAgent)
                {
                    return Forbid();
                }
            }

            return Ok(new
            {
                success = true,
                message = "Visit retrieved successfully.",
                data = visit
            });
        }

        // =====================================================
        // GET MY VISITS
        // GET: api/Visits/my
        // =====================================================

        [HttpGet("my")]
        public async Task<IActionResult> GetMyVisits()
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

            var visits =
                await _visitService
                    .GetByUserIdAsync(userId.Value);

            return Ok(new
            {
                success = true,
                message = "Your visits retrieved successfully.",
                data = visits
            });
        }

        // =====================================================
        // GET AGENT VISITS
        // GET: api/Visits/agent/1
        // =====================================================

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

            // Agent can view only their own visits.
            if (!User.IsInRole("Admin") &&
                currentUserId.Value != agentId)
            {
                return Forbid();
            }

            var visits =
                await _visitService
                    .GetByAgentIdAsync(agentId);

            return Ok(new
            {
                success = true,
                message = "Agent visits retrieved successfully.",
                data = visits
            });
        }

        // =====================================================
        // UPDATE VISIT STATUS
        // PUT: api/Visits/1
        // =====================================================

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateVisitDto request)
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

            var existingVisit =
                await _visitService.GetByIdAsync(id);

            if (existingVisit == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Visit not found."
                });
            }

            // Admin can update any visit.
            if (!User.IsInRole("Admin"))
            {
                var agentVisits =
                    await _visitService
                        .GetByAgentIdAsync(
                            currentUserId.Value);

                var belongsToAgent =
                    agentVisits.Any(x => x.Id == id);

                if (!belongsToAgent)
                {
                    return Forbid();
                }
            }

            try
            {
                var result =
                    await _visitService.UpdateAsync(
                        id,
                        request.Status,
                        request.Notes);

                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Visit not found."
                    });
                }

                var updatedVisit =
                    await _visitService.GetByIdAsync(id);

                return Ok(new
                {
                    success = true,
                    message = "Visit updated successfully.",
                    data = updatedVisit
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

        // =====================================================
        // CANCEL VISIT
        // PUT: api/Visits/1/cancel
        // =====================================================

        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id)
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

            var visit =
                await _visitService.GetByIdAsync(id);

            if (visit == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Visit not found."
                });
            }

            // Only the user who created the visit
            // can cancel it.
            if (visit.UserId != currentUserId.Value &&
                !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var result =
                await _visitService.UpdateAsync(
                    id,
                    "Cancelled",
                    visit.Notes);

            if (!result)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Visit not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Visit cancelled successfully."
            });
        }

        // =====================================================
        // GET CURRENT USER ID FROM JWT
        // =====================================================

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