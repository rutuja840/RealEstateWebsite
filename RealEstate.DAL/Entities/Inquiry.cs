namespace RealEstate.DAL.Entities
{
    public class Inquiry
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }

        public int? UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime? PreferredVisitDate { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties

        public Property Property { get; set; } = null!;

        public User? User { get; set; }
    }
}