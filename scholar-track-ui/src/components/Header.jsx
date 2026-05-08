import React from 'react';
import './Header.css';

const Header = ({ title, user = 'Sarah' }) => {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
      </div>
      <div className="header__right">
        <button className="header__notif-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 00-6 6v1.586l-1.707 1.707A1 1 0 003 13h14a1 1 0 00.707-1.707L16 9.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" fill="currentColor"/>
          </svg>
          <span className="header__notif-badge" />
        </button>
        <div className="header__profile">
          <div className="header__avatar">
            <span>{user.charAt(0).toUpperCase()}</span>
          </div>
          <div className="header__user-info">
            <span className="header__user-name">{user}</span>
            <span className="header__user-role">Student</span>
          </div>
          <svg className="header__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
