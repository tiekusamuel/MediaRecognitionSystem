import React from 'react';
import { FaMusic, FaSpotify, FaApple, FaClock } from 'react-icons/fa';
import type { MusicRecognitionResponse } from '../services/musicService';
import { useRef, useState } from "react";

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

const audioRef = useRef<HTMLAudioElement>(null);

const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [isLoading, setIsLoading] = useState(false);
const [previewError, setPreviewError] = useState(false);


const togglePreview = async () => {
  if (!audioRef.current) return;

  try {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    await audioRef.current.play();

    setIsPlaying(true);
    setPreviewError(false);
  } catch (err) {
    console.error(err);
    setPreviewError(true);
  } finally {
    setIsLoading(false);
  }
};

const onLoadedMetadata = () => {
  if (audioRef.current) {
    setDuration(audioRef.current.duration);
  }
};

const onTimeUpdate = () => {
  if (audioRef.current) {
    setCurrentTime(audioRef.current.currentTime);
  }
};

const onEnded = () => {
  setIsPlaying(false);
  setCurrentTime(0);

  if (audioRef.current) {
    audioRef.current.currentTime = 0;
  }
};

const onError = () => {
  setPreviewError(true);
  setIsPlaying(false);
  setIsLoading(false);
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};




  return (
    <div className="card shadow-lg">
      <div className="row g-0">
        {/* Album Art */}
        <div className="col-md-4">
          <img
            src={music.track.albumArtUrl || '/placeholder-music.png'}
            alt={music.track.album}
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
                <h3 className="card-title mb-1">{music.track.title}</h3>
                <h5 className="text-muted">{music.track.artist}</h5>
              </div>
              <span className={`badge bg-${getConfidenceColor(music.confidenceScore)} fs-6`}>
                {music.confidenceScore}% Match
              </span>
            </div>

            {/* Album Info */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-3 text-muted">
                <span>
                  <FaMusic className="me-1" />
                  {music.track.album}
                </span>
                <span>
                  <FaClock className="me-1" />
                  {music.track.duration}
                </span>
              </div>
            </div>

            {/* Genre and Year */}
            <div className="row mb-3">
              <div className="col-6">
                <strong>Genre:</strong>
                <div className="text-muted">{music.track.genre}</div>
              </div>
              <div className="col-6">
                <strong>Release Year:</strong>
                <div className="text-muted">{music.track.releaseYear}</div>
              </div>
            </div>

           {/* Streaming Links */}
            {(music.track.spotifyUrl || music.track.appleMusicUrl) && (
              <div className="mb-4">
                <strong className="d-block mb-2">Listen on:</strong>

                <div className="d-flex gap-2 flex-wrap">
                  {music.track.spotifyUrl && (
                    <a
                      href={music.track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                    >
                      <FaSpotify className="me-2" />
                      Spotify
                    </a>
                  )}

                  {music.track.appleMusicUrl && (
                    <a
                      href={music.track.appleMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-dark"
                    >
                      <FaApple className="me-2" />
                      Apple Music
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Audio Player Placeholder */}
            <div className="bg-light p-3 rounded">

                {music?.track?.previewUrl ? (
                    <>
                        <audio
                            ref={audioRef}
                            src={music.track.previewUrl}
                            onLoadedMetadata={onLoadedMetadata}
                            onTimeUpdate={onTimeUpdate}
                            onEnded={onEnded}
                            onError={onError}
                        />

                        <div className="d-flex justify-content-between align-items-center mb-2">

                            <button
                                className="btn btn-primary"
                                onClick={togglePreview}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Loading..."
                                    : isPlaying
                                    ? "⏸ Pause Sample"
                                    : "▶ Play Sample"}
                            </button>
                            {music.track.songLink && (
                              <a
                                href={music.track.songLink}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-secondary"
                              >
                                ⬇ Download Preview
                              </a>
                            )}

                            <span className="small text-muted">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>

                        </div>

                        <div className="progress" style={{ height: "8px" }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width:
                                        duration > 0
                                            ? `${(currentTime / duration) * 100}%`
                                            : "0%",
                                }}
                            />
                        </div>

                        {previewError && (
                            <div className="text-danger mt-2">
                                Unable to play preview.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-muted">
                        Audio preview not available.
                    </div>
                )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicResultCard;