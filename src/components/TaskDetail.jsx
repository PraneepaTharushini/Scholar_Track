// src/components/TaskDetail.jsx
import React, { useState } from "react";

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const SUBJECTS = [
  "Database Management Systems",
  "Artificial Intelligence",
  "Software Engineering",
  "Computer Networks",
  "Operating Systems",
  "Mathematics",
  "Data Structures & Algorithms",
];

export default function TaskDetail({ task: initialTask, onBack, onUpdate, onDelete }) {
  const [task, setTask] = useState(initialTask);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    subjectFull: task.subjectFull,
    deadline: task.deadline,
    priority: task.priority,
    status: task.status,
    description: task.description,
  });

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSave = () => {
    const updated = {
      ...task,
      ...editForm,
      subject: editForm.subjectFull.split(" ").map((w) => w[0]).join("").slice(0, 4),
    };
    setTask(updated);
    if (onUpdate) onUpdate(updated);
    setShowEdit(false);
  };

  const handleMarkComplete = () => {
    const updated = { ...task, status: "completed" };
    setTask(updated);
    if (onUpdate) onUpdate(updated);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(task.id);
    onBack();
  };

  const statusClass = task.status === "completed" ? "status-completed" : "status-pending";
  const statusLabel = task.status === "completed" ? "Completed" : "Pending";

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button className="btn-back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <span className="page-title">Task Details</span>
        </div>
        <button className="avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>

      <div className="content">
        <div className="detail-card">

          {/* Header */}
          <div className="detail-header">
            <h2 className="detail-title">{task.title}</h2>
            <span className={`badge badge-${task.priority}`} style={{ flexShrink: 0 }}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
          </div>

          {/* Meta */}
          <div className="detail-meta">
            <div>
              <div className="meta-label">Subject</div>
              <div className="meta-value">{task.subjectFull}</div>
            </div>
            <div>
              <div className="meta-label">Deadline</div>
              <div className="meta-value">{formatDate(task.deadline)}</div>
            </div>
            <div>
              <div className="meta-label">Status</div>
              <div className={statusClass}>{statusLabel}</div>
            </div>
            <div>
              <div className="meta-label">Source</div>
              <div className="meta-value">{task.source}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="desc-label">Description</div>
            <p className="desc-text">{task.description}</p>
          </div>

          {/* AI Analysis */}
          <div className="ai-box">
            <div className="ai-box-title">AI Analysis</div>
            <ul>
              <li>Urgency Score: {task.ai.urgency} / 10</li>
              <li>Importance Score: {task.ai.importance} / 10</li>
              <li>Recommended Priority: {task.ai.recommended}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-btns">
            <button className="btn-edit" onClick={() => setShowEdit(true)}>Edit Task</button>
            {task.status !== "completed" && (
              <button className="btn-complete" onClick={handleMarkComplete}>Mark as Completed</button>
            )}
            <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>Delete Task</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Task</span>
              <button className="modal-close" onClick={() => setShowEdit(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" name="title" value={editForm.title} onChange={handleEditChange} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select" name="subjectFull" value={editForm.subjectFull} onChange={handleEditChange}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" name="deadline" value={editForm.deadline} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" name="priority" value={editForm.priority} onChange={handleEditChange}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={editForm.status} onChange={handleEditChange}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={editForm.description} onChange={handleEditChange} />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn-save" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Task</span>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#4b5563", marginBottom: 4 }}>
              Are you sure you want to delete <strong>{task.title}</strong>? This cannot be undone.
            </p>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-delete" style={{ padding: "9px 18px", fontSize: "0.85rem", fontFamily: "'Sora', sans-serif", fontWeight: 600, cursor: "pointer" }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
