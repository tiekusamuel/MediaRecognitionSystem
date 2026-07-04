import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaMusic, FaHistory, FaUser, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import historyService, { type HistoryItem } from '../services/historyService';
import HistoryCard from '../components/HistoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Home dashboard page
 */
const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [statistics, setStatistics] = useState({
    totalRecognitions: 0,
    movieRecognitions: 0,
    musicRecognitions: 0,
    averageAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load recent history
      const historyResponse = await historyService.getHistory({ page: 1, pageSize: 5 });
      setRecentHistory(historyResponse.items);

      // Calculate statistics
      const stats = {
        totalRecognitions: historyResponse.totalCount,
        movieRecognitions: historyResponse.items.filter(item => item.type === 'movie').length,
        musicRecognitions: historyResponse.items.filter(item => item.type === 'music').length,
        averageAccuracy: historyResponse.items.length > 0
          ? Math.round(historyResponse.items.reduce((sum, item) => sum + item.confidence, 0) / historyResponse.items.length)
          : 0,
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await historyService.deleteHistoryItem(id);
        loadDashboardData();
      } catch (error) {
        console.error('Failed to delete history item:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." fullScreen />;
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-5">
        <h1 className="display-4 fw-bold mb-2">
          Welcome back, {currentUser?.username}!
        </h1>
        <p className="lead text-muted">
          Here's what's happening with your recognition activities today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Total Recognitions</p>
                  <h2 className="fw-bold mb-0">{statistics.totalRecognitions}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaChartLine className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Movie Recognitions</p>
                  <h2 className="fw-bold mb-0">{statistics.movieRecognitions}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FaFilm className="text-info" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Music Recognitions</p>
                  <h2 className="fw-bold mb-0">{statistics.musicRecognitions}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaMusic className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Average Accuracy</p>
                  <h2 className="fw-bold mb-0">{statistics.averageAccuracy}%</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FaChartLine className="text-warning" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h3 className="fw-bold mb-4">Quick Actions</h3>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <Link to="/movie" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 d-inline-flex p-4 rounded-circle mb-3">
                    <FaFilm className="text-primary" size={32} />
                  </div>
                  <h5 className="fw-bold mb-2">Recognize Movie</h5>
                  <p className="text-muted small mb-3">
                    Upload a video clip to identify the movie
                  </p>
                  <span className="btn btn-outline-primary btn-sm">
                    Get Started <FaArrowRight className="ms-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/music" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 d-inline-flex p-4 rounded-circle mb-3">
                    <FaMusic className="text-success" size={32} />
                  </div>
                  <h5 className="fw-bold mb-2">Recognize Music</h5>
                  <p className="text-muted small mb-3">
                    Upload or record audio to identify songs
                  </p>
                  <span className="btn btn-outline-success btn-sm">
                    Get Started <FaArrowRight className="ms-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/history" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div className="bg-info bg-opacity-10 d-inline-flex p-4 rounded-circle mb-3">
                    <FaHistory className="text-info" size={32} />
                  </div>
                  <h5 className="fw-bold mb-2">View History</h5>
                  <p className="text-muted small mb-3">
                    Browse your recognition history
                  </p>
                  <span className="btn btn-outline-info btn-sm">
                    View All <FaArrowRight className="ms-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/profile" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 d-inline-flex p-4 rounded-circle mb-3">
                    <FaUser className="text-warning" size={32} />
                  </div>
                  <h5 className="fw-bold mb-2">View Profile</h5>
                  <p className="text-muted small mb-3">
                    Manage your account settings
                  </p>
                  <span className="btn btn-outline-warning btn-sm">
                    Go to Profile <FaArrowRight className="ms-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Recognition History */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">Recent Recognitions</h3>
          <Link to="/history" className="btn btn-outline-primary">
            View All History
          </Link>
        </div>

        {recentHistory.length > 0 ? (
          <div>
            {recentHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={handleDeleteHistory}
                onView={(id) => console.log('View item:', id)}
              />
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <FaHistory className="text-muted mb-3" size={48} />
              <h5 className="text-muted">No recognitions yet</h5>
              <p className="text-muted mb-4">
                Start by recognizing your first movie or song!
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/movie" className="btn btn-primary">
                  Recognize Movie
                </Link>
                <Link to="/music" className="btn btn-success">
                  Recognize Music
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;