import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  fullScreen?: boolean;
}

/**
 * Reusable loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'primary',
  fullScreen = false 
}) => {
  const spinnerSizeClass = size === 'sm' ? '' : size === 'lg' ? 'spinner-border-lg' : '';
  
  const spinnerElement = (
    <div className="text-center">
      <div className={`spinner-border text-${variant} ${spinnerSizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <div className="mt-3 text-muted">{message}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;