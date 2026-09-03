using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.BLL.DTOs.User;
using RealEstate.BLL.Interfaces;
using System.Security.Claims;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // GET PROFILE
        // GET: api/Users/{id}

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            // Get logged-in user's ID from JWT
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });
            }

            // User can access only their own profile
            if (currentUserId.Value != id)
            {
                return Forbid();
            }

            var user =
                await _userService.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "User not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "User profile retrieved successfully.",
                data = user
            });
        }

        // GET USER BY EMAIL
        // GET: api/Users/email?email=rahul@gmail.com

        [HttpGet("email")]
        public async Task<IActionResult> GetByEmail(
            [FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Email is required."
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

            var user =
                await _userService.GetByEmailAsync(email);

            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "User not found."
                });
            }

            // Prevent users from looking up other users
            if (user.Id != currentUserId.Value)
            {
                return Forbid();
            }

            return Ok(new
            {
                success = true,
                message = "User retrieved successfully.",
                data = user
            });
        }

        // UPDATE PROFILE
        // PUT: api/Users/{id}
       
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateProfile(
     int id,
     [FromBody] UpdateUserDto request)
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

            if (currentUserId.Value != id)
            {
                return Forbid();
            }

            var result =
                await _userService.UpdateAsync(
                    id,
                    request);

            return Ok(new
            {
                success = true,
                message = "User profile updated successfully.",
                data = result
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
