import React, { useState, useEffect } from 'react';
import './Analytics.css';

const StatCard = ({ value, label }) => (
  <div className="analytics-stat-card">
    <span className="analytics-stat-value">{value}</span>
    <span className="analytics-stat-label">{label}</span>
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState({
    totalExperts: 0,
    domainsCovered: 0,
    averageRating: 4.5
  });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  

  useEffect(() => {
    fetch(`${API_URL}/experts`)

      .then(res => res.json())
      .then(data => {
        const totalExperts = data.length;
        const domainsSet = new Set();
        data.forEach(expert => {
          if (expert.domain) domainsSet.add(expert.domain.toLowerCase());
        });
        setStats({
          totalExperts,
          domainsCovered: domainsSet.size,
          averageRating: 4.5
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Platform Analytics</h1>
      <div className="analytics-stats-row">
        <StatCard value={stats.totalExperts} label="Total Experts" />
        <StatCard value={stats.domainsCovered} label="Domains Covered" />
        <StatCard value={stats.averageRating} label="Average Rating" />
      </div>
      <div className="analytics-placeholder">
        <div className="analytics-spinner"></div>
        <span>Charts and visualizations coming soon…</span>
      </div>
    </div>
  );
};

export default Analytics;
