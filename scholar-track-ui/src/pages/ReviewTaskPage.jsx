import React, { useState } from 'react';
import './ReviewTaskPage.css';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const CATEGORY_OPTIONS = ['Assignment', 'Exam', 'Project', 'Scholarship', 'Quiz', 'Other'];

const initialTasks = [
  {
    id: 1,
    taskTitle: '',
    subject: '',
    deadline: '',
    priority: 'Low',
    category: 'Project',
    description: '',
    confidence: 94,
    hasError: false,
  },
  {
    id: 2,
    taskTitle: '',
    subject: '',
    deadline: '',
    priority: 'Low',
    category: 'Project',
    description: '',
    confidence: 61,
    hasError: true,
    errorMessage: 'Deadline not detected',
  },
];

const ConfidenceBadge = ({ score }) => {
  const color = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  return (
    <span className={`confidence-badge confidence-badge--${color}`}>
      <span className="confidence-badge__dot" />
      {score}% confidence
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const map = {
    Low: 'low',
    Medium: 'medium',
    High: 'high',
    Critical: 'critical',
  };
  return <span className={`priority-pill priority-pill--${map[priority] || 'medium'}`}>{priority}</span>;
};

const TaskCard = ({ task, index, onChange, onRemove }) => {
  const handleChange = (field, value) => {
    onChange(task.id, field, value);
  };

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
                onChange={(e) => {
                  handleChange('deadline', e.target.value);
                  if (e.target.value) handleChange('hasError', false);
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
                <path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              Priority
            </label>
            <select
              className="form-select"
              value={task.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
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

const ReviewTaskPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (taskId, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    );
  };

  const handleRemove = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const hasErrors = tasks.some((t) => t.hasError && !t.deadline);

  const handleConfirm = () => {
    if (hasErrors) return;
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCancel = () => {
    setTasks(initialTasks);
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
          The system extracted the following tasks using <strong>OCR + NLP</strong>. Please review and edit if needed before saving to your task list.
        </p>
        <span className="review-banner__count">{tasks.length} task{tasks.length !== 1 ? 's' : ''} extracted</span>
      </div>

      {/* Source Document Info */}
      <div className="review-source">
        <div className="review-source__item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span>Source: <strong>DBMS_Syllabus.pdf</strong></span>
        </div>
        <div className="review-source__item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Processed <strong>2 minutes ago</strong></span>
        </div>
        <div className="review-source__item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{color: 'var(--success)'}}>OCR completed</span>
        </div>
      </div>

      {/* Task Cards */}
      {tasks.length > 0 ? (
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
      ) : (
        <div className="review-empty">
          <div className="review-empty__icon">🗂️</div>
          <p>All tasks removed. No tasks to review.</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="review-footer">
        <div className="review-footer__left">
          {hasErrors && (
            <div className="review-footer__warning">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 14H1L8 1z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6v3M8 11v.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Please fix required fields before saving
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
            Cancel
          </button>
          <button
            className={`btn btn--primary ${hasErrors || tasks.length === 0 ? 'btn--disabled' : ''}`}
            onClick={handleConfirm}
            disabled={hasErrors || tasks.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Confirm & Save Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewTaskPage;
