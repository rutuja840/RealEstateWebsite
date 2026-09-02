namespace RealEstate.BLL.DTOs.Inquiry
{
    public class CreateInquiryDto
    {
        public int PropertyId { get; set; }

        public int? UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public DateTime? PreferredVisitDate { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}