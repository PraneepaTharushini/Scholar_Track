import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/upload': 'Upload Documents',
  '/review': 'Review Tasks',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/system': 'System Info',
  '/settings': 'Settings',
};

function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleUpdate = (updated) => {
    setTasks((prev) => prev.map((task) => task.id === updated.id ? updated : task));
    setSelectedTask(updated);
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setSelectedTask(null);
  };

  if (selectedTask) {
    const freshTask = tasks.find((task) => task.id === selectedTask.id) || selectedTask;
    return <TaskDetail task={freshTask} onBack={() => setSelectedTask(null)} onUpdate={handleUpdate} onDelete={handleDelete} />;
  }

  return (
    <TaskManagement
      tasks={tasks}
      onView={setSelectedTask}
      onMarkDone={(id) => setTasks((prev) => prev.map((task) => task.id === id ? { ...task, status: 'completed' } : task))}
      onDelete={handleDelete}
    />
  );
}

const AppLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Scholar Track';
  const { theme, toggleTheme } = useTheme();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';

  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <div className="app-main">
        <Header title={title} user={user?.name || 'Student'} role={role} theme={theme} onToggleTheme={toggleTheme} onLogout={onLogout} />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={!isAdmin ? <UploadPage /> : <Navigate to="/" replace />} />
            <Route path="/review" element={!isAdmin ? <ReviewTaskPage /> : <Navigate to="/" replace />} />
            <Route path="/tasks" element={!isAdmin ? <TasksPage /> : <Navigate to="/" replace />} />
            <Route path="/calendar" element={!isAdmin ? <AcademicCalendar /> : <Navigate to="/" replace />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/system" element={isAdmin ? <SystemInfo /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function AppInner() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    import('./services/api').then(async ({ api }) => {
      if (!api.hasToken()) {
        setCheckingSession(false);
        return;
      }

      try {
        const result = await api.getMe();
        setUser(result.user);
      } catch {
        api.clearToken();
      } finally {
        setCheckingSession(false);
      }
    });
  }, []);

  const handleLogout = () => {
    import('./services/api').then(({ api }) => api.clearToken());
    setUser(null);
  };

  if (checkingSession) {
    return <div className="app-loading">Loading Scholar Track...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
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
