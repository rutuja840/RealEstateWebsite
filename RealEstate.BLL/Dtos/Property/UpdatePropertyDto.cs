namespace RealEstate.BLL.DTOs.Property
{
    public class UpdatePropertyDto
    {
        public int PropertyTypeId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string City { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public int Bedrooms { get; set; }

        public int Bathrooms { get; set; }

        public decimal Area { get; set; }

        public string AreaUnit { get; set; } = "SqFt";

        public bool IsFurnished { get; set; }

        public bool IsReadyToMove { get; set; }

        public bool IsActive { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }
    }
}