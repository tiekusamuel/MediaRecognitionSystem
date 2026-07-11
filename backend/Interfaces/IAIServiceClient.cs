using backend.DTOs.Responses;

namespace backend.Interfaces;

public interface IAIServiceClient
{
    Task<MusicRecognitionResultDto> RecognizeMusicAsync(
        Stream audioStream,
        string fileName,
        CancellationToken cancellationToken = default);
}