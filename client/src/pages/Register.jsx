import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch {
      setError('Server error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create an account</h1>
          <p className="register-subtitle">Join Domain Expert Discovery</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className={`input-label ${focusedInput==='name'||formData.name?'focused':''}`}>Full Name</label>
            <input
              type="text"
              name="name"
              className="register-input"
              value={formData.name}
              onChange={handleChange}
              onFocus={()=>setFocusedInput('name')}
              onBlur={()=>setFocusedInput(null)}
              required
            />
          </div>

          <div className="input-group">
            <label className={`input-label ${focusedInput==='email'||formData.email?'focused':''}`}>Email address</label>
            <input
              type="email"
              name="email"
              className="register-input"
              value={formData.email}
              onChange={handleChange}
              onFocus={()=>setFocusedInput('email')}
              onBlur={()=>setFocusedInput(null)}
              required
            />
          </div>

          <div className="input-group">
            <label className={`input-label ${focusedInput==='password'||formData.password?'focused':''}`}>Password</label>
            <input
              type="password"
              name="password"
              className="register-input"
              value={formData.password}
              onChange={handleChange}
              onFocus={()=>setFocusedInput('password')}
              onBlur={()=>setFocusedInput(null)}
              required
            />
          </div>

          <div className="input-group">
            <label className={`input-label ${focusedInput==='confirmPassword'||formData.confirmPassword?'focused':''}`}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="register-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={()=>setFocusedInput('confirmPassword')}
              onBlur={()=>setFocusedInput(null)}
              required
            />
          </div>

          <button
            type="submit"
            className={`register-button ${loading?'loading':''}`}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Register'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
