namespace backend.Models
{
    public class Scene
    {
        public Guid Id { get; set; }
        public Guid MovieId { get; set; }
        public string Description { get; set; } = string.Empty;
        public TimeSpan StartTimestamp { get; set; }
        public TimeSpan EndTimestamp { get; set; }
        public string Characters { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Movie Movie { get; set; } = null!;
    }
}