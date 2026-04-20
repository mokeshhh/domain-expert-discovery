import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Experts.css";

// --- SVG ICON CONSTANTS ---
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
const CHEVRON_LEFT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6"></polyline>
  </svg>
);
const CHEVRON_RIGHT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
);

function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function Experts() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("query") || "";

  const saved = JSON.parse(sessionStorage.getItem("expertsState") || "{}");
  const preserved = location.state?.expertsState || {};

  const [experts, setExperts] = useState(saved.experts || []);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loading, setLoading] = useState(!saved.experts);
  const [isScraping, setIsScraping] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(saved.searchTerm ?? preserved.searchTerm ?? initialQuery);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState(saved.selectedDomains ?? preserved.selectedDomains ?? []);
  const [domains, setDomains] = useState(saved.domains || []);
  const [showDomainPanel, setShowDomainPanel] = useState(false);
  const [viewMode, setViewMode] = useState(saved.viewMode ?? preserved.viewMode ?? "grid");
  const [currentPage, setCurrentPage] = useState(saved.currentPage ?? preserved.currentPage ?? 1);
  const [expertsPerPage] = useState(12);

  const inputRef = useRef();
  const dropdownRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL;

  // Initialize Session ID if not present
  useEffect(() => {
    if (!sessionStorage.getItem("expertSearchSessionId")) {
      const newSessionId = "sess_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("expertSearchSessionId", newSessionId);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "expertsState",
      JSON.stringify({ experts, searchTerm, selectedDomains, viewMode, currentPage, domains })
    );
  }, [experts, searchTerm, selectedDomains, viewMode, currentPage, domains]);

  useEffect(() => {
    if (experts.length > 0) {
      const unique = [...new Set(experts.map((e) => e.domain).filter(Boolean))]
        .map(capitalizeWords).sort();
      setDomains(unique);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/experts`)
      .then((res) => res.json())
      .then((data) => {
        setExperts(data);
        setLoading(false);
        const unique = [...new Set(data.map((e) => e.domain).filter(Boolean))]
          .map(capitalizeWords).sort();
        setDomains(unique);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.email) { setRecentSearches([]); return; }
    fetch(`${API_URL}/auth/recent-searches?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setRecentSearches(data.recentSearches.slice(0, 3)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    let f = [...experts];
    if (selectedDomains.length > 0) {
      f = f.filter((e) => selectedDomains.includes(capitalizeWords(e.domain)));
    }
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      f = f.filter((e) =>
          e.name.toLowerCase().includes(lowerSearch) ||
          (e.domain && e.domain.toLowerCase().includes(lowerSearch)) ||
          (e.location && e.location.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredExperts(f);
  }, [experts, searchTerm, selectedDomains]);

  const triggerDeepSearch = async (q) => {
    if (!q || !q.trim()) return;
    const fullQuery = q.trim();
    const sessionId = sessionStorage.getItem("expertSearchSessionId");
    setIsScraping(true);
    try {
      const res = await fetch(`${API_URL}/experts/search?query=${encodeURIComponent(fullQuery)}&sessionId=${sessionId}`);
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setExperts(prev => {
          const combined = [...prev, ...data];
          return Array.from(new Map(combined.map(item => [item['username'] || item['_id'], item])).values());
        });
        setCurrentPage(1);
      }
    } catch (e) { 
      console.error("Autoscrape failed:", e); 
    } finally { 
      setIsScraping(false); 
    }
  };

  const saveRecent = (q) => {
    if (!user?.email || !q.trim()) return;
    fetch(`${API_URL}/auth/save-recent-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, searchQuery: q.trim() }),
    })
      .then((res) => res.json())
      .then((d) => setRecentSearches(d.recentSearches.slice(0, 3)))
      .catch(() => {});
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    saveRecent(query);
    if (filteredExperts.length === 0) {
      triggerDeepSearch(query);
    }
  };

  const clearSearch = () => { setSearchTerm(""); inputRef.current?.focus(); };
  
  const onRecent = (s) => { 
    setSearchTerm(s); 
    saveRecent(s); 
    const hasLocalMatches = experts.some(e => 
      e.name.toLowerCase().includes(s.toLowerCase()) || 
      (e.domain && e.domain.toLowerCase().includes(s.toLowerCase()))
    );
    if (!hasLocalMatches) triggerDeepSearch(s); 
  };

  const toggleDomain = (d) => { setSelectedDomains((cd) => (cd.includes(d) ? cd.filter((x) => x !== d) : [...cd, d])); };
  const goToPage = (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  
  const handleExpertClick = (expertId) => {
    sessionStorage.setItem("expertsScrollY", window.scrollY);
    const expertsState = { experts, searchTerm, selectedDomains, viewMode, currentPage, domains };
    navigate(`/experts/${expertId}`, { state: { fromBack: true, expertsState } });
  };

  const totalExperts = filteredExperts.length;
  const totalPages = Math.ceil(totalExperts / expertsPerPage);
  const currentExperts = filteredExperts.slice((currentPage - 1) * expertsPerPage, currentPage * expertsPerPage);

  const getPageNumbers = () => {
    const pageNums = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pageNums.push(i); }
    else {
      if (currentPage <= 3) { pageNums.push(1, 2, 3, 4, "...", totalPages); }
      else if (currentPage >= totalPages - 2) { pageNums.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages); }
      else { pageNums.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages); }
    }
    return pageNums;
  };

  if (loading) return (
    <div className="loader-container">
      <div className="loading-spinner"></div>
      <div className="loader-text">Loading experts...</div>
    </div>
  );

  return (
    <div className="improved-experts-page">
      <div className="page-header">
        <h1 className="classy-title"><span>Experts</span> <span className="highlight">List</span></h1>
      </div>

      <div className="search-controls">
        <div className="controls-container">
          <form className="search-form" onSubmit={onSubmit}>
            <div className="search-input-group">
              <div className="search-icon">{SEARCH_ICON}</div>
              <input ref={inputRef} type="text" placeholder="Search by name, domain, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
              {searchTerm && <button type="button" className="clear-btn" onClick={clearSearch}>{CLEAR_ICON}</button>}
            </div>
          </form>
          <div className="action-controls">
            <div className="filter-dropdown" ref={dropdownRef}>
              <button className={`control-btn filter-btn ${showDomainPanel ? "active" : ""}`} onClick={() => setShowDomainPanel(!showDomainPanel)}>
                {FILTER_ICON} <span>Filter</span>
                {selectedDomains.length > 0 && <span className="filter-badge">{selectedDomains.length}</span>}
              </button>
              {showDomainPanel && (
                <div className="filter-panel">
                  <div className="filter-header">
                    <h3>Filter by Domain</h3>
                    {selectedDomains.length > 0 && <button className="clear-filters" onClick={() => setSelectedDomains([])}>Clear All</button>}
                  </div>
                  <div className="filter-list">
                    {domains.map((d) => (
                      <label key={d} className="filter-item">
                        <input type="checkbox" checked={selectedDomains.includes(d)} onChange={() => toggleDomain(d)} />
                        <span className="checkmark"></span><span>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="view-toggle">
              <button className={`control-btn view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
              <button className={`control-btn view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <span className="recent-label">Recent</span>
            <div className="recent-items">{recentSearches.map((s, i) => <button key={i} className="recent-item" onClick={() => onRecent(s)}>{s}</button>)}</div>
          </div>
        )}
        {selectedDomains.length > 0 && (
          <div className="active-filters">{selectedDomains.map((d) => <span key={d} className="active-filter">{d} <button onClick={() => toggleDomain(d)} className="remove-filter">×</button></span>)}</div>
        )}
      </div>

      {isScraping && (
        <div className="scraping-container">
          <div className="scraping-card">
            <div className="scraping-loader">
              <div className="orbit-spinner">
                <div className="orbit"></div>
                <div className="orbit"></div>
                <div className="orbit"></div>
              </div>
            </div>
            <h2 className="scraping-title">Searching Global Networks</h2>
            <p className="scraping-status">
              Finding new experts for <span className="term-highlight">"{searchTerm}"</span>
            </p>
            <div className="progress-bar">
              <div className="progress-value"></div>
            </div>
            <p className="wait-message">Processing live data... this may take up to 20 seconds.</p>
          </div>
        </div>
      )}

      <div className="experts-container">
        {filteredExperts.length === 0 && !isScraping ? (
          <div className="empty-state-container">
            <div className="empty-state-card">
              <div className="empty-icon-wrapper">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3>No local matches found</h3>
              <p>
                Press <span className="enter-key-highlight" onClick={() => triggerDeepSearch(searchTerm)}>Enter</span> to search <strong>"{searchTerm}"</strong> remotely and trigger an autoscrape!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={`experts-grid ${viewMode}`}>
              {currentExperts.map((expert) => (
                <div key={expert._id || expert.id} className="expert-card" onClick={() => handleExpertClick(expert._id || expert.id)} style={{ cursor: "pointer" }}>
                  <div className="card-header">
                    <div className="expert-avatar">{expert.avatar ? <img src={expert.avatar} alt={expert.name} loading="lazy" /> : <div className="avatar-placeholder"><span>{expert.name?.[0]?.toUpperCase() || "?"}</span></div>}</div>
                    <div className="expert-basic-info">
                      <h3 className="expert-name">{expert.name}</h3>
                      <div className="expert-meta">
                        <div className="meta-item domain-item">{BRIEFCASE_ICON}<span>{capitalizeWords(expert.domain) || "N/A"}</span></div>
                        <div className="meta-item location-item">{LOCATION_ICON}<span>{expert.location || "N/A"}</span></div>
                      </div>
                    </div>
                  </div>
                  {expert.linkedin_url && (
                    <div className="card-footer">
                      <span className="linkedin-btn" onClick={(e) => { e.stopPropagation(); window.open(expert.linkedin_url, "_blank"); }}>{LINKEDIN_ICON} <span>LinkedIn</span></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button className={`pagination-btn prev-btn ${currentPage === 1 ? "disabled" : ""}`} onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>{CHEVRON_LEFT} <span>Previous</span></button>
                  <div className="page-numbers">{getPageNumbers().map((p, i) => p === "..." ? <span key={i} className="pagination-ellipsis">...</span> : <button key={i} className={`pagination-number ${currentPage === p ? "active" : ""}`} onClick={() => goToPage(p)}>{p}</button>)}</div>
                  <button className={`pagination-btn next-btn ${currentPage === totalPages ? "disabled" : ""}`} onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}><span>Next</span> {CHEVRON_RIGHT}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}