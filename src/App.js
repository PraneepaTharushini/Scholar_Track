// src/App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import TaskManagement, { INITIAL_TASKS } from "./components/TaskManagement";
import TaskDetail from "./components/TaskDetail";

export default function App() {
  const [activePage, setActivePage] = useState("Tasks");
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const handleView = (task) => {
    setSelectedTask(task);
    setActivePage("Tasks"); // keep Tasks highlighted in sidebar
  };

  const handleBack = () => {
    setSelectedTask(null);
  };

  const handleUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTask(null);
  };

  const handleNav = (page) => {
    setActivePage(page);
    setSelectedTask(null);
  };

  const renderPage = () => {
    if (selectedTask) {
      return (
        <TaskDetail
          task={selectedTask}
          onBack={handleBack}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      );
    }
    if (activePage === "Tasks") {
      return <TaskManagement tasks={tasks} onView={handleView} />;
    }
    // Placeholder for other pages (not part of scope)
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#9ca3af" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 9h6M9 12h4"/>
        </svg>
        <p style={{ fontSize: "0.95rem", fontWeight: 600 }}>{activePage}</p>
        <p style={{ fontSize: "0.8rem" }}>This page is handled by another team member.</p>
      </div>
    );
  };

  return (
    <div className="app">
      <Sidebar active={activePage} onNav={handleNav} />
      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}
