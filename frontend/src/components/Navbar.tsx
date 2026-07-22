import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaFilm, FaMusic, FaHistory, FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

/**
 * Responsive Bootstrap navigation bar
 */
const Navbar: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeNavbar = () => {
    setIsCollapsed(true);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        {/* Logo/Brand */}
        <Link className="navbar-brand fw-bold" to="/" onClick={closeNavbar}>
          <FaFilm className="me-2" />
          RecognizeIt
        </Link>

        {/* Toggler for mobile */}
        <button
          className={`navbar-toggler ${isCollapsed ? 'collapsed' : ''}`}
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation items */}
        <div className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'}`} id="navbarNav">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/home') ? 'active' : ''}`}
                    to="/home"
                    onClick={closeNavbar}
                  >
                    <FaHome className="me-1" />
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/music') ? 'active' : ''}`}
                    to="/music"
                    onClick={closeNavbar}
                  >
                    <FaMusic className="me-1" />
                    Music Recognition
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/movie') ? 'active' : ''}`}
                    to="/movie"
                    onClick={closeNavbar}
                  >
                    <FaFilm className="me-1" />
                    Movie Recognition
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                    to="/history"
                    onClick={closeNavbar}
                  >
                    <FaHistory className="me-1" />
                    History
                  </Link>
                </li>
              </ul>

              {/* User menu */}
              <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaUser className="me-1" />
                    {currentUser?.username || 'User'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile" onClick={closeNavbar}>
                        <FaUser className="me-2" />
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={() => { handleLogout(); closeNavbar(); }}>
                        <FaSignOutAlt className="me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={closeNavbar}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register" onClick={closeNavbar}>
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;