import './Dashboard.css';
import { useTaskContext } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const priorityColors = {
  high:   { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium' },
  low:    { bg: '#d1fae5', text: '#065f46', label: 'Low' },
};

/* ── Mood engine ────────────────────────────────────────────── */
const MOODS = [
  {
    min: 0, max: 1,
    emoji: '😊', label: "You're relaxed!",
    color: '#10b981', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
    message: 'Great job keeping on top of your workload. Keep it up! 🎉',
    tip: '💡 Tip: Use this calm time to get ahead on upcoming assignments.',
  },
  {
    min: 2, max: 3,
    emoji: '🙂', label: 'On track',
    color: '#6366f1', bg: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
    message: "Your workload is manageable. You're doing well! 👍",
    tip: '💡 Tip: Focus on today\'s deadlines first, then plan the week ahead.',
  },
  {
    min: 4, max: 6,
    emoji: '😐', label: 'Getting busy',
    color: '#f59e0b', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    message: 'Things are picking up. Stay focused and tackle tasks one by one! 📋',
    tip: '💡 Tip: Break large tasks into small steps and check them off.',
  },
  {
    min: 7, max: 9,
    emoji: '😟', label: 'Feeling stressed',
    color: '#ef4444', bg: 'linear-gradient(135deg,#fee2e2,#fecaca)',
    message: "You've got a lot on your plate. Remember to breathe and prioritize! 🫁",
    tip: '💡 Tip: Tackle overdue items first. Ask for extensions if needed.',
  },
  {
    min: 10, max: Infinity,
    emoji: '😰', label: 'Overwhelmed!',
    color: '#b91c1c', bg: 'linear-gradient(135deg,#fecaca,#fca5a5)',
    message: "It's a lot right now, but you can handle it! Let's make a plan. 💪",
    tip: '💡 Tip: Talk to your advisor. Delegate where possible and rest too.',
  },
];

function getMood(overdue, pending) {
  const score = overdue * 3 + pending * 0.5;
  return MOODS.find(m => score >= m.min && score <= m.max) || MOODS[MOODS.length - 1];
}

function getTaskEmoji(title = '') {
  const t = title.toLowerCase();
  if (t.includes('quiz'))                                        return '❓';
  if (t.includes('exam') || t.includes('midterm') || t.includes('final')) return '📖';
  if (t.includes('project'))                                     return '🗂️';
  if (t.includes('lab'))                                         return '🧪';
  if (t.includes('presentation'))                                return '🎤';
  if (t.includes('report'))                                      return '📄';
  return '📝';
}

function formatDeadline(str) {
  if (!str) return 'No deadline';
  const d = new Date(str);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString())    return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ── Component ──────────────────────────────────────────────── */
export default function Dashboard() {
  const { savedTasks, stats } = useTaskContext();
  const navigate = useNavigate();

  // Stat cards — now live from context
  const statCards = [
    { label: 'Total Tasks', num: stats.total,     icon: '📝', trend: 'Total tracked',      bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { label: 'Completed',   num: stats.completed, icon: '✅', trend: 'Finished',            bg: 'linear-gradient(135deg,#10b981,#059669)' },
    { label: 'Pending',     num: stats.pending,   icon: '⏳', trend: 'Awaiting',            bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { label: 'Overdue',     num: stats.overdue,   icon: '🚨', trend: 'Immediate attention', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  ];

  const completionPct = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const mood = getMood(stats.overdue, stats.pending);

  // Recent tasks — last 5 saved tasks, newest first
  const recentTasks = [...savedTasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Upcoming deadlines — pending tasks with deadlines, soonest first
  const upcomingDeadlines = savedTasks
    .filter(t => t.status !== 'completed' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  const deadlineColors = ['#ef4444', '#f59e0b', '#6366f1', '#10b981'];

  return (
    <div className="dash-page">

      {/* ── Mood banner ── */}
      <div className="dash-mood" style={{ background: mood.bg }}>
        <div className="dash-mood-face">{mood.emoji}</div>
        <div className="dash-mood-body">
          <div className="dash-mood-label" style={{ color: mood.color }}>{mood.label}</div>
          <div className="dash-mood-message">{mood.message}</div>
          <div className="dash-mood-tip">{mood.tip}</div>
        </div>
        <div className="dash-mood-badges">
          <span className="dash-mood-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            🚨 {stats.overdue} overdue
          </span>
          <span className="dash-mood-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
            ⏳ {stats.pending} pending
          </span>
          <span className="dash-mood-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
            ✅ {stats.completed} done
          </span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stat-grid">
        {statCards.map(s => (
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

      {/* ── Main two-column ── */}
      <div className="dash-main-grid">

        {/* Left: recent tasks */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📋 Recent Tasks</div>
              <span className="dash-see-all" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
                View all →
              </span>
            </div>

            {recentTasks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No tasks yet. <span
                  style={{ color: '#6366f1', cursor: 'pointer' }}
                  onClick={() => navigate('/upload')}
                >
                  Upload a document
                </span> to get started.
              </div>
            ) : (
              <div className="dash-task-list">
                {recentTasks.map((t, i) => {
                  const p = priorityColors[t.priority] || priorityColors.low;
                  return (
                    <div key={t.id ?? i} className="dash-task-row">
                      <div className="dash-task-left">
                        <div className="dash-task-header">
                          <span className="dash-task-emoji">{getTaskEmoji(t.title)}</span>
                          <div className="dash-task-title">{t.title}</div>
                        </div>
                        <div className="dash-task-meta">
                          <span className="dash-task-course">{t.subject}</span>
                          <span className="dash-task-due">Due: {formatDeadline(t.deadline)}</span>
                        </div>
                        <div className="dash-task-prog-wrap">
                          <div className="dash-task-prog-bar">
                            <div
                              className="dash-task-prog-fill"
                              style={{ width: t.status === 'completed' ? '100%' : '0%' }}
                            />
                          </div>
                          <span className="dash-task-pct">
                            {t.status === 'completed' ? '100' : '0'}%
                          </span>
                        </div>
                      </div>
                      <span className="dash-task-badge" style={{ background: p.bg, color: p.text }}>
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="dash-right-col">

          {/* Overall progress ring */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📊 Overall Progress</div>
            </div>
            <div className="dash-progress-ring-wrap">
              <svg viewBox="0 0 120 120" className="dash-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12" />
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
                <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text-primary)">
                  {completionPct}%
                </text>
                <text x="60" y="72" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                  completed
                </text>
              </svg>
              <div className="dash-ring-stats">
                <div className="dash-ring-stat">
                  <span className="dash-ring-dot" style={{ background: '#6366f1' }} />
                  {stats.completed} Done
                </div>
                <div className="dash-ring-stat">
                  <span className="dash-ring-dot" style={{ background: '#f59e0b' }} />
                  {stats.pending} Pending
                </div>
                <div className="dash-ring-stat">
                  <span className="dash-ring-dot" style={{ background: '#ef4444' }} />
                  {stats.overdue} Overdue
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
              <div className="panel-title">📅 Upcoming Deadlines</div>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No upcoming deadlines.
              </div>
            ) : (
              upcomingDeadlines.map((t, i) => (
                <div key={t.id ?? i} className="dash-event-row">
                  <div className="dash-event-bar" style={{ background: deadlineColors[i % deadlineColors.length] }} />
                  <div className="dash-event-info">
                    <div className="dash-event-title">{t.title}</div>
                    <div className="dash-event-time">{formatDeadline(t.deadline)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}