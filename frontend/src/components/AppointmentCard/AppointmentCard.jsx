import React from 'react';
import './AppointmentCard.css';

export default function AppointmentCard({ appointment }) {
  if (!appointment) return null;

  return (
    <div className="stack-card" style={{display: 'flex', flexDirection: 'column', flex: 1}}>
      <div className="card-header-row">
        <span className="card-title-sm">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2.6" y="3.4" width="10.8" height="10" rx="2.6" stroke="#94A3B8" strokeWidth="1.4"></rect><path d="M5.6 2.2v2.4M10.4 2.2v2.4" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round"></path></svg>
          Next appointment
        </span>
        <span className="appt-badge">Upcoming</span>
      </div>
      <div className="appt-body">
        <div className="appt-date-box">
          <span style={{fontSize: '10px', fontWeight: 650, letterSpacing: '.09em', color: '#64748B'}}>{appointment.day}</span>
          <span style={{fontSize: '22px', fontWeight: 640, letterSpacing: '-0.03em'}}>{appointment.date}</span>
        </div>
        <div style={{flex: 1}}>
          <div className="appt-doctor">{appointment.doctor}</div>
          <div className="appt-specialty">{appointment.specialty}</div>
          <div className="appt-time">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.2" stroke="#94A3B8" strokeWidth="1.3"></circle><path d="M7 4.4V7l2 1.4" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round"></path></svg>
            {appointment.time}
          </div>
        </div>
      </div>
      <div className="appt-actions">
        <button style={{flex: 1, height: '36px', borderRadius: '11px', border: 'none', background: 'rgba(59,130,246,.11)', color: '#1D4ED8', fontWeight: 600, cursor: 'pointer'}}>Join call</button>
        <button style={{flex: 1, height: '36px', borderRadius: '11px', border: '1px solid rgba(15,23,42,.09)', background: '#FFFFFF', color: '#334155', fontWeight: 550, cursor: 'pointer'}}>Reschedule</button>
      </div>
    </div>
  );
}