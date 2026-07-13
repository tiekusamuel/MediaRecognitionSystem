namespace backend.DTOs.Responses
{
    public class HistoryItemDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty; // "movie" or "music"
        public string Title { get; set; } = string.Empty;
        public string thumbnail { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public DateTime RecognitionDate { get; set; }
        public object? Details { get; set; } // Additional details based on type
    }
}