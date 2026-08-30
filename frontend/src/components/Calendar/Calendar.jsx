import React from 'react';
import './Calendar.css';

export default function Calendar({ appointments = [] }) {
  // Static grid representation for August/September 2026 demo
  const days = [
    { day: 30, currentMonth: false }, { day: 31, currentMonth: false },
    { day: 1, currentMonth: true }, { day: 2, currentMonth: true }, { day: 3, currentMonth: true }, { day: 4, currentMonth: true }, { day: 5, currentMonth: true }, { day: 6, currentMonth: true }, { day: 7, currentMonth: true },
    { day: 8, currentMonth: true }, { day: 9, currentMonth: true }, { day: 10, currentMonth: true }, { day: 11, currentMonth: true }, { day: 12, currentMonth: true }, { day: 13, currentMonth: true }, { day: 14, currentMonth: true },
    { day: 15, currentMonth: true }, { day: 16, currentMonth: true }, { day: 17, currentMonth: true }, { day: 18, currentMonth: true }, { day: 19, currentMonth: true }, { day: 20, currentMonth: true }, { day: 21, currentMonth: true },
    { day: 22, currentMonth: true }, { day: 23, currentMonth: true }, { day: 24, currentMonth: true }, { day: 25, currentMonth: true }, { day: 26, currentMonth: true, today: true, event: true }, { day: 27, currentMonth: true }, { day: 28, currentMonth: true },
    { day: 29, currentMonth: true }, { day: 30, currentMonth: true }, { day: 1, currentMonth: false }, { day: 2, currentMonth: false }, { day: 3, currentMonth: false }, { day: 4, currentMonth: false }, { day: 5, currentMonth: false }
  ];

  return (
    <div className="calendar-card">
      <div className="cal-header-row">
        <span className="cal-month-title">August 2026</span>
        <div className="cal-nav-btns">
          <button className="cal-nav-btn">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 9L4.5 6L7.5 3" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
          <button className="cal-nav-btn">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3L7.5 6L4.5 9" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
        </div>
      </div>

      <div className="cal-grid-header">
        <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
      </div>

      <div className="cal-days-grid">
        {days.map((d, index) => (
          <div 
            key={index} 
            className={`cal-day-cell ${!d.currentMonth ? 'muted' : ''} ${d.today ? 'today' : ''} ${d.event ? 'has-event' : ''}`}
          >
            {d.day}
          </div>
        ))}
      </div>

      {appointments && appointments.length > 0 && (
        <div className="cal-events-list">
          {appointments.map((appt, idx) => (
            <div key={idx} className="cal-event-item">
              <div>
                <div className="cal-event-title">{appt.title || appt.doctor}</div>
                <div className="cal-event-time">{appt.time}</div>
              </div>
              <span className="cal-event-badge">Scheduled</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}