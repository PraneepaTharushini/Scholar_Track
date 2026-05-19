import React, { useState, useEffect } from 'react';
import './ReviewTaskPage.css';
import { api } from '../services/api';

const CATEGORY_OPTIONS = ['Assignment', 'Exam', 'Project', 'Scholarship', 'Quiz', 'Other'];

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

// ── Confidence Badge ─────────────────────────────────────────
const ConfidenceBadge = ({ score }) => {
  const color = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  return (
    <span className={`confidence-badge confidence-badge--${color}`}>
      <span className="confidence-badge__dot" />
      {score}% confidence
    </span>
  );
};

// ── Priority Badge ────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const level = (priority || 'Low').toLowerCase();
  return (
    <span className={`priority-pill priority-pill--${level}`}>
      {(priority || 'Low').toUpperCase()}
    </span>
  );
};

// ── Deadline year helpers ───────────────────────────────────
/**
 * Given a date string like "202601-05-19" or "20260-05-19",
 * truncate the year to at most 4 digits and return a clean value.
 * Returns '' if the input is falsy.
 */
function sanitizeDeadline(val) {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length < 1) return val;
  const year = parts[0].slice(0, 4); // cap year to 4 digits
  parts[0] = year;
  return parts.join('-');
}

// ── Task Card ────────────────────────────────────────────────
const TaskCard = ({ task, index, onChange, onRemove }) => {
  const handleChange = (field, value) => onChange(task.id, field, value);

  return (
    <div className={`task-card ${task.hasError ? 'task-card--has-error' : ''}`}>
      <div className="task-card__header">
        <div className="task-card__header-left">
          <div className="task-card__number">Task {index + 1}</div>
          <ConfidenceBadge score={task.confidence} />
        </div>
        <div className="task-card__header-right">
          <PriorityBadge priority={task.priority} />
          <button
            className="task-card__remove-btn"
            onClick={() => onRemove(task.id)}
            title="Remove task"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="task-card__body">
        <div className="task-card__row task-card__row--full">
          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}}>
                <path d="M2 3h10M2 7h7M2 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Task Title
            </label>
            <input
              type="text"
              className="form-input"
              value={task.taskTitle}
              onChange={(e) => handleChange('taskTitle', e.target.value)}
              placeholder="Enter task title..."
            />
          </div>
        </div>

        <div className="task-card__row task-card__row--two-col">
          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}}>
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Subject / Course
            </label>
            <input
              type="text"
              className="form-input"
              value={task.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="e.g. DBMS, AI, SE..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}}>
                <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1 5.5h12M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Deadline
            </label>
            <div className="form-input-wrapper">
              <input
                type="date"
                className={`form-input ${task.hasError && !task.deadline ? 'form-input--error' : ''}`}
                value={task.deadline}
                min="2000-01-01"
                max="9999-12-31"
                onChange={(e) => {
                  const raw = e.target.value;
                  const clean = sanitizeDeadline(raw);
                  // Reject if the year is still > 4 digits after sanitize (shouldn't happen, safety net)
                  if (clean) {
                    const year = parseInt(clean.split('-')[0], 10);
                    if (year < 2000 || year > 9999) return;
                  }
                  handleChange('deadline', clean);
                  // Auto-update priority whenever deadline changes
                  handleChange('priority', computePriority(clean));
                  if (clean) handleChange('hasError', false);
                }}
                onBlur={(e) => {
                  // Sanitize on blur to catch paste / autofill edge-cases
                  const clean = sanitizeDeadline(e.target.value);
                  if (clean !== task.deadline) {
                    handleChange('deadline', clean);
                  }
                }}
                onKeyDown={(e) => {
                  // Fast-path: prevent typing a 5th digit in the year portion
                  const val = task.deadline || '';
                  const year = val.split('-')[0] || '';
                  if (year.length >= 4 && /[0-9]/.test(e.key) && e.target.selectionStart < 4) {
                    e.preventDefault();
                  }
                }}
              />
              {task.hasError && !task.deadline && (
                <div className="form-error">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {task.errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="task-card__row task-card__row--two-col">
          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}}>
                <path d="M7 1l1.5 4h4.5l-3.5 2.5 1.3 4L7 9l-3.8 2.5 1.3-4L1 5h4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
              </svg>
              Priority
              <span style={{marginLeft: '6px', fontSize: '10px', opacity: 0.55, fontWeight: 400}}>(auto)</span>
            </label>
            {/* Read-only: priority is derived automatically from the deadline */}
            <div className={`form-select priority-select priority-select--${(task.priority || 'low').toLowerCase()}`}
              style={{cursor: 'default', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <span style={{width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: 'currentColor', opacity: 0.8}} />
              {(task.priority || 'low').charAt(0).toUpperCase() + (task.priority || 'low').slice(1)}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}}>
                <path d="M2 4h10l-1 8H3L2 4zM5 4l.5-3h3L9 4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              Category
            </label>
            <select
              className="form-select"
              value={task.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="task-card__row task-card__row--full">
          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}}>
                <path d="M1 4h12M1 7h8M1 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Description
            </label>
            <textarea
              className="form-textarea"
              value={task.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional notes or description for this task..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Review Task Page ─────────────────────────────────────────
const ReviewTaskPage = () => {
  const [tasks, setTasks] = useState([
    {
      id: 'new_1',
      taskTitle: '',
      subject: '',
      deadline: '',
      priority: 'low',
      category: 'Assignment',
      description: '',
      confidence: 100,
      hasError: false,
    },
  ]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [nextId, setNextId] = useState(2); // start at 2 since 1 is already used

  const handleChange = (taskId, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    );
  };

  const handleRemove = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddBlank = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: `new_${nextId}`,
        taskTitle: '',
        subject: '',
        deadline: '',
        priority: 'low',       // will be recomputed when deadline is set
        category: 'Assignment',
        description: '',
        confidence: 100,
        hasError: false,
      },
    ]);
    setNextId((n) => n + 1);
  };

  const hasErrors = tasks.some((t) => t.hasError && !t.deadline);
  const hasEmptyTitles = tasks.some((t) => !t.taskTitle || t.taskTitle.trim() === '');

  const handleConfirm = async () => {
    if (hasErrors || hasEmptyTitles) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const payload = tasks.map((t) => ({
        task_title:    t.taskTitle,
        subject:       t.subject,
        deadline:      t.deadline || null,
        // priority intentionally omitted — backend always computes it from deadline
        category:      t.category,
        description:   t.description,
        confidence:    t.confidence,
        has_error:     t.hasError,
        error_message: t.errorMessage || null,
      }));
      await api.batchSaveTasks(payload);
      setSaveSuccess(true);
      setTasks([]); // clear after saving
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save tasks. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTasks([]);
    setSaveError('');
  };

  return (
    <div className="review-page">
      {/* Info Banner */}
      <div className="review-banner">
        <div className="review-banner__icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#4F46E5" strokeWidth="1.5"/>
            <path d="M10 9v5M10 7v.5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="review-banner__text">
          Add tasks below, then click <strong>Confirm &amp; Save Tasks</strong> to store them in your task list.
        </p>
        <span className="review-banner__count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Task Cards */}
      <div className="review-tasks-grid">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onChange={handleChange}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Action Footer */}
      <div className="review-footer">
        <div className="review-footer__left">
          <button className="btn btn--outline" onClick={handleAddBlank} style={{ marginRight: '8px' }}>
            + Add Task
          </button>
          {hasErrors && (
            <div className="review-footer__warning">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 14H1L8 1z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6v3M8 11v.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Please fix required fields before saving
            </div>
          )}
          {hasEmptyTitles && !hasErrors && (
            <div className="review-footer__warning">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 14H1L8 1z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6v3M8 11v.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              All tasks must have a title
            </div>
          )}
          {saveError && (
            <div className="review-footer__warning" style={{ color: 'var(--danger, #EF4444)' }}>
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="review-footer__success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tasks saved successfully!
            </div>
          )}
        </div>
        <div className="review-footer__actions">
          <button className="btn btn--outline" onClick={handleCancel}>
            Clear All
          </button>
          <button
            className={`btn btn--primary ${hasErrors || hasEmptyTitles || tasks.length === 0 || isSaving ? 'btn--disabled' : ''}`}
            onClick={handleConfirm}
            disabled={hasErrors || hasEmptyTitles || tasks.length === 0 || isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isSaving ? 'Saving…' : 'Confirm & Save Tasks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewTaskPage;
