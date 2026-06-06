import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ title, user = 'Sarah', role = 'student', theme = 'light', onToggleTheme, onLogout }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header__right">
        {/* Dark / Light mode toggle */}
        <button
          className="header__theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notification bell → /notifications */}
        <button
          className="header__notif-btn"
          title="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 00-6 6v1.586l-1.707 1.707A1 1 0 003 13h14a1 1 0 00.707-1.707L16 9.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" fill="currentColor"/>
          </svg>
          <span className="header__notif-badge" />
        </button>

        {/* Profile dropdown → settings */}
        <div className="header__profile-wrap">
          <button
            className="header__profile"
            onClick={() => setProfileOpen(o => !o)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <div className="header__avatar">
              <span>{user.charAt(0).toUpperCase()}</span>
            </div>
            <div className="header__user-info">
              <span className="header__user-name">{user}</span>
              <span className="header__user-role">{role === 'admin' ? 'Admin' : 'Student'}</span>
            </div>
            <svg
              className={`header__chevron ${profileOpen ? 'open' : ''}`}
              width="16" height="16" viewBox="0 0 16 16" fill="none"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {profileOpen && (
            <div className="header__dropdown">
              <button
                className="header__drop-item"
                onClick={() => { navigate('/settings'); setProfileOpen(false); }}
              >
                <span>👤</span> My Profile
              </button>
              <button
                className="header__drop-item"
                onClick={() => { navigate('/notifications'); setProfileOpen(false); }}
              >
                <span>🔔</span> Notifications
              </button>
              {role === 'admin' && (
                <button
                  className="header__drop-item"
                  onClick={() => { navigate('/system'); setProfileOpen(false); }}
                >
                  <span>🖥️</span> System Info
                </button>
              )}
              <div className="header__drop-divider" />
              <button
                className="header__drop-item danger"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout?.();
                }}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
