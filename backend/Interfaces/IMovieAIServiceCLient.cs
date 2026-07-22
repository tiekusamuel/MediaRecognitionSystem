using backend.DTOs.Responses;

namespace backend.Interfaces;

public interface IMovieAIServiceClient
{
    Task<MovieRecognitionResultDto> RecognizeVideoAsync(
        Stream videoStream,
        string fileName,
        CancellationToken cancellationToken = default);

    Task<MovieRecognitionResultDto> RecognizeImageAsync(
        Stream imageStream,
        string fileName,
        CancellationToken cancellationToken = default);
}