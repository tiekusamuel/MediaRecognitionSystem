using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Requests
{
    public class VideoUploadRequest : FileUploadRequest
    {
        [Range(0, int.MaxValue, ErrorMessage = "Start time must be a positive number")]
        public int? StartTimeSeconds { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "End time must be a positive number")]
        public int? EndTimeSeconds { get; set; }
    }
}