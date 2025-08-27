import React from "react";
import './ThemeToggle.css';

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onClick={toggleTheme}
      className={`theme-toggle-btn ${theme === "dark" ? "dark" : "light"}`}
    >
      <span className="theme-toggle-label">
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </span>
      <span className="theme-toggle-icon">
        {theme === "light" ? (
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            className="theme-icon"
          >
            <circle
              cx="12"
              cy="12"
              r="5"
              stroke="#ffc700"
              strokeWidth="2"
              fill="#ffc700"
            />
            <g stroke="#ffc700" strokeWidth="1.6" strokeLinecap="round">
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M4.22 4.22l1.42 1.42" />
              <path d="M18.36 18.36l1.42 1.42" />
              <path d="M4.22 19.78l1.42-1.42" />
              <path d="M18.36 5.64l1.42-1.42" />
            </g>
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            className="theme-icon theme-icon-moon"
          >
            <path
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
              stroke="#fff"
              strokeWidth="2"
              fill="#18181b"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
