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

        public DbSet<Movie> Movies { get; set; } = null!;
        public DbSet<Scene> Scenes { get; set; } = null!;
        public DbSet<MusicTrack> MusicTracks { get; set; } = null!;
        public DbSet<RecognitionHistory> RecognitionHistories { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Movie configuration
            modelBuilder.Entity<Movie>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Director).HasMaxLength(100);
                entity.Property(e => e.ImdbId).HasMaxLength(20);
                entity.HasIndex(e => e.ImdbId);
                
                entity.HasMany(e => e.Scenes)
                      .WithOne(e => e.Movie)
                      .HasForeignKey(e => e.MovieId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Scene configuration
            modelBuilder.Entity<Scene>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
                entity.HasIndex(e => e.MovieId);
            });

            // MusicTrack configuration
            modelBuilder.Entity<MusicTrack>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Artist).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Album).HasMaxLength(200);
                entity.Property(e => e.Isrc).HasMaxLength(20);
                entity.HasIndex(e => e.Isrc);
            });

            // RecognitionHistory configuration
            modelBuilder.Entity<RecognitionHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Type);
            });
        }
    }
}