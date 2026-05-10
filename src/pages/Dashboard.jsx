import './Dashboard.css';

const stats = [
  { label: 'Total Tasks', num: 47, icon: '📝', trend: '+3 this week', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', trendUp: true },
  { label: 'Completed', num: 32, icon: '✅', trend: '+5 this week', bg: 'linear-gradient(135deg,#10b981,#059669)', trendUp: true },
  { label: 'Pending', num: 11, icon: '⏳', trend: '-2 resolved', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', trendUp: false },
  { label: 'Overdue', num: 4, icon: '🚨', trend: 'Action needed', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', trendUp: false },
];

const recentTasks = [
  { title: 'DBMS Project', emoji: '🗂️', course: 'CS3042', due: 'Today 11:59 PM', priority: 'high', progress: 80 },
  { title: 'Algebra Midterm Prep', emoji: '📖', course: 'MAT2012', due: 'Tomorrow 2:00 PM', priority: 'high', progress: 55 },
  { title: 'Physics Lab Report', emoji: '🧪', course: 'PHY1012', due: 'May 13', priority: 'medium', progress: 30 },
  { title: 'AI Research Paper', emoji: '📄', course: 'CS3062', due: 'May 17', priority: 'low', progress: 10 },
  { title: 'Statistics Assignment', emoji: '📝', course: 'STA2022', due: 'May 20', priority: 'medium', progress: 0 },
];

const upcomingEvents = [
  { title: 'DB Assignment Due', time: 'Today, 11:59 PM', color: '#ef4444' },
  { title: 'Algebra Midterm', time: 'Tomorrow, 2:00 PM', color: '#f59e0b' },
  { title: 'CS Group Code Review', time: 'May 12, 3:00 PM', color: '#6366f1' },
  { title: 'Physics Lab Submission', time: 'May 13, 5:00 PM', color: '#10b981' },
];

const priorityColors = {
  high:   { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium' },
  low:    { bg: '#d1fae5', text: '#065f46', label: 'Low' },
};

export default function Dashboard() {
  const completionPct = Math.round((32 / 47) * 100);

  return (
    <div className="dash-page">
      {/* Stat cards */}
      <div className="dash-stat-grid">
        {stats.map(s => (
          <div key={s.label} className="dash-stat-card" style={{ background: s.bg }}>
            <div className="dash-stat-icon">{s.icon}</div>
            <div>
              <div className="dash-stat-num">{s.num}</div>
              <div className="dash-stat-lbl">{s.label}</div>
              <div className="dash-stat-trend">{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-main-grid">
        {/* Left: recent tasks */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📋 Recent Tasks</div>
              <span className="dash-see-all">View all →</span>
            </div>
            <div className="dash-task-list">
              {recentTasks.map((t, i) => {
                const p = priorityColors[t.priority];
                return (
                  <div key={i} className="dash-task-row">
                    <div className="dash-task-left">
                      <div className="dash-task-header">
                        <span className="dash-task-emoji">{t.emoji}</span>
                        <div className="dash-task-title">{t.title}</div>
                      </div>
                      <div className="dash-task-meta">
                        <span className="dash-task-course">{t.course}</span>
                        <span className="dash-task-due">Due: {t.due}</span>
                      </div>
                      <div className="dash-task-prog-wrap">
                        <div className="dash-task-prog-bar">
                          <div
                            className="dash-task-prog-fill"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="dash-task-pct">{t.progress}%</span>
                      </div>
                    </div>
                    <span
                      className="dash-task-badge"
                      style={{ background: p.bg, color: p.text }}
                    >
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dash-right-col">
          {/* Overall progress */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📊 Overall Progress</div>
            </div>
            <div className="dash-progress-ring-wrap">
              <svg viewBox="0 0 120 120" className="dash-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionPct / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="#1a1a3e">{completionPct}%</text>
                <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#9ca3af">completed</text>
              </svg>
              <div className="dash-ring-stats">
                <div className="dash-ring-stat"><span className="dash-ring-dot" style={{ background: '#6366f1' }}></span>32 Done</div>
                <div className="dash-ring-stat"><span className="dash-ring-dot" style={{ background: '#f59e0b' }}></span>11 In Progress</div>
                <div className="dash-ring-stat"><span className="dash-ring-dot" style={{ background: '#ef4444' }}></span>4 Overdue</div>
              </div>
            </div>
          </div>

          {/* Upcoming events */}
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
              <div className="panel-title">📅 Upcoming Deadlines</div>
            </div>
            {upcomingEvents.map((e, i) => (
              <div key={i} className="dash-event-row">
                <div className="dash-event-bar" style={{ background: e.color }} />
                <div className="dash-event-info">
                  <div className="dash-event-title">{e.title}</div>
                  <div className="dash-event-time">{e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
