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
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import SystemInfo from './pages/SystemInfo';
import AcademicCalendar from './components/AcademicCalendar';
import UploadPage from './pages/UploadPage';
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
      <TaskDetail
        task={selectedTask}
        onBack={handleBack}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
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
            <Route path="/"              element={<Dashboard />} />
            <Route path="/upload"        element={<UploadPage />} />
            <Route path="/review"        element={<ReviewTaskPage />} />
            <Route path="/tasks"         element={<TasksPage />} />
            <Route path="/calendar"      element={<AcademicCalendar />} />
            <Route path="/analytics"     element={<AnalyticsDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/system"        element={<SystemInfo />} />
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