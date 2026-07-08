using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Interfaces;
using backend.Models;

namespace backend.Repositories
{
    public class MovieRepository : IMovieRepository
    {
        private readonly ApplicationDbContext _context;

        public MovieRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Movie?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Movies
                .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        }

        public async Task<Movie?> GetByImdbIdAsync(string imdbId, CancellationToken cancellationToken = default)
        {
            return await _context.Movies
                .FirstOrDefaultAsync(m => m.ImdbId == imdbId, cancellationToken);
        }

        public async Task<IEnumerable<Movie>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Movies
                .ToListAsync(cancellationToken);
        }

        public async Task<Movie> AddAsync(Movie movie, CancellationToken cancellationToken = default)
        {
            movie.CreatedAt = DateTime.UtcNow;
            await _context.Movies.AddAsync(movie, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return movie;
        }

        public async Task<Movie> UpdateAsync(Movie movie, CancellationToken cancellationToken = default)
        {
            movie.UpdatedAt = DateTime.UtcNow;
            _context.Movies.Update(movie);
            await _context.SaveChangesAsync(cancellationToken);
            return movie;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var movie = await _context.Movies.FindAsync(new object[] { id }, cancellationToken);
            if (movie == null) return false;

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}