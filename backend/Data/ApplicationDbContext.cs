using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Existing DbSets
        public DbSet<Movie> Movies { get; set; } = null!;
        
        public DbSet<MusicTrack> MusicTracks { get; set; } = null!;
        public DbSet<RecognitionHistory> RecognitionHistories { get; set; } = null!;

        // User-related DbSets
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Recognition> Recognitions { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id)
                    .HasDefaultValueSql("NEWID()");

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(true);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.JoinDate)
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasColumnType("datetime2");

                entity.Property(e => e.Avatar)
                    .HasMaxLength(500);

                // Indexes
                entity.HasIndex(e => e.Email)
                    .IsUnique()
                    .HasDatabaseName("IX_Users_Email");

                entity.HasIndex(e => e.Username)
                    .IsUnique()
                    .HasDatabaseName("IX_Users_Username");

                // Relationships
                entity.HasMany(e => e.Recognitions)
                    .WithOne(e => e.User)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_Recognitions_Users");
            });

            // Recognition configuration
            modelBuilder.Entity<Recognition>(entity =>
            {
                entity.ToTable("Recognitions");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasDefaultValueSql("NEWID()");

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Accuracy)
                    .HasColumnType("decimal(5,2)");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasColumnType("datetime2");

                // Indexes
                entity.HasIndex(e => e.UserId)
                    .HasDatabaseName("IX_Recognitions_UserId");

                entity.HasIndex(e => e.Type)
                    .HasDatabaseName("IX_Recognitions_Type");

                entity.HasIndex(e => e.CreatedAt)
                    .HasDatabaseName("IX_Recognitions_CreatedAt");

                // Composite index for better query performance
                entity.HasIndex(e => new { e.UserId, e.Type })
                    .HasDatabaseName("IX_Recognitions_UserId_Type");
            });

            // Movie configuration
            modelBuilder.Entity<Movie>(entity =>
            {
                entity.ToTable("Movies");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Director)
                    .HasMaxLength(100);
                
                entity.Property(e => e.ImdbId)
                    .HasMaxLength(20);
                
                entity.HasIndex(e => e.ImdbId)
                    .HasDatabaseName("IX_Movies_ImdbId");
                
                
            });

            

            // MusicTrack configuration
            modelBuilder.Entity<MusicTrack>(entity =>
            {
                entity.ToTable("MusicTracks");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Artist)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Album)
                    .HasMaxLength(200);
                
                entity.Property(e => e.Isrc)
                    .HasMaxLength(20);
                
                entity.HasIndex(e => e.Isrc)
                    .HasDatabaseName("IX_MusicTracks_Isrc");
            });

            // RecognitionHistory configuration
            modelBuilder.Entity<RecognitionHistory>(entity =>
            {
                entity.ToTable("RecognitionHistories");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.FileName)
                    .IsRequired()
                    .HasMaxLength(255);
                
                entity.HasIndex(e => e.CreatedAt)
                    .HasDatabaseName("IX_RecognitionHistories_CreatedAt");
                
                entity.HasIndex(e => e.Type)
                    .HasDatabaseName("IX_RecognitionHistories_Type");
            });
        }
    }
}