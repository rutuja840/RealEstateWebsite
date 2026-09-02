namespace RealEstate.DAL.Entities
{
    public class Favorite
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int PropertyId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties

        public User User { get; set; } = null!;

        public Property Property { get; set; } = null!;
    }
}