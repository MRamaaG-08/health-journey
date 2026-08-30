import React from 'react';
import './Insights.css';

export default function Insights({ data }) {
  const { user, vitals } = data;

  return (
    <div className="insights-wrapper">
      <div className="insights-header-row">
        <div className="insights-title">
          <h2>Health Insights</h2>
          <p>Last 30 days, compared to your baseline</p>
        </div>
        <div className="insights-tabs">
          <button className="insight-tab active">Month</button>
          <button className="insight-tab">Quarter</button>
          <button className="insight-tab">Year</button>
        </div>
      </div>

      <div className="insights-grid">
        
        {/* Monthly Trend Card */}
        <div className="insight-card" style={{gridColumn: 'span 1'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <div className="insight-label">Monthly health trend</div>
              <div className="insight-metric-row">
                <span className="insight-big-value">{user.score}</span>
                <span className="insight-change-positive">▲ 4.8%</span>
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--text-secondary)'}}>
              <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: 3, background: '#3B82F6'}}></span>Score</span>
              <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: 3, background: 'rgba(20,184,166,.55)'}}></span>Activity</span>
            </div>
          </div>

          <div className="monthly-chart-bars">
            <div className="chart-bar-group"><div className="bar-score" style={{height: '46%'}}></div><div className="bar-activity" style={{height: '16%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '52%'}}></div><div className="bar-activity" style={{height: '20%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '44%'}}></div><div className="bar-activity" style={{height: '14%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '60%'}}></div><div className="bar-activity" style={{height: '24%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '58%'}}></div><div className="bar-activity" style={{height: '18%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '66%'}}></div><div className="bar-activity" style={{height: '26%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '62%'}}></div><div className="bar-activity" style={{height: '22%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '74%'}}></div><div className="bar-activity" style={{height: '30%'}}></div></div>
            <div className="chart-bar-group"><div className="bar-score" style={{height: '70%'}}></div><div className="bar-activity" style={{height: '28%'}}></div></div>
            <div className="chart-bar-group highlight">
              <span className="chart-peak-label">{user.score}</span>
              <div className="bar-score" style={{height: '78%'}}></div>
              <div className="bar-activity" style={{height: '32%'}}></div>
            </div>
          </div>
          <div className="monthly-chart-labels">
            <span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
          </div>
        </div>

        {/* Vitals Card */}
        <div className="insight-card">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div className="insight-label">Vitals Check</div>
            <span style={{fontSize: '11px', fontWeight: '600', padding: '3.5px 8px', borderRadius: '7px', background: 'rgba(20,184,166,.11)', color: 'var(--accent-teal-dark)'}}>Stable</span>
          </div>
          <div className="vitals-stack-list">
            <div className="vitals-row-item">
              <div>
                <div className="vitals-row-title">Blood pressure</div>
                <div className="vitals-row-val">{vitals.bp}</div>
              </div>
            </div>
            <div className="vitals-divider"></div>
            <div className="vitals-row-item">
              <div>
                <div className="vitals-row-title">Resting HR</div>
                <div className="vitals-row-val">{vitals.restingHR} <span style={{fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)'}}>bpm</span></div>
              </div>
            </div>
            <div className="vitals-divider"></div>
            <div className="vitals-row-item">
              <div>
                <div className="vitals-row-title">Daily Steps</div>
                <div className="vitals-row-val">{vitals.steps.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}