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
    public class MusicRecognitionController : ControllerBase
    {
        private readonly IMusicRecognitionService _musicRecognitionService;
        private readonly IFileProcessingService _fileProcessingService;
        private readonly ILogger<MusicRecognitionController> _logger;

        public MusicRecognitionController(
            IMusicRecognitionService musicRecognitionService,
            IFileProcessingService fileProcessingService,
            ILogger<MusicRecognitionController> logger)
        {
            _musicRecognitionService = musicRecognitionService;
            _fileProcessingService = fileProcessingService;
            _logger = logger;
        }

        /// <summary>
        /// Recognize music from microphone recording (Base64 audio data)
        /// </summary>
        /// <param name="request">Microphone audio request with base64 data</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Music recognition result</returns>
        [HttpPost("recognize/microphone")]
        [ProducesResponseType(typeof(ApiResponse<MusicRecognitionResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RecognizeFromMicrophoneAsync(
            [FromBody] MicrophoneAudioRequest request,
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

                // Validate audio format
                var allowedFormats = new[] { "audio/webm", "audio/wav", "audio/mp3", "audio/ogg", "audio/mpeg" };
                if (!allowedFormats.Contains(request.AudioFormat.ToLower()))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        $"Unsupported audio format. Allowed formats: {string.Join(", ", allowedFormats)}"));
                }

                // Convert base64 to byte array
                byte[] audioBytes;
                try
                {
                    // Remove data URL prefix if present (e.g., "data:audio/webm;base64,")
                    var base64Data = request.AudioData;
                    if (base64Data.Contains(","))
                    {
                        base64Data = base64Data.Split(',')[1];
                    }

                    audioBytes = Convert.FromBase64String(base64Data);
                }
                catch (FormatException)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Invalid base64 audio data"));
                }

                // Validate audio size (max 10MB for microphone recordings)
                const long maxSize = 10 * 1024 * 1024;
                if (audioBytes.Length > maxSize)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        $"Audio data exceeds maximum size of {maxSize / (1024 * 1024)}MB"));
                }

                if (audioBytes.Length == 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Audio data is empty"));
                }

                // Create memory stream from audio bytes
                using var audioStream = new MemoryStream(audioBytes);

                // Generate filename based on timestamp
                var fileName = $"microphone_recording_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{GetFileExtension(request.AudioFormat)}";

                // Call recognition service
                var result = await _musicRecognitionService.RecognizeFromAudioAsync(
                    audioStream,
                    fileName,
                    request.DurationSeconds,
                    cancellationToken);

                return Ok(ApiResponse<MusicRecognitionResultDto>.SuccessResponse(
                    result,
                    "Music recognized successfully from microphone"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing microphone recognition request");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while processing your request",
                    new List<string> { ex.Message }));
            }
        }

        /// <summary>
        /// Recognize music from an uploaded audio file
        /// </summary>
        [HttpPost("recognize/file")]
        [ProducesResponseType(typeof(ApiResponse<MusicRecognitionResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RecognizeFromFileAsync(
            [FromForm] AudioUploadRequest request,
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
                    request.AudioFile,
                    FileType.Audio,
                    cancellationToken);

                if (!isValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(errorMessage));
                }

                var filePath = await _fileProcessingService.SaveFileAsync(
                    request.AudioFile,
                    FileType.Audio,
                    cancellationToken);

                using var fileStream = await _fileProcessingService.GetFileStreamAsync(
                    filePath,
                    cancellationToken);

                var result = await _musicRecognitionService.RecognizeFromAudioAsync(
                    fileStream,
                    request.AudioFile.FileName,
                    request.DurationSeconds,
                    cancellationToken);

                return Ok(ApiResponse<MusicRecognitionResultDto>.SuccessResponse(
                    result,
                    "Music recognized successfully from file"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing file recognition request");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while processing your request"));
            }
        }

        /// <summary>
        /// Get a specific recognition result by ID
        /// </summary>
        [HttpGet("result/{recognitionId:guid}")]
        [ProducesResponseType(typeof(ApiResponse<MusicRecognitionResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRecognitionResultAsync(
            Guid recognitionId,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _musicRecognitionService.GetRecognitionResultAsync(
                    recognitionId,
                    cancellationToken);

                return Ok(ApiResponse<MusicRecognitionResultDto>.SuccessResponse(
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

                var result = await _musicRecognitionService.GetRecognitionHistoryAsync(
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

        /// <summary>
        /// Helper method to get file extension from MIME type
        /// </summary>
        private string GetFileExtension(string mimeType)
        {
            return mimeType.ToLower() switch
            {
                "audio/webm" => "webm",
                "audio/wav" => "wav",
                "audio/wave" => "wav",
                "audio/mp3" => "mp3",
                "audio/mpeg" => "mp3",
                "audio/ogg" => "ogg",
                "audio/m4a" => "m4a",
                _ => "webm" // default
            };
        }
    }
}