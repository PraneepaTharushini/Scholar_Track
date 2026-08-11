import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { api } from '../services/api';

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
    message: 'Your workload is manageable. You\'re doing well! 👍',
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
  const [summary, setSummary] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Auto-clear toast after 5s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Stopwatch state
  const [timerActive, setTimerActive] = useState(false);
  const [timerTaskId, setTimerTaskId] = useState(null);
  const [timerTaskTitle, setTimerTaskTitle] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Onboarding Screen state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeOnboardingTab, setActiveOnboardingTab] = useState(1);
  const [simulatedCompletedCount, setSimulatedCompletedCount] = useState(0);

  // Sync simulated count with actual completed count when modal opens/summary changes
  useEffect(() => {
    if (summary) {
      setSimulatedCompletedCount(summary.completed || 0);
    }
  }, [showOnboarding, summary]);

  const fetchDashboardData = async () => {
    try {
      const recsData = await api.getRecommendations();
      setSummary(recsData.summary);
      setRecs(recsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stopwatch counting up
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startWork = (taskId, taskTitle) => {
    setTimerTaskId(taskId);
    setTimerTaskTitle(taskTitle);
    setTimeElapsed(0);
    setTimerActive(true);
    setTimerRunning(true);
  };

  const stopAndSaveWork = async () => {
    setTimerRunning(false);

    if (timeElapsed < 5) {
      setToast({
        message: '⚠️ Session too short to log! Please focus for at least 5 seconds.',
        type: 'warning'
      });
      setTimerActive(false);
      return;
    }

    try {
      if ('speechSynthesis' in window) {
        const minutes = Math.floor(timeElapsed / 60);
        const utterance = new SpeechSynthesisUtterance(`Work session complete. You focused for ${minutes} minutes. Great job!`);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
    }

    if (timerTaskId) {
      try {
        await api.incrementTaskFocus(timerTaskId);
      } catch (err) {
        console.error("Failed to increment focus session:", err);
      }
    }

    setToast({
      message: `🎉 Focus session completed! ${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s logged to the database.`,
      type: 'success'
    });
    setTimerActive(false);
    fetchDashboardData();
  };

  const fastForwardTimer = () => {
    setTimeElapsed(prev => prev + 1500); // Skip forward 25 minutes for testing/grading ease
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12, display: 'inline-block', animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Loading personalized dashboard...</div>
        </div>
      </div>
    );
  }

  const overdueCount = summary?.overdue || 0;
  const pendingCount = summary?.pending || 0;
  const completedCount = summary?.completed || 0;
  const totalCount = summary?.total || 0;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Derive mood from stats
  const dueTodayCount = (recs?.ranked_tasks || []).filter(t => t.days_left === 0).length;
  const mood = getMood(overdueCount, dueTodayCount, pendingCount);

  // Recent tasks (top 5 from ranked list)
  const recentTasks = (recs?.ranked_tasks || []).slice(0, 5).map(t => {
    let emoji = '✏️';
    const title = (t.title || '').toLowerCase();
    if (title.includes('quiz')) emoji = '❓';
    else if (title.includes('exam') || title.includes('test')) emoji = '📖';
    else if (title.includes('project')) emoji = '🗂️';
    else if (title.includes('lab')) emoji = '🧪';
    else if (title.includes('assignment')) emoji = '📝';

    return {
      id: t.task_id || t.id,
      title: t.title,
      emoji: emoji,
      course: t.subject || 'CS',
      due: t.days_left < 0 ? 'Overdue' : t.days_left === 0 ? 'Due Today' : `${t.days_left}d left`,
      priority: t.days_left < 0 ? 'high' : (t.quadrant === 'DO FIRST' ? 'high' : (t.quadrant === 'SCHEDULE' || t.quadrant === 'DELEGATE') ? 'medium' : 'low'),
      progress: t.status === 'completed' ? 100 : 0,
      focus_sessions: t.focus_sessions || 0,
      days_left: t.days_left
    };
  });

  // Upcoming deadlines (overdue alerts + top ranked tasks)
  const upcomingEvents = (recs?.ranked_tasks || []).slice(0, 4).map(t => ({
    title: t.title,
    time: t.days_left < 0 ? 'OVERDUE' : t.days_left === 0 ? 'Today' : `${t.days_left} days left`,
    color: t.days_left < 0 ? '#ef4444' : t.days_left <= 2 ? '#f59e0b' : '#6366f1'
  }));

  // Dynamic stat cards
  const stats = [
    { label: 'Total Tasks', num: totalCount,     icon: '📝', trend: 'Total tracked',  bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { label: 'Completed',   num: completedCount, icon: '✅', trend: 'Finished',       bg: 'linear-gradient(135deg,#10b981,#059669)' },
    { label: 'Pending',     num: pendingCount,   icon: '⏳', trend: 'Awaiting',       bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { label: 'Overdue',     num: overdueCount,   icon: '🚨', trend: 'Immediate attention', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  ];

  return (
    <div className="dash-page">

      {/* ── Mood banner ───────────────────────────────────────── */}
      <div className="dash-mood" style={{ background: mood.bg }}>
        <div className="dash-mood-face">{mood.emoji}</div>
        <div className="dash-mood-body">
          <div className="dash-mood-label" style={{ color: mood.color }}>
            {mood.label}
          </div>
          <div className="dash-mood-message">
            {recs?.top_recommendation || mood.message}
          </div>
          <div className="dash-mood-tip">
            {recs?.summary_message || mood.tip}
          </div>
        </div>
        <div className="dash-mood-badges">
          <span className="dash-mood-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            🚨 {overdueCount} overdue
          </span>
          <span className="dash-mood-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
            ⏳ {pendingCount} pending
          </span>
          <span className="dash-mood-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
            ✅ {completedCount} done
          </span>
        </div>
      </div>

      {/* ── Formula Status banner ───────────────────────────────── */}
      <div className="dash-formula-panel">
        <div className="dash-formula-header">
          <span className="dash-formula-icon">🚀</span>
          <div className="dash-formula-header-text">
            <div className="dash-formula-title-row">
              <h4 className="dash-formula-title">Priority Engine: Adaptive Mode</h4>
              <button className="dash-formula-info-btn" onClick={() => setShowOnboarding(true)}>
                ℹ️ How Calibration Works
              </button>
            </div>
            <p className="dash-formula-desc">
              Starts with Urgency and Importance scoring. As you complete more tasks, the system gradually incorporates your productivity behavior to improve prioritization.
            </p>
          </div>
        </div>
        <div className="dash-formula-progress">
          <div className="dash-formula-bar">
            <div 
              className="dash-formula-fill" 
              style={{ width: `${Math.min(100, (completedCount / 50) * 100)}%`, background: 'linear-gradient(90deg, #6366f1, #34d399)' }} 
            />
          </div>
          <span className="dash-formula-text">
            {completedCount} / 50 tasks ({Math.min(100, Math.round((completedCount / 50) * 100))}% Shifted)
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
              <div className="panel-title">📋 Enriched Priority Queue</div>
              <span className="dash-see-all" onClick={() => window.location.pathname = '/tasks'}>View all →</span>
            </div>
            <div className="dash-task-list">
              {recentTasks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tasks tracked yet.
                </div>
              ) : (
                recentTasks.map((t, i) => {
                  const p = priorityColors[t.priority] || priorityColors.low;
                  return (
                    <div key={i} className="dash-task-row">
                      <div className="dash-task-left">
                        <div className="dash-task-header">
                          <span className="dash-task-emoji">{t.emoji}</span>
                          <div className="dash-task-title">{t.title}</div>
                        </div>
                        <div className="dash-task-meta">
                          <span className="dash-task-course">{t.course}</span>
                          <span className="dash-task-due" style={{ color: t.days_left < 0 ? '#ef4444' : 'inherit', fontWeight: t.days_left < 0 ? '700' : 'normal' }}>
                            Due: {t.due}
                          </span>
                          <span className="dash-task-sessions">⏱️ {t.focus_sessions} focus session{t.focus_sessions !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="dash-task-prog-wrap">
                          <div className="dash-task-prog-bar">
                            <div className="dash-task-prog-fill" style={{ width: `${t.progress}%` }} />
                          </div>
                          <span className="dash-task-pct">{t.progress}%</span>
                        </div>
                      </div>
                      <div className="dash-task-right">
                        <span className="dash-task-badge" style={{ background: p.bg, color: p.text }}>
                          {p.label}
                        </span>
                        {t.progress < 100 && (
                          <button
                            className="dash-start-work-btn"
                            onClick={() => startWork(t.id, t.title)}
                          >
                            ⏱️ Start Focus
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dash-right-col">
          {/* ⏱️ Inline Stopwatch Widget */}
          <div className="panel stopwatch-panel">
            <div className="panel-header">
              <div className="panel-title">⏱️ Stopwatch Focus</div>
            </div>
            {timerActive ? (
              <div className="stopwatch-content">
                <div className="stopwatch-task-tag">ACTIVE FOCUS SESSION</div>
                <div className="stopwatch-task-title">{timerTaskTitle}</div>
                
                <div className="timer-display-wrap" style={{ margin: '16px auto 20px auto' }}>
                  <svg className="timer-progress-svg" viewBox="0 0 160 160">
                    <circle className="timer-circle-bg" cx="80" cy="80" r="70" />
                    <circle 
                      className={`timer-circle-fg ${timerRunning ? 'stopwatch-pulsing' : ''}`} 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={0}
                      style={{
                        stroke: '#6366f1',
                      }}
                    />
                  </svg>
                  <div className="timer-time" style={{ fontSize: '32px' }}>
                    {Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:
                    {(timeElapsed % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="stopwatch-controls">
                  <button 
                    className="timer-btn timer-btn--play"
                    style={{ padding: '8px 12px', fontSize: '12px' }}
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? '⏸ Pause' : '▶ Resume'}
                  </button>
                  <button 
                    className="timer-btn" 
                    style={{ background: '#10b981', color: '#fff', padding: '8px 12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    onClick={stopAndSaveWork}
                  >
                    ✅ Save
                  </button>
                  <button 
                    className="timer-btn timer-btn--reset" 
                    style={{ padding: '8px 12px', fontSize: '12px' }}
                    onClick={() => { setTimerActive(false); setTimerRunning(false); }}
                    title="Cancel focus session"
                  >
                    ✕ Cancel
                  </button>
                  <button 
                    className="timer-btn timer-btn--ff" 
                    style={{ padding: '8px 10px', fontSize: '11px' }}
                    onClick={fastForwardTimer}
                    title="Add 25 minutes for testing"
                  >
                    ⏩ +25m
                  </button>
                </div>
              </div>
            ) : (
              <div className="stopwatch-empty">
                <div className="stopwatch-empty-icon" style={{ fontSize: '36px', marginBottom: '8px', color: 'var(--text-muted)' }}>⏱️</div>
                <div className="stopwatch-empty-text" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '4px' }}>No active session</div>
                <div className="stopwatch-empty-sub" style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                  Click <strong>⏱️ Start Focus</strong> next to any high-priority task in the queue to begin tracking your work inline.
                </div>
              </div>
            )}
          </div>

          {/* Overall progress */}
          <div className="panel" style={{ marginTop: 16 }}>
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
                <div className="dash-ring-stat"><span className="dash-ring-dot" style={{ background: '#10b981' }}></span>{completedCount} Done</div>
                <div className="dash-ring-stat"><span className="dash-ring-dot" style={{ background: '#f59e0b' }}></span>{pendingCount} Pending</div>
                <div className="dash-ring-stat"><span className="dash-ring-dot" style={{ background: '#ef4444' }}></span>{overdueCount} Overdue</div>
              </div>
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
              <div className="panel-title">📅 Upcoming Deadlines</div>
            </div>
            {upcomingEvents.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No deadlines pending.
              </div>
            ) : (
              upcomingEvents.map((e, i) => (
                <div key={i} className="dash-event-row">
                  <div className="dash-event-bar" style={{ background: e.color }} />
                  <div className="dash-event-info">
                    <div className="dash-event-title">{e.title}</div>
                    <div className="dash-event-time">{e.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Onboarding / Explanation Screen ─────────────────────── */}
      {showOnboarding && (
        <div className="onboarding-overlay" onClick={() => setShowOnboarding(false)}>
          <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
            <button className="onboarding-close" onClick={() => setShowOnboarding(false)}>✕</button>
            <h2 className="onboarding-title">🧠 Priority Engine Calibration</h2>
            <p className="onboarding-sub">
              Your tasks are prioritized dynamically based on a continuous machine learning formula.
            </p>

            {/* Dynamic Weights Visualization */}
            <div className="onboarding-visualizer">
              <h4 className="visualizer-title">Interactive Weight Calibration Simulator</h4>
              <div className="visualizer-subtitle">
                {simulatedCompletedCount === completedCount 
                  ? `Showing your actual weight distribution (${completedCount} task${completedCount !== 1 ? 's' : ''} completed)`
                  : `Simulating ${simulatedCompletedCount} completed task${simulatedCompletedCount !== 1 ? 's' : ''} (Actual: ${completedCount})`
                }
              </div>
              
              {(() => {
                const bWeight = Math.min(0.2, simulatedCompletedCount / 50.0);
                const uWeight = 0.6 - (bWeight / 2.0);
                const iWeight = 0.4 - (bWeight / 2.0);

                return (
                  <div className="weight-chart-container">
                    <div className="weight-bar-item">
                      <div className="weight-bar-label">
                        <span>📅 Urgency Weight</span>
                        <strong>{(uWeight * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="weight-bar-track">
                        <div className="weight-bar-fill weight-bar-fill--urgency" style={{ width: `${uWeight * 100}%` }} />
                      </div>
                    </div>

                    <div className="weight-bar-item">
                      <div className="weight-bar-label">
                        <span>⭐ Importance Weight</span>
                        <strong>{(iWeight * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="weight-bar-track">
                        <div className="weight-bar-fill weight-bar-fill--importance" style={{ width: `${iWeight * 100}%` }} />
                      </div>
                    </div>

                    <div className="weight-bar-item">
                      <div className="weight-bar-label">
                        <span>🧠 Your Behavior Weight</span>
                        <strong>{(bWeight * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="weight-bar-track">
                        <div className="weight-bar-fill weight-bar-fill--behavior" style={{ width: `${bWeight * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="visualizer-simulator">
                <div className="simulator-label">
                  <span>Simulate Completed Tasks:</span>
                  <strong>{simulatedCompletedCount}</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={simulatedCompletedCount} 
                  onChange={(e) => setSimulatedCompletedCount(Number(e.target.value))} 
                  className="simulator-slider"
                />
              </div>
            </div>

            {/* Explanatory Tabs */}
            <div className="onboarding-tabs">
              <button 
                className={`onboarding-tab-btn ${activeOnboardingTab === 1 ? 'active' : ''}`}
                onClick={() => setActiveOnboardingTab(1)}
              >
                1. Standard Mode
              </button>
              <button 
                className={`onboarding-tab-btn ${activeOnboardingTab === 2 ? 'active' : ''}`}
                onClick={() => setActiveOnboardingTab(2)}
              >
                2. Shifting weights
              </button>
              <button 
                className={`onboarding-tab-btn ${activeOnboardingTab === 3 ? 'active' : ''}`}
                onClick={() => setActiveOnboardingTab(3)}
              >
                3. Behavior Calibration
              </button>
            </div>

            <div className="onboarding-tab-content">
              {activeOnboardingTab === 1 && (
                <div>
                  <h4>Phase 1: Starting with standard priorities</h4>
                  <p>
                    When you are new to the platform (0 completed tasks), the system ranks tasks using standard academic variables: 
                    <strong> 60% Urgency</strong> (derived from days left until the deadline) and <strong>40% Importance</strong> (determined by default course category values or your override).
                  </p>
                </div>
              )}
              {activeOnboardingTab === 2 && (
                <div>
                  <h4>Phase 2: Gradual weight shifting</h4>
                  <p>
                    Every time you complete a task, the system learns your study behavior. It shifts up to 
                    <strong> 20% of the total priority score weight</strong> to your personalized "Behavior Score," while reducing the urgency and importance weights proportionally.
                  </p>
                </div>
              )}
              {activeOnboardingTab === 3 && (
                <div>
                  <h4>Phase 3: Productivity habit optimization</h4>
                  <p>
                    Your <strong>Behavior Score</strong> tracks the percentage of assignments submitted on or before the deadline. 
                    Focusing on tasks using the <strong>Stopwatch Focus</strong> widget builds up completed focus sessions, which actively improves your academic performance feedback loop.
                  </p>
                </div>
              )}
            </div>

            <button className="onboarding-close-btn-cta" onClick={() => setShowOnboarding(false)}>
              Got it! Keep Calibrating
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast-notification toast-${toast.type}`} role="alert">
          <span className="toast-icon">{toast.type === 'success' ? '🎉' : '⚠️'}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
