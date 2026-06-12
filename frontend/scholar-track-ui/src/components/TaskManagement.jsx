// src/components/TaskManagement.jsx
import React, { useState } from 'react';
import './TaskManagement.css';

const TASK_ICONS = {
  assignment: '📝',
  quiz:       '❓',
  exam:       '📖',
  project:    '🗂️',
  lab:        '🧪',
  presentation:'🎤',
  report:     '📄',
  default:    '✏️',
};

function getTaskIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('quiz'))         return TASK_ICONS.quiz;
  if (t.includes('exam') || t.includes('midterm') || t.includes('final')) return TASK_ICONS.exam;
  if (t.includes('project'))      return TASK_ICONS.project;
  if (t.includes('lab'))          return TASK_ICONS.lab;
  if (t.includes('presentation')) return TASK_ICONS.presentation;
  if (t.includes('report'))       return TASK_ICONS.report;
  if (t.includes('assignment'))   return TASK_ICONS.assignment;
  return TASK_ICONS.default;
}

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Database Assignment 02',
    subject: 'DBMS',
    subjectFull: 'Database Management Systems',
    deadline: '2026-05-15',
    priority: 'high',
    status: 'pending',
    source: 'Extracted from PDF (Course Outline)',
    description: 'Design and normalize the database schema up to 3NF. Submit via LMS before the deadline.',
    ai: { urgency: 8, importance: 9, recommended: 'High' },
  },
  {
    id: 2,
    title: 'AI Group Presentation',
    subject: 'AI',
    subjectFull: 'Artificial Intelligence',
    deadline: '2026-05-18',
    priority: 'medium',
    status: 'pending',
    source: 'Manual Entry',
    description: 'Prepare a 15-minute group presentation on machine learning algorithms. Include live demo.',
    ai: { urgency: 6, importance: 7, recommended: 'Medium' },
  },
  {
    id: 3,
    title: 'SE Quiz',
    subject: 'SE',
    subjectFull: 'Software Engineering',
    deadline: '2026-05-10',
    priority: 'low',
    status: 'completed',
    source: 'Extracted from PDF (Lecture Notes)',
    description: 'In-class quiz covering software development life cycle and UML diagrams.',
    ai: { urgency: 3, importance: 4, recommended: 'Low' },
  },
  {
    id: 4,
    title: 'Physics Lab Report',
    subject: 'PHY',
    subjectFull: 'Physics',
    deadline: '2026-05-20',
    priority: 'medium',
    status: 'pending',
    source: 'Extracted from PDF (Lab Manual)',
    description: 'Write a detailed lab report on the pendulum experiment including calculations and error analysis.',
    ai: { urgency: 5, importance: 6, recommended: 'Medium' },
  },
  {
    id: 5,
    title: 'Algebra Midterm Exam',
    subject: 'MAT',
    subjectFull: 'Mathematics',
    deadline: '2026-05-22',
    priority: 'high',
    status: 'pending',
    source: 'Extracted from PDF (Timetable)',
    description: 'Midterm exam covering chapters 1-6. Study linear algebra, matrix operations, and vector spaces.',
    ai: { urgency: 9, importance: 9, recommended: 'High' },
  },
];

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', bg: '#fef2f2', text: '#b91c1c', icon: '🔴' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb', text: '#92400e', icon: '🟡' },
  low:    { label: 'Low',    color: '#10b981', bg: '#f0fdf4', text: '#065f46', icon: '🟢' },
};

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(str) {
  const diff = new Date(str) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Overdue', color: '#ef4444' };
  if (days === 0) return { label: 'Due Today', color: '#ef4444' };
  if (days === 1) return { label: 'Tomorrow', color: '#f59e0b' };
  return { label: `${days}d left`, color: days <= 5 ? '#f59e0b' : '#10b981' };
};

