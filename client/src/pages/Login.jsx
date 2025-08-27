import React, { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // "login" or "reset"
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleEmailLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await res.json();
      if (res.ok) {
       sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('name', data.name);
        updateUser({ name: data.name, email: data.email });


        // Set flag to show welcome message on next page load
        sessionStorage.setItem("justLoggedIn", "yes");

        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Server error during login. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = async e => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setError('Password changed. Please log in.');
        setMode('login');
        setFormData({ email: formData.email, password: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch {
      setError('Server error during reset. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLoginSuccess = async resp => {
    const token = resp.credential;
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
         sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('name', data.name);
        updateUser({ name: data.name, email: data.email });

        // Set flag to show welcome message on next page load
        sessionStorage.setItem("justLoggedIn", "yes");

        navigate('/');
      } else {
        setError(data.message || 'Google login failed. Please try again.');
      }
    } catch {
      setError('Server error during Google login.');
    }
  };

  const handleGoogleLoginFailure = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            {mode === 'login' ? 'Welcome back' : 'Reset your password'}
          </h1>
          {mode === 'login' ? (
            <p className="login-subtitle">
              Sign in to your account to continue
            </p>
          ) : (
            <p className="login-subtitle">
              Enter email and new password below
            </p>
          )}
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form
          className="login-form"
          onSubmit={mode === 'login' ? handleEmailLogin : handleReset}
        >
          <div className="input-group">
            <label
              className={`input-label ${
                (focusedInput === 'email' || formData.email) && 'focused'
              }`}
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              className="login-input"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              required
            />
          </div>

          <div className="input-group">
            <label
              className={`input-label ${
                (focusedInput === 'password' || formData.password) && 'focused'
              }`}
            >
              {mode === 'login' ? 'Password' : 'New password'}
            </label>
            <input
              type="password"
              name="password"
              className="login-input"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              required
            />
          </div>

          {mode === 'reset' && (
            <div className="input-group">
              <label
                className={`input-label ${
                  (focusedInput === 'confirmPassword' ||
                    formData.confirmPassword) &&
                    'focused'
                }`}
              >
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="login-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                required
              />
            </div>
          )}

          <div className="form-options">
            {mode === 'login' && (
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
            )}
            <span
              className="forgot-password"
              onClick={() => {
                setMode(mode === 'login' ? 'reset' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Forgot password?' : 'Back to login'}
            </span>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? mode === 'login'
                ? 'Signing in…'
                : 'Resetting…'
              : mode === 'login'
              ? 'Sign in'
              : 'Reset password'}
          </button>
        </form>

        {mode === 'login' && (
          <>
            <div className="divider">
              <span>or continue with</span>
            </div>
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
            <div className="signup-link">
              Don't have an account? <a href="/register">Sign up</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
