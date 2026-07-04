import React, { useState, useRef, useEffect } from 'react';
import { FaMusic, FaMicrophone, FaUpload, FaRedo } from 'react-icons/fa';
import UploadBox from '../components/UploadBox';
import MusicResultCard from '../components/MusicResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import musicService, { type MusicRecognitionResponse } from '../services/musicService';

const RECORDING_DURATION = 15; // 15 seconds

/**
 * Music recognition page (Shazam-inspired)
 */
const MusicRecognition: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<MusicRecognitionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
      
      const response = await musicService.recognizeMusic(
        audioFile,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
          setUploadProgress(progress);
        }
      );
      
      setResult(response);
    } catch (err: any) {
      console.error('Music recognition failed:', err);
      setError(
        err.response?.data?.message || 
        'Failed to recognize music. Please try again.'
      );
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleRecognizeFile = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const response = await musicService.recognizeMusic(
        selectedFile,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
          setUploadProgress(progress);
        }
      );
      setResult(response);
    } catch (err: any) {
      console.error('Music recognition failed:', err);
      setError(
        err.response?.data?.message || 
        'Failed to recognize music. Please try again.'
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw circular waveform (Shazam style)
      const bars = 60;
      const radius = Math.min(WIDTH, HEIGHT) / 3;

      for (let i = 0; i < bars; i++) {
        const dataIndex = Math.floor((i / bars) * bufferLength);
        const value = dataArray[dataIndex];
        const percent = value / 255;
        
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const barHeight = percent * radius * 0.8;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        const hue = 120 + (percent * 60);
        canvasCtx.strokeStyle = `hsla(${hue}, 70%, 50%, ${0.6 + percent * 0.4})`;
        canvasCtx.lineWidth = 4;
        canvasCtx.lineCap = 'round';

        canvasCtx.beginPath();
        canvasCtx.moveTo(x1, y1);
        canvasCtx.lineTo(x2, y2);
        canvasCtx.stroke();
      }

      // Draw center circle
      canvasCtx.beginPath();
      canvasCtx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
      canvasCtx.strokeStyle = 'rgba(25, 135, 84, 0.3)';
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();

      // Draw inner glow
      const gradient = canvasCtx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(25, 135, 84, 0.1)');
      gradient.addColorStop(1, 'rgba(25, 135, 84, 0)');
      canvasCtx.fillStyle = gradient;
      canvasCtx.fill();
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      // Reset state
      setError(null);
      setResult(null);
      setRecordingTime(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // Setup audio analysis for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/ogg';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Automatically process the recording
        await processRecording(audioBlob);
      };

      // Start recording
      mediaRecorder.start(100);
      setIsRecording(true);

      // Start visualization
      drawWaveform();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          return newTime;
        });
      }, 1000);

      // Auto-stop after 15 seconds
      autoStopTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION * 1000);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(
        err.name === 'NotAllowedError' 
          ? 'Microphone access denied. Please allow microphone access and try again.'
          : 'Failed to start recording. Please check your microphone and try again.'
      );
      setIsRecording(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setRecordingTime(0);
    setIsProcessing(false);
    
    if (isRecording) {
      stopRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return Math.min((recordingTime / RECORDING_DURATION) * 100, 100);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="display-5 fw-bold mb-2">
          <FaMusic className="me-3 text-success" />
          Music Recognition
        </h1>
        <p className="lead text-muted">
          Upload an audio file or record from your microphone to identify songs
        </p>
      </div>

      {/* Upload/Record Section */}
      {!result && !isProcessing && (
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                {/* Tab Navigation */}
                <ul className="nav nav-pills mb-4 justify-content-center" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="upload-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#upload"
                      type="button"
                      role="tab"
                      disabled={isRecording || loading}
                    >
                      <FaUpload className="me-2" />
                      Upload Audio
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="record-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#record"
                      type="button"
                      role="tab"
                      disabled={loading}
                    >
                      <FaMicrophone className="me-2" />
                      Record
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Upload Tab */}
                  <div className="tab-pane fade show active" id="upload" role="tabpanel">
                    <UploadBox
                      accept="audio/*"
                      onFileSelect={handleFileSelect}
                      maxSize={50}
                      type="audio"
                      disabled={loading || isRecording}
                    />
                  </div>

                  {/* Record Tab - Shazam Style */}
                  <div className="tab-pane fade" id="record" role="tabpanel">
                    <div className="text-center py-4">
                      <div className="shazam-container">
                        {/* Canvas for waveform visualization */}
                        <div className="position-relative d-inline-block mb-4">
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={400}
                            className={`shazam-canvas ${isRecording ? 'recording' : ''}`}
                            style={{ 
                              maxWidth: '100%',
                              display: 'block'
                            }}
                          />
                          
                          {/* Center button */}
                          <div className="shazam-button-container">
                            <button
                              className={`shazam-button ${isRecording ? 'recording' : ''}`}
                              onClick={startRecording}
                              disabled={loading || isRecording}
                            >
                              <div className="shazam-button-inner">
                                {isRecording ? (
                                  <div className="recording-pulse">
                                    <div className="pulse-ring"></div>
                                    <div className="pulse-ring delay-1"></div>
                                    <div className="pulse-ring delay-2"></div>
                                  </div>
                                ) : (
                                  <FaMicrophone size={48} />
                                )}
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Recording status */}
                        {isRecording && (
                          <div className="mb-4">
                            <h3 className="fw-bold mb-2 shazam-timer">
                              {formatTime(recordingTime)}
                            </h3>
                            
                            {/* Progress circle */}
                            <div className="progress-circle-container mb-3">
                              <svg className="progress-ring" width="120" height="120">
                                <circle
                                  className="progress-ring-circle-bg"
                                  stroke="#e9ecef"
                                  strokeWidth="4"
                                  fill="transparent"
                                  r="54"
                                  cx="60"
                                  cy="60"
                                />
                                <circle
                                  className="progress-ring-circle"
                                  stroke="#198754"
                                  strokeWidth="4"
                                  fill="transparent"
                                  r="54"
                                  cx="60"
                                  cy="60"
                                  style={{
                                    strokeDasharray: `${2 * Math.PI * 54}`,
                                    strokeDashoffset: `${2 * Math.PI * 54 * (1 - getProgressPercentage() / 100)}`,
                                    transition: 'stroke-dashoffset 0.3s linear'
                                  }}
                                />
                                <text
                                  x="60"
                                  y="60"
                                  textAnchor="middle"
                                  dy="7"
                                  className="progress-text"
                                  fill="#198754"
                                  fontSize="20"
                                  fontWeight="bold"
                                >
                                  {RECORDING_DURATION - recordingTime}s
                                </text>
                              </svg>
                            </div>

                            <div className="d-flex justify-content-center align-items-center">
                              <span className="recording-indicator me-2"></span>
                              <span className="text-muted fw-medium">Listening to the music...</span>
                            </div>
                            <p className="text-muted small mt-2">
                              Recording will stop automatically
                            </p>
                          </div>
                        )}

                        {!isRecording && (
                          <>
                            <h4 className="fw-bold mb-2">Tap to Shazam</h4>
                            <p className="text-muted">
                              Will automatically record for {RECORDING_DURATION} seconds
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
                        className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Recognize Button (for uploaded files) */}
                {selectedFile && !loading && (
                  <div className="mt-4 text-center">
                    <button
                      className="btn btn-success btn-lg px-5"
                      onClick={handleRecognizeFile}
                    >
                      <FaMusic className="me-2" />
                      Recognize Music
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {(isProcessing || (loading && uploadProgress === 0)) && (
        <div className="text-center py-5">
          <LoadingSpinner message="Analyzing the recording... This may take a moment." />
          {isProcessing && (
            <p className="text-muted mt-3">
              Processing {RECORDING_DURATION}-second audio sample
            </p>
          )}
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Recognition Result</h3>
            <button className="btn btn-outline-success" onClick={handleReset}>
              <FaRedo className="me-2" />
              Try Another
            </button>
          </div>
          
          <MusicResultCard music={result} />
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && !isProcessing && (
        <div className="row mt-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 bg-light">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Tips for best results:</h5>
                <ul className="mb-0">
                  <li className="mb-2">Record in a quiet environment for best accuracy</li>
                  <li className="mb-2">Hold your device close to the audio source</li>
                  <li className="mb-2">Recording automatically captures {RECORDING_DURATION} seconds</li>
                  <li className="mb-2">Include vocals or distinctive instrumentals</li>
                  <li className="mb-2">Supported formats: MP3, WAV, M4A, OGG, FLAC, WebM</li>
                  <li className="mb-2">Maximum file size: 50MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shazam-style CSS */}
      <style>{`
        .shazam-container {
          position: relative;
        }

        .shazam-canvas {
          border-radius: 50%;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .shazam-canvas.recording {
          animation: canvasPulse 2s ease-in-out infinite;
        }

        .shazam-button-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .shazam-button {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #198754 0%, #20c997 100%);
          box-shadow: 0 10px 30px rgba(25, 135, 84, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: visible;
        }

        .shazam-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 15px 40px rgba(25, 135, 84, 0.4);
        }

        .shazam-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .shazam-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .shazam-button.recording {
          background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
          animation: buttonPulse 1.5s ease-in-out infinite;
          cursor: not-allowed;
        }

        .shazam-button-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .recording-pulse {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: pulseRing 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .pulse-ring.delay-1 {
          animation-delay: 0.5s;
        }

        .pulse-ring.delay-2 {
          animation-delay: 1s;
        }

        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes buttonPulse {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(220, 53, 69, 0.4);
          }
          50% {
            box-shadow: 0 15px 50px rgba(220, 53, 69, 0.6);
          }
        }

        @keyframes canvasPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(25, 135, 84, 0.2);
          }
          50% {
            box-shadow: 0 0 40px rgba(25, 135, 84, 0.4);
          }
        }

        .recording-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #dc3545;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .shazam-timer {
          color: #198754;
          font-size: 2.5rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .progress-circle-container {
          display: inline-block;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-circle {
          transition: stroke-dashoffset 0.3s linear;
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .shazam-canvas {
            width: 300px !important;
            height: 300px !important;
          }

          .shazam-button {
            width: 100px;
            height: 100px;
          }

          .shazam-button svg {
            font-size: 36px;
          }

          .shazam-timer {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MusicRecognition;