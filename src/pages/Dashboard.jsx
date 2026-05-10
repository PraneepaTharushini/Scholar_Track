import './Dashboard.css';

/* ── Data ───────────────────────────────────────────────────── */
const stats = [
  { label: 'Total Tasks', num: 47,  icon: '📝', trend: '+3 this week',  bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { label: 'Completed',   num: 32,  icon: '✅', trend: '+5 this week',  bg: 'linear-gradient(135deg,#10b981,#059669)' },
  { label: 'Pending',     num: 11,  icon: '⏳', trend: '-2 resolved',   bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { label: 'Overdue',     num: 4,   icon: '🚨', trend: 'Action needed', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
];

const recentTasks = [
  { title: 'DBMS Project',        emoji: '🗂️', course: 'CS3042', due: 'Today 11:59 PM',    priority: 'high',   progress: 80 },
  { title: 'Algebra Midterm Prep',emoji: '📖', course: 'MAT2012', due: 'Tomorrow 2:00 PM',  priority: 'high',   progress: 55 },
  { title: 'Physics Lab Report',  emoji: '🧪', course: 'PHY1012', due: 'May 13',            priority: 'medium', progress: 30 },
  { title: 'AI Research Paper',   emoji: '📄', course: 'CS3062', due: 'May 17',             priority: 'low',    progress: 10 },
  { title: 'Statistics Assignment',emoji:'📝', course: 'STA2022', due: 'May 20',            priority: 'medium', progress: 0  },
];

const upcomingEvents = [
  { title: 'DB Assignment Due',    time: 'Today, 11:59 PM',  color: '#ef4444' },
  { title: 'Algebra Midterm',      time: 'Tomorrow, 2:00 PM',color: '#f59e0b' },
  { title: 'CS Group Code Review', time: 'May 12, 3:00 PM',  color: '#6366f1' },
  { title: 'Physics Lab Submission', time: 'May 13, 5:00 PM',color: '#10b981' },
];

const priorityColors = {
  high:   { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium' },
  low:    { bg: '#d1fae5', text: '#065f46', label: 'Low' },
};

/* ── Mood engine ────────────────────────────────────────────── */
const MOODS = [
  {
    min: 0, max: 1,
    emoji: '😊', label: 'You\'re relaxed!',
    color: '#10b981', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
    message: 'Great job keeping on top of your workload. Keep it up! 🎉',
    tip: '💡 Tip: Use this calm time to get ahead on upcoming assignments.',
  },
  {
    min: 2, max: 3,
    emoji: '🙂', label: 'On track',
    color: '#6366f1', bg: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
    message: 'Your workload is manageable. You\'re doing well, Sarah! 👍',
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
    message: 'You\'ve got a lot on your plate. Remember to breathe and prioritize! 🫁',
    tip: '💡 Tip: Tackle overdue items first. Ask for extensions if needed.',
  },
  {
    min: 10, max: Infinity,
    emoji: '😰', label: 'Overwhelmed!',
    color: '#b91c1c', bg: 'linear-gradient(135deg,#fecaca,#fca5a5)',
    message: 'It\'s a lot right now, but you can handle it! Let\'s make a plan. 💪',
    tip: '💡 Tip: Talk to your advisor. Delegate where possible and rest too.',
  },
];

function getMood(overdue, dueToday, pending) {
  const score = overdue * 3 + dueToday * 2 + pending * 0.5;
  return MOODS.find(m => score >= m.min && score <= m.max) || MOODS[MOODS.length - 1];
}

/* ── Component ──────────────────────────────────────────────── */
export default function Dashboard() {
  const completionPct = Math.round((32 / 47) * 100);

  // Derive mood from stats (overdue=4, dueToday=1 (DBMS), pending=11)
  const mood = getMood(4, 1, 11);

  return (
    <div className="dash-page">

      {/* ── Mood banner ───────────────────────────────────────── */}
      <div className="dash-mood" style={{ background: mood.bg }}>
        <div className="dash-mood-face">{mood.emoji}</div>
        <div className="dash-mood-body">
          <div className="dash-mood-label" style={{ color: mood.color }}>
            {mood.label}
          </div>
          <div className="dash-mood-message">{mood.message}</div>
          <div className="dash-mood-tip">{mood.tip}</div>
        </div>
        <div className="dash-mood-badges">
          <span className="dash-mood-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            🚨 4 overdue
          </span>
          <span className="dash-mood-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
            ⏳ 11 pending
          </span>
          <span className="dash-mood-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
            ✅ 32 done
          </span>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
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

      {/* ── Main two-column ────────────────────────────────────── */}
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
                          <div className="dash-task-prog-fill" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="dash-task-pct">{t.progress}%</span>
                      </div>
                    </div>
                    <span className="dash-task-badge" style={{ background: p.bg, color: p.text }}>
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
                <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text-primary)">{completionPct}%</text>
                <text x="60" y="72" textAnchor="middle" fontSize="10" fill="var(--text-muted)">completed</text>
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
