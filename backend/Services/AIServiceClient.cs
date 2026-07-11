using System.Net.Http.Json;
using backend.DTOs.Responses;
using backend.Interfaces;

namespace backend.Services;

public class AIServiceClient : IAIServiceClient
{
    private readonly HttpClient _httpClient;

    public AIServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<MusicRecognitionResultDto> RecognizeMusicAsync(
        Stream audioStream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        using var content = new MultipartFormDataContent();

        content.Add(
            new StreamContent(audioStream),
            "audio",
            fileName
        );

        var response = await _httpClient.PostAsync(
            "/music/recognize",
            content,
            cancellationToken
        );

        response.EnsureSuccessStatusCode();

        var result =
            await response.Content.ReadFromJsonAsync<MusicRecognitionResultDto>(
                cancellationToken: cancellationToken);

        return result!;
    }
}