// src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Experts from './pages/Experts';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ExpertDetail from './pages/ExpertDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import SplashScreen from './components/SplashScreen';  // New splash

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-center">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/experts" element={<Experts />} />
      <Route path="/experts/:id" element={<ExpertDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth-only routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Login/Register only for guests */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="508054214791-7q4lfcrbjrv80lf01vdcrlcsgelpt78u.apps.googleusercontent.com">
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <Router>
            <ScrollToTop />
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <div className="relative min-h-screen flex flex-col overflow-hidden">
              <div className="absolute inset-0 z-0 w-full h-full pointer-events-none bg-white" />
              <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </div>
          </Router>
        )}
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
