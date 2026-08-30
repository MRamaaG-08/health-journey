import React from 'react';

export default function EmergencyCard({ data }) {
  if (!data || !data.contacts) return null;

  return (
    <div style={{ background: 'var(--accent-red-dark)', color: '#fff', padding: '24px', borderRadius: '22px', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🚨</span> Emergency Information
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '13px' }}>
        <div><span style={{ opacity: 0.7 }}>Blood:</span> <strong>{data.bloodGroup}</strong></div>
        <div><span style={{ opacity: 0.7 }}>Allergies:</span> <strong>{data.allergies}</strong></div>
        <div style={{ gridColumn: 'span 2' }}><span style={{ opacity: 0.7 }}>Conditions:</span> <strong>{data.conditions}</strong></div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.contacts.map(c => (
          <div key={c.id} style={{ fontSize: '13px' }}>
            <strong>{c.name}</strong>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>{c.relation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}