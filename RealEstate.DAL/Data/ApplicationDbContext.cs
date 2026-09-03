using Microsoft.EntityFrameworkCore;
using RealEstate.DAL.Entities;

namespace RealEstate.DAL.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();

        public DbSet<PropertyType> PropertyTypes =>
            Set<PropertyType>();

        public DbSet<Property> Properties =>
            Set<Property>();

        public DbSet<PropertyImage> PropertyImages =>
            Set<PropertyImage>();

        public DbSet<Favorite> Favorites =>
            Set<Favorite>();

        public DbSet<Inquiry> Inquiries =>
            Set<Inquiry>();

        public DbSet<VisitSchedule> VisitSchedules =>
            Set<VisitSchedule>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
           
            // User

            modelBuilder.Entity<User>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<User>()
                .HasIndex(x => x.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(x => x.Email)
                .HasMaxLength(150)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(x => x.FullName)
                .HasMaxLength(150)
                .IsRequired();

            // Map PhoneNumber CLR property to existing DB column 'Phone'
            modelBuilder.Entity<User>()
                .Property(x => x.Phone)
                .HasColumnName("Phone")
                .HasMaxLength(20)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(x => x.Role)
                .HasMaxLength(50)
                .IsRequired();

            // Property
           
            modelBuilder.Entity<Property>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<Property>()
                .Property(x => x.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Property>()
                .Property(x => x.Area)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Property>()
                .Property(x => x.Latitude)
                .HasPrecision(10, 7);

            modelBuilder.Entity<Property>()
                .Property(x => x.Longitude)
                .HasPrecision(10, 7);

            // PropertyType -> Property
            
            modelBuilder.Entity<Property>()
                .HasOne(x => x.PropertyType)
                .WithMany(x => x.Properties)
                .HasForeignKey(x => x.PropertyTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Agent(User) -> Property
           
            modelBuilder.Entity<Property>()
                .HasOne(x => x.Agent)
                .WithMany(x => x.Properties)
                .HasForeignKey(x => x.AgentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Property -> PropertyImage
       
            modelBuilder.Entity<PropertyImage>()
                .HasOne(x => x.Property)
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> Favorite
            
            modelBuilder.Entity<Favorite>()
                .HasOne(x => x.User)
                .WithMany(x => x.Favorites)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Property -> Favorite
          
            modelBuilder.Entity<Favorite>()
                .HasOne(x => x.Property)
                .WithMany(x => x.Favorites)
                .HasForeignKey(x => x.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Prevent duplicate favorite
            modelBuilder.Entity<Favorite>()
                .HasIndex(x => new
                {
                    x.UserId,
                    x.PropertyId
                })
                .IsUnique();
           
            // Property -> Inquiry
           
            modelBuilder.Entity<Inquiry>()
                .HasOne(x => x.Property)
                .WithMany(x => x.Inquiries)
                .HasForeignKey(x => x.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> Inquiry
            
            modelBuilder.Entity<Inquiry>()
                .HasOne(x => x.User)
                .WithMany(x => x.Inquiries)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
          
            // Property -> VisitSchedule
            
            modelBuilder.Entity<VisitSchedule>()
                .HasOne(x => x.Property)
                .WithMany(x => x.VisitSchedules)
                .HasForeignKey(x => x.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> VisitSchedule
           
            modelBuilder.Entity<VisitSchedule>()
                .HasOne(x => x.User)
                .WithMany(x => x.VisitSchedules)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Property Types Seed Data
            
            modelBuilder.Entity<PropertyType>().HasData(

                new PropertyType
                {
                    Id = 1,
                    Name = "Apartment"
                },

                new PropertyType
                {
                    Id = 2,
                    Name = "Villa"
                },

                new PropertyType
                {
                    Id = 3,
                    Name = "House"
                },

                new PropertyType
                {
                    Id = 4,
                    Name = "Plot"
                },

                new PropertyType
                {
                    Id = 5,
                    Name = "Office"
                },

                new PropertyType
                {
                    Id = 6,
                    Name = "Shop"
                },

                new PropertyType
                {
                    Id = 7,
                    Name = "Penthouse"
                },

                new PropertyType
                {
                    Id = 8,
                    Name = "Farmhouse"
                }
            );

        }
    }
}
