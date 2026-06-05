import { useMemo, useState } from 'react';
import './AcademicCalendar.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const eventsByMonth = {
  '2026-3': {
    2: { text: 'SE Quiz', type: 'low' },
    5: { text: 'DB Assignment', type: 'high' },
    8: { text: 'AI Presentation', type: 'medium' },
    13: { text: 'SE Assignment', type: 'high' },
    18: { text: 'DB Quiz', type: 'medium' },
    23: { text: 'AI Report', type: 'high' }
  },
  '2026-4': {
    3: { text: 'CS3022 Review', type: 'medium' },
    7: { text: 'Algebra Midterm', type: 'high' },
    14: { text: 'Physics Lab', type: 'low' },
    20: { text: 'DBMS Project Due', type: 'high' },
    25: { text: 'Statistics Test', type: 'medium' },
  },
  '2026-5': {
    2: { text: 'Research Paper', type: 'high' },
    9: { text: 'Group Presentation', type: 'medium' },
    15: { text: 'NLP Assignment', type: 'low' },
    22: { text: 'Final Project', type: 'high' },
    28: { text: 'End-of-Sem Review', type: 'medium' },
  },
};

function getMonthLabel(date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function buildCalendarCells(year, monthIndex) {
  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();

  const leading = Array.from({ length: firstDayIndex }, (_, i) => ({
    key: `lead-${i}`,
    empty: true
  }));

  const monthKey = `${year}-${monthIndex + 1}`;
  const monthEvents = eventsByMonth[monthKey] || {};

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === monthIndex &&
      today.getDate() === day;
    return {
      key: `day-${day}`,
      day,
      event: monthEvents[day] || null,
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

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const cells = useMemo(() => buildCalendarCells(year, monthIndex), [year, monthIndex]);
  const monthLabel = useMemo(() => getMonthLabel(currentDate), [currentDate]);

  const goPrevMonth = () =>
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goNextMonth = () =>
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const typeLabels = { high: '⚠️ High', medium: '🔶 Medium', low: '✅ Low' };

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
                  {cell.event && (
                    <span className={`cal-pill ${cell.event.type}`}>{cell.event.text}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
