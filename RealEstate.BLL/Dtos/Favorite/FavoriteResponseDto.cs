namespace RealEstate.BLL.DTOs.Favorite
{
    public class FavoriteResponseDto
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int PropertyId { get; set; }

        public string PropertyTitle { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string City { get; set; } = string.Empty;

        public string PropertyType { get; set; } = string.Empty;

        public string? PrimaryImage { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}