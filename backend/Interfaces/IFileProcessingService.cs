using backend.Helpers.Enums;

namespace backend.Interfaces
{
    public interface IFileProcessingService
    {
        Task<(bool isValid, string errorMessage)> ValidateFileAsync(
            IFormFile file, 
            FileType fileType,
            CancellationToken cancellationToken = default);

        Task<string> SaveFileAsync(
            IFormFile file, 
            FileType fileType,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteFileAsync(
            string filePath,
            CancellationToken cancellationToken = default);

        Task<Stream> GetFileStreamAsync(
            string filePath,
            CancellationToken cancellationToken = default);

        string GetFileExtension(string fileName);
        long GetFileSize(IFormFile file);
    }
}