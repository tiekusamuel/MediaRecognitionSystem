namespace backend.DTOs.Responses
{
    public class HistoryResponseDto
    {
        public List<HistoryItemDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}