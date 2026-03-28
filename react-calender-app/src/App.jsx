import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AcademicCalendar from './components/AcademicCalendar';
import './styles.css';

function App() {
  return (
    <div className="rc-layout">
      <Sidebar />
      <main className="rc-main">
        <div className="rc-shell">
          <Topbar />
          <AcademicCalendar />
        </div>
      </main>
    </div>
  );
}

export default App;
