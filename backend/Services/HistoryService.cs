using backend.DTOs.Responses;
using backend.Interfaces;

namespace backend.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IMusicRecognitionService _musicRecognitionService;
        private readonly IMovieRecognitionService _movieRecognitionService;
        private readonly ILogger<HistoryService> _logger;
        public HistoryService(
            IMusicRecognitionService musicRecognitionService,
            IMovieRecognitionService movieRecognitionService,
            ILogger<HistoryService> logger)
        {
            _musicRecognitionService = musicRecognitionService;
            _movieRecognitionService = movieRecognitionService;
            _logger = logger;
        }

        public async Task<HistoryResponseDto> GetHistoryAsync(
            string? type,
            string? search,
            int page,
            int pageSize,
            string? sortBy,
            string? sortOrder,
            CancellationToken cancellationToken = default)
        {
            var allItems = new List<HistoryItemDto>();

            // Fetch music history
            if (string.IsNullOrEmpty(type) || type.Equals("music", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var musicHistory = await _musicRecognitionService.GetRecognitionHistoryAsync(
                        1, int.MaxValue, cancellationToken);
                    
                    if (musicHistory?.Items != null)
                    {
                        var musicItems = musicHistory.Items
                            .Where(m => m.IsSuccessful)
                            .Select(m => new HistoryItemDto
                            {
                                Id = m.Id,
                                Type = "music",
                                Title = string.IsNullOrWhiteSpace(m.Result) ? m.FileName : m.Result,
                                Poster = m.Poster,
                                Confidence = m.ConfidenceScore,
                                RecognitionDate = m.RecognizedAt,
                                Details = m
                            }).ToList();

                        allItems.AddRange(musicItems);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch music history");
                }
            }

            // Fetch movie history
            if (string.IsNullOrEmpty(type) || type.Equals("movie", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var movieHistory = await _movieRecognitionService.GetRecognitionHistoryAsync(
                        1, int.MaxValue, cancellationToken);
                    
                    if (movieHistory?.Items != null)
                    {
                        var movieItems = movieHistory.Items
                            .Where(m => m.IsSuccessful)
                            .Select(m => new HistoryItemDto
                            {
                                Id = m.Id,
                                Type = "movie",
                                Title = string.IsNullOrWhiteSpace(m.Result) ? m.FileName : m.Result,
                                Poster = m.Poster,
                                Confidence = m.ConfidenceScore,
                                RecognitionDate = m.RecognizedAt,
                                Details = m
                            }).ToList();

                        allItems.AddRange(movieItems);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch movie history");
                }
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                allItems = allItems.Where(item => 
                    item.Title.Contains(search, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            // Apply sorting
            allItems = ApplySorting(allItems, sortBy, sortOrder);

            // Calculate pagination
            var totalCount = allItems.Count;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var paginatedItems = allItems
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new HistoryResponseDto
            {
                Items = paginatedItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<HistoryItemDto> GetHistoryItemAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            // Try to find in music history first
            try
            {
                var musicResult = await _musicRecognitionService.GetRecognitionResultAsync(
                    id, cancellationToken);
                
                if (musicResult.IsSuccessful)
                {
                    return new HistoryItemDto
                    {
                        Id = musicResult.RecognitionId,
                        Type = "music",
                        Title = musicResult.Track?.Title ?? musicResult.Message,
                        Poster = musicResult.Track?.AlbumArtUrl  ?? string.Empty,
                        Confidence = musicResult.ConfidenceScore,
                        RecognitionDate = musicResult.RecognizedAt,
                        Details = musicResult
                    };
                }
            }
            catch (KeyNotFoundException)
            {
                // Not found in music, try movies
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error retrieving music result with ID {Id}", id);
            }

            // Try to find in movie history
            try
            {
                var movieResult = await _movieRecognitionService.GetRecognitionResultAsync(
                    id, cancellationToken);
                
                if (movieResult.IsSuccessful)
                {
                    return new HistoryItemDto
                    {
                        Id = movieResult.RecognitionId,
                        Type = "movie",
                        Title = movieResult.Movie?.Title ?? movieResult.Message,
                        Poster = movieResult.Movie?.Poster ?? string.Empty,
                        Confidence = movieResult.ConfidenceScore,
                        RecognitionDate = movieResult.RecognizedAt,
                        Details = movieResult
                    };
                }
            }
            catch (KeyNotFoundException)
            {
                throw new KeyNotFoundException($"History item with ID {id} not found");
            }

            throw new KeyNotFoundException($"History item with ID {id} not found");
        }

        public async Task DeleteHistoryItemAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            bool deletedFromMusic = false;
            bool deletedFromMovie = false;

            // Try to delete from music history
            try
            {
                await _musicRecognitionService.DeleteRecognitionResultAsync(id, cancellationToken);
                deletedFromMusic = true;
            }
            catch (KeyNotFoundException)
            {
                // Not found in music
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error deleting music result with ID {Id}", id);
            }

            // Try to delete from movie history
            try
            {
                await _movieRecognitionService.DeleteRecognitionResultAsync(id, cancellationToken);
                deletedFromMovie = true;
            }
            catch (KeyNotFoundException)
            {
                // Not found in movie
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error deleting movie result with ID {Id}", id);
            }

            if (!deletedFromMusic && !deletedFromMovie)
            {
                throw new KeyNotFoundException($"History item with ID {id} not found");
            }
        }

        public async Task DeleteMultipleItemsAsync(
            List<Guid> ids,
            CancellationToken cancellationToken = default)
        {
            var errors = new List<string>();

            foreach (var id in ids)
            {
                try
                {
                    await DeleteHistoryItemAsync(id, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete history item {Id}", id);
                    errors.Add($"Failed to delete item {id}: {ex.Message}");
                }
            }

            if (errors.Any())
            {
                _logger.LogWarning("Some items failed to delete: {Errors}", string.Join(", ", errors));
            }
        }

        public async Task ClearHistoryAsync(CancellationToken cancellationToken = default)
        {
            var tasks = new List<Task>();

            // Clear music history
            tasks.Add(Task.Run(async () =>
            {
                try
                {
                    await _musicRecognitionService.ClearHistoryAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to clear music history");
                }
            }, cancellationToken));

            // Clear movie history
            tasks.Add(Task.Run(async () =>
            {
                try
                {
                    await _movieRecognitionService.ClearHistoryAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to clear movie history");
                }
            }, cancellationToken));

            await Task.WhenAll(tasks);
        }

        private List<HistoryItemDto> ApplySorting(
            List<HistoryItemDto> items,
            string? sortBy,
            string? sortOrder)
        {
            var isDescending = sortOrder?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? true;

            return sortBy?.ToLower() switch
            {
                "confidence" => isDescending 
                    ? items.OrderByDescending(i => i.Confidence).ToList()
                    : items.OrderBy(i => i.Confidence).ToList(),
                
                "title" => isDescending 
                    ? items.OrderByDescending(i => i.Title).ToList()
                    : items.OrderBy(i => i.Title).ToList(),
                
                "date" or _ => isDescending 
                    ? items.OrderByDescending(i => i.RecognitionDate).ToList()
                    : items.OrderBy(i => i.RecognitionDate).ToList(),
            };
        }
    }
}