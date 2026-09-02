namespace RealEstate.DAL.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        // Use PhoneNumber to match DbContext and migrations
        public string Phone { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "User";

        public string? ProfileImage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<Property> Properties { get; set; } = new List<Property>();

        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

        public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();

        public ICollection<VisitSchedule> VisitSchedules { get; set; } = new List<VisitSchedule>();
        
    }
}