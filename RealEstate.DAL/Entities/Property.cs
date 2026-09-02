namespace RealEstate.DAL.Entities
{
    public class Property
    {
        public int Id { get; set; }

        // Foreign Keys

        public int AgentId { get; set; }

        public int PropertyTypeId { get; set; }

        // Property Information

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string City { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        // Property Details

        public int Bedrooms { get; set; }

        public int Bathrooms { get; set; }

        public decimal Area { get; set; }

        public string AreaUnit { get; set; } = "SqFt";

        // Property Status

        public bool IsFurnished { get; set; }

        public bool IsReadyToMove { get; set; }

        public bool IsActive { get; set; } = true;

        // Map Location

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        // Audit

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties

        public User Agent { get; set; } = null!;

        public PropertyType PropertyType { get; set; } = null!;

        public ICollection<PropertyImage> Images { get; set; }
            = new List<PropertyImage>();

        public ICollection<Favorite> Favorites { get; set; }
            = new List<Favorite>();

        public ICollection<Inquiry> Inquiries { get; set; }
            = new List<Inquiry>();

        public ICollection<VisitSchedule> VisitSchedules { get; set; }
            = new List<VisitSchedule>();
    }
}