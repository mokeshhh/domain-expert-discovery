import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const { name, phone, email, message } = formData;
    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setError('All fields are required.');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitted(false);
    setError(null);
    // Simulate async submission with fade-in success message
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div className="contact-hero-row" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <div>
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-intro">
            Domain Expert Finding Hub connects you with verified professionals across diverse fields. Whether you
            seek guidance, collaboration, or expert advice, our platform helps you discover and connect easily.
          </p>
        </div>
        <div className="contact-illustration">
          <img src="/illustrations/hero-illustration.svg" alt="Domain experts illustration" className="contact-hero-image" />
        </div>
      </motion.div>

      <div className="contact-cards">
        <motion.div className="info-card" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
          <h2>Contact Information</h2>
          <p>
            For any queries or feedback, write to us using this form. We’ll get back to you as soon as possible.
            Your comments help us excel in delivering expert connections.
          </p>
          <div className="info-line">
            <span role="img" aria-label="phone">📞</span>
            <span><b>+91-996476xxxx</b></span>
          </div>
          <div className="info-line">
            <span role="img" aria-label="email">✉️</span>
            <span>email@gmail.com</span>
          </div>
          <div className="info-line">
            <span role="img" aria-label="location">📍</span>
            <span>Bengaluru, Karnataka, India</span>
          </div>
        </motion.div>

        <motion.div className="form-card" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
          <h2>Get Started Now</h2>
          <p>Your comments help us achieve our objective of being a center of excellence in education. Thank you.</p>

          {error && <div className="form-error" role="alert">{error}</div>}

          {submitted ? (
            <motion.div
              className="form-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              role="alert"
            >
              Thank you for your message!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                aria-invalid={error?.includes('required') && !formData.name}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="form-input"
                aria-invalid={error?.includes('required') && !formData.phone}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                aria-invalid={error?.includes('email')}
              />
              <textarea
                name="message"
                placeholder="Message..."
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="form-textarea"
                aria-invalid={error?.includes('required') && !formData.message}
              />
              <button type="submit" className="form-button">
                Submit <span aria-hidden="true">→</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
