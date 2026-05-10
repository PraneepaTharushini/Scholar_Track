import React, { useState } from 'react';
import './AnalyticsPage.css';

/* ── Mini sparkline chart (SVG) ─────────────────────────── */
const Sparkline = ({ data, color = '#4F46E5', height = 48 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 160;
  const h = height;
  const pad = 4;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const polyline = points.join(' ');
  const areaPoints = `${pad},${h - pad} ${polyline} ${pad + (data.length - 1) * step},${h - pad}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={polyline} stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {/* last dot */}
      <circle
        cx={pad + (data.length - 1) * step}
        cy={h - pad - ((data[data.length - 1] - min) / range) * (h - pad * 2)}
        r="4"
        fill={color}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
};

/* ── Donut chart (SVG) ──────────────────────────────────── */
const DonutChart = ({ segments, size = 140 }) => {
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r - 10} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1E1B4B" fontFamily="Inter,sans-serif">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter,sans-serif">Total</text>
    </svg>
  );
};

/* ── Bar chart (SVG) ────────────────────────────────────── */
const BarChart = ({ data, color = '#4F46E5', height = 120 }) => {
  const max = Math.max(...data.map(d => d.value)) || 1;
  const barW = 28;
  const gap = 14;
  const totalW = data.length * (barW + gap) - gap;
  return (
    <svg width={totalW} height={height + 24} viewBox={`0 0 ${totalW} ${height + 24}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = (d.value / max) * height;
        const x = i * (barW + gap);
        const y = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={height} width={barW} height={0} fill="url(#barGrad)" rx="5" style={{ transition: 'none' }} />
            <rect x={x} y={y} width={barW} height={barH} fill="url(#barGrad)" rx="5" opacity="0.92" />
            <text x={x + barW / 2} y={height + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter,sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Progress Bar ───────────────────────────────────────── */
const ProgressBar = ({ label, value, max, color }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="analytics-progress-row">
      <div className="analytics-progress-meta">
        <span className="analytics-progress-label">{label}</span>
        <span className="analytics-progress-value" style={{ color }}>{value} <span>/ {max}</span></span>
      </div>
      <div className="analytics-progress-track">
        <div className="analytics-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/* ── Data ───────────────────────────────────────────────── */
const weeklyData = [12, 18, 15, 22, 19, 28, 24];
const completionData = [8, 14, 11, 18, 15, 24, 20];

const barData = [
  { label: 'Mon', value: 8 },
  { label: 'Tue', value: 14 },
  { label: 'Wed', value: 11 },
  { label: 'Thu', value: 18 },
  { label: 'Fri', value: 15 },
  { label: 'Sat', value: 24 },
  { label: 'Sun', value: 20 },
];

const donutSegments = [
  { label: 'Completed', value: 48, color: '#10B981' },
  { label: 'In Progress', value: 22, color: '#4F46E5' },
  { label: 'Overdue', value: 9, color: '#EF4444' },
  { label: 'Upcoming', value: 17, color: '#F59E0B' },
];

const subjectProgress = [
  { label: 'Database (DBMS)', value: 15, max: 18, color: '#4F46E5' },
  { label: 'Artificial Intelligence', value: 12, max: 16, color: '#7C3AED' },
  { label: 'Software Engineering', value: 10, max: 14, color: '#10B981' },
  { label: 'Computer Networks', value: 7, max: 12, color: '#F59E0B' },
  { label: 'Mathematics', value: 4, max: 10, color: '#EF4444' },
];

const recentActivity = [
  { id: 1, action: 'Task completed', detail: 'DBMS ER Diagram Assignment', time: '2 hours ago', type: 'success' },
  { id: 2, action: 'Document uploaded', detail: 'AI_Lab_Manual.pdf → 3 tasks extracted', time: '5 hours ago', type: 'info' },
  { id: 3, action: 'Deadline missed', detail: 'Networks Quiz — Chapter 4', time: '1 day ago', type: 'danger' },
  { id: 4, action: 'Task reviewed & saved', detail: 'SE Project Milestone 2', time: '2 days ago', type: 'success' },
  { id: 5, action: 'Document uploaded', detail: 'Math_Syllabus.pdf → 5 tasks extracted', time: '3 days ago', type: 'info' },
];

/* ── Stat Card ──────────────────────────────────────────── */
const StatCard = ({ label, value, change, changePositive, sparkData, color, icon }) => (
  <div className="analytics-stat-card">
    <div className="analytics-stat-card__top">
      <div className="analytics-stat-card__icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <span className={`analytics-stat-card__change ${changePositive ? 'analytics-stat-card__change--up' : 'analytics-stat-card__change--down'}`}>
        {changePositive ? '▲' : '▼'} {change}
      </span>
    </div>
    <div className="analytics-stat-card__value">{value}</div>
    <div className="analytics-stat-card__label">{label}</div>
    <div className="analytics-stat-card__spark">
      <Sparkline data={sparkData} color={color} height={44} />
    </div>
  </div>
);

/* ── Main Page ──────────────────────────────────────────── */
const AnalyticsPage = () => {
  const [period, setPeriod] = useState('week');

  return (
    <div className="analytics-page">

      {/* ── Period Tabs ─────────────────────────────────── */}
      <div className="analytics-toolbar">
        <div className="analytics-period-tabs">
          {['week', 'month', 'semester'].map(p => (
            <button
              key={p}
              className={`analytics-period-tab ${period === p ? 'analytics-period-tab--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <button className="analytics-export-btn">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1v9M4 7l3.5 3.5L11 7M2 12.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Report
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="analytics-stats-grid">
        <StatCard
          label="Total Tasks"
          value="96"
          change="12% this week"
          changePositive={true}
          sparkData={weeklyData}
          color="#4F46E5"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M5 9h8M5 6h8M5 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value="48"
          change="8% this week"
          changePositive={true}
          sparkData={completionData}
          color="#10B981"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <StatCard
          label="Overdue"
          value="9"
          change="3 from last week"
          changePositive={false}
          sparkData={[3, 5, 4, 7, 6, 9, 9]}
          color="#EF4444"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16.5 15H1.5L9 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M9 8v3M9 13v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          }
        />
        <StatCard
          label="Completion Rate"
          value="72%"
          change="5% this week"
          changePositive={true}
          sparkData={[55, 60, 58, 65, 63, 70, 72]}
          color="#7C3AED"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>

      {/* ── Middle Row: Bar Chart + Donut ───────────────── */}
      <div className="analytics-mid-row">

        {/* Weekly Activity Bar Chart */}
        <div className="analytics-card analytics-card--bar">
          <div className="analytics-card__header">
            <div>
              <div className="analytics-card__title">Weekly Task Activity</div>
              <div className="analytics-card__subtitle">Tasks submitted per day this week</div>
            </div>
            <span className="analytics-badge analytics-badge--primary">This Week</span>
          </div>
          <div className="analytics-bar-wrap">
            <BarChart data={barData} color="#4F46E5" height={120} />
          </div>
          <div className="analytics-bar-legend">
            <span className="analytics-legend-dot" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }} />
            <span>Tasks Submitted</span>
          </div>
        </div>

        {/* Donut + Legend */}
        <div className="analytics-card analytics-card--donut">
          <div className="analytics-card__header">
            <div>
              <div className="analytics-card__title">Task Status Breakdown</div>
              <div className="analytics-card__subtitle">Distribution across all tasks</div>
            </div>
          </div>
          <div className="analytics-donut-body">
            <DonutChart segments={donutSegments} size={148} />
            <div className="analytics-donut-legend">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="analytics-donut-legend-item">
                  <span className="analytics-legend-dot" style={{ background: seg.color }} />
                  <span className="analytics-donut-legend-label">{seg.label}</span>
                  <span className="analytics-donut-legend-val">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Row: Subject Progress + Activity Feed ─ */}
      <div className="analytics-bottom-row">

        {/* Subject Progress */}
        <div className="analytics-card analytics-card--progress">
          <div className="analytics-card__header">
            <div>
              <div className="analytics-card__title">Subject Progress</div>
              <div className="analytics-card__subtitle">Tasks completed per subject</div>
            </div>
          </div>
          <div className="analytics-progress-list">
            {subjectProgress.map((s) => (
              <ProgressBar key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="analytics-card analytics-card--activity">
          <div className="analytics-card__header">
            <div>
              <div className="analytics-card__title">Recent Activity</div>
              <div className="analytics-card__subtitle">Latest actions on your account</div>
            </div>
          </div>
          <div className="analytics-activity-list">
            {recentActivity.map((a) => (
              <div key={a.id} className="analytics-activity-item">
                <div className={`analytics-activity-dot analytics-activity-dot--${a.type}`} />
                <div className="analytics-activity-info">
                  <div className="analytics-activity-action">{a.action}</div>
                  <div className="analytics-activity-detail">{a.detail}</div>
                </div>
                <div className="analytics-activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
