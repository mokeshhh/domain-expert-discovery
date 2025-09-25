// Navbar.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import './Navbar.css';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn, logout } from '../utils/auth';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';


function Navbar({ theme, toggleTheme }) {
  const { user, clearUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef();
  const allowedAnalyticsEmails = ["leomokesh@gmail.com", "abc@gmail.com"];


  useEffect(() => {
    setUserLoggedIn(isLoggedIn());
  }, [location]);

  // Welcome message on login
  useEffect(() => {
    if (sessionStorage.getItem("justLoggedIn") === "yes" && user) {
      setShowWelcome(true);
      sessionStorage.removeItem("justLoggedIn");
      setTimeout(() => setShowWelcome(false), 2200);
    }
  }, [user, location]);

  // Navbar background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-active' : 'nav-link';

  const handleLogout = () => {
    clearUser();
    logout();
    sessionStorage.removeItem("justLoggedIn");
    navigate('/login');
    setShowProfileMenu(false);
  };

  const goToProfile = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(v => !v);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-left">
          <NavLink to="/" className="brand">
  <img src="/logo.png" alt="Logo" className="nav-logo" />
  <motion.span
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="brand-text"
  >
    Domain Expert <span className="highlighted-text">Discovery</span>
  </motion.span>
</NavLink>

        </div>

        <AnimatePresence>
          {user && showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="nav-welcome"
            >
              👋 Welcome back, {user.name || "User"}!
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`nav-center ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className={getNavLinkClass} end onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/experts" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Experts
          </NavLink>
          <NavLink to="/about" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Contact
          </NavLink>
          
          {userLoggedIn && (
            <>
              <NavLink to="/dashboard" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Wishlist
              </NavLink>
                  {allowedAnalyticsEmails.includes(user?.email) && (
      <NavLink to="/analytics" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
        Analytics
      </NavLink>
    )}

            </>
          )}

          {isMobileMenuOpen && !userLoggedIn && (
          <>
           <NavLink to="/login" className={getNavLinkClass} end onClick={() => setMobileMenuOpen(false)}>Login</NavLink>
           <NavLink to="/register" className={getNavLinkClass} end onClick={() => setMobileMenuOpen(false)}>Register</NavLink>
          </>     
          )}
        </div>

        <div className="nav-right">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          </button>

          {userLoggedIn ? (
            <div className="profile-wrapper" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                title="Profile"
                className="profile-btn"
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
                aria-label="Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" className="profile-icon">
                  <circle cx="12" cy="9" r="3" />
                  <path d="M12 15c-3.3 0-6 2-6 3v1h12v-1c0-1-2.7-3-6-3z" />
                </svg>
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="profile-menu"
                  >
                    <button className="profile-menu-item" onClick={goToProfile}>
                      My Profile
                    </button>
                    <div className="profile-menu-item theme-toggle-wrapper">
                      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </div>
                    <button className="profile-menu-item logout" onClick={handleLogout}>
                      Logout
                    </button>
                    <div className="profile-menu-caret" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={getNavLinkClass}>Login</NavLink>
              
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
