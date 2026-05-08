import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ReviewTaskPage from './pages/ReviewTaskPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TaskManagement from './components/TaskManagement';
import TaskDetail from './components/TaskDetail';
import ProfilePage from './components/ProfileSettingsPage';
import './App.css';

/* ── Page titles mapped to routes ─────────────────────────── */
const PAGE_TITLES = {
  '/':              'Dashboard',
  '/upload':        'Upload Documents',
  '/review':        'Review Tasks',
  '/tasks':         'Tasks',
  '/calendar':      'Calendar',
  '/analytics':     'Analytics',
  '/notifications': 'Notifications',
  '/system':        'System Info',
  '/settings':      'Settings',
};

/* ── Coming Soon placeholder ─────────────────────────────── */
const ComingSoon = ({ title }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: 12,
    color: 'var(--text-secondary)'
  }}>
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="16" fill="#EEF2FF"/>
      <path d="M20 28h16M28 20v16" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
    <h2 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700 }}>{title}</h2>
    <p style={{ fontSize: 14 }}>This page is coming soon.</p>
  </div>
);

/* ── Task page with detail view ──────────────────────────── */
function TasksPage() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState(null); // null = use TaskManagement's internal state

  const handleView = (task) => setSelectedTask(task);
  const handleBack = () => setSelectedTask(null);
  const handleUpdate = (updated) => {
    setSelectedTask(updated);
  };
  const handleDelete = () => setSelectedTask(null);

  if (selectedTask) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <TaskDetail
          task={selectedTask}
          onBack={handleBack}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    );
  }
  return <TaskManagement onView={handleView} />;
}

/* ── Main app layout (after login) ──────────────────────── */
const AppLayout = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Scholar Track';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header title={title} user="Sarah" />
        <main className="app-content">
          <Routes>
            <Route path="/"              element={<ComingSoon title="Dashboard" />} />
            <Route path="/upload"        element={<ComingSoon title="Upload Documents" />} />
            <Route path="/review"        element={<ReviewTaskPage />} />
            <Route path="/tasks"         element={<TasksPage />} />
            <Route path="/calendar"      element={<ComingSoon title="Calendar" />} />
            <Route path="/analytics"     element={<AnalyticsDashboard />} />
            <Route path="/notifications" element={<ComingSoon title="Notifications" />} />
            <Route path="/system"        element={<ComingSoon title="System Info" />} />
            <Route path="/settings"      element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

/* ── Root App ─────────────────────────────────────────────── */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;