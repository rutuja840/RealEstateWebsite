using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.BLL.DTOs.Property;
using RealEstate.BLL.Interfaces;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public PropertiesController(
            IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        // =====================================================
        // GET ALL PROPERTIES
        // GET: api/Properties
        // =====================================================

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var properties =
                await _propertyService.GetAllAsync();

            return Ok(new
            {
                success = true,
                message = "Properties retrieved successfully.",
                data = properties
            });
        }

        // =====================================================
        // GET PROPERTY BY ID
        // GET: api/Properties/1
        // =====================================================

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var property =
                await _propertyService.GetByIdAsync(id);

            if (property == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Property not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Property retrieved successfully.",
                data = property
            });
        }

        // =====================================================
        // SEARCH / FILTER PROPERTIES
        // GET: api/Properties/search
        // =====================================================

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(
            [FromQuery] PropertySearchDto request)
        {
            var properties =
                await _propertyService.SearchAsync(request);

            return Ok(new
            {
                success = true,
                message = "Properties searched successfully.",
                data = properties
            });
        }

        // =====================================================
        // GET PROPERTIES BY AGENT
        // GET: api/Properties/agent/1
        // =====================================================

        [HttpGet("agent/{agentId:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> GetByAgent(
            int agentId)
        {
            var currentUserId = GetCurrentUserId();

            var isAdmin =
                User.IsInRole("Admin");

            // Agent can only access their own properties.
            if (!isAdmin &&
                (currentUserId == null ||
                 currentUserId.Value != agentId))
            {
                return Forbid();
            }

            var properties =
                await _propertyService
                    .GetByAgentIdAsync(agentId);

            return Ok(new
            {
                success = true,
                message = "Agent properties retrieved successfully.",
                data = properties
            });
        }

        // =====================================================
        // CREATE PROPERTY
        // POST: api/Properties
        // =====================================================

        [HttpPost]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreatePropertyDto request)
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

            // Always take AgentId from JWT.
            // Do not trust AgentId sent by client.
            request.AgentId = currentUserId.Value;

            var property =
                await _propertyService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = property.Id },
                new
                {
                    success = true,
                    message = "Property created successfully.",
                    data = property
                });
        }

        // =====================================================
        // UPDATE PROPERTY
        // PUT: api/Properties/1
        // =====================================================

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdatePropertyDto request)
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

            // Get existing property
            var existingProperty =
                await _propertyService.GetByIdAsync(id);

            if (existingProperty == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Property not found."
                });
            }

            var isAdmin =
                User.IsInRole("Admin");

            // Only property owner/agent or admin
            // can update property.
            if (!isAdmin &&
                existingProperty.AgentId != currentUserId.Value)
            {
                return Forbid();
            }

            var property =
                await _propertyService.UpdateAsync(
                    id,
                    request);

            return Ok(new
            {
                success = true,
                message = "Property updated successfully.",
                data = property
            });
        }

        // =====================================================
        // DELETE PROPERTY
        // DELETE: api/Properties/1
        // =====================================================

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> Delete(int id)
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

            var existingProperty =
                await _propertyService.GetByIdAsync(id);

            if (existingProperty == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Property not found."
                });
            }

            var isAdmin =
                User.IsInRole("Admin");

            // Only property owner/agent or admin
            // can delete property.
            if (!isAdmin &&
                existingProperty.AgentId != currentUserId.Value)
            {
                return Forbid();
            }

            var deleted =
                await _propertyService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Property could not be deleted."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Property deleted successfully."
            });
        }

        // =====================================================
        // UPLOAD IMAGES
        // POST: api/Properties/{propertyId}/images
        // =====================================================

        [HttpPost("{propertyId:int}/images")]
        [Authorize(Roles = "Agent,Admin")]
        [RequestSizeLimit(25_000_000)]
        public async Task<IActionResult> UploadImages(
            int propertyId,
            [FromForm] List<IFormFile> files)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid authentication token."
                });

            if (files == null || files.Count == 0)
                return BadRequest(new
                {
                    success = false,
                    message = "Please select at least one image."
                });

            var property = await _propertyService.GetByIdAsync(propertyId);

            if (property == null)
                return NotFound(new
                {
                    success = false,
                    message = "Property not found."
                });

            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && property.AgentId != currentUserId.Value)
                return Forbid();

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var uploadedUrls = new List<string>();

            foreach (var file in files)
            {
                if (file.Length == 0)
                    continue;

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new
                    {
                        success = false,
                        message = "Each image must be smaller than 5 MB."
                    });

                var extension = Path.GetExtension(file.FileName)
                    .ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new
                    {
                        success = false,
                        message = "Only JPG, JPEG, PNG, and WEBP files are allowed."
                    });

                var fileName = $"{Guid.NewGuid():N}{extension}";

                var uploadFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "properties");

                Directory.CreateDirectory(uploadFolder);

                var filePath = Path.Combine(uploadFolder, fileName);

                await using var stream = new FileStream(
                    filePath,
                    FileMode.CreateNew);

                await file.CopyToAsync(stream);

                var imageUrl = $"/uploads/properties/{fileName}";

                await _propertyService.AddImageAsync(
                    propertyId,
                    imageUrl);

                uploadedUrls.Add(imageUrl);
            }

            return Ok(new
            {
                success = true,
                message = "Images uploaded successfully.",
                data = uploadedUrls
            });
        }

        // =====================================================
        // ADD IMAGE URLS
        // POST: api/Properties/{propertyId}/images/urls
        // =====================================================

        [HttpPost("{propertyId:int}/images/urls")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> AddImageUrls(int propertyId, [FromBody] AddImageUrlsDto request)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized(new { success = false, message = "Invalid authentication token." });

            if (request == null || request.ImageUrls == null || !request.ImageUrls.Any())
                return BadRequest(new { success = false, message = "Please provide one or more image URLs in the request body." });

            var property = await _propertyService.GetByIdAsync(propertyId);
            if (property == null)
                return NotFound(new { success = false, message = "Property not found." });

            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && property.AgentId != currentUserId.Value)
                return Forbid();

            var added = new List<string>();
            var invalid = new List<string>();

            foreach (var imageUrl in request.ImageUrls)
            {
                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    invalid.Add(imageUrl);
                    continue;
                }

                if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) || (uri.Scheme != "http" && uri.Scheme != "https"))
                {
                    invalid.Add(imageUrl);
                    continue;
                }

                // Optionally: you could verify content-type by making a HEAD request here.
                try
                {
                    await _propertyService.AddImageAsync(propertyId, imageUrl);
                    added.Add(imageUrl);
                }
                catch (Exception)
                {
                    invalid.Add(imageUrl);
                }
            }

            return Ok(new
            {
                success = true,
                message = "Image URLs processed.",
                added,
                invalid
            });
        }

        // =====================================================
        // DELETE IMAGE
        // DELETE: api/Properties/{propertyId}/images/{imageId}
        // =====================================================

        [HttpDelete("{propertyId:int}/images/{imageId:int}")]
        [Authorize(Roles = "Agent,Admin")]
        public async Task<IActionResult> DeleteImage(int propertyId, int imageId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var property = await _propertyService.GetByIdAsync(propertyId);
            if (property == null) return NotFound(new { success = false, message = "Property not found." });

            if (!User.IsInRole("Admin") && property.AgentId != currentUserId.Value)
                return Forbid();

            try
            {
                var imageUrl = await _propertyService.DeleteImageAsync(propertyId, imageId);
                var relativePath = imageUrl.TrimStart('/', '\\')
                    .Replace('/', Path.DirectorySeparatorChar)
                    .Replace('\\', Path.DirectorySeparatorChar);
                var webRoot = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"));
                var physicalPath = Path.GetFullPath(Path.Combine(webRoot, relativePath));

                if (physicalPath.StartsWith(webRoot, StringComparison.OrdinalIgnoreCase) &&
                    System.IO.File.Exists(physicalPath))
                {
                    System.IO.File.Delete(physicalPath);
                }
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Image not found." });
            }

            return Ok(new { success = true, message = "Image deleted successfully." });
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