using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace RealEstate.DAL.Entities
{
    public class PropertyType
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        // Navigation Property

        public ICollection<Property> Properties { get; set; }
            = new List<Property>();
    }
}