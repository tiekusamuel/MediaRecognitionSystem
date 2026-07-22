using System.Net.Http.Headers;
using System.Text.Json;
using backend.DTOs.Responses;
using backend.Interfaces;

namespace backend.Services;

public class MovieAIServiceClient : IMovieAIServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MovieAIServiceClient> _logger;

    public MovieAIServiceClient(
        HttpClient httpClient,
        ILogger<MovieAIServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<MovieRecognitionResultDto> RecognizeVideoAsync(
        Stream videoStream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        using var content = new MultipartFormDataContent();

        var streamContent = new StreamContent(videoStream);

        streamContent.Headers.ContentType =
            new MediaTypeHeaderValue("video/mp4");

        content.Add(
            streamContent,
            "file",
            fileName);

        _logger.LogInformation(
            "Sending video to AI Service...");

        var response = await _httpClient.PostAsync(
            "/movie/recognize",
            content,
            cancellationToken);

        var json = await response.Content.ReadAsStringAsync(cancellationToken);

        _logger.LogInformation(json);

        response.EnsureSuccessStatusCode();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var aiResponse = JsonSerializer.Deserialize<MovieRecognitionResultDto>(
            json,
            options);

        if (aiResponse == null)
        {
            throw new Exception(
                "Failed to deserialize AI response.");
        }

        return aiResponse;
    }

    public async Task<MovieRecognitionResultDto> RecognizeImageAsync(
        Stream imageStream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        using var content = new MultipartFormDataContent();

        var streamContent = new StreamContent(imageStream);

        streamContent.Headers.ContentType =
            new MediaTypeHeaderValue("image/jpeg");

        content.Add(
            streamContent,
            "file",
            fileName);

        _logger.LogInformation(
            "Sending image to AI Service...");

        var response = await _httpClient.PostAsync(
            "movie/recognize-image",
            content,
            cancellationToken);

        var json = await response.Content.ReadAsStringAsync(cancellationToken);

        _logger.LogInformation(json);

        response.EnsureSuccessStatusCode();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var aiResponse = JsonSerializer.Deserialize<MovieRecognitionResultDto>(
            json,
            options);

        if (aiResponse == null)
        {
            throw new Exception(
                "Failed to deserialize AI response.");
        }

        return aiResponse;
    }
}