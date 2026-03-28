import { useMemo, useState } from 'react';

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

function getMonthLabel(date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function buildCalendarCells(year, monthIndex) {
  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const leading = Array.from({ length: firstDayIndex }, (_, i) => ({
    key: `lead-${i}`,
    empty: true
  }));

  const monthKey = `${year}-${monthIndex + 1}`;
  const monthEvents = eventsByMonth[monthKey] || {};

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      key: `day-${day}`,
      day,
      event: monthEvents[day] || null,
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const cells = useMemo(() => buildCalendarCells(year, monthIndex), [year, monthIndex]);
  const monthLabel = useMemo(() => getMonthLabel(currentDate), [currentDate]);

  const goPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <section className="rc-calendar-wrap">
      <div className="rc-month-nav">
        <button type="button" onClick={goPrevMonth} aria-label="Previous month">
          {'<'}
        </button>
        <h3>{monthLabel}</h3>
        <button type="button" onClick={goNextMonth} aria-label="Next month">
          {'>'}
        </button>
      </div>

      <div className="rc-weekdays">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="rc-grid">
        {cells.map((cell) => (
          <div key={cell.key} className={`rc-day ${cell.empty ? 'empty' : ''}`}>
            {!cell.empty && (
              <>
                <span className="rc-date">{cell.day}</span>
                {cell.event && <span className={`rc-pill ${cell.event.type}`}>{cell.event.text}</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
