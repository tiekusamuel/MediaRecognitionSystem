using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Helpers.Enums;
using backend.Interfaces;
using backend.Models;

namespace backend.Repositories
{
    public class RecognitionHistoryRepository : IRecognitionHistoryRepository
    {
        private readonly ApplicationDbContext _context;

        public RecognitionHistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecognitionHistory?> GetByIdAsync(
            Guid id, 
            CancellationToken cancellationToken = default)
        {
            return await _context.RecognitionHistories
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<RecognitionHistory>> GetByTypeAsync(
            RecognitionType type,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            return await _context.RecognitionHistories
                .Where(r => r.Type == type)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetCountByTypeAsync(
            RecognitionType type, 
            CancellationToken cancellationToken = default)
        {
            return await _context.RecognitionHistories
                .CountAsync(r => r.Type == type, cancellationToken);
        }

        public async Task<RecognitionHistory> AddAsync(
            RecognitionHistory history, 
            CancellationToken cancellationToken = default)
        {
            history.CreatedAt = DateTime.UtcNow;
            await _context.RecognitionHistories.AddAsync(history, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return history;
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.RecognitionHistories
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (entity != null)
            {
                _context.RecognitionHistories.Remove(entity);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task ClearAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _context.RecognitionHistories.ToListAsync(cancellationToken);
            _context.RecognitionHistories.RemoveRange(entities);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}