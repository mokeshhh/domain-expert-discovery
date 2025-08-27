import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem('email');
    const token = sessionStorage.getItem('authToken');
    if (!email || !token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch(`/api/auth/me?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  const updateUser = (userData) => setUser(userData);

  const clearUser = () => {
    setUser(null);
    sessionStorage.clear();  // Clears user session data on logout
  };

  if (loading) {
    return null; // or loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, updateUser, clearUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
