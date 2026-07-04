namespace backend.DTOs.Responses
{
    public class MovieRecognitionResultDto
    {
        public Guid RecognitionId { get; set; }
        public bool IsSuccessful { get; set; }
        public double ConfidenceScore { get; set; }
        public MovieDto? Movie { get; set; }
        public SceneDto? Scene { get; set; }
        public DateTime RecognizedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class MovieDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string PosterUrl { get; set; } = string.Empty;
        public string ImdbId { get; set; } = string.Empty;
        public double Rating { get; set; }
    }

    public class SceneDto
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string StartTimestamp { get; set; } = string.Empty;
        public string EndTimestamp { get; set; } = string.Empty;
        public string Characters { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
    }
}