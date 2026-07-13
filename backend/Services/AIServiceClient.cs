using System.Net.Http.Json;
using backend.DTOs.Responses;
using backend.Interfaces;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class AIServiceClient : IAIServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIServiceClient> _logger;

    public AIServiceClient(HttpClient httpClient, ILogger<AIServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
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

        var responseBody = await response.Content.ReadAsStringAsync();

        


        response.EnsureSuccessStatusCode();


        var result =
            await response.Content.ReadFromJsonAsync<MusicRecognitionResultDto>(
                cancellationToken: cancellationToken);

        return result!;
    }
}