import React, { useState, useEffect } from 'react';
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

/* ── Task page with detail view ──────────────────────────── */

function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { api } = await import('./services/api');
        const list = await api.getTasks();
        setTasks(list);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleView = (task) => setSelectedTask(task);
  const handleBack = () => setSelectedTask(null);

  const handleUpdate = async (updated) => {
    try {
      const { api } = await import('./services/api');
      const full = updated.subjectFull ? updated.subjectFull.trim() : '';
      const abbr = updated.subject ? updated.subject.trim() : '';
      const subjectValue = (abbr && full && abbr !== full) ? `${abbr}|${full}` : (full || abbr);
      await api.updateTask(updated.id, {
        title: updated.title,
        description: updated.description,
        deadline: updated.deadline,
        category: updated.category,
        status: updated.status,
        importance_override: updated.importance_override,
        subject: subjectValue
      });
      const freshList = await api.getTasks();
      setTasks(freshList);

      const freshSelected = freshList.find(t => t.id === updated.id) || updated;
      setSelectedTask(freshSelected);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
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

  // Close sidebar on path changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar when screen grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header
          title={title}
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
        />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/review" element={<ReviewTaskPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<AcademicCalendar />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/system" element={<SystemInfo />} />
            <Route path="/settings" element={<ProfilePage user={user} onUpdateUser={onUpdateUser} />} />
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

  const handleUpdateUser = (updatedData) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem(`scholar_track_profile_${prev.id}`, JSON.stringify({
        name: newUser.name,
        email: newUser.email
      }));
      return newUser;
    });
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

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
