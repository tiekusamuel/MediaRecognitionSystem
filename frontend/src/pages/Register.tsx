import React, { useState} from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Register page component
 */
const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    setError(null);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Invalid password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({ username, email, password, confirmPassword });
      navigate('/home');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating your account..." fullScreen />;
  }

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100 py-5">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Create Account</h2>
                <p className="text-muted">Join us to start recognizing media</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
                {/* Username */}
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    <FaUser className="me-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    minLength={3}
                  />
                  <div className="invalid-feedback">
                    Username must be at least 3 characters long
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="me-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter a valid email address
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <FaLock className="me-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={8}
                  />
                  <div className="form-text">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    <FaLock className="me-2" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <div className="invalid-feedback">
                    Passwords must match
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                  <FaUserPlus className="me-2" />
                  Create Account
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;