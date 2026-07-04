import React from 'react';
import { FaMusic, FaSpotify, FaApple, FaYoutube, FaClock } from 'react-icons/fa';
import type { MusicRecognitionResponse } from '../services/musicService';

interface MusicResultCardProps {
  music: MusicRecognitionResponse;
}

/**
 * Music recognition result card component
 */
const MusicResultCard: React.FC<MusicResultCardProps> = ({ music }) => {
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'danger';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card shadow-lg">
      <div className="row g-0">
        {/* Album Art */}
        <div className="col-md-4">
          <img
            src={music.albumArt || '/placeholder-music.png'}
            alt={music.album}
            className="img-fluid rounded-start h-100 object-fit-cover"
            style={{ minHeight: '350px' }}
          />
        </div>

        {/* Details */}
        <div className="col-md-8">
          <div className="card-body">
            {/* Title and Confidence */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h3 className="card-title mb-1">{music.title}</h3>
                <h5 className="text-muted">{music.artist}</h5>
              </div>
              <span className={`badge bg-${getConfidenceColor(music.confidence)} fs-6`}>
                {music.confidence}% Match
              </span>
            </div>

            {/* Album Info */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-3 text-muted">
                <span>
                  <FaMusic className="me-1" />
                  {music.album}
                </span>
                <span>
                  <FaClock className="me-1" />
                  {formatDuration(music.duration)}
                </span>
              </div>
            </div>

            {/* Genre and Year */}
            <div className="row mb-3">
              <div className="col-6">
                <strong>Genre:</strong>
                <div className="text-muted">{music.genre}</div>
              </div>
              <div className="col-6">
                <strong>Release Year:</strong>
                <div className="text-muted">{music.releaseYear}</div>
              </div>
            </div>

            {/* Streaming Links */}
            {music.streamingLinks && (
              <div className="mb-4">
                <strong className="d-block mb-2">Listen on:</strong>
                <div className="d-flex gap-2 flex-wrap">
                  {music.streamingLinks.spotify && (
                    <a
                      href={music.streamingLinks.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                    >
                      <FaSpotify className="me-2" />
                      Spotify
                    </a>
                  )}
                  {music.streamingLinks.appleMusic && (
                    <a
                      href={music.streamingLinks.appleMusic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-dark"
                    >
                      <FaApple className="me-2" />
                      Apple Music
                    </a>
                  )}
                  {music.streamingLinks.youtube && (
                    <a
                      href={music.streamingLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-danger"
                    >
                      <FaYoutube className="me-2" />
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Audio Player Placeholder */}
            <div className="bg-light p-3 rounded">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted small">Audio preview not available</span>
                <button className="btn btn-sm btn-primary">Play Sample</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicResultCard;