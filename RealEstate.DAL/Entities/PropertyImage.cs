namespace RealEstate.DAL.Entities
{
    public class PropertyImage
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; }

        // Navigation Property

        public Property Property { get; set; } = null!;
    }
}