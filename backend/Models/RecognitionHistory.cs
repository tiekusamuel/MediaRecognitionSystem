using backend.Helpers.Enums;

namespace backend.Models
{
    public class RecognitionHistory
    {
        public Guid Id { get; set; }
        public RecognitionType Type { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public double ConfidenceScore { get; set; }
        public bool IsSuccessful { get; set; }
        public string ResultData { get; set; } = string.Empty; // JSON serialized result
        public RecognitionStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }
}