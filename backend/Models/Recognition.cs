// Models/Recognition.cs
namespace backend.Models
{
    public class Recognition
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty; // "movie" or "music"
        public double Accuracy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}