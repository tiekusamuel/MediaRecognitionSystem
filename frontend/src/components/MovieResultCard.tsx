import React from 'react';
import { FaStar, FaPlay, FaCalendar, FaFilm } from 'react-icons/fa';
import type { MovieRecognitionResponse } from '../services/movieService';

interface MovieResultCardProps {
  movie: MovieRecognitionResponse;
  onPlayTrailer?: () => void;
}


/**
 * Movie recognition result card component
 */
const MovieResultCard: React.FC<MovieResultCardProps> = ({ movie, onPlayTrailer }) => {
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'danger';
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="row g-0">
        {/* Poster */}
        <div className="col-md-4">
          <img
            src={movie.movie?.poster || '/placeholder-movie.png'}
            alt={movie.movie?.title}
            className="img-fluid rounded-start h-100 object-fit-cover"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Details */}
        <div className="col-md-8">
          <div className="card-body">
            {/* Title and Confidence */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h3 className="card-title mb-0">{movie.movie?.title}</h3>
              <span className={`badge bg-${getConfidenceColor(movie.confidenceScore)} fs-6`}>
                {movie.confidenceScore}% Match
              </span>
            </div>

            {/* Meta Info */}
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-3 text-muted">
                <span>
                  <FaCalendar className="me-1" />
                  {movie.movie?.year}
                </span>
                <span>
                  <FaFilm className="me-1" />
                  {movie.movie?.genre.join(', ')}
                </span>
              </div>
            </div>

            {/* Director */}
            <div className="mb-2">
              <strong>Director:</strong> {movie.movie?.director}
            </div>

            {/* Cast */}
            <div className="mb-3">
              <strong>Cast:</strong>{' '}
              <span className="text-muted">{movie.movie?.cast.join(', ')}</span>
            </div>

            {/* Synopsis */}
            <div className="mb-3">
              <strong>Synopsis:</strong>
              <p className="text-muted mt-2">{movie.movie?.synopsis}</p>
            </div>

            {/* Rating placeholder */}
            <div className="mb-3">
              <strong>Rating:</strong>
              <div className="d-inline-flex ms-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="text-warning me-1" />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4">
              {movie.movie?.trailerUrl && (
                <button
                  className="btn btn-primary me-2"
                  onClick={onPlayTrailer}
                >
                  <FaPlay className="me-2" />
                  Watch Trailer
                </button>
              )}
              <button className="btn btn-outline-secondary">
                More Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieResultCard;