import React, { useState } from 'react';
import './JourneyTimeline.css';

export default function JourneyTimeline({ events = [] }) {
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(ev => {
    if (filter === 'all') return true;
    if (filter === 'ai' && ev.type === 'ai') return true;
    if (filter === 'labs' && ev.type === 'lab') return true;
    if (filter === 'medical' && ['med', 'vax', 'alert'].includes(ev.type)) return true;
    return false;
  });

  const getMarkerClass = (type) => {
    const map = {
      ai: 'marker-ai',
      lab: 'marker-lab',
      med: 'marker-med',
      alert: 'marker-alert',
      vax: 'marker-vax'
    };
    return map[type] || 'marker-lab';
  };

  if (!events.length) return <div className="timeline-container">Loading timeline...</div>;

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h3 className="timeline-title">Journey Timeline</h3>
        <div className="timeline-filters">
          <button 
            className={`timeline-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >All</button>
          <button 
            className={`timeline-filter-btn ${filter === 'ai' ? 'active' : ''}`}
            onClick={() => setFilter('ai')}
          >AI Insights</button>
          <button 
            className={`timeline-filter-btn ${filter === 'labs' ? 'active' : ''}`}
            onClick={() => setFilter('labs')}
          >Lab Reports</button>
          <button 
            className={`timeline-filter-btn ${filter === 'medical' ? 'active' : ''}`}
            onClick={() => setFilter('medical')}
          >Medical</button>
        </div>
      </div>
      
      <div className="timeline-list">
        {filteredEvents.map((ev, index) => (
          <div key={ev.id} className="timeline-event-item" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="timeline-marker-wrapper">
              <div className={`timeline-marker ${getMarkerClass(ev.type)}`}></div>
            </div>
            
            <div className="timeline-content-box">
              <div className="timeline-date">{ev.date}</div>
              <div className="timeline-item-title">
                {ev.title}
                {ev.badge && <span className="timeline-badge">{ev.badge}</span>}
              </div>
              <div className="timeline-desc">{ev.desc}</div>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
            No events found for this category.
          </div>
        )}
      </div>
    </div>
  );
}