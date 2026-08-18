// src/components/TaskDetail.jsx
import React, { useState } from 'react';
import './TaskDetail.css';

/**
 * Mirror of the backend compute_priority logic.
 * Returns 'critical' | 'high' | 'medium' | 'low' based on days until deadline.
 */
function computePriority(deadlineStr) {
  if (!deadlineStr) return 'low';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadlineStr);
  dl.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((dl - today) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 1)  return 'critical';
  if (daysLeft === 2) return 'high';
  if (daysLeft === 3) return 'medium';
  return 'low';
}

const TASK_ICONS = {
  assignment:   '📝',
  quiz:         '❓',
  exam:         '📖',
  project:      '🗂️',
  lab:          '🧪',
  presentation: '🎤',
  report:       '📄',
  default:      '✏️',
};

function getTaskIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('quiz'))                                       return TASK_ICONS.quiz;
  if (t.includes('exam') || t.includes('midterm') || t.includes('final')) return TASK_ICONS.exam;
  if (t.includes('project'))                                    return TASK_ICONS.project;
  if (t.includes('lab'))                                        return TASK_ICONS.lab;
  if (t.includes('presentation'))                               return TASK_ICONS.presentation;
  if (t.includes('report'))                                     return TASK_ICONS.report;
  if (t.includes('assignment'))                                 return TASK_ICONS.assignment;
  return TASK_ICONS.default;
}

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(str) {
  const diff = new Date(str) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, cls: 'overdue' };
  if (days === 0) return { label: 'Due today',  cls: 'soon' };
  if (days === 1) return { label: 'Due tomorrow', cls: 'soon' };
  return { label: `${days} days left`, cls: '' };
}

const PRIORITY_CONFIG = {
  critical: { label: '🔴 Critical', cls: 'critical' },
  high:     { label: '🔴 High',     cls: 'high' },
  medium:   { label: '🟡 Medium',   cls: 'medium' },
  low:      { label: '🟢 Low',      cls: 'low' },
};

const SUBJECTS = [
  'Database Management Systems',
  'Artificial Intelligence',
  'Software Engineering',
  'Computer Networks',
  'Operating Systems',
  'Mathematics',
  'Physics',
  'Data Structures & Algorithms',
];

