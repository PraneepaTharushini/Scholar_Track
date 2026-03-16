import React from 'react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="st-topbar">
      <h2>Dashboard</h2>
      <div className="st-user">
        <div className="st-avatar">👤</div>
      </div>
    </header>
  );
};

export default Topbar;