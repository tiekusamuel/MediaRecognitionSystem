import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

/**
 * 404 Not Found page
 */
const NotFound: React.FC = () => {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 text-center">
          <FaExclamationTriangle size={100} className="text-warning mb-4" />
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead text-muted mb-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/home" className="btn btn-primary btn-lg">
            <FaHome className="me-2" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;