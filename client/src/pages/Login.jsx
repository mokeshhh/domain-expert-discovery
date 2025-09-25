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

  // States for signup verification steps
  const [sentVerification, setSentVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccessMessage('');
  };

  const handleVerificationCodeChange = e => {
    setVerificationCode(e.target.value);
    setError('');
    setSuccessMessage('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setSentVerification(false);
    setCodeVerified(false);
    setVerificationCode('');
  };

  // Login handler (unchanged)
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

  // Step 1: Send verification code to email
  const handleSendVerificationCode = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) {
        setSentVerification(true);
        setError('');
        setSuccessMessage('Verification code sent. Please check your email.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send verification code.');
        setSuccessMessage('');
      }
    } catch {
      setError('Server error during sending verification code.');
      setSuccessMessage('');
    }
    setLoading(false);
  };

  // Step 2: Verify the code
  const handleVerifyCode = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: verificationCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCodeVerified(true);
        setError('');
        setSuccessMessage('Code verified! Please set your password.');
      } else {
        setError(data.message || 'Invalid verification code.');
        setSuccessMessage('');
      }
    } catch {
      setError('Server error during code verification.');
      setSuccessMessage('');
    }
    setLoading(false);
  };

  // Step 3: Complete signup with password
  const handleCompleteSignup = async e => {
    e.preventDefault();
    setLoading(true);
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
        setSuccessMessage('Account created successfully! Please sign in.');
        setError('');
        setMode('login');
        setSentVerification(false);
        setCodeVerified(false);
        setVerificationCode('');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Signup failed.');
        setSuccessMessage('');
      }
    } catch {
      setError('Server error during signup.');
      setSuccessMessage('');
    }
    setLoading(false);
  };

  // Password reset handler (unchanged)
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

  // Google login handlers (unchanged)
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
    <div className="login-page">
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

          {/* Signup Form with stepwise email verification */}
          <div className="form-container sign-up-container">
            {!sentVerification ? (
              // Step 1: Enter Name, Email, and Send Verification Code button
              <form onSubmit={handleSendVerificationCode}>
                <h1 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '25px' }}>Create Account</h1>
                <span style={{ marginBottom: '10px' }}>Enter your name and email</span>

                {successMessage && <div className="success-message">{successMessage}</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="input-group">
                  <input
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

                <button
                  type="submit"
                  className={`auth-button ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>

                <button type="button" className="back-button" onClick={() => handleModeChange('login')} disabled={loading}>
                  Back to Login
                </button>
              </form>
            ) : !codeVerified ? (
              // Step 2: Verification code input
              <form onSubmit={handleVerifyCode}>
                <h1 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '25px' }}>Verify Email</h1>
                <span style={{ marginBottom: '15px' }}>Enter the verification code sent to your email</span>

                {successMessage && <div className="success-message">{successMessage}</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="input-group">
                  <input
                    type="text"
                    name="verificationCode"
                    placeholder="Verification Code"
                    className="login-input"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className={`auth-button ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={() => {
                    setSentVerification(false);
                    setVerificationCode('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  disabled={loading}
                >
                  Back
                </button>
              </form>
            ) : (
              // Step 3: Set Password and Confirm Password then Signup
              <form onSubmit={handleCompleteSignup}>
                <h1 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '25px' }}>Set Password</h1>
                <span style={{ marginBottom: '10px' }}>Create your password</span>

                {successMessage && <div className="success-message">{successMessage}</div>}
                {error && <div className="error-message">{error}</div>}

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

                <div className="input-group">
                  <input
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
                  {loading ? 'Creating...' : 'Sign Up'}
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={() => {
                    setCodeVerified(false);
                    setVerificationCode('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  disabled={loading}
                >
                  Back
                </button>
              </form>
            )}
          </div>

          {/* Overlay Container */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 style={{ fontSize: '30px' }}>Hello, Friend!</h1>
                <p>Enter your personal details and start your journey with us</p>
                <button className="ghost" id="signIn" onClick={() => handleModeChange('login')}>
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 style={{ fontSize: '30px' }}>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="ghost" id="signUp" onClick={() => handleModeChange('signup')}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
