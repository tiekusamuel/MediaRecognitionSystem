import React, { useState } from 'react';
import { FaFilm, FaUpload } from 'react-icons/fa';
import UploadBox from '../components/UploadBox';
import MovieResultCard from '../components/MovieResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import movieService from '../services/movieService';
import type { MovieRecognitionRequest, MovieRecognitionResponse } from '../services/movieService';

/**
 * Movie recognition page
 */
const MovieRecognition: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [result, setResult] = useState<MovieRecognitionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleRecognize = async () => {
    if (!selectedFile) {
      setError('Please select a video file first');
      return;
    }
  

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    const request : MovieRecognitionRequest = {
      file: selectedFile,
      startTimeSeconds:
           startTime === ""
               ? undefined
               : Number(startTime),
      endTimeSeconds:
           endTime === "" 
              ? undefined
              : Number(endTime),
    };
      
  
    try {
      const response = await movieService.recognizeMovie(
        request,
        (progressEvent: any) => {
          const total = progressEvent?.total ?? 0;
          const loaded = progressEvent?.loaded ?? 0;
          const progress = total ? Math.round((loaded * 100) / total) : 0;
          setUploadProgress(progress);
        }
      );
  
      setResult(response);
      console.log(response);
    } catch (err: any) {
      console.error('Movie recognition failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to recognize movie. Please try again.'
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayTrailer = () => {
    if (result?.movie?.trailerUrl) {
      window.open(result.movie?.trailerUrl, '_blank');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="display-5 fw-bold mb-2">
          <FaFilm className="me-3 text-primary" />
          Movie Recognition
        </h1>
        <p className="lead text-muted">
          Upload a video clip from a movie and let our AI identify it for you
        </p>
      </div>

      {/* Upload Section */}
      {!result && (
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h4 className="card-title mb-4">Upload Video</h4>
                
                <UploadBox
                  accept="video/*"
                  onFileSelect={handleFileSelect}
                  maxSize={100}
                  type="video"
                  disabled={loading}
                />

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Uploading...</span>
                      <span className="text-muted">{uploadProgress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Recognize Button */}
                {selectedFile && !loading && (
                  <div className="mt-4 text-center">
                    <button
                      className="btn btn-primary btn-lg px-5"
                      onClick={handleRecognize}
                    >
                      <FaUpload className="me-2" />
                      Recognize Movie
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && uploadProgress === 0 && (
        <div className="text-center py-5">
          <LoadingSpinner message="Analyzing video... This may take a moment." />
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Recognition Result</h3>
            <button className="btn btn-outline-primary" onClick={handleReset}>
              Recognize Another
            </button>
          </div>
          
          <MovieResultCard movie={result} onPlayTrailer={handlePlayTrailer} />
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <div className="row mt-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 bg-light">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Tips for best results:</h5>
                <ul className="mb-0">
                  <li className="mb-2">Upload a clear video clip (at least 5 seconds long)</li>
                  <li className="mb-2">Ensure the video quality is good (minimum 480p)</li>
                  <li className="mb-2">Include distinctive scenes with characters or landmarks</li>
                  <li className="mb-2">Supported formats: MP4, MOV, AVI, MKV</li>
                  <li className="mb-2">Maximum file size: 100MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieRecognition;