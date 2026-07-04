import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFilm, FaMusic, FaHistory, FaUser, FaCog } from 'react-icons/fa';

/**
 * Desktop sidebar navigation component
 */
const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/home', icon: FaHome, label: 'Dashboard' },
    { path: '/movie', icon: FaFilm, label: 'Movie Recognition' },
    { path: '/music', icon: FaMusic, label: 'Music Recognition' },
    { path: '/history', icon: FaHistory, label: 'History' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ];

  return (
    <div className="bg-light border-end vh-100 position-sticky top-0" style={{ width: '250px' }}>
      <div className="p-3">
        <h5 className="text-primary fw-bold mb-4">Navigation</h5>
        <nav className="nav flex-column">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-3 px-3 mb-2 rounded ${
                  isActive ? 'bg-primary text-white' : 'text-dark'
                }`
              }
            >
              <item.icon className="me-3" size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Settings at bottom */}
      <div className="position-absolute bottom-0 w-100 p-3 border-top">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link d-flex align-items-center py-3 px-3 rounded ${
              isActive ? 'bg-primary text-white' : 'text-dark'
            }`
          }
        >
          <FaCog className="me-3" size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;