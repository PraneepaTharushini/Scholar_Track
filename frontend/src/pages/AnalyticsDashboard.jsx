import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';
import { api } from '../services/api';

// ── Loading skeleton ─────────────────────────────────────────
const Skeleton = ({ width = '100%', height = '1.5rem', style = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius: '6px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }}
  />
);

// ── Analytics Dashboard ──────────────────────────────────────
const AnalyticsDashboard = () => {
  const [summary, setSummary]       = useState(null);
  const [taskStatus, setTaskStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [insights, setInsights]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getAnalyticsAll();
        setSummary(data.summary);
        setTaskStatus(data.status || []);
        setCategories(data.categories || []);
        setInsights(data.insights || []);
      } catch (err) {
        setError(err.message || 'Failed to load analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const maxPct = taskStatus.length > 0 ? Math.max(...taskStatus.map((t) => t.pct)) : 1;

  // ── Stats config ─────────────────────────────────────────
  const statCards = summary
    ? [
        { label: 'Total Tasks', value: summary.total,     color: 'default' },
        { label: 'Completed',   value: summary.completed, color: 'green'   },
        { label: 'Pending',     value: summary.pending,   color: 'orange'  },
        { label: 'Overdue',     value: summary.overdue,   color: 'red'     },
      ]
    : [];

  if (error) {
    return (
      <div className="an-page">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '1.5rem', borderRadius: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#EF4444',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 6v5M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
          <button
            onClick={() => window.location.reload()}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="an-page">
      {/* ── Top stats ──────────────────────────────────────────── */}
      <div className="an-stats-grid">
        <div className="an-stats-row">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="an-stat-card">
                  <Skeleton width="60%" height="0.85rem" style={{ marginBottom: '0.5rem' }} />
                  <Skeleton width="40%" height="2rem" />
                </div>
              ))
            : statCards.slice(0, 3).map((s) => (
                <div key={s.label} className="an-stat-card">
                  <span className="an-stat-card__label">{s.label}</span>
                  <span className={`an-stat-card__value an-stat-card__value--${s.color}`}>
                    {s.value}
                  </span>
                </div>
              ))}
        </div>

        {/* Overdue row */}
        <div className="an-stats-row an-stats-row--single">
          {loading
            ? (
              <div className="an-stat-card">
                <Skeleton width="50%" height="0.85rem" style={{ marginBottom: '0.5rem' }} />
                <Skeleton width="30%" height="2rem" />
              </div>
            )
            : statCards.slice(3).map((s) => (
                <div key={s.label} className="an-stat-card">
                  <span className="an-stat-card__label">{s.label}</span>
                  <span className={`an-stat-card__value an-stat-card__value--${s.color}`}>
                    {s.value}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* ── Middle: chart + categories ─────────────────────────── */}
      <div className="an-middle">

        {/* Task Status Overview */}
        <div className="an-card an-card--chart">
          <h3 className="an-card__title">Task Status Overview</h3>
          {loading ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '120px' }}>
              {[70, 45, 20].map((h, i) => (
                <Skeleton key={i} width="60px" height={`${h}%`} style={{ alignSelf: 'flex-end' }} />
              ))}
            </div>
          ) : taskStatus.length === 0 ? (
            <p style={{ color: 'var(--text-muted, #9CA3AF)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No task data yet.
            </p>
          ) : (
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
          )}
        </div>

        {/* Category Distribution */}
        <div className="an-card an-card--priority">
          <h3 className="an-card__title">Category Distribution</h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="1.1rem" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p style={{ color: 'var(--text-muted, #9CA3AF)', fontSize: '0.875rem' }}>
              No categories yet.
            </p>
          ) : (
            <ul className="an-priority-list">
              {categories.map((c, i) => {
                const dotColors = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                return (
                  <li key={c.label} className="an-priority-list__item">
                    <span className="an-priority-list__dot" style={{ background: dotColors[i % dotColors.length] }} />
                    <span className="an-priority-list__label">
                      {c.label} — <strong>{c.count}</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>

      {/* ── AI Insights ──────────────────────────────────────────── */}
      <div className="an-insights">
        <div className="an-insights__header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#4F46E5" strokeWidth="1.6"/>
            <path d="M9 6c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 2-2 3.5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="11" cy="13.5" r=".8" fill="#4F46E5"/>
            <path d="M3 9h3M12 3l1.5-1.5" stroke="#4F46E5" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="an-insights__title">Insights</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.5rem 0' }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height="1rem" />)}
          </div>
        ) : (
          <ul className="an-insights__list">
            {insights.map((tip, i) => (
              <li key={i} className="an-insights__item">
                <span className="an-insights__bullet" />
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
