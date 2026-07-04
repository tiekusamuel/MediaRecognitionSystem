import React from 'react';
import { FaUser, FaEnvelope, FaCalendar, FaEdit, FaFilm, FaMusic, FaChartLine } from 'react-icons/fa';
import type { User } from '../services/authService';

interface ProfileCardProps {
  user: User;
  statistics?: {
    totalRecognitions: number;
    movieRecognitions: number;
    musicRecognitions: number;
    averageAccuracy: number;
  };
  onEditProfile?: () => void;
}

/**
 * User profile card component
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ user, statistics, onEditProfile }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card shadow-lg">
      <div className="card-body p-4">
        {/* Avatar and Basic Info */}
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block mb-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="rounded-circle"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                style={{ width: '120px', height: '120px', fontSize: '48px' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h3 className="mb-1">{user.username}</h3>
          <p className="text-muted mb-3">{user.email}</p>
          {onEditProfile && (
            <button className="btn btn-outline-primary" onClick={onEditProfile}>
              <FaEdit className="me-2" />
              Edit Profile
            </button>
          )}
        </div>

        <hr />

        {/* User Details */}
        <div className="mb-4">
          <h5 className="mb-3">Account Information</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <FaUser className="text-muted me-3" />
                <div>
                  <small className="text-muted d-block">Username</small>
                  <strong>{user.username}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <FaEnvelope className="text-muted me-3" />
                <div>
                  <small className="text-muted d-block">Email</small>
                  <strong>{user.email}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <FaCalendar className="text-muted me-3" />
                <div>
                  <small className="text-muted d-block">Member Since</small>
                  <strong>{formatDate(user.joinDate)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <>
            <hr />
            <div>
              <h5 className="mb-3">Recognition Statistics</h5>
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <FaChartLine className="text-primary mb-2" size={24} />
                    <h4 className="mb-0">{statistics.totalRecognitions}</h4>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <FaFilm className="text-info mb-2" size={24} />
                    <h4 className="mb-0">{statistics.movieRecognitions}</h4>
                    <small className="text-muted">Movies</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <FaMusic className="text-success mb-2" size={24} />
                    <h4 className="mb-0">{statistics.musicRecognitions}</h4>
                    <small className="text-muted">Music</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <FaChartLine className="text-warning mb-2" size={24} />
                    <h4 className="mb-0">{statistics.averageAccuracy}%</h4>
                    <small className="text-muted">Accuracy</small>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;