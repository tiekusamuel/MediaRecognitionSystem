using backend.DTOs.Responses;

namespace backend.Interfaces
{
    public interface IMusicRecognitionService
    {
        Task<MusicRecognitionResultDto> RecognizeFromAudioAsync(
            Stream audioStream, 
            string fileName,
            int? durationSeconds = null,
            CancellationToken cancellationToken = default);

        Task<MusicRecognitionResultDto> GetRecognitionResultAsync(
            Guid recognitionId,
            CancellationToken cancellationToken = default);

        Task<RecognitionHistoryListDto> GetRecognitionHistoryAsync(
            int pageNumber = 1, 
            int pageSize = 10,
            CancellationToken cancellationToken = default);

        Task DeleteRecognitionResultAsync(Guid id, CancellationToken cancellationToken = default);
        Task ClearHistoryAsync(CancellationToken cancellationToken = default);
    }
}