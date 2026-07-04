namespace backend.Configurations
{
    public class FileUploadConfiguration
    {
        public long MaxVideoSizeInBytes { get; set; } = 100 * 1024 * 1024; // 100 MB
        public long MaxImageSizeInBytes { get; set; } = 10 * 1024 * 1024;  // 10 MB
        public long MaxAudioSizeInBytes { get; set; } = 20 * 1024 * 1024;  // 20 MB
        
        public string[] AllowedVideoExtensions { get; set; } = { ".mp4", ".avi", ".mov", ".mkv", ".wmv" };
        public string[] AllowedImageExtensions { get; set; } = { ".jpg", ".jpeg", ".png", ".bmp", ".gif" };
        public string[] AllowedAudioExtensions { get; set; } = { ".mp3", ".wav", ".m4a", ".flac", ".aac" };
        
        public string UploadPath { get; set; } = "Uploads";
    }
}