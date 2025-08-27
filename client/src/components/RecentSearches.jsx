import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function RecentSearches() {
  const { user } = useContext(AuthContext);
  const [recentSearches, setRecentSearches] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user?.email) return;
    fetch(`${API_URL}/auth/recent-searches?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.recentSearches) setRecentSearches(data.recentSearches);
      })
      .catch(err => console.error('Failed to fetch recent searches', err));
  }, [user]);

  return (
    <div style={{ margin: '24px 0' }}>
      <h3>Recent Searches</h3>
      {recentSearches.length === 0 ? (
        <p>No recent searches.</p>
      ) : (
        <ul>
          {recentSearches.map((query, idx) => (
            <li key={idx}>{query}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentSearches;
