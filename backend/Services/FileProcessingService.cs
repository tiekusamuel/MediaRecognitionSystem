using backend.Helpers.Constants;
using backend.Helpers.Enums;
using backend.Interfaces;

namespace backend.Services
{
    public class FileProcessingService : IFileProcessingService
    {
        private readonly ILogger<FileProcessingService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadsPath;

        public FileProcessingService(
            ILogger<FileProcessingService> logger,
            IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
            _uploadsPath = Path.Combine(_environment.ContentRootPath, "Uploads");

            EnsureUploadDirectoryExists();
        }

        public async Task<(bool isValid, string errorMessage)> ValidateFileAsync(
            IFormFile file,
            FileType fileType,
            CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;

            if (file == null || file.Length == 0)
            {
                return (false, "File is empty or null.");
            }

            var extension = GetFileExtension(file.FileName).ToLowerInvariant();
            var contentType = file.ContentType.ToLowerInvariant();

            switch (fileType)
            {
                case FileType.Video:
                    if (!FileConstants.AllowedVideoExtensions.Contains(extension))
                    {
                        return (false, $"Invalid video file extension. Allowed: {string.Join(", ", FileConstants.AllowedVideoExtensions)}");
                    }
                    if (!FileConstants.VideoContentTypes.Contains(contentType))
                    {
                        return (false, "Invalid video content type.");
                    }
                    if (file.Length > FileConstants.MaxVideoSizeInBytes)
                    {
                        return (false, $"Video file size exceeds maximum allowed size of {FileConstants.MaxVideoSizeInBytes / (1024 * 1024)} MB.");
                    }
                    break;

                case FileType.Image:
                    if (!FileConstants.AllowedImageExtensions.Contains(extension))
                    {
                        return (false, $"Invalid image file extension. Allowed: {string.Join(", ", FileConstants.AllowedImageExtensions)}");
                    }
                    if (!FileConstants.ImageContentTypes.Contains(contentType))
                    {
                        return (false, "Invalid image content type.");
                    }
                    if (file.Length > FileConstants.MaxImageSizeInBytes)
                    {
                        return (false, $"Image file size exceeds maximum allowed size of {FileConstants.MaxImageSizeInBytes / (1024 * 1024)} MB.");
                    }
                    break;

                case FileType.Audio:
                    if (!FileConstants.AllowedAudioExtensions.Contains(extension))
                    {
                        return (false, $"Invalid audio file extension. Allowed: {string.Join(", ", FileConstants.AllowedAudioExtensions)}");
                    }
                    if (!FileConstants.AudioContentTypes.Contains(contentType))
                    {
                        return (false, "Invalid audio content type.");
                    }
                    if (file.Length > FileConstants.MaxAudioSizeInBytes)
                    {
                        return (false, $"Audio file size exceeds maximum allowed size of {FileConstants.MaxAudioSizeInBytes / (1024 * 1024)} MB.");
                    }
                    break;

                default:
                    return (false, "Unknown file type.");
            }

            return (true, string.Empty);
        }

        public async Task<string> SaveFileAsync(
            IFormFile file,
            FileType fileType,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var fileTypeFolder = Path.Combine(_uploadsPath, fileType.ToString());
                Directory.CreateDirectory(fileTypeFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(fileTypeFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }

                _logger.LogInformation("File saved successfully: {FilePath}", filePath);

                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file: {FileName}", file.FileName);
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(
            string filePath,
            CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;

            try
            {
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("File deleted successfully: {FilePath}", filePath);
                    return true;
                }

                _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
                throw;
            }
        }

        public async Task<Stream> GetFileStreamAsync(
            string filePath,
            CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            return new FileStream(filePath, FileMode.Open, FileAccess.Read);
        }

        public string GetFileExtension(string fileName)
        {
            return Path.GetExtension(fileName);
        }

        public long GetFileSize(IFormFile file)
        {
            return file.Length;
        }

        private void EnsureUploadDirectoryExists()
        {
            var directories = new[]
            {
                Path.Combine(_uploadsPath, "Video"),
                Path.Combine(_uploadsPath, "Image"),
                Path.Combine(_uploadsPath, "Audio")
            };

            foreach (var directory in directories)
            {
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                    _logger.LogInformation("Upload directory created: {Directory}", directory);
                }
            }
        }
    }
}