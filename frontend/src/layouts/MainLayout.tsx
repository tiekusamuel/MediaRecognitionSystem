import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

/**
 * Main application layout
 * Includes Navbar, Sidebar (desktop only), content area, and Footer
 */
const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar />

      <div className="flex-grow-1 d-flex">
        {/* Sidebar - Desktop only, authenticated users only */}
        {isAuthenticated && (
          <div className="d-none d-lg-block">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow-1 p-4">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;