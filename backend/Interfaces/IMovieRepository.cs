using backend.Models;

namespace backend.Interfaces
{
    public interface IMovieRepository
    {
        Task<Movie?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Movie?> GetByImdbIdAsync(string imdbId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Movie>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Movie> AddAsync(Movie movie, CancellationToken cancellationToken = default);
        Task<Movie> UpdateAsync(Movie movie, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}