import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import SystemInfo from './pages/SystemInfo';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Dashboard title="Upload Documents" icon="⬆️" />} />
          <Route path="/review" element={<Dashboard title="Review Tasks" icon="✅" />} />
          <Route path="/tasks" element={<Dashboard title="Tasks" icon="📝" />} />
          <Route path="/calendar" element={<Dashboard title="Calendar" icon="📅" />} />
          <Route path="/analytics" element={<Dashboard title="Analytics" icon="📈" />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/system-info" element={<SystemInfo />} />
          <Route path="/settings" element={<Dashboard title="Settings" icon="⚙️" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
