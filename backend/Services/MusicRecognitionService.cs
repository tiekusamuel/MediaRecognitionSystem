using backend.DTOs.Responses;
using backend.Helpers.Enums;
using backend.Interfaces;
using backend.Models;
using System.Text.Json;

namespace backend.Services
{
    public class MusicRecognitionService : IMusicRecognitionService
    {
        private readonly ILogger<MusicRecognitionService> _logger;
        private readonly IRecognitionHistoryRepository _historyRepository;

        public MusicRecognitionService(
            ILogger<MusicRecognitionService> logger,
            IRecognitionHistoryRepository historyRepository)
        {
            _logger = logger;
            _historyRepository = historyRepository;
        }

        public async Task<MusicRecognitionResultDto> RecognizeFromAudioAsync(
            Stream audioStream,
            string fileName,
            int? durationSeconds = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting audio recognition for file: {FileName}", fileName);

                // Simulate audio processing
                await Task.Delay(1800, cancellationToken);

                // Simulate recognition logic
                var result = SimulateMusicRecognition();

                // Save to history
                await SaveRecognitionHistoryAsync(
                    fileName,
                    RecognitionType.Music,
                    result,
                    cancellationToken);

                _logger.LogInformation(
                    "Audio recognition completed. Recognition ID: {RecognitionId}",
                    result.RecognitionId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audio recognition for file: {FileName}", fileName);
                throw;
            }
        }

        public async Task<MusicRecognitionResultDto> GetRecognitionResultAsync(
            Guid recognitionId,
            CancellationToken cancellationToken = default)
        {
            var history = await _historyRepository.GetByIdAsync(recognitionId, cancellationToken);

            if (history == null)
            {
                throw new KeyNotFoundException($"Recognition result with ID {recognitionId} not found.");
            }

            return JsonSerializer.Deserialize<MusicRecognitionResultDto>(history.ResultData)
                ?? throw new InvalidOperationException("Failed to deserialize recognition result.");
        }

        public async Task<RecognitionHistoryListDto> GetRecognitionHistoryAsync(
            int pageNumber = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var histories = await _historyRepository.GetByTypeAsync(
                RecognitionType.Music,
                pageNumber,
                pageSize,
                cancellationToken);

            var totalCount = await _historyRepository.GetCountByTypeAsync(
                RecognitionType.Music,
                cancellationToken);

            var items = histories.Select(h => new RecognitionHistoryDto
            {
                Id = h.Id,
                Type = h.Type,
                FileName = h.FileName,
                ConfidenceScore = h.ConfidenceScore,
                IsSuccessful = h.IsSuccessful,
                Result = GetResultSummary(h.ResultData),
                RecognizedAt = h.CreatedAt
            }).ToList();

            return new RecognitionHistoryListDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task DeleteRecognitionResultAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _historyRepository.DeleteAsync(id, cancellationToken);
        }

        public async Task ClearHistoryAsync(CancellationToken cancellationToken = default)
        {
            await _historyRepository.ClearAsync(cancellationToken);
        }

        private async Task SaveRecognitionHistoryAsync(
            string fileName,
            RecognitionType type,
            MusicRecognitionResultDto result,
            CancellationToken cancellationToken)
        {
            var history = new RecognitionHistory
            {
                Id = result.RecognitionId,
                Type = type,
                FileName = fileName,
                ConfidenceScore = result.ConfidenceScore,
                IsSuccessful = result.IsSuccessful,
                ResultData = JsonSerializer.Serialize(result),
                Status = RecognitionStatus.Completed,
                CompletedAt = DateTime.UtcNow
            };

            await _historyRepository.AddAsync(history, cancellationToken);
        }

        private string GetResultSummary(string resultData)
        {
            try
            {
                var result = JsonSerializer.Deserialize<MusicRecognitionResultDto>(resultData);
                return result?.Track != null
                    ? $"{result.Track.Title} - {result.Track.Artist}"
                    : "No match found";
            }
            catch
            {
                return "Error parsing result";
            }
        }

        private MusicRecognitionResultDto SimulateMusicRecognition()
        {
            var random = new Random();
            var confidence = random.NextDouble() * 0.25 + 0.75; // 75-100%

            return new MusicRecognitionResultDto
            {
                RecognitionId = Guid.NewGuid(),
                IsSuccessful = true,
                ConfidenceScore = Math.Round(confidence, 2),
                Track = new MusicTrackDto
                {
                    Id = Guid.NewGuid(),
                    Title = "Bohemian Rhapsody",
                    Artist = "Queen",
                    Album = "A Night at the Opera",
                    Genre = "Rock",
                    ReleaseYear = 1975,
                    Duration = "5:55",
                    Isrc = "GBUM71029604",
                    AlbumArtUrl = "https://example.com/albums/night_at_opera.jpg",
                    PreviewUrl = "https://example.com/previews/bohemian_rhapsody.mp3"
                },
                RecognizedAt = DateTime.UtcNow,
                Message = "Music track recognized successfully"
            };
        }
    }
}