import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const location = useLocation();
  const isAdmin = location.pathname === '/system-info';
  
  // Mapping paths to titles
  const titles = {
    '/dashboard': 'Dashboard',
    '/upload': 'Upload Documents',
    '/review': 'Review Tasks',
    '/tasks': 'Tasks',
    '/calendar': 'Calendar',
    '/analytics': 'Analytics',
    '/notifications': '🔔 Notifications & Reminders',
    '/system-info': 'ℹ️ System Information & Admin',
    '/settings': 'Settings'
  };

  const title = titles[location.pathname] || 'Dashboard';

  return (
    <div className="header">
      <div className="header-title">{title}</div>
      
      <div className="user-profile">
        {isAdmin ? (
          <>
            <span className="badge-admin">👑 Admin</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a3e' }}>Admin</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>System Manager</div>
            </div>
            <div className="user-avatar" style={{ background: '#1a1a3e' }}>A</div>
          </>
        ) : (
          <>
            <div className="notif-bell">
              🔔
              <div className="badge">3</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a3e', textAlign: 'right' }}>Sarah</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'right' }}>Student</div>
            </div>
            <div className="user-avatar">S</div>
          </>
        )}
      </div>
    </div>
  );
}
