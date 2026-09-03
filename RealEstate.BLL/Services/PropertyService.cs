using RealEstate.BLL.DTOs.Property;
using RealEstate.BLL.Interfaces;
using RealEstate.DAL.Entities;
using RealEstate.DAL.Interfaces;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace RealEstate.BLL.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IPropertyRepository _propertyRepository;

        public PropertyService(
            IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

       
        // GET ALL PROPERTIES
        

        public async Task<List<PropertyResponseDto>> GetAllAsync()
        {
            var properties =
                await _propertyRepository.GetAllAsync();

            return properties
                .Select(MapToDto)
                .ToList();
        }

        
        // GET PROPERTY BY ID
       

        public async Task<PropertyResponseDto?> GetByIdAsync(
            int id)
        {
            var property =
                await _propertyRepository.GetByIdAsync(id);

            if (property == null)
            {
                return null;
            }

            return MapToDto(property);
        }
       
        // GET PROPERTIES BY AGENT
       
        public async Task<List<PropertyResponseDto>>
            GetByAgentIdAsync(int agentId)
        {
            var properties =
                await _propertyRepository
                    .GetByAgentIdAsync(agentId);

            return properties
                .Select(MapToDto)
                .ToList();
        }

       
        // SEARCH / FILTER PROPERTIES
        
        public async Task<List<PropertyResponseDto>>
            SearchAsync(PropertySearchDto request)
        {
            var properties =
                await _propertyRepository.SearchAsync(
                    request.City,
                    request.MinPrice,
                    request.MaxPrice,
                    request.PropertyTypeId,
                    request.Bedrooms,
                    request.Bathrooms,
                    request.MinArea,
                    request.MaxArea,
                    request.IsFurnished,
                    request.IsReadyToMove);

            return properties
                .Select(MapToDto)
                .ToList();
        }

       
        // CREATE PROPERTY
        

        public async Task<PropertyResponseDto>
            CreateAsync(CreatePropertyDto request)
        {
            if (request.Price <= 0)
            {
                throw new ArgumentException(
                    "Property price must be greater than zero.");
            }

            if (request.Area <= 0)
            {
                throw new ArgumentException(
                    "Property area must be greater than zero.");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ArgumentException(
                    "Property title is required.");
            }

            if (string.IsNullOrWhiteSpace(request.City))
            {
                throw new ArgumentException(
                    "City is required.");
            }

            var property = new Property
            {
                AgentId = request.AgentId,

                PropertyTypeId = request.PropertyTypeId,

                Title = request.Title,

                Description = request.Description,

                Price = request.Price,

                City = request.City,

                Address = request.Address,

                Bedrooms = request.Bedrooms,

                Bathrooms = request.Bathrooms,

                Area = request.Area,

                AreaUnit = request.AreaUnit,

                IsFurnished = request.IsFurnished,

                IsReadyToMove = request.IsReadyToMove,

                Latitude = request.Latitude,

                Longitude = request.Longitude,

                IsActive = true,

                CreatedAt = DateTime.UtcNow
            };

            var createdProperty =
                await _propertyRepository
                    .AddAsync(property);

            // Get complete property with Agent,
            // PropertyType and Images
            var result =
                await _propertyRepository
                    .GetByIdAsync(createdProperty.Id);

            if (result == null)
            {
                throw new InvalidOperationException(
                    "Property could not be retrieved after creation.");
            }

            return MapToDto(result);
        }

        // UPDATE PROPERTY
       

        public async Task<PropertyResponseDto>
            UpdateAsync(
                int id,
                UpdatePropertyDto request)
        {
            var property =
                await _propertyRepository
                    .GetByIdAsync(id);

            if (property == null)
            {
                throw new KeyNotFoundException(
                    "Property not found.");
            }

            if (request.Price <= 0)
            {
                throw new ArgumentException(
                    "Property price must be greater than zero.");
            }

            if (request.Area <= 0)
            {
                throw new ArgumentException(
                    "Property area must be greater than zero.");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ArgumentException(
                    "Property title is required.");
            }

            // Update fields
            property.PropertyTypeId =
                request.PropertyTypeId;

            property.Title =
                request.Title;

            property.Description =
                request.Description;

            property.Price =
                request.Price;

            property.City =
                request.City;

            property.Address =
                request.Address;

            property.Bedrooms =
                request.Bedrooms;

            property.Bathrooms =
                request.Bathrooms;

            property.Area =
                request.Area;

            property.AreaUnit =
                request.AreaUnit;

            property.IsFurnished =
                request.IsFurnished;

            property.IsReadyToMove =
                request.IsReadyToMove;

            property.IsActive =
                request.IsActive;

            property.Latitude =
                request.Latitude;

            property.Longitude =
                request.Longitude;

            await _propertyRepository
                .UpdateAsync(property);

            var updatedProperty =
                await _propertyRepository
                    .GetByIdAsync(id);

            if (updatedProperty == null)
            {
                throw new InvalidOperationException(
                    "Property could not be retrieved after update.");
            }

            return MapToDto(updatedProperty);
        }

      
        // DELETE PROPERTY
       

        public async Task<bool> DeleteAsync(int id)
        {
            var property =
                await _propertyRepository
                    .GetByIdAsync(id);

            if (property == null)
            {
                return false;
            }

            await _propertyRepository
                .DeleteAsync(property);

            return true;
        }

        // MAP ENTITY TO DTO
       
        private static PropertyResponseDto MapToDto(
            Property property)
        {
            return new PropertyResponseDto
            {
                Id = property.Id,

                AgentId = property.AgentId,

                AgentName = property.Agent != null
                    ? property.Agent.FullName
                    : string.Empty,

                PropertyTypeId =
                    property.PropertyTypeId,

                PropertyTypeName =
                    property.PropertyType != null
                        ? property.PropertyType.Name
                        : string.Empty,

                Title = property.Title,

                Description = property.Description,

                Price = property.Price,

                City = property.City,

                Address = property.Address,

                Bedrooms = property.Bedrooms,

                Bathrooms = property.Bathrooms,

                Area = property.Area,

                AreaUnit = property.AreaUnit,

                IsFurnished =
                    property.IsFurnished,

                IsReadyToMove =
                    property.IsReadyToMove,

                IsActive =
                    property.IsActive,

                Latitude =
                    property.Latitude,

                Longitude =
                    property.Longitude,

                CreatedAt =
                    property.CreatedAt,

                Images = property.Images?
                    .Select(x => new PropertyImageDto {
                        Id = x.Id,
                        ImageUrl = x.ImageUrl,
                        IsPrimary = x.IsPrimary,
                        Caption = string.Empty
                    })
                    .ToList()
                    ?? new List<PropertyImageDto>()
            };
        }

        public async Task AddImageAsync(int propertyId, string imageUrl)
        {
            var property = await _propertyRepository.GetByIdAsync(propertyId);
            if (property == null)
                throw new KeyNotFoundException("Property not found.");

            await _propertyRepository.AddImageAsync(new PropertyImage
            {
                PropertyId = propertyId,
                ImageUrl = imageUrl,
                IsPrimary = !property.Images.Any()
            });
        }

        public async Task<string> DeleteImageAsync(int propertyId, int imageId)
        {
            var image = await _propertyRepository.GetImageAsync(propertyId, imageId);
            if (image == null)
                throw new KeyNotFoundException("Image not found.");

            await _propertyRepository.DeleteImageAsync(image);
            return image.ImageUrl;
        }
    }
}
