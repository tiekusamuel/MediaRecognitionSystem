namespace backend.Models
{
    public class Movie
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public List<string> Genre { get; set; } = new();
        public TimeSpan Duration { get; set; }
        public string PosterUrl { get; set; } = string.Empty;
        public string ImdbId { get; set; } = string.Empty;
        public double Rating { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        
    }
}