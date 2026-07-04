using backend.Models;

namespace backend.Interfaces
{
    public interface IMusicRepository
    {
        Task<MusicTrack?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<MusicTrack?> GetByIsrcAsync(string isrc, CancellationToken cancellationToken = default);
        Task<IEnumerable<MusicTrack>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<MusicTrack> AddAsync(MusicTrack track, CancellationToken cancellationToken = default);
        Task<MusicTrack> UpdateAsync(MusicTrack track, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}