namespace backend.Models
{
    public class MusicTrack
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string Album { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public TimeSpan Duration { get; set; }
        public string Isrc { get; set; } = string.Empty; // International Standard Recording Code
        public string AlbumArtUrl { get; set; } = string.Empty;
        public string PreviewUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public string thumbnail { get; set; } = string.Empty;
    }
}