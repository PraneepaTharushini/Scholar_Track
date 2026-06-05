import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ReviewTaskPage from './pages/ReviewTaskPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TaskManagement, { INITIAL_TASKS } from './components/TaskManagement';
import TaskDetail from './components/TaskDetail';
import ProfilePage from './components/ProfileSettingsPage';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import SystemInfo from './pages/SystemInfo';
import AcademicCalendar from './components/AcademicCalendar';
import UploadPage from './pages/UploadPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleView = (task) => setSelectedTask(task);
  const handleBack = () => setSelectedTask(null);

  // Update task in list and selected view
  const handleUpdate = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTask(updated);
  };

  // Delete task from list and go back
  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setSelectedTask(null);
  };

  // Mark a task done directly from the list
  const handleMarkDone = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  if (selectedTask) {
    // keep selected task in sync with list
    const freshTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
    return (
      <TaskDetail
        task={freshTask}
        onBack={handleBack}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    );
  }
  return (
    <TaskManagement
      tasks={tasks}
      onView={handleView}
      onMarkDone={handleMarkDone}
      onDelete={handleDelete}
    />
  );
}

/* ── Main app layout (after login) ──────────────────────── */
const AppLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Scholar Track';
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header title={title} user={user?.name || 'Student'} theme={theme} onToggleTheme={toggleTheme} />
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
function AppInner() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    import('./services/api').then(({ api }) => api.clearToken());
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;