export default function TaskDetail({ task: initialTask, onBack, onUpdate, onDelete }) {
  const [task, setTask]                       = useState(initialTask);
  const [showEdit, setShowEdit]               = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm]               = useState({
    title:       task.title,
    subjectFull: task.subjectFull,
    deadline:    task.deadline,
    priority:    task.priority,
    status:      task.status,
    description: task.description,
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-recompute priority whenever deadline changes
      if (name === 'deadline') {
        updated.priority = computePriority(value);
      }
      return updated;
    });
  };

  const handleEditSave = () => {
    const full = editForm.subjectFull ? editForm.subjectFull.trim() : '';
    const abbr = full.length <= 4 ? full.toUpperCase() : full.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase();
    const updated = {
      ...task,
      ...editForm,
      subject: abbr,
    };
    setTask(updated);
    if (onUpdate) onUpdate(updated);
    setShowEdit(false);
  };

  const handleMarkComplete = () => {
    const updated = { ...task, status: 'completed' };
    setTask(updated);
    if (onUpdate) onUpdate(updated);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(task.id);
    onBack();
  };

  const p    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const due  = daysUntil(task.deadline);
  const icon = getTaskIcon(task.title);

  const urgencyPct    = (task.ai?.urgency    || 0) * 10;
  const importancePct = (task.ai?.importance || 0) * 10;

  const urgencyColor =
    urgencyPct >= 80 ? '#ef4444' : urgencyPct >= 50 ? '#f59e0b' : '#10b981';
  const importanceColor =
    importancePct >= 80 ? '#ef4444' : importancePct >= 50 ? '#f59e0b' : '#10b981';

  const recPriority = task.ai?.recommended || 'Low';
  const recColors = {
    High:   { bg: '#fee2e2', color: '#b91c1c' },
    Medium: { bg: '#fef3c7', color: '#92400e' },
    Low:    { bg: '#d1fae5', color: '#065f46' },
  };
  const rec = recColors[recPriority] || recColors.Low;

  return (
    <div className="td-page">
      {/* ── Back / breadcrumb ── */}
      <div className="td-back-row">
        <button className="td-back-btn" onClick={onBack}>
          ← Back to Tasks
        </button>
        <div className="td-breadcrumb">
          <span>Tasks</span>
          <span className="td-breadcrumb-sep">›</span>
          <span className="td-breadcrumb-current">{task.title}</span>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="td-hero">
        {/* Top section: icon + title + badges + actions */}
        <div className="td-hero-top">
          <div className="td-task-icon-wrap">{icon}</div>
          <div className="td-hero-info">
            <div className="td-task-title">{task.title}</div>
            <div className="td-badges">
              <span className={`td-priority-badge ${p.cls}`}>{p.label}</span>
              <span className={`td-status-badge ${task.status}`}>
                {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
              </span>
              <span className="td-source-tag">📌 {task.source}</span>
            </div>
          </div>
          <div className="td-hero-actions">
            <button className="td-btn td-btn-edit" onClick={() => setShowEdit(true)}>
              ✏️ Edit
            </button>
            {task.status !== 'completed' && (
              <button className="td-btn td-btn-complete" onClick={handleMarkComplete}>
                ✅ Mark Done
              </button>
            )}
            <button className="td-btn td-btn-delete" onClick={() => setShowDeleteConfirm(true)}>
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Meta strip */}
        <div className="td-meta-grid">
          <div className="td-meta-cell">
            <div className="td-meta-label">Subject</div>
            <div className="td-meta-value">{task.subjectFull}</div>
          </div>
          <div className="td-meta-cell">
            <div className="td-meta-label">Deadline</div>
            <div className={`td-meta-value ${due.cls}`}>{formatDate(task.deadline)}</div>
          </div>
          <div className="td-meta-cell">
            <div className="td-meta-label">Time Remaining</div>
            <div className={`td-meta-value ${due.cls}`}>{due.label}</div>
          </div>
          <div className="td-meta-cell">
            <div className="td-meta-label">Subject Code</div>
            <div className="td-meta-value">{task.subject}</div>
          </div>
        </div>
      </div>

      {/* ── Body: description + AI analysis ── */}
      <div className="td-body-grid">
        {/* Description */}
        <div className="td-card">
          <div className="td-card-header">📄 Description</div>
          <div className="td-card-body">
            <p className="td-desc-text">{task.description}</p>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="td-card">
          <div className="td-card-header">🤖 AI Analysis</div>
          <div className="td-card-body">
            {/* Urgency */}
            <div className="td-ai-row">
              <div>
                <div className="td-ai-label">Urgency Score</div>
                <div className="td-ai-bar-wrap">
                  <div className="td-ai-bar">
                    <div
                      className="td-ai-bar-fill"
                      style={{ width: `${urgencyPct}%`, background: urgencyColor }}
                    />
                  </div>
                  <span className="td-ai-score">{task.ai?.urgency ?? '—'}/10</span>
                </div>
              </div>
            </div>

            {/* Importance */}
            <div className="td-ai-row">
              <div>
                <div className="td-ai-label">Importance Score</div>
                <div className="td-ai-bar-wrap">
                  <div className="td-ai-bar">
                    <div
                      className="td-ai-bar-fill"
                      style={{ width: `${importancePct}%`, background: importanceColor }}
                    />
                  </div>
                  <span className="td-ai-score">{task.ai?.importance ?? '—'}/10</span>
                </div>
              </div>
            </div>

            {/* Recommended priority */}
            <div className="td-ai-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div className="td-ai-label">Recommended Priority</div>
              <span
                className="td-recommended-badge"
                style={{ background: rec.bg, color: rec.color }}
              >
                {recPriority} Priority
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit modal ── */}
      {showEdit && (
        <div className="td-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-header">
              <span className="td-modal-title">✏️ Edit Task</span>
              <button className="td-modal-close" onClick={() => setShowEdit(false)}>✕</button>
            </div>
            <div className="td-modal-body">
              <div className="td-field">
                <label className="td-field-label">Title</label>
                <input
                  className="td-field-input"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Task title"
                />
              </div>
              <div className="td-form-row">
                <div className="td-field">
                  <label className="td-field-label">Subject</label>
                  <input
                    className="td-field-input"
                    name="subjectFull"
                    value={editForm.subjectFull}
                    onChange={handleEditChange}
                    placeholder="e.g. Database Systems, Math"
                  />
                </div>
                <div className="td-field">
                  <label className="td-field-label">Deadline</label>
                  <input className="td-field-input" type="date" name="deadline" value={editForm.deadline} onChange={handleEditChange} />
                </div>
                <div className="td-field">
                  <label className="td-field-label">
                    Priority
                    <span style={{marginLeft: '6px', fontSize: '10px', opacity: 0.55, fontWeight: 400}}>(auto)</span>
                  </label>
                  {/* Read-only: always computed from deadline */}
                  <div className="td-field-select" style={{cursor: 'default', userSelect: 'none'}}>
                    {PRIORITY_CONFIG[editForm.priority]?.label || '🟢 Low'}
                  </div>
                </div>
                <div className="td-field">
                  <label className="td-field-label">Status</label>
                  <select className="td-field-select" name="status" value={editForm.status} onChange={handleEditChange}>
                    <option value="pending">⏳ Pending</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
              </div>
              <div className="td-field">
                <label className="td-field-label">Description</label>
                <textarea
                  className="td-field-textarea"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Describe the task…"
                />
              </div>
            </div>
            <div className="td-modal-footer">
              <button className="td-btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="td-btn-save" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {showDeleteConfirm && (
        <div className="td-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="td-modal td-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="td-modal-header">
              <span className="td-modal-title">Delete Task</span>
              <button className="td-modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="td-modal-body">
              <div className="td-delete-warning">
                <span className="td-delete-warning-icon">⚠️</span>
                <div>
                  <div className="td-delete-warning-title">This action cannot be undone</div>
                  <div className="td-delete-warning-sub">
                    Are you sure you want to permanently delete <strong>"{task.title}"</strong>?
                  </div>
                </div>
              </div>
            </div>
            <div className="td-modal-footer">
              <button className="td-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="td-btn-confirm-delete" onClick={handleDelete}>Delete Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
