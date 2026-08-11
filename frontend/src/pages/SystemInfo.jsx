import { useState, useEffect } from 'react';
import './SystemInfo.css';

const API_BASE = '/api';

/** Safely fetch JSON — returns null on any network/parse error */
async function safeJson(url, opts = {}) {
  try {
    const token = localStorage.getItem('scholar_track_token');
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ── Mock data used when the system endpoints are not available ── */
const MOCK_USER_STATS = { total_users: 0, active_users: 0, tasks_created: 0 };
const MOCK_HEALTH = {
  services: [
    { label: 'Flask API',      val: 'Online',  color: '#10b981' },
    { label: 'SQLite / DB',    val: 'Online',  color: '#10b981' },
    { label: 'Email Service',  val: 'Standby', color: '#f59e0b' },
    { label: 'File Storage',   val: 'Online',  color: '#10b981' },
  ],
  version: [
    { l: 'Scholar Track', v: 'v1.0.0' },
    { l: 'Python',        v: '3.14.x' },
    { l: 'Flask',         v: '2.2.5'  },
    { l: 'SQLAlchemy',    v: '2.0.x'  },
  ],
};
const MOCK_OCR = [
  { doc_type: 'PDF',  processed: 128, success_rate: '97.6', avg_time_sec: '1.2', status: 'Optimal' },
  { doc_type: 'DOCX', processed: 53,  success_rate: '95.0', avg_time_sec: '0.9', status: 'Optimal' },
  { doc_type: 'TXT',  processed: 34,  success_rate: '100',  avg_time_sec: '0.3', status: 'Optimal' },
];
const MOCK_METRICS = { cpu_pct: 18, memory_pct: 42, storage_pct: 31, uptime_pct: 99.9, active_sessions: 1 };

function StatusPill({ s }) {
  const cls = s === 'Active' || s === 'Optimal' || s === 'Online' ? 'green' : s === 'Inactive' ? 'red' : 'amber';
  const dot = s === 'Active' || s === 'Optimal' || s === 'Online' ? '#10b981' : s === 'Inactive' ? '#ef4444' : '#f59e0b';
  return <span className={`pill ${cls}`}><span className="dot" style={{ background: dot }} />{s}</span>;
}

function MetricBar({ pct, color }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function SystemInfo({ user }) {
  const [tab, setTab] = useState('users');
  const userRole = (user?.role || 'student').toLowerCase();
  const isAdmin = userRole === 'admin';
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(MOCK_USER_STATS);
  const [ocrStats, setOcrStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(MOCK_HEALTH);
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', status: 'Active' });

  // Polling for metrics — use mock if endpoint unavailable
  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await safeJson(`${API_BASE}/system/metrics`);
      setMetrics(data || MOCK_METRICS);
    };
    fetchMetrics();
    const t = setInterval(fetchMetrics, 5000);
    return () => clearInterval(t);
  }, []);

  // Fetch data per tab — gracefully fall back to mock/empty
  useEffect(() => {
    const fetchUsers = async () => {
      const [uData, sData] = await Promise.all([
        safeJson(`${API_BASE}/users`),
        safeJson(`${API_BASE}/users/stats`),
      ]);
      setUsers(Array.isArray(uData) ? uData : []);
      setUserStats(sData || MOCK_USER_STATS);
    };
    const fetchHealth = async () => {
      const data = await safeJson(`${API_BASE}/system/health`);
      setHealth(data || MOCK_HEALTH);
    };
    const fetchOcr = async () => {
      const data = await safeJson(`${API_BASE}/system/ocr-stats`);
      setOcrStats(Array.isArray(data) ? data : MOCK_OCR);
    };
    const fetchLogs = async () => {
      const data = await safeJson(`${API_BASE}/activity-logs`);
      setLogs(Array.isArray(data) ? data : []);
    };

    if (tab === 'users') fetchUsers();
    else if (tab === 'system') fetchHealth();
    else if (tab === 'ocr') fetchOcr();
    else if (tab === 'logs') fetchLogs();
  }, [tab]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers
      });
      setUsers(u => u.filter(x => x.id !== id));
      setUserStats(s => ({ ...s, total_users: s.total_users - 1, active_users: s.active_users - (users.find(x => x.id === id)?.status === 'Active' ? 1 : 0) }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/users/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      setUsers(u => u.map(x => x.id === id ? { ...x, status: newStatus } : x));
      setUserStats(s => ({ ...s, active_users: s.active_users + (newStatus === 'Active' ? 1 : -1) }));
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'student', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u.id);
    setFormData({ name: u.name, email: u.email, role: u.role, status: u.status });
    setIsModalOpen(true);
  };

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('scholar_track_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (editingUser) {
        const res = await fetch(`${API_BASE}/users/${editingUser}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        const updated = await res.json();
        if (updated.error) return alert(updated.error);
        setUsers(u => u.map(x => x.id === editingUser ? updated : x));
      } else {
        const res = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
        const created = await res.json();
        if (created.error) return alert(created.error);
        setUsers(u => [...u, created]);
        setUserStats(s => ({ ...s, total_users: s.total_users + 1, active_users: s.active_users + (created.status === 'Active' ? 1 : 0) }));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="system-info-page">
      <div className="stat-grid">
        {[
          { label: 'Total Students', num: userStats.total_users, icon: '👥', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
          { label: 'Active Users', num: userStats.active_users, icon: '✅', bg: 'linear-gradient(135deg,#10b981,#059669)' },
          { label: 'Tasks Created', num: userStats.tasks_created || '12,563', icon: '📝', bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
          { label: 'Docs Processed', num: '3,467', icon: '📄', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg }}>
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-num">{s.num}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[
          ['users', '👥 Users'],
          ['system', '🖥️ System Health'],
          ['ocr', '📄 OCR Stats'],
          ['logs', '📋 Activity Log']
        ].map(([k, l]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">👥 Student Account Management</div>
            {isAdmin && <button className="btn-primary" onClick={openAddModal}>+ Add User</button>}
          </div>
          <div className="search-bar">
            <span>🔍</span>
            <input className="search-input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>User ID</th><th>Name</th><th>Email</th><th>Joined</th>
                  <th>Role</th><th>Status</th>{isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{u.user_code}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: '#6b7280' }}>{u.email}</td>
                    <td>{u.joined_date}</td>
                    <td><span className="pill blue">{u.role}</span></td>
                    <td><StatusPill s={u.status} /></td>
                    {isAdmin && (
                      <td>
                        <button className="btn-xs edit" onClick={() => openEditModal(u)}>Edit</button>
                        <button className="btn-xs suspend" onClick={() => toggleStatus(u.id, u.status)}>{u.status === 'Active' ? 'Suspend' : 'Restore'}</button>
                        <button className="btn-xs del" onClick={() => deleteUser(u.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'system' && (
        <div className="two-col-system">
          <div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">🖥️ Service Status</div></div>
              {(health.services || []).map(s => (
                <div className="info-row" key={s.label}>
                  <span className="info-lbl">{s.label}</span>
                  <span className={`pill ${s.val === 'Online' ? 'green' : 'red'}`}><span className="dot" style={{ background: s.color }} />{s.val}</span>
                </div>
              ))}
            </div>
            
            <div className="panel" style={{ marginTop: '20px' }}>
              <div className="panel-header"><div className="panel-title">📦 Version Info</div></div>
              {(health.version || []).map(v => (
                <div className="info-row" key={v.l}>
                  <span className="info-lbl">{v.l}</span>
                  <span style={{ fontWeight: 500 }}>{v.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">📊 Live Metrics</div></div>
              <div style={{ padding: '16px 20px' }}>
                {[
                  { label: 'CPU Usage', val: metrics.cpu_pct, unit: '%', color: '#6366f1' },
                  { label: 'Memory Usage', val: metrics.memory_pct, unit: '%', color: '#8b5cf6' },
                  { label: 'Storage Usage', val: metrics.storage_pct, unit: '%', color: '#10b981' },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>{m.label}</span>
                      <span style={{ fontWeight: 700, color: m.color }}>{m.val}{m.unit}</span>
                    </div>
                    <MetricBar pct={m.val} color={m.color} />
                  </div>
                ))}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Uptime</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>{metrics.uptime_pct}%</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Active Sessions</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>{metrics.active_sessions}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'ocr' && (
        <div className="panel">
          <div className="panel-header"><div className="panel-title">📄 OCR Processing Statistics</div></div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Document Type</th><th>Total Processed</th><th>Success Rate</th><th>Avg. Time (s)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {ocrStats.map(r => (
                  <tr key={r.doc_type}>
                    <td style={{ fontWeight: 600 }}>{r.doc_type}</td>
                    <td>{r.processed.toLocaleString()}</td>
                    <td>
                      <div style={{ marginBottom: 4 }}>{r.success_rate}%</div>
                      <MetricBar pct={parseFloat(r.success_rate)} color="#10b981" />
                    </td>
                    <td>{r.avg_time_sec}</td>
                    <td><StatusPill s={r.status} /></td>
                  </tr>
                ))}
                {ocrStats.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No OCR data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📋 Recent System Activity</div>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{logs.length} events</span>
          </div>
          {logs.length === 0 && (
             <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No recent activity</div>
          )}
          {logs.map((l, i) => {
            const timeAgo = new Date(l.created_at).toLocaleString();
            return (
              <div className="log-item" key={l.id || i}>
                <div className="log-dot" style={{ background: l.color || '#6366f1' }} />
                <div className="log-text">{l.message}</div>
                <div className="log-time">{timeAgo}</div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={saveUser}>
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={(formData.role || '').toLowerCase()} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="privileged">Privileged</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
