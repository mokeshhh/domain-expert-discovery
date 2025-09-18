import React, { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' or 'signup' or 'reset'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccessMessage('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  // Login handler remains unchanged
  const handleEmailLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('name', data.name);
        updateUser({ name: data.name, email: data.email });
        sessionStorage.setItem('justLoggedIn', 'yes');
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Server error during login. Please try again.');
    }
    setLoading(false);
  };

  // Updated Signup handler: same as Register page logic integrated here
  const handleSignup = async e => {
    e.preventDefault();
    setLoading(true);

    // Password Confirmation validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();

      if (res.ok) {
        // On successful signup, switch mode to login with message
        setSuccessMessage('Account created successfully! Please sign in.');
        setError('');
        setMode('login');
        setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Signup failed. Please try again.');
        setSuccessMessage('');
      }
    } catch {
      setError('Server error during signup. Please try again.');
      setSuccessMessage('');
    }

    setLoading(false);
  };

  // Password reset remains unchanged
  const handleReset = async e => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        setError('Password changed. Please log in.');
        setMode('login');
        setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch {
      setError('Server error during reset. Please try again.');
    }
    setLoading(false);
  };

  // Google login handlers remain unchanged
  const handleGoogleLoginSuccess = async resp => {
    const token = resp.credential;
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('name', data.name);
        updateUser({ name: data.name, email: data.email });
        sessionStorage.setItem('justLoggedIn', 'yes');
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
      {/* Background elements */}
      <div className="login-background">
        <div className="bg-circle circle-1" />
        <div className="bg-circle circle-2" />
        <div className="bg-circle circle-3" />
      </div>

      {/* Password Reset Overlay */}
      {mode === 'reset' && (
        <div className="reset-overlay">
          <div className="reset-card">
            <div className="login-header">
              <h1 className="login-title">Reset Password</h1>
              <p className="login-subtitle">Enter email and new password</p>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <form className="login-form-inner" onSubmit={handleReset}>
              <div className="input-group">
                <label className={`input-label ${(focusedInput === 'email' || formData.email) && 'focused'}`}>Email address</label>
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
                <label className={`input-label ${(focusedInput === 'password' || formData.password) && 'focused'}`}>New Password</label>
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

              <div className="input-group">
                <label className={`input-label ${(focusedInput === 'confirmPassword' || formData.confirmPassword) && 'focused'}`}>Confirm Password</label>
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

              <button
                type="submit"
                className={`auth-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>

              <button type="button" className="back-button" onClick={() => handleModeChange('login')}>
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Auth Container */}
      <div className={`auth-container ${mode === 'signup' ? 'right-panel-active' : ''}`}>
        {/* Login Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleEmailLogin}>
            <h1 style={{ marginTop: '20px', marginBottom: '-10px', fontSize: '25px' }}>Sign in</h1>
            <div className="social-container">
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
            </div>
            <span style={{ marginTop: '-15px', marginBottom: '10px' }}>or use your account</span>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && mode === 'login' && <div className="error-message">{error}</div>}

            <div className="iinput-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="login-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="login-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a
                href="#"
                className="forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  handleModeChange('reset');
                }}
              >
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1 style={{ marginTop: '20px', marginBottom: '-10px', fontSize: '25px' }}>Create Account</h1>
            <div className="social-container">
              <div className="social-icons">
                <i className="fab fa-facebook-f"></i>
                <i className="fab fa-google-plus-g"></i>
                <i className="fab fa-linkedin-in"></i>
              </div>
            </div>
            <span style={{ marginTop: '-10px', marginBottom: '-5px' }}>or use your email for registration</span>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && mode === 'signup' && <div className="error-message">{error}</div>}

            <div className="input-group">
              <input style={{ marginTop: '10px', marginBottom: '-145px'}}
                type="text"
                name="name"
                placeholder="Name"
                className="login-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input style={{ marginTop: '-5px', marginBottom: '-5px'}}
                type="email"
                name="email"
                placeholder="Email"
                className="login-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input style={{ marginTop: '-15px', marginBottom: '-5px'}}
                type="password"
                name="password"
                placeholder="Password"
                className="login-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input style={{ marginTop: '-10px', marginBottom: '-10px'}}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="login-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'SIGN UP'}
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 style={{ fontSize: '30px' }}>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn" onClick={() => handleModeChange('login')}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 style={{ fontSize: '30px' }}>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" id="signUp" onClick={() => handleModeChange('signup')}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
