import React, { useState } from 'react';
import './MedicationCard.css';

export default function MedicationCard({ medications, onToggle }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggleClick = async (id) => {
    setLoadingId(id);
    await onToggle(id);
    setLoadingId(null);
  };

  if (!medications || medications.length === 0) return null;

  return (
    <div className="stack-card stack-card-purple">
      <div className="card-header-row">
        <span className="card-title-sm med-title">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2.4" y="5.6" width="11.2" height="5.6" rx="2.8" stroke="#7C3AED" strokeWidth="1.4"></rect><path d="M8 5.8v5.2" stroke="#7C3AED" strokeWidth="1.4"></path></svg>
          Medication
        </span>
        <span className="med-badge">{medications.filter(m => m.taken).length} of {medications.length} taken</span>
      </div>
      
      {medications.map(med => (
        <div className="med-body" key={med.id} style={{ opacity: med.taken ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
          <div className="med-icon">
            <div className={med.taken ? "med-pill-taken" : "med-pill"}></div>
          </div>
          <div style={{flex: 1}}>
            <div className="med-name" style={{ textDecoration: med.taken ? 'line-through' : 'none' }}>{med.name}</div>
            <div className="med-due">{med.due}</div>
          </div>
          
          <button 
            className={med.taken ? "btn-med-undo" : "btn-med"} 
            onClick={() => handleToggleClick(med.id)}
            disabled={loadingId === med.id}
            style={{ 
              opacity: loadingId === med.id ? 0.7 : 1, 
              cursor: loadingId === med.id ? 'wait' : 'pointer' 
            }}
          >
            {loadingId === med.id ? '...' : (med.taken ? 'Undo' : 'Mark taken')}
          </button>
          
        </div>
      ))}
    </div>
  );
}