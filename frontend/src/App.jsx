import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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

const AUTH_PATHS = {
  login: '/login',
  register: '/register',
  forgot: '/forgot-password',
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Scholar Track';
  const { theme, toggleTheme } = useTheme();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header
          title={title}
          user={user?.name || 'Student'}
          role={role}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
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

const RequireAuth = ({ user, children }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const PublicAuthPage = ({ user, mode, onLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (nextUser) => {
    onLogin(nextUser);
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const handleModeChange = (nextMode) => {
    navigate(AUTH_PATHS[nextMode] || AUTH_PATHS.login);
  };

  return <LoginPage initialMode={mode} onModeChange={handleModeChange} onLogin={handleLogin} />;
};

function AppInner() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    import('./services/api').then(async ({ api }) => {
      if (!api.hasValidToken()) {
        api.clearToken();
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

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('scholar-track-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('scholar-track-auth-expired', handleAuthExpired);
  }, [navigate]);

  const handleLogout = () => {
    import('./services/api').then(({ api }) => api.clearToken());
    setUser(null);
    navigate('/login', { replace: true });
  };

  if (checkingSession) {
    return <div className="app-loading">Loading Scholar Track...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<PublicAuthPage user={user} mode="login" onLogin={setUser} />} />
      <Route path="/register" element={<PublicAuthPage user={user} mode="register" onLogin={setUser} />} />
      <Route path="/forgot-password" element={<PublicAuthPage user={user} mode="forgot" onLogin={setUser} />} />
      <Route
        path="/*"
        element={(
          <RequireAuth user={user}>
            <AppLayout user={user} onLogout={handleLogout} />
          </RequireAuth>
        )}
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
