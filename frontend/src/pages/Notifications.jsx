import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const API_BASE = '/api';

export default function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [settingsList, setSettingsList] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('scholar_track_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fetchNotifs = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications`, { headers });
        setItems(await res.json());
      } catch (e) { console.error(e); }
    };
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/reminders/preferences`, { headers });
        setSettingsList(await res.json());
      } catch (e) { console.error(e); }
    };
    const fetchDeadlines = async () => {
      try {
        const res = await fetch(`${API_BASE}/reminders/deadlines`, { headers });
        setUpcoming(await res.json());
      } catch (e) { console.error(e); }
    };

    fetchNotifs();
    fetchSettings();
    fetchDeadlines();
  }, []);

  const filtered = filter === 'all' ? items
    : filter === 'unread' ? items.filter(n => n.is_unread)
    : items.filter(n => n.type === filter);

  const unreadCount = items.filter(n => n.is_unread).length;
  const counts = {
    urgent: items.filter(n => n.type === 'urgent').length,
    reminder: items.filter(n => n.type === 'reminder').length,
    unread: unreadCount,
    ai: items.filter(n => n.type === 'ai').length,
  };

  const dismiss = async (id) => {
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE', headers });
      setItems(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH', headers });
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_unread: false } : n));
    } catch (e) { console.error(e); }
  };

  const markAll = async () => {
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'PATCH', headers });
      setItems(prev => prev.map(n => ({ ...n, is_unread: false })));
    } catch (e) { console.error(e); }
  };

  const toggleSetting = async (pref_key, current_status) => {
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`${API_BASE}/reminders/preferences/${pref_key}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_enabled: !current_status })
      });
      setSettingsList(prev => prev.map(s => s.pref_key === pref_key ? { ...s, is_enabled: !current_status } : s));
    } catch (e) { console.error(e); }
  };

  const viewTask = (notif) => {
    if (notif.is_unread) {
      markAsRead(notif.id);
    }
    navigate('/tasks');
  };

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
                <div key={n.id} className={`notif-item${n.is_unread ? ' unread' : ''}`}>
                  {n.is_unread && <div className="unread-dot" />}
                  <div className={`notif-ico ${n.type}`}>{n.icon}</div>
                  <div className="notif-body">
                    <div className="notif-top">
                      <div className="notif-ttl">{n.title}</div>
                      <div className="notif-time">{n.time_label}</div>
                    </div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-tags">
                      {(n.tags || []).map(t => <span key={t} className={`tag ${t}`}>{t.toUpperCase()}</span>)}
                      {n.course && <span className="course-tag">{n.course}</span>}
                    </div>
                    <div className="notif-action">
                      <button className="btn-sm primary" onClick={() => viewTask(n)}>View Task</button>
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
              <div className="deadline-item" key={d.id || i}>
                <div className="deadline-bar" style={{ background: d.color }} />
                <div className="deadline-info">
                  <div className="deadline-title">{d.title}</div>
                  <div className="deadline-sub">{d.course} · {d.deadline_time}</div>
                </div>
                <div className="deadline-time" style={{ color: d.color }}>{d.urgency_label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: settings */}
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
                    <div className="setting-desc">{s.description}</div>
                  </div>
                  <button
                    className={`toggle${s.is_enabled ? ' on' : ''}`}
                    onClick={() => toggleSetting(s.pref_key, s.is_enabled)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI Study schedule suggestion */}
          <div className="schedule-card">
            <h4>🤖 AI Study Schedule for Today</h4>
            <p>Based on your deadlines and past patterns, here's your optimised study plan:</p>
            <div className="schedule-times">
              <div className="schedule-time-row"><span>🕓 4:00 – 6:00 PM</span><span style={{ fontWeight: 600 }}>Database Project</span></div>
              <div className="schedule-time-row"><span>🕖 6:30 – 8:00 PM</span><span style={{ fontWeight: 600 }}>Algebra Review</span></div>
              <div className="schedule-time-row"><span>🕗 8:30 – 9:30 PM</span><span style={{ fontWeight: 600 }}>Statistics Read</span></div>
            </div>
          </div>

          {/* Notification channel status */}
          <div className="panel" style={{ marginTop: 20 }}>
            <div className="panel-header">
              <div className="panel-title">📡 Delivery Channels</div>
            </div>
            {[
              { icon: '📧', label: 'Gmail SMTP', status: 'Connected', color: '#10b981' },
              { icon: '🌐', label: 'Browser Push', status: 'Enabled', color: '#10b981' },
              { icon: '📱', label: 'PWA Mobile', status: 'Ready', color: '#10b981' },
            ].map(c => (
              <div className="setting-row" key={c.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <div className="setting-name">{c.label}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>● {c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
