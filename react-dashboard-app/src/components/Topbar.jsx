import React from 'react';
import './Topbar.css';

const Topbar = ({ title = 'Dashboard', onMenuClick }) => {
  return (
    <header className="st-topbar">
      <div className="st-topbar-left">
        <button className="st-menu-btn" type="button" onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <h2>{title}</h2>
      </div>
      <div className="st-avatar">👤</div>
    </header>
  );
};

export default Topbar;