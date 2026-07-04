using backend.Helpers.Enums;
using backend.Models;

namespace backend.Interfaces
{
    public interface IRecognitionHistoryRepository
    {
        Task<RecognitionHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<RecognitionHistory>> GetByTypeAsync(
            RecognitionType type, 
            int pageNumber, 
            int pageSize,
            CancellationToken cancellationToken = default);
        Task<int> GetCountByTypeAsync(RecognitionType type, CancellationToken cancellationToken = default);
        Task<RecognitionHistory> AddAsync(RecognitionHistory history, CancellationToken cancellationToken = default);
    }
}