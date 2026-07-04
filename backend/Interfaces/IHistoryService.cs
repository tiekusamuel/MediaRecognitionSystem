using backend.DTOs.Responses;

namespace backend.Interfaces
{
    public interface IHistoryService
    {
        Task<HistoryResponseDto> GetHistoryAsync(
            string? type,
            string? search,
            int page,
            int pageSize,
            string? sortBy,
            string? sortOrder,
            CancellationToken cancellationToken = default);

        Task<HistoryItemDto> GetHistoryItemAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task DeleteHistoryItemAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task DeleteMultipleItemsAsync(
            List<Guid> ids,
            CancellationToken cancellationToken = default);

        Task ClearHistoryAsync(
            CancellationToken cancellationToken = default);
    }
}