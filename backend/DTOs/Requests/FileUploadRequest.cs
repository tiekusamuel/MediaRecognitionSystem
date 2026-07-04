using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Requests
{
    public class FileUploadRequest
    {
        [Required(ErrorMessage = "File is required")]
        public IFormFile File { get; set; } = null!;

        public string? AdditionalNotes { get; set; }
    }
}