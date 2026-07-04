using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Interfaces;
using backend.Models;

namespace backend.Repositories
{
    public class MusicRepository : IMusicRepository
    {
        private readonly ApplicationDbContext _context;

        public MusicRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MusicTrack?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.MusicTracks
                .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        }

        public async Task<MusicTrack?> GetByIsrcAsync(string isrc, CancellationToken cancellationToken = default)
        {
            return await _context.MusicTracks
                .FirstOrDefaultAsync(m => m.Isrc == isrc, cancellationToken);
        }

        public async Task<IEnumerable<MusicTrack>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.MusicTracks.ToListAsync(cancellationToken);
        }

        public async Task<MusicTrack> AddAsync(MusicTrack track, CancellationToken cancellationToken = default)
        {
            track.CreatedAt = DateTime.UtcNow;
            await _context.MusicTracks.AddAsync(track, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return track;
        }

        public async Task<MusicTrack> UpdateAsync(MusicTrack track, CancellationToken cancellationToken = default)
        {
            track.UpdatedAt = DateTime.UtcNow;
            _context.MusicTracks.Update(track);
            await _context.SaveChangesAsync(cancellationToken);
            return track;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var track = await _context.MusicTracks.FindAsync(new object[] { id }, cancellationToken);
            if (track == null) return false;

            _context.MusicTracks.Remove(track);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}