export default function TaskManagement({ onView }) {
  const [tasks] = useState(INITIAL_TASKS);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const subjects = ['All', ...new Set(INITIAL_TASKS.map(t => t.subjectFull))];

  const filtered = tasks.filter(t => {
    const matchSubject  = subjectFilter === 'All' || t.subjectFull === subjectFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter.toLowerCase();
    const matchStatus   = statusFilter === 'All' || t.status === statusFilter.toLowerCase();
    const matchSearch   = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchPriority && matchStatus && matchSearch;
  });

  const counts = {
    all:       tasks.length,
    pending:   tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    high:      tasks.filter(t => t.priority === 'high').length,
  };

  return (
    <div className="tm-page">
      {/* ── Summary strip ── */}
      <div className="tm-summary">
        {[
          { label: 'Total Tasks', val: counts.all,       icon: '📋', color: '#6366f1' },
          { label: 'Pending',     val: counts.pending,   icon: '⏳', color: '#f59e0b' },
          { label: 'Completed',   val: counts.completed, icon: '✅', color: '#10b981' },
          { label: 'High Priority', val: counts.high,    icon: '🚨', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="tm-sum-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <span className="tm-sum-icon">{s.icon}</span>
            <div>
              <div className="tm-sum-val" style={{ color: s.color }}>{s.val}</div>
              <div className="tm-sum-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="tm-toolbar">
        <div className="tm-search-wrap">
          <span className="tm-search-icon">🔍</span>
          <input
            className="tm-search"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tm-filters">
          <select className="tm-select" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="tm-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            {['All', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="tm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {['All', 'Pending', 'Completed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="tm-view-toggle">
          <button
            className={`tm-view-btn${viewMode === 'table' ? ' active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >☰</button>
          <button
            className={`tm-view-btn${viewMode === 'cards' ? ' active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Card view"
          >⊞</button>
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="tm-empty">
          <span style={{ fontSize: 40 }}>🔍</span>
          <div>No tasks match your filters.</div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="tm-table-wrap panel">
          <table className="tm-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Subject</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const p = PRIORITY_CONFIG[task.priority];
                const due = daysUntil(task.deadline);
                return (
                  <tr key={task.id} className={task.status === 'completed' ? 'tm-row-done' : ''}>
                    <td>
                      <div className="tm-task-cell">
                        <span className="tm-task-emoji">{getTaskIcon(task.title)}</span>
                        <div>
                          <div className="tm-task-name">{task.title}</div>
                          <div className="tm-task-src">📌 {task.source}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="tm-subject-pill">{task.subject}</span>
                    </td>
                    <td>
                      <div className="tm-date">{formatDate(task.deadline)}</div>
                      <div className="tm-due-tag" style={{ color: due.color }}>{due.label}</div>
                    </td>
                    <td>
                      <span className="tm-priority-badge" style={{ background: p.bg, color: p.text }}>
                        {p.icon} {p.label}
                      </span>
                    </td>
                    <td>
                      <span className={`tm-status ${task.status}`}>
                        {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <button className="tm-view-btn-action" onClick={() => onView(task)}>
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tm-cards">
          {filtered.map(task => {
            const p = PRIORITY_CONFIG[task.priority];
            const due = daysUntil(task.deadline);
            return (
              <div key={task.id} className={`tm-card ${task.status === 'completed' ? 'done' : ''}`}>
                <div className="tm-card-top">
                  <span className="tm-card-emoji">{getTaskIcon(task.title)}</span>
                  <span className="tm-priority-badge" style={{ background: p.bg, color: p.text }}>
                    {p.icon} {p.label}
                  </span>
                </div>
                <div className="tm-card-title">{task.title}</div>
                <div className="tm-card-desc">{task.description}</div>
                <div className="tm-card-meta">
                  <span className="tm-subject-pill">{task.subject}</span>
                  <span className="tm-due-tag" style={{ color: due.color }}>📅 {due.label}</span>
                </div>
                <div className="tm-card-footer">
                  <span className={`tm-status ${task.status}`}>
                    {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                  </span>
                  <button className="tm-view-btn-action" onClick={() => onView(task)}>View →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { INITIAL_TASKS };
