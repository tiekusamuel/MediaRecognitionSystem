using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Requests
{
    public class AudioUploadRequest
    {
        [Required(ErrorMessage = "Audio file is required")]
        public IFormFile AudioFile { get; set; } = null!;

        [Range(0, 60, ErrorMessage = "Duration must be between 0 and 60 seconds")]
        public int? DurationSeconds { get; set; }

        public string? Source { get; set; } // "microphone" or "file"
    }
}