import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './MobileBottomNav.css';

const MobileBottomNav = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">

      {/* Dashboard */}
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        aria-label="Dashboard"
      >
        <div className="mobile-nav-icon-wrap">
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span>
        </div>
        <span className="mobile-nav-label">Home</span>
      </NavLink>

      {/* Tasks */}
      <NavLink
        to="/tasks"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        aria-label="Tasks"
      >
        <div className="mobile-nav-icon-wrap">
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h9M3 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        <span className="mobile-nav-label">Tasks</span>
      </NavLink>

      {/* Upload */}
      <NavLink
        to="/upload"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        aria-label="Upload"
      >
        <div className="mobile-nav-icon-wrap">
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M9 12V4M9 4L6 7M9 4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        <span className="mobile-nav-label">Upload</span>
      </NavLink>

      {/* Notifications */}
      <NavLink
        to="/notifications"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        aria-label="Notifications"
      >
        <div className="mobile-nav-icon-wrap">
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a5 5 0 00-5 5v2L2 11h14l-2-2V7a5 5 0 00-5-5zM7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        <span className="mobile-nav-badge" aria-hidden="true" />
        <span className="mobile-nav-label">Alerts</span>
      </NavLink>

      {/* More / Sidebar toggle */}
      <button
        className="mobile-nav-item mobile-nav-item--menu"
        onClick={onToggleSidebar}
        aria-label="Open menu"
      >
        <div className="mobile-nav-icon-wrap">
          <span className="mobile-nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        <span className="mobile-nav-label">More</span>
      </button>

    </nav>
  );
};

export default MobileBottomNav;
