import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [removingId, setRemovingId] = useState(null);

  const userEmail = localStorage.getItem('email');
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    async function fetchSavedExperts() {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/get-saved-experts?email=${userEmail}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.savedExperts)) {
          const expertDetails = await Promise.all(
            data.savedExperts.map(async (id) => {
              const resExpert = await fetch(`${API_BASE_URL}/api/experts/${id}`);
              return resExpert.ok ? await resExpert.json() : null;
            })
          );
          setExperts(expertDetails.filter(Boolean));
        } else {
          setExperts([]);
        }
      } catch {
        setExperts([]);
      }
      setLoading(false);
    }
    fetchSavedExperts();
  }, [userEmail, API_BASE_URL]);

  const handleRemoveExpert = async (expertId) => {
    setRemovingId(expertId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/remove-saved-expert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, expertId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimeout(() => {
          setExperts(prev => prev.filter(e => e._id !== expertId));
          setRemovingId(null);
        }, 300);
      } else {
        setRemovingId(null);
        alert(data.message || 'Failed to remove expert.');
      }
    } catch {
      setRemovingId(null);
      alert('Could not remove expert. Please try again later.');
    }
  };

  const renderSkeletonCards = () => (
    <div className={`experts-grid ${viewMode}`}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="expert-card skeleton-card">
          <div className="card-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-delete-btn"></div>
          </div>
          <div className="card-body">
            <div className="skeleton-line skeleton-name"></div>
            <div className="skeleton-line skeleton-role"></div>
            <div className="skeleton-line skeleton-location"></div>
          </div>
          <div className="card-footer">
            <div className="skeleton-line skeleton-link"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">
        <svg className="heart-icon" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3>No saved experts yet</h3>
      <p>Start building your network by saving experts you'd like to connect with. Find talented professionals and keep track of potential collaborations.</p>
      <button className="cta-button" onClick={() => navigate('/experts')}>
        <svg className="user-plus-icon" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Discover Experts
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header loading">
          <div className="loading-spinner"></div>
          <h1>Loading your experts...</h1>
        </div>
        {renderSkeletonCards()}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Saved Experts</h1>
            <p className="subtitle">
              {experts.length > 0
                ? `${experts.length} expert${experts.length !== 1 ? 's' : ''} in your network`
                : 'Build your professional network'}
            </p>
          </div>
          {experts.length > 0 && (
            <div className="header-controls">
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg className="grid-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="list-icon" viewBox="0 0 24 24" fill="none">
                    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {experts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className={`experts-grid ${viewMode}`}>
            {experts.map((expert, index) => (
              <div
                key={expert._id}
                className={`expert-card ${removingId === expert._id ? 'removing' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="card-header">
                  <div className="expert-avatar">
                    <img src={expert.avatar} alt={expert.name} className="w-20 h-20 rounded-full object-cover" />
                  
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExpert(expert._id);
                    }}
                    disabled={removingId === expert._id}
                    className="delete-btn"
                    aria-label={`Remove expert ${expert.name}`}
                  >
                    {removingId === expert._id ? (
                      <div className="loading-spinner small"></div>
                    ) : (
                      <svg className="trash-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="card-body">
                  <h3 className="expert-name">{expert.name}</h3>
                  <div className="expert-role">
                    <svg className="role-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{expert.domain}</span>
                  </div>
                  <div className="expert-location">
                    <svg className="location-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{expert.location}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="view-profile-btn"
                    onClick={() => navigate(`/experts/${expert._id}`)}
                  >
                    <span>Click to view profile</span>
                    <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
