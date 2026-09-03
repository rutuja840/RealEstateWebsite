using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.BLL.Interfaces;
using System.Security.Claims;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;

        public FavoritesController(
            IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }
       
        // POST: api/Favorites/{propertyId}

        [HttpPost("{propertyId:int}")]
        public async Task<IActionResult> AddFavorite(
            int propertyId)
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

            if (propertyId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid property ID."
                });
            }

            try
            {
                var favorite =
                    await _favoriteService.AddAsync(
                        userId.Value,
                        propertyId);

                return Ok(new
                {
                    success = true,
                    message = "Property added to favorites.",
                    data = favorite
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
       
        // DELETE: api/Favorites/{propertyId}
        
        [HttpDelete("{propertyId:int}")]
        public async Task<IActionResult> RemoveFavorite(
            int propertyId)
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

            if (propertyId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid property ID."
                });
            }

            var removed =
                await _favoriteService.RemoveAsync(
                    userId.Value,
                    propertyId);

            if (!removed)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Property is not in your favorites."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Property removed from favorites."
            });
        }
        
        // GET: api/Favorites/check/{propertyId}
        
        [HttpGet("check/{propertyId:int}")]
        public async Task<IActionResult> CheckFavorite(
            int propertyId)
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

            if (propertyId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid property ID."
                });
            }

            var exists =
                await _favoriteService.ExistsAsync(
                    userId.Value,
                    propertyId);

            return Ok(new
            {
                success = true,
                isFavorite = exists
            });
        }
       
        // GET: api/Favorites
       
        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
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

            var favorites =
                await _favoriteService
                    .GetByUserIdAsync(userId.Value);

            return Ok(new
            {
                success = true,
                message = "Favorites retrieved successfully.",
                data = favorites
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
