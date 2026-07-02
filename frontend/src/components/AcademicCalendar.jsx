import { useMemo, useState, useEffect } from 'react';
import './AcademicCalendar.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthLabel(date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function buildCalendarCells(year, monthIndex, tasks) {
  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();

  const leading = Array.from({ length: firstDayIndex }, (_, i) => ({
    key: `lead-${i}`,
    empty: true
  }));

  // Group tasks by day number for the current year and monthIndex
  const eventsByDay = {};
  tasks.forEach(task => {
    if (!task.deadline) return;
    const d = new Date(task.deadline);
    if (d.getFullYear() === year && d.getMonth() === monthIndex) {
      const day = d.getDate();
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push({
        id: task.id,
        text: task.title,
        type: task.priority || 'low'
      });
    }
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === monthIndex &&
      today.getDate() === day;
    return {
      key: `day-${day}`,
      day,
      events: eventsByDay[day] || [],
      isToday,
      empty: false
    };
  });

  const total = leading.length + days.length;
  const trailingCount = (7 - (total % 7)) % 7;

  const trailing = Array.from({ length: trailingCount }, (_, i) => ({
    key: `trail-${i}`,
    empty: true
  }));

  return [...leading, ...days, ...trailing];
}

export default function AcademicCalendar() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { api } = await import('../services/api');
        const list = await api.getTasks();
        setTasks(list);
      } catch (e) {
        console.error('Failed to load tasks for calendar:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const cells = useMemo(() => buildCalendarCells(year, monthIndex, tasks), [year, monthIndex, tasks]);
  const monthLabel = useMemo(() => getMonthLabel(currentDate), [currentDate]);

  const goPrevMonth = () =>
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goNextMonth = () =>
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 16 }}>Loading calendar events...</div>
      </div>
    );
  }

  return (
    <div className="cal-page">
      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-leg-item"><span className="cal-leg-dot high"></span> High priority</span>
        <span className="cal-leg-item"><span className="cal-leg-dot medium"></span> Medium priority</span>
        <span className="cal-leg-item"><span className="cal-leg-dot low"></span> Low priority</span>
      </div>

      <div className="panel">
        {/* Month nav */}
        <div className="cal-month-nav">
          <button type="button" onClick={goPrevMonth} aria-label="Previous month" className="cal-nav-btn">
            ‹
          </button>
          <h2 className="cal-month-title">{monthLabel}</h2>
          <button type="button" onClick={goNextMonth} aria-label="Next month" className="cal-nav-btn">
            ›
          </button>
        </div>

        {/* Week header */}
        <div className="cal-weekdays">
          {weekDays.map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {cells.map(cell => (
            <div
              key={cell.key}
              className={`cal-day ${cell.empty ? 'empty' : ''} ${cell.isToday ? 'today' : ''}`}
            >
              {!cell.empty && (
                <>
                  <span className="cal-date">{cell.day}</span>
                  {cell.events && cell.events.map(event => (
                    <span key={event.id || event.text} className={`cal-pill ${event.type}`} title={event.text}>
                      {event.text}
                    </span>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
