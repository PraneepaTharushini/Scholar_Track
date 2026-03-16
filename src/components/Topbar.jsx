import React from 'react';
import './Topbar.css';

const Topbar = ({ title = 'Dashboard' }) => {
  return (
    <header className="st-topbar">
      <h2>{title}</h2>
      <div className="st-avatar">👤</div>
    </header>
  );
};

export default Topbar;