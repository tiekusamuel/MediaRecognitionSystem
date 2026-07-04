using Microsoft.AspNetCore.Mvc;
using backend.DTOs.Requests;
using backend.DTOs.Responses;
using backend.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;
        private readonly ILogger<HistoryController> _logger;

        public HistoryController(
            IHistoryService historyService,
            ILogger<HistoryController> logger)
        {
            _historyService = historyService;
            _logger = logger;
        }

        /// <summary>
        /// Get recognition history with filters
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<HistoryResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetHistoryAsync(
            [FromQuery] string? type = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = "date",
            [FromQuery] string? sortOrder = "desc",
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (page < 1 || pageSize < 1)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Page and pageSize must be greater than 0"));
                }

                if (pageSize > 100)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Page size cannot exceed 100"));
                }

                if (!string.IsNullOrEmpty(type) && 
                    !type.Equals("music", StringComparison.OrdinalIgnoreCase) && 
                    !type.Equals("movie", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Type must be either 'music' or 'movie'"));
                }

                var result = await _historyService.GetHistoryAsync(
                    type,
                    search,
                    page,
                    pageSize,
                    sortBy,
                    sortOrder,
                    cancellationToken);

                return Ok(ApiResponse<HistoryResponseDto>.SuccessResponse(
                    result,
                    "History retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving history");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while retrieving history"));
            }
        }

        /// <summary>
        /// Get single history item details
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<HistoryItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetHistoryItemAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _historyService.GetHistoryItemAsync(id, cancellationToken);
                
                return Ok(ApiResponse<HistoryItemDto>.SuccessResponse(
                    result,
                    "History item retrieved successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving history item {Id}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while retrieving the history item"));
            }
        }

        /// <summary>
        /// Delete a history item
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteHistoryItemAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                await _historyService.DeleteHistoryItemAsync(id, cancellationToken);
                
                return Ok(ApiResponse<object>.SuccessResponse(
                    null,
                    "History item deleted successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting history item {Id}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while deleting the history item"));
            }
        }

        /// <summary>
        /// Delete multiple history items
        /// </summary>
        [HttpPost("delete-multiple")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteMultipleItemsAsync(
            [FromBody] DeleteMultipleRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Invalid request data",
                        ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()));
                }

                await _historyService.DeleteMultipleItemsAsync(request.Ids, cancellationToken);
                
                return Ok(ApiResponse<object>.SuccessResponse(
                    null,
                    $"{request.Ids.Count} history items deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting multiple history items");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while deleting history items"));
            }
        }

        /// <summary>
        /// Clear all history
        /// </summary>
        [HttpDelete("clear")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ClearHistoryAsync(CancellationToken cancellationToken)
        {
            try
            {
                await _historyService.ClearHistoryAsync(cancellationToken);
                
                return Ok(ApiResponse<object>.SuccessResponse(
                    null,
                    "All history cleared successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing history");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while clearing history"));
            }
        }
    }
}