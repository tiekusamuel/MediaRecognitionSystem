import React, { useState, useRef} from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { FaCloudUploadAlt, FaFilm, FaMusic, FaTimes, FaCheck } from 'react-icons/fa';

interface UploadBoxProps {
  accept: string;
  onFileSelect: (file: File) => void;
  maxSize?: number; // in MB
  type?: 'video' | 'audio';
  disabled?: boolean;
}

/**
 * Reusable drag-and-drop upload component
 */
const UploadBox: React.FC<UploadBoxProps> = ({
  accept,
  onFileSelect,
  maxSize = 100,
  type = 'video',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    const isValidType = acceptedTypes.some(acceptedType => {
      if (acceptedType.endsWith('/*')) {
        const baseType = acceptedType.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === acceptedType;
    });

    if (!isValidType) {
      setError(`Invalid file type. Accepted types: ${accept}`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);

      // Create preview URL for video/audio
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  

  return (
    <div className="upload-box">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="d-none"
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          className={`border border-3 rounded p-5 text-center ${
            isDragging ? 'border-primary bg-light' : 'border-dashed border-secondary'
          } ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <div className="mb-3">
            {type === 'video' ? (
              <FaFilm size={64} className="text-primary" />
            ) : (
              <FaMusic size={64} className="text-primary" />
            )}
          </div>
          <FaCloudUploadAlt size={48} className="text-muted mb-3" />
          <h5 className="mb-2">Drag and drop your {type} file here</h5>
          <p className="text-muted mb-3">or</p>
          <button
            className="btn btn-primary"
            onClick={handleBrowseClick}
            disabled={disabled}
            type="button"
          >
            Browse Files
          </button>
          <div className="mt-3">
            <small className="text-muted">
              Accepted formats: {accept}
              <br />
              Max file size: {maxSize}MB
            </small>
          </div>
        </div>
      ) : (
        <div className="border border-success rounded p-4">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <FaCheck className="text-success me-2" size={24} />
              <div>
                <h6 className="mb-0">{selectedFile.name}</h6>
                <small className="text-muted">{formatFileSize(selectedFile.size)}</small>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <FaTimes />
            </button>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-3">
              {type === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-100 rounded"
                  style={{ maxHeight: '300px' }}
                />
              ) : (
                <audio src={previewUrl} controls className="w-100" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-danger mt-3 mb-0" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadBox;