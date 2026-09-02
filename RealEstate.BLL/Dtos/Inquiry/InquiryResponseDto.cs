namespace RealEstate.BLL.DTOs.Inquiry
{
    public class InquiryResponseDto
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }

        public string PropertyTitle { get; set; } = string.Empty;

        public int? UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime? PreferredVisitDate { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}