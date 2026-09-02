namespace RealEstate.BLL.DTOs.Property
{
    public class PropertyImageDto
    {
        public int Id { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; }

        public string Caption { get; set; } = string.Empty;
    }
}
