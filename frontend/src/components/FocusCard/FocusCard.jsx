import React, { useState } from 'react';
import './FocusCard.css';

export default function FocusCard({ tasks = [], onToggle }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggleClick = async (id) => {
    setLoadingId(id);
    await onToggle(id);
    setLoadingId(null);
  };

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="stack-card" style={{padding: '22px 24px'}}>
      <div className="card-header-row" style={{marginBottom: '16px'}}>
        <span className="card-title-sm">Today's focus</span>
        <span className="focus-badge">{doneCount} / {tasks.length} done</span>
      </div>
      <div className="focus-list">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="focus-item"
            onClick={() => loadingId !== task.id && handleToggleClick(task.id)}
            style={{ 
              cursor: loadingId === task.id ? 'wait' : 'pointer',
              opacity: loadingId === task.id ? 0.6 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            <span className={task.done ? "checkbox-done" : "checkbox-empty"}>
              {task.done && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.8 5.2l2 2L8.2 2.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path></svg>}
            </span>
            <span className={task.done ? "focus-text-done" : "focus-text"}>{task.task}</span>
            {!task.done && task.xp > 0 && <span className="xp-badge">+{task.xp} XP</span>}
          </div>
        ))}
      </div>
    </div>
  );
}