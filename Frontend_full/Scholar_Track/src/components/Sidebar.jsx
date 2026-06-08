import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const allNavItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', iconPath: 'M1 1h7v7H1zM10 1h7v7h-7zM1 10h7v7H1zM10 10h7v7h-7z' },
  { id: 'upload', label: 'Upload Documents', path: '/upload', iconPath: 'M9 12V4M9 4L6 7M9 4l3 3M3 14h12' },
  { id: 'review', label: 'Review Tasks', path: '/review', iconPath: 'M3 9l4 4 8-8' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', iconPath: 'M3 5h12M3 9h9M3 13h6' },
  { id: 'calendar', label: 'Calendar', path: '/calendar', iconPath: 'M2 7h14M6 1v4M12 1v4M2 3h14v13H2z' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', iconPath: 'M2 14l4-5 4 2 5-7' },
  { id: 'notifications', label: 'Notifications', path: '/notifications', iconPath: 'M9 2a5 5 0 00-5 5v2L2 11h14l-2-2V7a5 5 0 00-5-5zM7 14a2 2 0 004 0' },
  { id: 'systeminfo', label: 'System Info', path: '/system', iconPath: 'M9 8v5M9 6v.5' },
  { id: 'settings', label: 'Settings', path: '/settings', iconPath: 'M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.41 1.41M13.37 13.37l1.41 1.41M3.22 14.78l1.41-1.41M13.37 4.63l1.41-1.41' },
];

const adminNavIds = new Set(['dashboard', 'analytics', 'notifications', 'systeminfo', 'settings']);
const studentNavIds = new Set(['dashboard', 'upload', 'review', 'tasks', 'calendar', 'analytics', 'notifications', 'settings']);

const SidebarIcon = ({ path }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Sidebar = ({ role = 'student' }) => {
  const allowedIds = role === 'admin' ? adminNavIds : studentNavIds;
  const navItems = allNavItems.filter((item) => allowedIds.has(item.id));

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
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`}
          >
            <span className="sidebar__nav-icon"><SidebarIcon path={item.iconPath} /></span>
            <span className="sidebar__nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__footer-text">v1.0.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
