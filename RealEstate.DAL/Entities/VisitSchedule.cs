namespace RealEstate.DAL.Entities
{
    public class VisitSchedule
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }

        public int UserId { get; set; }

        public DateTime VisitDate { get; set; }

        public string Status { get; set; } = "Pending";

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties

        public Property Property { get; set; } = null!;

        public User User { get; set; } = null!;
        public int AgentId { get; set; }
    }
}