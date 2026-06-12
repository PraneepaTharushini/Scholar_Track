import { useState, useEffect } from 'react';
import './SystemInfo.css';

const initialUsers = [
  { id: 'USR001', name: 'Sarah Johnson', email: 'sarah.johnson@gmail.com', joined: 'Jan 15, 2026', role: 'Student', tasks: 47, docs: 12, status: 'Active' },
  { id: 'USR002', name: 'Michael Chen', email: 'michael.chen@gmail.com', joined: 'Feb 03, 2026', role: 'Student', tasks: 31, docs: 8, status: 'Active' },
  { id: 'USR003', name: 'Emma Rodriguez', email: 'emma.rodriguez@gmail.com', joined: 'Mar 10, 2026', role: 'Student', tasks: 55, docs: 14, status: 'Active' },
  { id: 'USR004', name: 'James Wilson', email: 'james.wilson@gmail.com', joined: 'Mar 22, 2026', role: 'Student', tasks: 9, docs: 3, status: 'Inactive' },
];

const ocrStats = [
  { type: 'PDF Documents', processed: 1247, success: '96.2%', avgTime: '2.3s', status: 'Optimal' },
  { type: 'Images (PNG/JPG)', processed: 856, success: '92.8%', avgTime: '1.8s', status: 'Optimal' },
  { type: 'Email Screenshots', processed: 743, success: '94.5%', avgTime: '2.1s', status: 'Optimal' },
  { type: 'Syllabi / DOCX', processed: 621, success: '89.3%', avgTime: '3.5s', status: 'Optimal' },
];

const logs = [
  { msg: 'Database backup completed successfully', time: '2 hrs ago', color: '#10b981' },
  { msg: 'New user registered: priya.sharma@gmail.com', time: '4 hrs ago', color: '#6366f1' },
  { msg: 'OCR service processed 23 documents', time: '5 hrs ago', color: '#10b981' },
  { msg: 'NLP models updated to v2.1.0', time: '12 hrs ago', color: '#10b981' },
  { msg: 'ML priority engine recalibrated', time: '1 day ago', color: '#f59e0b' },
];

function StatusPill({ s }) {
  const cls = s === 'Active' || s === 'Optimal' ? 'green' : s === 'Inactive' ? 'red' : 'amber';
  const dot = s === 'Active' || s === 'Optimal' ? '#10b981' : s === 'Inactive' ? '#ef4444' : '#f59e0b';
  return <span className={`pill ${cls}`}><span className="dot" style={{ background: dot }} />{s}</span>;
}

function MetricBar({ pct, color }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function SystemInfo() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [cpu, setCpu] = useState(34);
  const [mem, setMem] = useState(35);

  useEffect(() => {
    const t = setInterval(() => {
      setCpu(v => Math.min(90, Math.max(15, v + (Math.random() * 6 - 3))));
      setMem(v => Math.min(80, Math.max(25, v + (Math.random() * 4 - 2))));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const deleteUser = id => setUsers(u => u.filter(x => x.id !== id));
  const toggleStatus = id => setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x));

  const activeCount = users.filter(u => u.status === 'Active').length;

  return (
    <div className="system-info-page">
      <div className="stat-grid">
        {[
          { label: 'Total Students', num: users.length, icon: '👥', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
          { label: 'Active Users', num: activeCount, icon: '✅', bg: 'linear-gradient(135deg,#10b981,#059669)' },
          { label: 'Tasks Created', num: '12,563', icon: '📝', bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
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
            <button className="btn-primary">+ Add User</button>
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
                  <th>Tasks</th><th>Docs</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: '#6b7280' }}>{u.email}</td>
                    <td>{u.joined}</td>
                    <td><span className="pill blue">{u.tasks}</span></td>
                    <td>{u.docs}</td>
                    <td><StatusPill s={u.status} /></td>
                    <td>
                      <button className="btn-xs edit">Edit</button>
                      <button className="btn-xs suspend" onClick={() => toggleStatus(u.id)}>{u.status === 'Active' ? 'Suspend' : 'Restore'}</button>
                      <button className="btn-xs del" onClick={() => deleteUser(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No users found</td></tr>
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
              {[
                { label: 'MySQL Database', val: 'Online', color: '#10b981' },
                { label: 'Flask API Server', val: 'Operational', color: '#10b981' },
                { label: 'OCR Engine (Tesseract)', val: 'Running', color: '#10b981' },
                { label: 'NLP Pipeline (spaCy)', val: 'Operational', color: '#10b981' },
              ].map(s => (
                <div className="info-row" key={s.label}>
                  <span className="info-lbl">{s.label}</span>
                  <span className="pill green"><span className="dot" style={{ background: s.color }} />{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">📊 Live Metrics</div></div>
              <div style={{ padding: '16px 20px' }}>
                {[
                  { label: 'CPU Usage', val: Math.round(cpu), unit: '%', color: '#6366f1' },
                  { label: 'Memory Usage', val: Math.round(mem), unit: '%', color: '#8b5cf6' },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>{m.label}</span>
                      <span style={{ fontWeight: 700, color: m.color }}>{m.val}{m.unit}</span>
                    </div>
                    <MetricBar pct={m.val} color={m.color} />
                  </div>
                ))}
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
                <tr><th>Document Type</th><th>Total Processed</th><th>Success Rate</th><th>Avg. Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {ocrStats.map(r => (
                  <tr key={r.type}>
                    <td style={{ fontWeight: 600 }}>{r.type}</td>
                    <td>{r.processed.toLocaleString()}</td>
                    <td>
                      <div style={{ marginBottom: 4 }}>{r.success}</div>
                      <MetricBar pct={parseFloat(r.success)} color="#10b981" />
                    </td>
                    <td>{r.avgTime}</td>
                    <td><StatusPill s={r.status} /></td>
                  </tr>
                ))}
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
          {logs.map((l, i) => (
            <div className="log-item" key={i}>
              <div className="log-dot" style={{ background: l.color }} />
              <div className="log-text">{l.msg}</div>
              <div className="log-time">{l.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
