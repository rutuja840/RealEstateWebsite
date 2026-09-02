namespace RealEstate.BLL.DTOs.Property
{
    public class PropertySearchDto
    {
        public string? City { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public int? PropertyTypeId { get; set; }

        public int? Bedrooms { get; set; }

        public int? Bathrooms { get; set; }

        public decimal? MinArea { get; set; }

        public decimal? MaxArea { get; set; }

        public bool? IsFurnished { get; set; }

        public bool? IsReadyToMove { get; set; }
    }
}