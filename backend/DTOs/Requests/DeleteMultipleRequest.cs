using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Requests
{
    public class DeleteMultipleRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "At least one ID must be provided")]
        public List<Guid> Ids { get; set; } = new();
    }
}