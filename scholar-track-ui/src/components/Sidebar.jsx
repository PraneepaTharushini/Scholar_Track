import React from 'react';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'upload', label: 'Upload Documents', icon: '⬆' },
  { id: 'review', label: 'Review Tasks', icon: '✔' },
  { id: 'tasks', label: 'Tasks', icon: '☰' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'systeminfo', label: 'System Info', icon: '⚙' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

const Sidebar = ({ activePage = 'review' }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#4F46E5"/>
            <path d="M7 14L11 18L21 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="sidebar__brand-name">Scholar Track</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`sidebar__nav-item ${activePage === item.id ? 'sidebar__nav-item--active' : ''}`}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-label">{item.label}</span>
            {activePage === item.id && <span className="sidebar__nav-indicator" />}
          </a>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__footer-text">v1.0.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
