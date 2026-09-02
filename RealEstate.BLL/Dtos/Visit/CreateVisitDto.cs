namespace RealEstate.BLL.DTOs.Visit
{
    public class CreateVisitDto
    {
        public int PropertyId { get; set; }

        public int UserId { get; set; }

        public DateTime VisitDate { get; set; }

        public string? Notes { get; set; }
    }
}