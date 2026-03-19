import React from 'react';
import './AnalyticsDashboard.css';

/* ── Data ─────────────────────────────────────────────────── */
const stats = [
  { label: 'Total Tasks', value: 18, color: 'default' },
  { label: 'Completed',   value: 9,  color: 'green'   },
  { label: 'Pending',     value: 7,  color: 'orange'  },
];
const overdue = { label: 'Overdue', value: 2, color: 'red' };

const taskStatus = [
  { label: 'Completed', value: 9,  color: '#22C55E', pct: 50 },
  { label: 'Pending',   value: 7,  color: '#F59E0B', pct: 39 },
  { label: 'Overdue',   value: 2,  color: '#EF4444', pct: 11 },
];

const priorities = [
  { label: 'High Priority',   count: 6, dot: '#EF4444' },
  { label: 'Medium Priority', count: 8, dot: '#F59E0B' },
  { label: 'Low Priority',    count: 4, dot: '#22C55E' },
];

const insights = [
  'You complete most tasks 1–2 days before the deadline.',
  'High priority tasks need earlier attention.',
  'Workload peak detected in mid-month.',
];

/* ── Component ───────────────────────────────────────────── */
const AnalyticsDashboard = () => {
  const maxPct = Math.max(...taskStatus.map((t) => t.pct));

  return (
    <div className="an-page">

      {/* ── Top stats ─────────────────────────────────── */}
      <div className="an-stats-grid">
        {/* Row 1: 3 cards */}
        <div className="an-stats-row">
          {stats.map((s) => (
            <div key={s.label} className="an-stat-card">
              <span className="an-stat-card__label">{s.label}</span>
              <span className={`an-stat-card__value an-stat-card__value--${s.color}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2: 1 card (Overdue) */}
        <div className="an-stats-row an-stats-row--single">
          <div className="an-stat-card">
            <span className="an-stat-card__label">{overdue.label}</span>
            <span className={`an-stat-card__value an-stat-card__value--${overdue.color}`}>
              {overdue.value}
            </span>
          </div>
        </div>
      </div>

      {/* ── Middle: chart + priorities ─────────────────── */}
      <div className="an-middle">

        {/* Task Status Overview */}
        <div className="an-card an-card--chart">
          <h3 className="an-card__title">Task Status Overview</h3>
          <div className="an-bar-chart">
            {taskStatus.map((t) => (
              <div key={t.label} className="an-bar-chart__col">
                <div className="an-bar-chart__track">
                  <div
                    className="an-bar-chart__fill"
                    style={{
                      height: `${(t.pct / maxPct) * 100}%`,
                      background: t.color,
                    }}
                  >
                    <span className="an-bar-chart__bar-label">{t.label}</span>
                  </div>
                </div>
                <span className="an-bar-chart__count">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="an-card an-card--priority">
          <h3 className="an-card__title">Priority Distribution</h3>
          <ul className="an-priority-list">
            {priorities.map((p) => (
              <li key={p.label} className="an-priority-list__item">
                <span className="an-priority-list__dot" style={{ background: p.dot }} />
                <span className="an-priority-list__label">
                  {p.label} – <strong>{p.count}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── AI Insights ───────────────────────────────── */}
      <div className="an-insights">
        <div className="an-insights__header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#4F46E5" strokeWidth="1.6"/>
            <path d="M9 6c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 2-2 3.5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="11" cy="13.5" r=".8" fill="#4F46E5"/>
            <path d="M3 9h3M12 3l1.5-1.5" stroke="#4F46E5" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="an-insights__title">AI Insights</span>
        </div>
        <ul className="an-insights__list">
          {insights.map((tip, i) => (
            <li key={i} className="an-insights__item">
              <span className="an-insights__bullet" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
