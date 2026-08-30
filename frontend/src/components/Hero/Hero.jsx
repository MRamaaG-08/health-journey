import React from 'react';
import AppointmentCard from '../AppointmentCard/AppointmentCard';
import MedicationCard from '../MedicationCard/MedicationCard';
import FocusCard from '../FocusCard/FocusCard';
import './Hero.css';

export default function Hero({ data, onMedicationToggle, onFocusToggle }) {
  const { user, vitals, appointments, medications, focus } = data;

  return (
    <div className="hero-section-container">
      <div className="hero-header">
        <div>
          <div className="vitals-status">
            <span className="status-pulse"></span>
            <span className="status-text">All vitals normal</span>
          </div>
          <h1 className="hero-title">Good morning, {user.firstName}.</h1>
          <p className="hero-subtitle">You're healthier than last week. Two things need your attention today.</p>
        </div>
        <div className="hero-actions">
          <button className="btn-secondary">Weekly report</button>
          <button className="btn-primary">Add health entry</button>
        </div>
      </div>

      <div className="hero-grid">
        <div className="health-score-card">
          <div className="score-bg-blobs">
            <div className="score-blob-1"></div>
            <div className="score-blob-2"></div>
            <div className="score-blob-3"></div>
            <div className="score-sheen"></div>
          </div>

          <div className="score-main-content">
            <div className="score-left-col">
              <div className="score-tag">
                Health Score
                <span className="score-badge">Excellent</span>
              </div>
              <div className="score-value-row">
                <span className="score-number">{user.score}</span>
                <span className="score-max">/100</span>
                <span className="score-trend">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1.6v6.8M5 1.6L2.2 4.4M5 1.6l2.8 2.8" stroke="#5EEAD4" strokeWidth="1.6" strokeLinecap="round"></path></svg>
                  +4 this month
                </span>
              </div>
              <p className="score-summary">Sleep and activity improved this week. Vitamin D remains slightly low — recheck recommended in 3 weeks.</p>

              <div className="vitals-cards-row">
                <div className="vital-mini-card">
                  <div className="vital-label">Resting HR</div>
                  <div className="vital-value">{vitals.restingHR} <span className="vital-unit">bpm</span></div>
                </div>
                <div className="vital-mini-card">
                  <div className="vital-label">Blood pressure</div>
                  <div className="vital-value">{vitals.bp.split('/')[0]}<span style={{color: 'rgba(226,232,240,.4)'}}>/</span>{vitals.bp.split('/')[1]}</div>
                </div>
                <div className="vital-mini-card">
                  <div className="vital-label">SpO₂</div>
                  <div className="vital-value">{vitals.spo2}<span className="vital-unit">%</span></div>
                </div>
              </div>
            </div>

            <div className="steps-ring-container">
              <div className="steps-blur-ring"></div>
              <div className="steps-solid-ring"></div>
              <div className="steps-inner">
                <span className="steps-label">Today</span>
                <span className="steps-value">{vitals.steps.toLocaleString()}</span>
                <span className="steps-unit">steps</span>
                <div className="steps-progress-bar"><div className="steps-progress-fill"></div></div>
                <span className="steps-subtext">84% of daily goal</span>
              </div>
            </div>
          </div>

          <div className="gamification-strip">
            <div className="game-col" style={{paddingRight: '20px'}}>
              <div className="game-label">Streak</div>
              <div className="game-value">12 days</div>
              <div className="game-progress-blocks">
                {[...Array(5)].map((_, i) => <span key={i} className="block-filled"></span>)}
                {[...Array(2)].map((_, i) => <span key={i+5} className="block-empty"></span>)}
              </div>
            </div>
            <div className="game-divider"></div>
            
            <div className="game-col game-col-px">
              <div className="game-label">Weekly goal</div>
              <div className="game-value">5 <span style={{fontSize: '12.5px', fontWeight: 500, color: 'rgba(226,232,240,.45)'}}>of 7 workouts</span></div>
              <div className="game-bar-bg"><div className="game-bar-fill-1"></div></div>
            </div>
            <div className="game-divider"></div>

            <div className="game-col game-col-px">
              <div className="game-label">Health XP</div>
              <div className="game-value" style={{display: 'flex', alignItems: 'baseline', gap: '7px'}}>
                2,480 <span style={{fontSize: '11.5px', fontWeight: 600, color: '#C4B5FD'}}>Level 7</span>
              </div>
              <div className="game-bar-bg"><div className="game-bar-fill-2"></div></div>
            </div>
            <div className="game-divider"></div>

            <div className="game-col todays-progress-wrapper" style={{paddingLeft: '20px'}}>
              <div className="circular-progress"><div className="circular-progress-inner">50%</div></div>
              <div>
                <div className="game-label">Today's progress</div>
                <div style={{fontSize: '13px', color: 'rgba(226,232,240,.72)', marginTop: '6px'}}>2 of 4 tasks complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-stack">
          <AppointmentCard appointment={appointments[0]} />
          <MedicationCard medications={medications} onToggle={onMedicationToggle} />
          <FocusCard tasks={focus} onToggle={onFocusToggle} />
        </div>
      </div>
    </div>
  );
}