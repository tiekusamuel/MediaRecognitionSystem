import React, { useEffect, useState } from 'react';
import { FaUser, FaKey, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';

/**
 * User profile page
 */
const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalRecognitions: 0,
    movieRecognitions: 0,
    musicRecognitions: 0,
    averageAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await authService.getProfile();
      setStatistics(profileData.statistics);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page or show modal
    alert('Edit profile functionality will be implemented in a future update!');
  };

  const handleChangePassword = () => {
    // Navigate to change password page or show modal
    alert('Change password functionality will be implemented in a future update!');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." fullScreen />;
  }

  if (!currentUser) {
    return (
      <div className="text-center py-5">
        <h4>User not found</h4>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="display-5 fw-bold mb-2">
          <FaUser className="me-3 text-warning" />
          My Profile
        </h1>
        <p className="lead text-muted">
          Manage your account settings and view your statistics
        </p>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-lg-8 mb-4">
          <ProfileCard
            user={currentUser}
            statistics={statistics}
            onEditProfile={handleEditProfile}
          />
        </div>

        {/* Actions */}
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Account Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary" onClick={handleEditProfile}>
                  <FaEdit className="me-2" />
                  Edit Profile
                </button>
                <button className="btn btn-outline-secondary" onClick={handleChangePassword}>
                  <FaKey className="me-2" />
                  Change Password
                </button>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Account Status</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Account Type</small>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Subscription Plan</small>
                <strong>Free</strong>
              </div>
              <div>
                <small className="text-muted d-block">Storage Used</small>
                <div className="progress mt-2" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: '45%' }}
                    aria-valuenow={45}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <small className="text-muted">45 MB of 100 MB</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline (Placeholder) */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Recent Activity</h5>
              <div className="text-center text-muted py-5">
                <p>Activity timeline will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;