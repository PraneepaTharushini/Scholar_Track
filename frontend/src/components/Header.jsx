import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ title, user, theme = 'light', onToggleTheme, onLogout, onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const name   = typeof user === 'object' ? (user?.name  || 'Student') : (user || 'Student');
  const role   = typeof user === 'object' ? (user?.role  || 'student') : 'student';
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1); // e.g. "Admin", "Student"
  const isAdmin = role === 'admin';
  const userId = typeof user === 'object' ? user?.id : null;
  const [avatarUrl, setAvatarUrl] = useState(() => userId ? localStorage.getItem('scholar_track_avatar_' + userId) : null);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (userId) {
        setAvatarUrl(localStorage.getItem('scholar_track_avatar_' + userId));
      }
    };
    window.addEventListener('avatarUpdate', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdate', handleAvatarUpdate);
  }, [userId]);

  const showBackButton = location.pathname !== '/';

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onToggleSidebar} aria-label="Open sidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {showBackButton && (
          <button className="header__back-btn" onClick={() => navigate(-1)} aria-label="Go back" title="Go back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header__right">
        {/* Dark / Light mode toggle */}
        <button
          className="header__theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
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
            <div className="header__avatar" style={{ overflow: 'hidden' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="header__user-info">
              <span className="header__user-name">{name}</span>
              <span className="header__user-role">{roleLabel}</span>
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
              {isAdmin && (
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
                  if (onLogout) onLogout();
                  setProfileOpen(false);
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
