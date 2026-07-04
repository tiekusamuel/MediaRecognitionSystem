using backend.Helpers.Enums;

namespace backend.DTOs.Responses
{
    public class RecognitionHistoryDto
    {
        public Guid Id { get; set; }
        public RecognitionType Type { get; set; }
        public string FileName { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
        public bool IsSuccessful { get; set; }
        public string Result { get; set; } = string.Empty;
        public DateTime RecognizedAt { get; set; }
    }

    public class RecognitionHistoryListDto
    {
        public List<RecognitionHistoryDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}