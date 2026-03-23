import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ menuOpen, onClose }) => {
  return (
    <aside className={`st-sidebar ${menuOpen ? 'open' : ''}`}>
      <button className="st-close-btn" type="button" onClick={onClose} aria-label="Close menu">
        ✕
      </button>

      <h1>Scholar-Track</h1>
      <nav>
        <NavLink to="/dashboard" onClick={onClose}>Dashboard</NavLink>
        <a href="#upload" onClick={onClose}>Upload Documents</a>
        <a href="#review" onClick={onClose}>Review Tasks</a>
        <a href="#tasks" onClick={onClose}>Tasks</a>
        <NavLink to="/calendar" onClick={onClose}>Calendar</NavLink>
        <a href="#analytics" onClick={onClose}>Analytics</a>
        <a href="#settings" onClick={onClose}>Settings</a>
      </nav>
    </aside>
  );
};

export default Sidebar;