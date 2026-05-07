// src/components/TaskManagement.jsx
import React, { useState } from "react";

const INITIAL_TASKS = [
  {
    id: 1,
    title: "Database Assignment 02",
    subject: "DBMS",
    subjectFull: "Database Management Systems",
    deadline: "2026-03-10",
    priority: "high",
    status: "pending",
    source: "Extracted from PDF (Course Outline)",
    description:
      "Design and normalize the database schema up to 3NF. Submit via LMS before the deadline.",
    ai: { urgency: 8, importance: 9, recommended: "High" },
  },
  {
    id: 2,
    title: "AI Group Presentation",
    subject: "AI",
    subjectFull: "Artificial Intelligence",
    deadline: "2026-03-14",
    priority: "medium",
    status: "pending",
    source: "Manual Entry",
    description:
      "Prepare a 15-minute group presentation on machine learning algorithms. Include live demo.",
    ai: { urgency: 6, importance: 7, recommended: "Medium" },
  },
  {
    id: 3,
    title: "SE Quiz",
    subject: "SE",
    subjectFull: "Software Engineering",
    deadline: "2026-03-05",
    priority: "low",
    status: "completed",
    source: "Extracted from PDF (Lecture Notes)",
    description:
      "In-class quiz covering software development life cycle and UML diagrams.",
    ai: { urgency: 3, importance: 4, recommended: "Low" },
  },
];

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TaskManagement({ onView }) {
  const [tasks] = useState(INITIAL_TASKS);
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [statusFilter, setStatusFilter] = useState("Status");

  const subjects = ["All Subjects", ...new Set(INITIAL_TASKS.map((t) => t.subjectFull))];
  const priorities = ["All Priorities", "High", "Medium", "Low"];
  const statuses = ["Status", "Pending", "Completed"];

  const filtered = tasks.filter((t) => {
    const s = subjectFilter === "All Subjects" || t.subjectFull === subjectFilter;
    const p = priorityFilter === "All Priorities" || t.priority === priorityFilter.toLowerCase();
    const st =
      statusFilter === "Status" ||
      t.status === statusFilter.toLowerCase();
    return s && p && st;
  });

  return (
    <>
      <div className="topbar">
        <span className="page-title">Task Management</span>
        <button className="avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>

      <div className="content">
        {/* Filters */}
        <div className="filters">
          <select className="filter-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            {priorities.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="task-table-wrap">
          <table className="task-table">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "32px" }}>
                    No tasks match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr key={task.id} className={task.status === "completed" ? "completed" : ""}>
                    <td style={{ fontWeight: 500 }}>{task.title}</td>
                    <td>{task.subject}</td>
                    <td>{formatDate(task.deadline)}</td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-${task.status}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-view" onClick={() => onView(task)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export { INITIAL_TASKS };
