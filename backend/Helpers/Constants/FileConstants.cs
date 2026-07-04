namespace backend.Helpers.Constants
{
    public static class FileConstants
    {
        // Video
        public static readonly string[] AllowedVideoExtensions = { ".mp4", ".avi", ".mov", ".mkv", ".wmv" };
        public const long MaxVideoSizeInBytes = 100 * 1024 * 1024; // 100 MB

        // Image
        public static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".bmp", ".gif" };
        public const long MaxImageSizeInBytes = 10 * 1024 * 1024; // 10 MB

        // Audio (File uploads)
        public static readonly string[] AllowedAudioExtensions = { ".mp3", ".wav", ".m4a", ".flac", ".aac", ".webm", ".ogg" };
        public const long MaxAudioSizeInBytes = 20 * 1024 * 1024; // 20 MB

        // Microphone audio
        public const long MaxMicrophoneAudioSizeInBytes = 10 * 1024 * 1024; // 10 MB
        public static readonly string[] AllowedMicrophoneFormats = { "audio/webm", "audio/wav", "audio/mp3", "audio/ogg", "audio/mpeg" };

        // Content Types
        public static readonly string[] VideoContentTypes = 
        { 
            "video/mp4", 
            "video/x-msvideo", 
            "video/quicktime", 
            "video/x-matroska",
            "video/x-ms-wmv"
        };

        public static readonly string[] ImageContentTypes = 
        { 
            "image/jpeg", 
            "image/png", 
            "image/bmp", 
            "image/gif" 
        };

        public static readonly string[] AudioContentTypes = 
        { 
            "audio/mpeg", 
            "audio/wav", 
            "audio/x-m4a", 
            "audio/flac", 
            "audio/aac",
            "audio/mp3",
            "audio/webm",
            "audio/ogg"
        };

        // Upload paths
        public const string VideoUploadPath = "Uploads/Video";
        public const string ImageUploadPath = "Uploads/Image";
        public const string AudioUploadPath = "Uploads/Audio";
        public const string MicrophoneUploadPath = "Uploads/Microphone";
    }
}