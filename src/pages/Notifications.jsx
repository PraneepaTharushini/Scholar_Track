import { useState } from 'react';
import './Notifications.css';

const initialNotifications = [
  { id: 1, type: 'urgent', icon: '🚨', title: 'Database Project Due Today!', msg: 'Your DBMS assignment is due at 11:59 PM. Submit now to avoid late penalty.', time: '9:30 AM', unread: true, tags: ['urgent'], course: 'DBMS', deadline: 'Today 11:59 PM' },
  { id: 2, type: 'reminder', icon: '⏰', title: 'Algebra Exam Tomorrow', msg: 'Your Algebra midterm is scheduled for tomorrow at 2:00 PM. Review your notes tonight.', time: '8:15 AM', unread: true, tags: ['reminder'], course: 'Mathematics', deadline: 'Tomorrow 2:00 PM' },
  { id: 3, type: 'ai', icon: '🤖', title: 'AI Alert: Delay Risk Detected', msg: 'Based on your workload, you may delay the Statistics Assignment. Suggested start: today 4 PM.', time: 'Yesterday', unread: true, tags: ['ai'], course: 'Statistics', deadline: 'In 3 days' },
  { id: 4, type: 'info', icon: '📌', title: 'CS Group Project – 2 Days Left', msg: 'Code review and documentation are pending. Coordinate with your team today.', time: '2 days ago', unread: false, tags: ['info'], course: 'CS3022', deadline: 'In 2 days 6:00 PM' },
  { id: 5, type: 'success', icon: '✅', title: 'Research Paper Submitted!', msg: 'Your Physics research paper was submitted successfully. View confirmation in task history.', time: 'Yesterday 3:45 PM', unread: false, tags: ['success'], course: 'Physics', deadline: 'Completed' },
];

const settingsList = [
  { id: 'email', label: 'Email Reminders', desc: 'Get deadline alerts in your Gmail inbox', on: true },
  { id: 'push', label: 'Browser Push Notifications', desc: 'Instant alerts for urgent tasks', on: true },
  { id: 'h24', label: '24-Hour Advance Reminder', desc: 'Notified one day before any deadline', on: true },
  { id: 'h1', label: '1-Hour Final Warning', desc: 'Last-minute reminder before deadline', on: true },
  { id: 'ai', label: 'AI Delay Prediction Alerts', desc: 'Warned when ML detects delay risk', on: true },
  { id: 'schedule', label: 'Daily Study Schedule', desc: 'Personalised study plan each morning', on: false },
];

const upcoming = [
  { title: 'Database Project', course: 'DBMS', time: 'Today 11:59 PM', color: '#ef4444', urgency: '3 hrs' },
  { title: 'Algebra Midterm', course: 'Mathematics', time: 'Tomorrow 2:00 PM', color: '#f59e0b', urgency: '17 hrs' },
  { title: 'CS Group Project', course: 'CS3022', time: 'In 2 days', color: '#6366f1', urgency: '2 days' },
];

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState(initialNotifications);
  const [toggles, setToggles] = useState(() => {
    const m = {}; settingsList.forEach(s => m[s.id] = s.on); return m;
  });

  const filtered = filter === 'all' ? items
    : filter === 'unread' ? items.filter(n => n.unread)
    : items.filter(n => n.type === filter);

  const unreadCount = items.filter(n => n.unread).length;
  const counts = {
    urgent: items.filter(n => n.type === 'urgent').length,
    reminder: items.filter(n => n.type === 'reminder').length,
    unread: unreadCount,
    ai: items.filter(n => n.type === 'ai').length,
  };

  const dismiss = id => setItems(prev => prev.filter(n => n.id !== id));
  const markAll = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <div className="notif-page">
      {/* Summary bar */}
      <div className="summary-bar">
        <div className="sum-card">
          <div className="sum-icon red">🚨</div>
          <div><div className="sum-num">{counts.urgent}</div><div className="sum-label">Urgent Alerts</div></div>
        </div>
        <div className="sum-card">
          <div className="sum-icon amber">⏰</div>
          <div><div className="sum-num">{counts.reminder}</div><div className="sum-label">Reminders</div></div>
        </div>
        <div className="sum-card">
          <div className="sum-icon indigo">📬</div>
          <div><div className="sum-num">{counts.unread}</div><div className="sum-label">Unread</div></div>
        </div>
        <div className="sum-card">
          <div className="sum-icon green">🤖</div>
          <div><div className="sum-num">{counts.ai}</div><div className="sum-label">AI Alerts</div></div>
        </div>
      </div>

      <div className="two-col">
        {/* Left: notification feed */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📋 Notification Feed</div>
              <button className="mark-all" onClick={markAll}>Mark all read</button>
            </div>
            <div className="filter-group">
              {['all', 'unread', 'urgent', 'reminder', 'ai', 'success'].map(f => (
                <button key={f} className={`filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="notif-list">
              {filtered.length === 0 ? (
                <div className="empty">🎉 All caught up! No notifications here.</div>
              ) : filtered.map(n => (
                <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>
                  {n.unread && <div className="unread-dot" />}
                  <div className={`notif-ico ${n.type}`}>{n.icon}</div>
                  <div className="notif-body">
                    <div className="notif-top">
                      <div className="notif-ttl">{n.title}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                    <div className="notif-msg">{n.msg}</div>
                    <div className="notif-tags">
                      {n.tags.map(t => <span key={t} className={`tag ${t}`}>{t.toUpperCase()}</span>)}
                      <span className="course-tag">{n.course}</span>
                    </div>
                    <div className="notif-action">
                      <button className="btn-sm primary">View Task</button>
                      <button className="btn-sm ghost" onClick={() => dismiss(n.id)}>Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <div className="panel-header">
              <div className="panel-title">📅 Upcoming Deadlines</div>
            </div>
            {upcoming.map((d, i) => (
              <div className="deadline-item" key={i}>
                <div className="deadline-bar" style={{ background: d.color }} />
                <div className="deadline-info">
                  <div className="deadline-title">{d.title}</div>
                  <div className="deadline-sub">{d.course} · {d.time}</div>
                </div>
                <div className="deadline-time" style={{ color: d.color }}>{d.urgency}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: settings + schedule */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">⚙️ Reminder Preferences</div>
            </div>
            <div className="settings-list">
              {settingsList.map(s => (
                <div className="setting-row" key={s.id}>
                  <div className="setting-info">
                    <div className="setting-name">{s.label}</div>
                    <div className="setting-desc">{s.desc}</div>
                  </div>
                  <button 
                    className={`toggle${toggles[s.id] ? ' on' : ''}`} 
                    onClick={() => setToggles(p => ({ ...p, [s.id]: !p[s.id] }))} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
