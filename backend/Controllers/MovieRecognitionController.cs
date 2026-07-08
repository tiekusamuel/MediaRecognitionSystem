using Microsoft.AspNetCore.Mvc;
using backend.DTOs.Requests;
using backend.DTOs.Responses;
using backend.Helpers.Enums;
using backend.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class MovieRecognitionController : ControllerBase
    {
        private readonly IMovieRecognitionService _movieRecognitionService;
        private readonly IFileProcessingService _fileProcessingService;
        private readonly ILogger<MovieRecognitionController> _logger;

        public MovieRecognitionController(
            IMovieRecognitionService movieRecognitionService,
            IFileProcessingService fileProcessingService,
            ILogger<MovieRecognitionController> logger)
        {
            _movieRecognitionService = movieRecognitionService;
            _fileProcessingService = fileProcessingService;
            _logger = logger;
        }

        /// <summary>
        /// Recognize a movie from an uploaded video file
        /// </summary>
        [HttpPost("recognize/video")]
        [ProducesResponseType(typeof(ApiResponse<MovieRecognitionResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RecognizeFromVideoAsync(
            [FromForm] VideoUploadRequest request,
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

                var (isValid, errorMessage) = await _fileProcessingService.ValidateFileAsync(
                    request.File,
                    FileType.Video,
                    cancellationToken);

                if (!isValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(errorMessage));
                }


                var filePath = await _fileProcessingService.SaveFileAsync(
                    request.File,
                    FileType.Video,
                    cancellationToken);

                using var fileStream = await _fileProcessingService.GetFileStreamAsync(
                    filePath,
                    cancellationToken);

                var result = await _movieRecognitionService.RecognizeFromVideoAsync(
                    fileStream,
                    request.File.FileName,
                    request.StartTimeSeconds,
                    request.EndTimeSeconds,
                    cancellationToken);

                return Ok(ApiResponse<MovieRecognitionResultDto>.SuccessResponse(
                    result,
                    "Movie recognized successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing video recognition request");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while processing your request"));
            }
        }

        /// <summary>
        /// Recognize a movie from an uploaded image file
        /// </summary>
        [HttpPost("recognize/image")]
        [ProducesResponseType(typeof(ApiResponse<MovieRecognitionResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RecognizeFromImageAsync(
            [FromForm] FileUploadRequest request,
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

                var (isValid, errorMessage) = await _fileProcessingService.ValidateFileAsync(
                    request.File,
                    FileType.Image,
                    cancellationToken);

                if (!isValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(errorMessage));
                }

                var filePath = await _fileProcessingService.SaveFileAsync(
                    request.File,
                    FileType.Image,
                    cancellationToken);

                using var fileStream = await _fileProcessingService.GetFileStreamAsync(
                    filePath,
                    cancellationToken);

                var result = await _movieRecognitionService.RecognizeFromImageAsync(
                    fileStream,
                    request.File.FileName,
                    cancellationToken);

                return Ok(ApiResponse<MovieRecognitionResultDto>.SuccessResponse(
                    result,
                    "Movie recognized successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing image recognition request");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while processing your request"));
            }
        }

        /// <summary>
        /// Get a specific recognition result by ID
        /// </summary>
        [HttpGet("result/{recognitionId:guid}")]
        [ProducesResponseType(typeof(ApiResponse<MovieRecognitionResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRecognitionResultAsync(
            Guid recognitionId,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _movieRecognitionService.GetRecognitionResultAsync(
                    recognitionId,
                    cancellationToken);

                return Ok(ApiResponse<MovieRecognitionResultDto>.SuccessResponse(
                    result,
                    "Recognition result retrieved successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recognition result");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while retrieving the result"));
            }
        }

        /// <summary>
        /// Get recognition history with pagination
        /// </summary>
        [HttpGet("history")]
        [ProducesResponseType(typeof(ApiResponse<RecognitionHistoryListDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRecognitionHistoryAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Page number and page size must be greater than 0"));
                }

                var result = await _movieRecognitionService.GetRecognitionHistoryAsync(
                    pageNumber,
                    pageSize,
                    cancellationToken);

                return Ok(ApiResponse<RecognitionHistoryListDto>.SuccessResponse(
                    result,
                    "History retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recognition history");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while retrieving history"));
            }
        }
    }
}