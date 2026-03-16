import React, { useMemo, useState } from 'react';
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
  }
};

function buildCells(year, monthIndex) {
  const start = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const monthKey = `${year}-${monthIndex + 1}`;
  const monthEvents = eventsByMonth[monthKey] || {};

  const leading = Array.from({ length: start }, (_, i) => ({ key: `l-${i}`, empty: true }));
  const dateCells = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    return { key: `d-${day}`, day, event: monthEvents[day], empty: false };
  });

  const total = leading.length + dateCells.length;
  const trailingCount = (7 - (total % 7)) % 7;
  const trailing = Array.from({ length: trailingCount }, (_, i) => ({ key: `t-${i}`, empty: true }));

  return [...leading, ...dateCells, ...trailing];
}

const AcademicCalendar = () => {
  const [current, setCurrent] = useState(new Date(2026, 2, 1));
  const year = current.getFullYear();
  const month = current.getMonth();

  const cells = useMemo(() => buildCells(year, month), [year, month]);
  const label = current.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <section className="ac-wrap">
      <div className="ac-month-nav">
        <button type="button" onClick={() => setCurrent(new Date(year, month - 1, 1))}>◀</button>
        <h3>{label}</h3>
        <button type="button" onClick={() => setCurrent(new Date(year, month + 1, 1))}>▶</button>
      </div>

      <div className="ac-weekdays">
        {weekDays.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="ac-grid">
        {cells.map((cell) => (
          <div key={cell.key} className={`ac-day ${cell.empty ? 'empty' : ''}`}>
            {!cell.empty && (
              <>
                <span className="ac-date">{cell.day}</span>
                {cell.event && <span className={`ac-pill ${cell.event.type}`}>{cell.event.text}</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AcademicCalendar;