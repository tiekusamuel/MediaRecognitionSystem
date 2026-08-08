import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

/**
 * Application footer component
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          {/* Application Info */}
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="fw-bold">RecognizeIt</h5>
            <p className="text-muted small">
              Advanced AI-powered movie and music recognition platform.
              Discover and identify your favorite content instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none small">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-muted text-decoration-none small">
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none small">
                  Contact
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-muted text-decoration-none small">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Connect With Us</h6>
            <div className="d-flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaGithub size={24} /> 
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaTwitter size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <hr className="bg-secondary my-4" />
        <div className="row">
          <div className="col-12 text-center">
            <p className="text-muted small mb-0">
              &copy; {currentYear} RecognizeIt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;