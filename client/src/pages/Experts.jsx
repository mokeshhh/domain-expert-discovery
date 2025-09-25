import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Experts.css";

// ... (Your SVG icon constants)
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

  // sessionStorage and location.state
  const saved = JSON.parse(sessionStorage.getItem("expertsState") || "{}");
  const preserved = location.state?.expertsState || {};

  const [experts, setExperts] = useState(saved.experts || []);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loading, setLoading] = useState(!saved.experts);
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

  // Cache current state at every change
  useEffect(() => {
    sessionStorage.setItem(
      "expertsState",
      JSON.stringify({ experts, searchTerm, selectedDomains, viewMode, currentPage, domains })
    );
  }, [experts, searchTerm, selectedDomains, viewMode, currentPage, domains]);

  // Fetch experts if no cached data
  useEffect(() => {
    if (experts.length > 0) {
      const unique = [...new Set(experts.map((e) => e.domain).filter(Boolean))]
        .map(capitalizeWords)
        .sort();
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
          .map(capitalizeWords)
          .sort();
        setDomains(unique);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch recent searches
  useEffect(() => {
    if (!user?.email) {
      setRecentSearches([]);
      return;
    }
    fetch(`${API_URL}/auth/recent-searches?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setRecentSearches(data.recentSearches.slice(0, 3)))
      .catch(() => setRecentSearches([]));
  }, [user]);

  // Filtered experts on filters/search
  useEffect(() => {
    let f = [...experts];
    if (selectedDomains.length > 0) {
      f = f.filter((e) => selectedDomains.includes(capitalizeWords(e.domain)));
    }
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      f = f.filter(
        (e) =>
          e.name.toLowerCase().includes(lowerSearch) ||
          e.domain.toLowerCase().includes(lowerSearch) ||
          e.location.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredExperts(f);
  }, [experts, searchTerm, selectedDomains]);

  // Use refs to track previous filters to only reset page on real changes
  const prevFilters = useRef({ searchTerm, selectedDomains });

  useEffect(() => {
    const searchChanged = prevFilters.current.searchTerm !== searchTerm;
    const domainsChanged =
      JSON.stringify(prevFilters.current.selectedDomains) !== JSON.stringify(selectedDomains);

    if (searchChanged || domainsChanged) {
      setCurrentPage(1);
    }

    prevFilters.current = { searchTerm, selectedDomains };
  }, [searchTerm, selectedDomains]);

  // Pagination calculations
  const totalExperts = filteredExperts.length;
  const totalPages = Math.ceil(totalExperts / expertsPerPage);
  const indexOfLastExpert = currentPage * expertsPerPage;
  const indexOfFirstExpert = indexOfLastExpert - expertsPerPage;
  const currentExperts = filteredExperts.slice(indexOfFirstExpert, indexOfLastExpert);

  // Scroll restoration flag
  const scrollRestored = useRef(false);

  // Restore scroll after filters and pagination applied
  useEffect(() => {
    if (!scrollRestored.current && location.state?.fromBack) {
      const scrollY = sessionStorage.getItem("expertsScrollY");
      if (scrollY) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollY));
          scrollRestored.current = true;
        }, 0);
      }
    }
  }, [location.state, currentPage, searchTerm, selectedDomains]);

  // Pagination controls
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollRestored.current = true; // Reset scroll restoration on manual pagination to scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };
  const getPageNumbers = () => {
    const pageNums = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNums.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNums.push(i);
        pageNums.push("...");
        pageNums.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNums.push(1);
        pageNums.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNums.push(i);
      } else {
        pageNums.push(1);
        pageNums.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNums.push(i);
        pageNums.push("...");
        pageNums.push(totalPages);
      }
    }
    return pageNums;
  };

  // Navigation to expert detail storing state and scroll
  const handleExpertClick = (expertId) => {
    sessionStorage.setItem("expertsScrollY", window.scrollY);
    const expertsState = { experts, searchTerm, selectedDomains, viewMode, currentPage, domains };
    navigate(`/experts/${expertId}`, { state: { fromBack: true, expertsState } });
  };

  // Save recent searches
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

  // Handlers for search and filters
  const onSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    saveRecent(searchTerm);
  };
  const clearSearch = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };
  const onRecent = (s) => {
    setSearchTerm(s);
    saveRecent(s);
  };
  const toggleDomain = (d) => {
    setSelectedDomains((cd) => (cd.includes(d) ? cd.filter((x) => x !== d) : [...cd, d]));
  };

  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "120px" }}>
        <div className="loading-spinner" aria-label="Loading experts"></div>
        <div style={{ marginTop: "16px", fontSize: "1.15rem", color: "var(--text-color)", letterSpacing: "0.01em" }}>
          Loading experts...
        </div>
      </div>
    );

  return (
    <div className="improved-experts-page">
      <div className="page-header">
        <h1 className="classy-title">
          <span>Experts</span> <span className="highlight">List</span>
        </h1>
      </div>

      {/* Filters and search */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <button className={`control-btn filter-btn ${showDomainPanel ? "active" : ""}`} onClick={() => setShowDomainPanel(!showDomainPanel)}>
                {FILTER_ICON} <span>Filter</span>
                {selectedDomains.length > 0 && <span className="filter-badge">{selectedDomains.length}</span>}
              </button>

              {showDomainPanel && (
                <div className="filter-panel">
                  <div className="filter-header">
                    <h3>Filter by Domain</h3>
                    {selectedDomains.length > 0 && (
                      <button className="clear-filters" onClick={() => setSelectedDomains([])}>
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="filter-list">
                    {domains.map((d) => (
                      <label key={d} className="filter-item">
                        <input type="checkbox" checked={selectedDomains.includes(d)} onChange={() => toggleDomain(d)} />
                        <span className="checkmark"></span>
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View mode toggle */}
            <div className="view-toggle">
              <button className={`control-btn view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid View">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button className={`control-btn view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="List View">
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

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <span className="recent-label">Recent</span>
            <div className="recent-items">
              {recentSearches.map((s, i) => (
                <button key={i} className="recent-item" onClick={() => onRecent(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDomains.length > 0 && (
          <div className="active-filters">
            {selectedDomains.map((d) => (
              <span key={d} className="active-filter">
                {d} <button onClick={() => toggleDomain(d)} className="remove-filter">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="experts-container">
        {filteredExperts.length === 0 ? (
          <div className="no-results">
            <div className="no-results-content">
              <h3>No experts found</h3>
              <p>Try adjusting your search or removing filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`experts-grid ${viewMode}`}>
              {currentExperts.map((expert) => (
                <div
                  key={expert._id || expert.id}
                  className="expert-card"
                  onClick={() => handleExpertClick(expert._id || expert.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-header">
                    <div className="expert-avatar">
                      {expert.avatar ? (
                        <img src={expert.avatar} alt={expert.name} loading="lazy" />
                      ) : (
                        <div className="avatar-placeholder">
                          <span>{expert.name?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                      )}
                    </div>
                    <div className="expert-basic-info">
                      <h3 className="expert-name">{expert.name}</h3>
                      <div className="expert-meta">
                        <div className="meta-item domain-item">
                          {BRIEFCASE_ICON}
                          <span>{capitalizeWords(expert.domain) || "N/A"}</span>
                        </div>
                        <div className="meta-item location-item">
                          {LOCATION_ICON}
                          <span>{expert.location || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {expert.linkedin_url && (
                    <div className="card-footer">
                      <span
                        className="linkedin-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(expert.linkedin_url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        {LINKEDIN_ICON} <span>LinkedIn</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button
                    className={`pagination-btn prev-btn ${currentPage === 1 ? "disabled" : ""}`}
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    {CHEVRON_LEFT} <span>Previous</span>
                  </button>
                  <div className="page-numbers">
                    {getPageNumbers().map((pageNum, index) =>
                      pageNum === "..." ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          className={`pagination-number ${currentPage === pageNum ? "active" : ""}`}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    className={`pagination-btn next-btn ${currentPage === totalPages ? "disabled" : ""}`}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <span>Next</span> {CHEVRON_RIGHT}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
