using backend.DTOs.Responses;
using backend.Helpers.Enums;
using backend.Helpers.Extensions;
using backend.Interfaces;
using backend.Models;
using System.Text.Json;

namespace backend.Services
{
    public class MovieRecognitionService : IMovieRecognitionService
    {
        private readonly ILogger<MovieRecognitionService> _logger;
        private readonly IRecognitionHistoryRepository _historyRepository;
        private readonly IMovieAIServiceClient _movieAIServiceClient;

        public MovieRecognitionService(
            ILogger<MovieRecognitionService> logger,
            IRecognitionHistoryRepository historyRepository,
            IMovieAIServiceClient movieAIServiceClient)
        {
            _logger = logger;
            _historyRepository = historyRepository;
            _movieAIServiceClient = movieAIServiceClient;
        }

        public async Task<MovieRecognitionResultDto> RecognizeFromVideoAsync(
            Stream videoStream,
            string fileName,
            int? startTimeSeconds = null,
            int? endTimeSeconds = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting video recognition for file: {FileName}", fileName);

                
                var result = await _movieAIServiceClient.RecognizeVideoAsync(
                    videoStream,
                    fileName,
                    cancellationToken);

                result.RecognitionId = Guid.NewGuid();
                result.RecognizedAt = DateTime.UtcNow;

                Console.WriteLine(result);
    

                // Save to history
                await SaveRecognitionHistoryAsync(
                    fileName, 
                    RecognitionType.Movie, 
                    result,
                    cancellationToken);

                _logger.LogInformation(
                    "Video recognition completed. Recognition ID: {RecognitionId}",
                    result.RecognitionId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during video recognition for file: {FileName}", fileName);
                throw;
            }
        }

        public async Task<MovieRecognitionResultDto> RecognizeFromImageAsync(
            Stream imageStream,
            string fileName,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting image recognition for file: {FileName}", fileName);

               
               
                var result = await _movieAIServiceClient.RecognizeImageAsync(
                    imageStream,
                    fileName,
                    cancellationToken);

                // Save to history
                await SaveRecognitionHistoryAsync(
                    fileName,
                    RecognitionType.Movie,
                    result,
                    cancellationToken);

                _logger.LogInformation(
                    "Image recognition completed. Recognition ID: {RecognitionId}",
                    result.RecognitionId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during image recognition for file: {FileName}", fileName);
                throw;
            }
        }

        public async Task<MovieRecognitionResultDto> GetRecognitionResultAsync(
            Guid recognitionId,
            CancellationToken cancellationToken = default)
        {
            var history = await _historyRepository.GetByIdAsync(recognitionId, cancellationToken);

            if (history == null)
            {
                throw new KeyNotFoundException($"Recognition result with ID {recognitionId} not found.");
            }

            return JsonSerializer.Deserialize<MovieRecognitionResultDto>(history.ResultData)
                ?? throw new InvalidOperationException("Failed to deserialize recognition result.");
        }

        public async Task<RecognitionHistoryListDto> GetRecognitionHistoryAsync(
            int pageNumber = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var histories = await _historyRepository.GetByTypeAsync(
                RecognitionType.Movie,
                pageNumber,
                pageSize,
                cancellationToken);

            var totalCount = await _historyRepository.GetCountByTypeAsync(
                RecognitionType.Movie,
                cancellationToken);

            var items = histories.Select(h =>
            {
                var result = JsonSerializer.Deserialize<MovieRecognitionResultDto>(h.ResultData);

                return new RecognitionHistoryDto
                {
                    Id = h.Id,
                    Type = h.Type,
                    FileName = h.FileName,
                    ConfidenceScore = h.ConfidenceScore,
                    IsSuccessful = h.IsSuccessful,
                    Result = result?.Movie?.Title ?? "No match found",
                    Poster = result?.Movie?.Poster ?? "No movie poster",
                    RecognizedAt = h.CreatedAt
                };
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
            MovieRecognitionResultDto result,
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
                var result = JsonSerializer.Deserialize<MovieRecognitionResultDto>(resultData);
                return result?.Movie?.Title ?? "No match found";
            }
            catch
            {
                return "Error parsing result";
            }
        }

        
    }
}