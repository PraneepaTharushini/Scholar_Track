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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

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
      await api.updateTask(updated.id, {
        title: updated.title,
        description: updated.description,
        deadline: updated.deadline,
        category: updated.category,
        status: updated.status,
        importance_override: updated.importance_override
      });
      const freshList = await api.getTasks();
      setTasks(freshList);
      
      const freshSelected = freshList.find(t => t.id === updated.id) || updated;
      setSelectedTask(freshSelected);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { api } = await import('./services/api');
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      const { api } = await import('./services/api');
      await api.updateTask(id, { status: 'completed' });
      const freshList = await api.getTasks();
      setTasks(freshList);
    } catch (err) {
      console.error('Failed to mark task done:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <div className="tm-empty">
          <span style={{ fontSize: 40, display: 'inline-block', animation: 'spin 2s linear infinite' }}>⏳</span>
          <div>Loading tasks from database...</div>
        </div>
      </div>
    );
  }

  if (selectedTask) {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on path changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header 
          title={title} 
          user={user?.name || 'Student'} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onLogout={onLogout} 
          onToggleSidebar={() => setSidebarOpen(o => !o)} 
        />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { api } = await import('./services/api');
        if (api.hasToken()) {
          const res = await api.getMe();
          setUser(res.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    import('./services/api').then(({ api }) => api.clearToken());
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-root, #0a0a0f)', color: 'var(--text-primary, #ffffff)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Initializing Scholar Track...</div>
        </div>
      </div>
    );
  }

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