// src/pages/RecycleBin.jsx
import React from 'react';
import './RecycleBin.css';

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecycleBin({ recycleBin = [], onRestore, onPermanentDelete, onClearAll }) {
  if (recycleBin.length === 0) {
    return (
      <div className="rb-page">
        <div className="rb-empty">
          <div className="rb-empty-icon">🗑️</div>
          <div className="rb-empty-title">Recycle Bin is Empty</div>
          <div className="rb-empty-sub">Deleted tasks will appear here. You can restore them or permanently delete them.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rb-page">
      <div className="rb-info-bar">
        <div className="rb-info-text">
          🗑️ <strong>{recycleBin.length}</strong> deleted task{recycleBin.length > 1 ? 's' : ''} — restore them or permanently remove them.
        </div>
        <button className="rb-clear-btn" onClick={onClearAll}>
          🧹 Clear All
        </button>
      </div>

      <div className="rb-list panel">
        {recycleBin.map((task, i) => (
          <div key={task.id} className="rb-row">
            <div className="rb-row-left">
              <div className="rb-task-icon">🗑️</div>
              <div className="rb-task-info">
                <div className="rb-task-name">{task.title}</div>
                <div className="rb-task-meta">
                  <span className="rb-subject">{task.subject}</span>
                  <span className="rb-dot">·</span>
                  <span>Due {formatDate(task.deadline)}</span>
                  <span className="rb-dot">·</span>
                  <span className={`rb-priority rb-priority--${task.priority}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
                {task.deletedAt && (
                  <div className="rb-deleted-at">
                    Deleted {new Date(task.deletedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
            <div className="rb-row-actions">
              <button className="rb-btn rb-btn--restore" onClick={() => onRestore(task.id)}>
                ↩️ Restore
              </button>
              <button className="rb-btn rb-btn--delete" onClick={() => onPermanentDelete(task.id)}>
                🗑️ Delete Permanently
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
