/**
 * AuthModal Component
 * Professional authentication modal with registration and login
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../Styles/AuthModal.css';

export default function AuthModal({ show, onClose, initialMode = 'signin' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, login, error: authError, clearError } = useAuth();

  // Close modal handler
  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      company: '',
      confirmPassword: ''
    });
    setErrors({});
    clearError();
    onClose();
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup') {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain a lowercase letter';
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must contain a number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        newErrors.password = 'Password must contain a special character';
      }
    }

    // Signup-specific validation
    if (mode === 'signup') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let result;
      
      if (mode === 'signup') {
        result = await register(
          formData.email,
          formData.password,
          formData.fullName,
          formData.company || null
        );
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        console.log('✅ Registration successful, redirecting to chat...');
        handleClose();
        navigate('/chat');
        // Navigate will be handled by AuthContext
      } else {
        result = await login(formData.email, formData.password);
        if (result.success) {
          console.log('✅ Login successful, redirecting to chat...');
          handleClose();
          navigate('/chat'); // ✅ ADD THIS - Navigate to chat after login
        }
      }
      if(!result.success){
        setErrors({ form: result.error || 'Authentication failed' });
      }
    } catch (err) {
      setErrors({ form: err.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch between signin and signup
  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    clearError();
  };

  if (!show) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-modal-close" onClick={handleClose} aria-label="Close">
          ×
        </button>

        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            {mode === 'signin' ? '👋' : '🚀'}
          </div>
          <h2 className="auth-modal-title">
            {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="auth-modal-subtitle">
            {mode === 'signin' 
              ? 'Sign in to your account' 
              : 'Create your free account'}
          </p>
        </div>

        {/* Error Message */}
        {(errors.form || authError) && (
          <div className="auth-error-banner">
            <span className="auth-error-icon">⚠️</span>
            {errors.form || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name - Signup Only */}
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="fullName" className="auth-label">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`auth-input ${errors.fullName ? 'auth-input-error' : ''}`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <span className="auth-field-error">{errors.fullName}</span>
              )}
            </div>
          )}

          {/* Email */}
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
              placeholder="you@company.com"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && (
              <span className="auth-field-error">{errors.email}</span>
            )}
          </div>

          {/* Company - Signup Only */}
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="company" className="auth-label">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="auth-input"
                placeholder="Acme Inc."
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Password */}
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">
              Password *
            </label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="auth-field-error">{errors.password}</span>
            )}
            {mode === 'signup' && (
              <div className="auth-password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={formData.password.length >= 8 ? 'valid' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/\d/.test(formData.password) ? 'valid' : ''}>
                    One number
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>
                    One special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password - Signup Only */}
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="auth-field-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Forgot Password - Signin Only */}
          {mode === 'signin' && (
            <div className="auth-forgot-password">
              <a href="#forgot" className="auth-link">
                Forgot password?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="auth-button-spinner">
                <span className="spinner"></span>
                {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {/* Toggle Mode */}
          <div className="auth-toggle-mode">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={toggleMode} className="auth-link-button">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={toggleMode} className="auth-link-button">
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>

        {/* Terms - Signup Only */}
        {mode === 'signup' && (
          <div className="auth-terms">
            <p>
              By signing up, you agree to our{' '}
              <a href="#terms" className="auth-link">Terms of Service</a>
              {' '}and{' '}
              <a href="#privacy" className="auth-link">Privacy Policy</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}