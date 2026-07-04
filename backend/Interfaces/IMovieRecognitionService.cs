using backend.DTOs.Responses;

namespace backend.Interfaces
{
    public interface IMovieRecognitionService
    {
        Task<MovieRecognitionResultDto> RecognizeFromVideoAsync(
            Stream videoStream, 
            string fileName, 
            int? startTimeSeconds = null, 
            int? endTimeSeconds = null,
            CancellationToken cancellationToken = default);

        Task<MovieRecognitionResultDto> RecognizeFromImageAsync(
            Stream imageStream, 
            string fileName,
            CancellationToken cancellationToken = default);

        Task<MovieRecognitionResultDto> GetRecognitionResultAsync(
            Guid recognitionId,
            CancellationToken cancellationToken = default);

        Task<RecognitionHistoryListDto> GetRecognitionHistoryAsync(
            int pageNumber = 1, 
            int pageSize = 10,
            CancellationToken cancellationToken = default);
    }
}