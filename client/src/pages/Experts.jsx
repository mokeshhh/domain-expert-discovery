// Experts.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Experts.css";

const FILTER_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
  </svg>
);
const SEARCH_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);
const CLEAR_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const LINKEDIN_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const LOCATION_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
const BRIEFCASE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function Experts() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("query") || "";

  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [domains, setDomains] = useState([]);
  const [showDomainPanel, setShowDomainPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const inputRef = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDomainPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/experts")
      .then((res) => res.json())
      .then((data) => {
        setExperts(data);
        setLoading(false);
        const unique = [...new Set(data.map(e => e.domain).filter(Boolean))]
          .map(capitalizeWords).sort();
        setDomains(unique);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.email) return setRecentSearches([]);
    fetch(`/api/auth/recent-searches?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setRecentSearches(data.recentSearches.slice(0,3)))
      .catch(() => setRecentSearches([]));
  }, [user]);

  useEffect(() => {
    let f = [...experts];
    if (selectedDomains.length) {
      f = f.filter(e => selectedDomains.includes(capitalizeWords(e.domain)));
    }
    if (searchTerm.trim()) {
      const l = searchTerm.toLowerCase();
      f = f.filter(e =>
        e.name.toLowerCase().includes(l) ||
        e.domain.toLowerCase().includes(l) ||
        e.location.toLowerCase().includes(l)
      );
    }
    setFilteredExperts(f);
  }, [searchTerm, selectedDomains, experts]);

  const saveRecent = q => {
    if (!user?.email||!q.trim()) return;
    fetch("/api/auth/save-recent-search", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email:user.email,searchQuery:q.trim()})
    })
    .then(res=>res.json())
    .then(d=>setRecentSearches(d.recentSearches.slice(0,3)))
    .catch(()=>{});
  };

  const onSubmit = e => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    saveRecent(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const onRecent = s => {
    setSearchTerm(s);
    saveRecent(s);
  };

  const toggleDomain = d => {
    setSelectedDomains(cd =>
      cd.includes(d) ? cd.filter(x=>x!==d) : [...cd,d]
    );
  };

if (loading) return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '120px' // Or adjust as needed for vertical position
  }}>
    <div className="loading-spinner" aria-label="Loading experts"></div>
    <div style={{
      marginTop: '16px', // Closer text to spinner
      fontSize: '1.15rem',
      color: 'var(--text-color)',
      letterSpacing: '0.01em'
    }}>
      Loading experts...
    </div>
  </div>
);



  return (
    <div className="improved-experts-page">
      {/* Classy Animated Title */}
      <div className="page-header">
        <h1 className="classy-title">
          <span>Experts</span> <span className="highlight">List</span>
        </h1>
      </div>

      {/* Controls */}
      <div className="search-controls">
        <div className="controls-container">
          <form className="search-form" onSubmit={onSubmit}>
            <div className="search-input-group">
              <div className="search-icon">{SEARCH_ICON}</div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, domain, or location..."
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button type="button" className="clear-btn" onClick={clearSearch}>
                  {CLEAR_ICON}
                </button>
              )}
            </div>
          </form>

          <div className="action-controls">
            <div className="filter-dropdown" ref={dropdownRef}>
              <button
                className={`control-btn filter-btn ${showDomainPanel?'active':''}`}
                onClick={()=>setShowDomainPanel(!showDomainPanel)}
              >
                {FILTER_ICON}
                <span>Filter</span>
                {selectedDomains.length>0 && <span className="filter-badge">{selectedDomains.length}</span>}
              </button>
              {showDomainPanel && (
                <div className="filter-panel">
                  <div className="filter-header">
                    <h3>Filter by Domain</h3>
                    {selectedDomains.length>0 && (
                      <button className="clear-filters" onClick={()=>setSelectedDomains([])}>
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="filter-list">
                    {domains.map(d=>(
                      <label key={d} className="filter-item">
                        <input
                          type="checkbox"
                          checked={selectedDomains.includes(d)}
                          onChange={()=>toggleDomain(d)}
                        />
                        <span className="checkmark"></span>
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="view-toggle">
              <button
                className={`control-btn view-btn ${viewMode==='grid'?'active':''}`}
                onClick={()=>setViewMode('grid')}
                title="Grid View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                className={`control-btn view-btn ${viewMode==='list'?'active':''}`}
                onClick={()=>setViewMode('list')}
                title="List View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {recentSearches.length>0 && (
          <div className="recent-searches">
            <span className="recent-label">Recent</span>
            <div className="recent-items">
              {recentSearches.map((s,i)=>(
                <button key={i} className="recent-item" onClick={()=>onRecent(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDomains.length>0 && (
          <div className="active-filters">
            {selectedDomains.map(d=>(
              <span key={d} className="active-filter">
                {d}
                <button onClick={()=>toggleDomain(d)} className="remove-filter">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="experts-container">
        {filteredExperts.length===0 ? (
          <div className="no-results">
            <div className="no-results-content">
              <h3>No experts found</h3>
              <p>Try adjusting your search or removing filters</p>
            </div>
          </div>
        ) : (
          <div className={`experts-grid ${viewMode}`}>
            {filteredExperts.map(expert=>(
              <Link
                to={`/experts/${expert._id||expert.id}`}
                key={expert._id||expert.id}
                className="expert-card"
              >
                <div className="card-header">
                  <div className="expert-avatar">
                    {expert.avatar
                      ? <img src={expert.avatar} alt={expert.name} loading="lazy"/>
                      : <div className="avatar-placeholder">
                          <span>{expert.name?.[0]?.toUpperCase()||"?"}</span>
                        </div>
                    }
                  </div>
                  <div className="expert-basic-info">
                    <h3 className="expert-name">{expert.name}</h3>
                    <div className="expert-meta">
                      <div className="meta-item domain-item">
                        {BRIEFCASE_ICON}
                        <span>{capitalizeWords(expert.domain)||"N/A"}</span>
                      </div>
                      <div className="meta-item location-item">
                        {LOCATION_ICON}
                        <span>{expert.location||"N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {expert.linkedin_url && (
                  <div className="card-footer">
                    <span
                      className="linkedin-btn"
                      onClick={e=>{
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(expert.linkedin_url,'_blank','noopener,noreferrer');
                      }}
                    >
                      {LINKEDIN_ICON}
                      <span>LinkedIn</span>
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
