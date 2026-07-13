namespace backend.DTOs.Responses
{
    public class MusicRecognitionResultDto
    {
        public Guid RecognitionId { get; set; }
        public bool IsSuccessful { get; set; }
        public double ConfidenceScore { get; set; }
        public MusicTrackDto? Track { get; set; }
        public DateTime RecognizedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class MusicTrackDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string Album { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Isrc { get; set; } = string.Empty;
        public string AlbumArtUrl { get; set; } = string.Empty;
        public string PreviewUrl { get; set; } = string.Empty;

        public string spotifyUrl {get; set;} = string.Empty;

        public string appleMusicUrl {get; set;} = string.Empty;

        public string songLink {get; set;} = string.Empty;

        public string thumbnail {get; set;} = string.Empty;

    }
}