import React, { useState, useRef, useEffect } from 'react';
import { FaMusic, FaMicrophone, FaUpload, FaRedo, FaStop, FaTimes } from 'react-icons/fa';
import UploadBox from '../components/UploadBox';
import MusicResultCard from '../components/MusicResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import musicService, { type MusicRecognitionResponse } from '../services/musicService';

const RECORDING_DURATION = 10; // 15 seconds

/**
 * Music recognition page - Modern unified interface
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
  const [activeSection, setActiveSection] = useState<'record' | 'upload' | null>(null);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimeRef = useRef(0);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startTimer=() =>{

      recordingTimeRef.current = 0;
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
      

  };

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
    setActiveSection('upload');
  };

  const processRecording = async (audioBlob: Blob, durationSeconds:number) => {
    setIsProcessing(true);
    setLoading(true);
    setError(null);

    try {
      const response = await musicService.recognizeMusicFromMicrophoneBlob(
        audioBlob,
        durationSeconds
      );

      console.log("Microphone Recognition:", response);
      setResult(response);
      
      setTimeout(() => {
        document.querySelector(".fade-in")?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);

    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ??
        "Failed to recognize music from microphone."
      );
      
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setActiveSection(null);
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
        undefined,
        (progressEvent: any) => {
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
      setActiveSection(null);
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

      // Draw circular waveform
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

        const hue = 200 + (percent * 60);
        canvasCtx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.6 + percent * 0.4})`;
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
      canvasCtx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();

      // Draw inner glow
      const gradient = canvasCtx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      canvasCtx.fillStyle = gradient;
      canvasCtx.fill();
    };

    draw();
  };

  const stopRecording = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('Stop recording clicked'); // Debug log

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

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setResult(null);
      setRecordingTime(0);
      setActiveSection('record');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
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
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if(timerRef.current){
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("Audio blob:", audioBlob);
        console.log("Audio type:", audioBlob.type);
        console.log("Audio size:", audioBlob.size);
        await processRecording(audioBlob, recordingTimeRef.current);
        console.log(
            "Final duration:",
            recordingTimeRef.current
        );
      };

      mediaRecorder.start();
   
      setIsRecording(true);
      startTimer();

      drawWaveform();

     
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
      setActiveSection(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setRecordingTime(0);
    setIsProcessing(false);
    setActiveSection(null);
    
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

  const isUploadDisabled = isRecording || activeSection === 'record' || loading || isProcessing;
  const isRecordDisabled = activeSection === 'upload' || loading || isProcessing;

  return (
    <div className="music-recognition-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaMusic className="title-icon" />
            Music Recognition
          </h1>
          <p className="page-subtitle">
            Record live audio or upload a file to identify any song instantly
          </p>
        </div>
      </div>

      {/* Main Content */}
      {!result && !isProcessing && (
        <div className="main-content">
          {/* Recording Section */}
          <div className={`section-card record-section ${isUploadDisabled ? 'disabled' : ''}`}>
            <div className="section-header">
              <div className="section-icon record-icon">
                <FaMicrophone />
              </div>
              <div>
                <h2 className="section-title">Record Audio</h2>
                <p className="section-description">
                  Tap the button to record {RECORDING_DURATION} seconds of audio
                </p>
              </div>
            </div>

            <div className="record-content">
              {!isRecording ? (
                <div className="record-idle">
                  <button
                    className="record-button"
                    onClick={startRecording}
                    disabled={isRecordDisabled}
                    type="button"
                  >
                    <div className="button-ripple"></div>
                    <FaMicrophone className="button-icon" />
                  </button>
                  <p className="record-hint">
                    {isRecordDisabled ? 'Please complete or cancel the upload first' : 'Click to start recording'}
                  </p>
                </div>
              ) : (
                <div className="record-active">
                  <div className="visualizer-container">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={280}
                      className="waveform-canvas"
                    />
                    <div className="recording-badge">
                      <span className="recording-dot"></span>
                      Recording
                    </div>
                  </div>

                  <div className="recording-info">
                    <div className="timer-display">{formatTime(recordingTime)}</div>
                    
                    <div className="progress-ring-wrapper">
                      <svg className="progress-ring" width="80" height="80">
                        <circle
                          className="progress-ring-bg"
                          cx="40"
                          cy="40"
                          r="35"
                        />
                        <circle
                          className="progress-ring-fill"
                          cx="40"
                          cy="40"
                          r="35"
                          style={{
                            strokeDasharray: `${2 * Math.PI * 35}`,
                            strokeDashoffset: `${2 * Math.PI * 35 * (1 - getProgressPercentage() / 100)}`,
                          }}
                        />
                        <text
                          x="40"
                          y="45"
                          textAnchor="middle"
                          className="countdown-text"
                        >
                          {RECORDING_DURATION - recordingTime}s
                        </text>
                      </svg>
                    </div>

                    <button
                      className="stop-button"
                      onClick={stopRecording}
                      type="button"
                    >
                      <FaStop />
                      <span>Stop Recording</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider">
            <span className="divider-text">OR</span>
          </div>

          {/* Upload Section */}
          <div className={`section-card upload-section ${isUploadDisabled ? 'disabled' : ''}`}>
            <div className="section-header">
              <div className="section-icon upload-icon">
                <FaUpload />
              </div>
              <div>
                <h2 className="section-title">Upload Audio File</h2>
                <p className="section-description">
                  Drop your audio file here or click to browse
                </p>
              </div>
            </div>

            <div className="upload-content">
              <UploadBox
                accept="audio/*"
                onFileSelect={handleFileSelect}
                maxSize={50}
                type="audio"
                disabled={isUploadDisabled}
              />

              {selectedFile && !loading && (
                <div className="file-selected-info">
                  <div className="selected-file">
                    <FaMusic className="file-icon" />
                    <span className="file-name">{selectedFile.name}</span>
                    <button
                      className="remove-file-btn"
                      onClick={() => {
                        setSelectedFile(null);
                        setActiveSection(null);
                      }}
                      title="Remove file"
                      type="button"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <button
                    className="recognize-button"
                    onClick={handleRecognizeFile}
                    type="button"
                  >
                    <FaMusic />
                    <span>Recognize Music</span>
                  </button>
                </div>
              )}

              {loading && uploadProgress > 0 && (
                <div className="upload-progress">
                  <div className="progress-header">
                    <span>Uploading...</span>
                    <span className="progress-percentage">{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <div className="error-content">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {(isProcessing || (loading && uploadProgress === 0)) && (
        <div className="processing-container">
          <LoadingSpinner message="Analyzing audio... This may take a moment." />
          {isProcessing && (
            <p className="processing-info">
              Processing {recordingTime}-second audio sample
            </p>
          )}
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="fade-in">
          <div className="result-header">
            <h3 className="result-title">Recognition Result</h3>
            <button className="reset-button" onClick={handleReset} type="button">
              <FaRedo />
              <span>Try Another</span>
            </button>
          </div>
          
          <MusicResultCard music={result} />
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && !isProcessing && (
        <div className="instructions-card">
          <h5 className="instructions-title">💡 Tips for Best Results</h5>
          <ul className="instructions-list">
            <li>Record in a quiet environment for best accuracy</li>
            <li>Hold your device close to the audio source</li>
            <li>Recording automatically captures {RECORDING_DURATION} seconds</li>
            <li>Include vocals or distinctive instrumentals</li>
            <li>Supported formats: MP3, WAV, M4A, OGG, FLAC, WebM</li>
            <li>Maximum file size: 50MB</li>
          </ul>
        </div>
      )}

      {/* Modern Styles */}
      <style>{`
        .music-recognition-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        /* Header Styles */
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .title-icon {
          color: #3b82f6;
          font-size: 2.5rem;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
        }

        /* Main Content */
        .main-content {
          max-width: 900px;
          margin: 0 auto;
        }

        /* Section Card */
        .section-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .section-card:hover::before {
          opacity: 1;
        }

        .section-card.disabled {
          opacity: 0.5;
          pointer-events: none;
          filter: grayscale(0.5);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .section-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          flex-shrink: 0;
        }

        .record-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .upload-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.25rem 0;
        }

        .section-description {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
        }

        /* Record Section */
        .record-content {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .record-idle {
          text-align: center;
        }

        .record-button {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .record-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.4);
        }

        .record-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .record-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .button-ripple {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          animation: ripple 2s ease-out infinite;
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .button-icon {
          font-size: 3rem;
          color: white;
          position: relative;
          z-index: 1;
        }

        .record-hint {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Recording Active */
        .record-active {
          text-align: center;
          width: 100%;
        }

        .visualizer-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .waveform-canvas {
          display: block;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.2);
          max-width: 100%;
          height: auto;
        }

        .recording-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .recording-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .recording-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .timer-display {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
          font-variant-numeric: tabular-nums;
        }

        .progress-ring-wrapper {
          position: relative;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-bg {
          fill: none;
          stroke: #e5e7eb;
          stroke-width: 5;
        }

        .progress-ring-fill {
          fill: none;
          stroke: #3b82f6;
          stroke-width: 5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.3s linear;
        }

        .countdown-text {
          font-size: 1.25rem;
          font-weight: 700;
          fill: #3b82f6;
          transform: rotate(90deg);
          transform-origin: center;
        }

        .stop-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          pointer-events: auto;
        }

        .stop-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }

        .stop-button:active {
          transform: translateY(0);
        }

        /* Upload Section */
        .upload-content {
          min-height: 250px;
        }

        .file-selected-info {
          margin-top: 1.5rem;
          text-align: center;
        }

        .selected-file {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: #f3f4f6;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .file-icon {
          color: #8b5cf6;
          font-size: 1.5rem;
        }

        .file-name {
          font-weight: 600;
          color: #1a1a1a;
          flex: 1;
          text-align: left;
        }

        .remove-file-btn {
          background: #ef4444;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-file-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .recognize-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 1rem 3rem;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .recognize-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        /* Upload Progress */
        .upload-progress {
          margin-top: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .progress-percentage {
          font-weight: 600;
          color: #3b82f6;
        }

        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        /* Section Divider */
        .section-divider {
          text-align: center;
          margin: 2.5rem 0;
          position: relative;
        }

        .section-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        }

        .divider-text {
          position: relative;
          display: inline-block;
          padding: 0 1.5rem;
          background: white;
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Error Alert */
        .error-alert {
          margin-top: 1.5rem;
          padding: 1rem 1.5rem;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          animation: slideDown 0.3s ease;
        }

        .error-content {
          color: #991b1b;
          font-size: 0.95rem;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Processing Container */
        .processing-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .processing-info {
          color: #6b7280;
          margin-top: 1rem;
        }

        /* Results */
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .result-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .reset-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        /* Instructions */
        .instructions-card {
          margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 20px;
          border: 1px solid #bfdbfe;
        }

        .instructions-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .instructions-list {
          margin: 0;
          padding-left: 1.5rem;
          color: #1e3a8a;
        }

        .instructions-list li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        .instructions-list li:last-child {
          margin-bottom: 0;
        }

        /* Fade In Animation */
        .fade-in {
          animation: fadeIn 0.5s ease;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .music-recognition-page {
            padding: 1.5rem 1rem;
          }

          .page-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }

          .section-card {
            padding: 1.5rem;
          }

          .section-header {
            flex-direction: column;
            text-align: center;
          }

          .section-title {
            font-size: 1.25rem;
          }

          .record-button {
            width: 120px;
            height: 120px;
          }

          .button-icon {
            font-size: 2.5rem;
          }

          .waveform-canvas {
            width: 240px !important;
            height: 240px !important;
          }

          .timer-display {
            font-size: 1.75rem;
          }

          .result-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .selected-file {
            flex-direction: column;
            text-align: center;
          }

          .file-name {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.75rem;
          }

          .title-icon {
            font-size: 2rem;
          }

          .section-icon {
            width: 30px;
            height: 30px;
            font-size: 1.25rem;
          }

          .waveform-canvas {
            width: 220px !important;
            height: 220px !important;
          }

          .recording-badge {
            font-size: 0.7rem;
            padding: 0.35rem 0.7rem;
          }

          .timer-display {
            font-size: 1.5rem;
          }

          .progress-ring {
            width: 70px !important;
            height: 70px !important;
          }

          .stop-button {
            padding: 0.65rem 1.5rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MusicRecognition;