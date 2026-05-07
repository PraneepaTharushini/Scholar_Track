import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '⬆️', label: 'Upload Documents', path: '/upload' },
  { icon: '✅', label: 'Review Tasks', path: '/review' },
  { icon: '📝', label: 'Tasks', path: '/tasks' },
  { icon: '📅', label: 'Calendar', path: '/calendar' },
  { icon: '📈', label: 'Analytics', path: '/analytics' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: 'ℹ️', label: 'System Info', path: '/system-info' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">✓</div>
        <span className="logo-text">Scholar Track</span>
      </div>
      
      {navItems.map(item => (
        <NavLink 
          key={item.label} 
          to={item.path} 
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      
      <div style={{ marginTop: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: '11px', padding: '0 6px' }}>
        v1.0.0 (React)
      </div>
    </div>
  );
}
