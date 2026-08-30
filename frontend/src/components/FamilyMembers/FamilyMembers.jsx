import React from 'react';

export default function FamilyMembers({ members = [] }) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '22px', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Family Profiles</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.map(member => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '12px' }}>
              {member.initials}
            </div>
            <div>
              <div style={{ fontWeight: '500', fontSize: '14px' }}>{member.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}