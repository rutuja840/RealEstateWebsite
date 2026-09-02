namespace RealEstate.BLL.DTOs.Visit
{
    public class VisitResponseDto
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }

        public string PropertyTitle { get; set; } = string.Empty;

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string UserEmail { get; set; } = string.Empty;

        public string UserPhone { get; set; } = string.Empty;

        public DateTime VisitDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}