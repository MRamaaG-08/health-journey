import React, { useState } from 'react';
import { deleteMedicalDocument } from '../../services/api';
import './RecentDocuments.css';

export default function RecentDocuments({ documents = [], onDocumentDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;
    setDeletingId(id);
    try {
      const res = await deleteMedicalDocument(id);
      if (res && res.status === 'success') {
        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
      }
    } catch (err) {
      alert("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '22px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Recent Documents</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {documents.map(doc => (
          <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'rgba(248, 250, 252, 0.5)' }}>
            <div>
              <div style={{ fontWeight: '550', fontSize: '14px', color: 'var(--text-primary)' }}>{doc.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{doc.meta}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '550', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>View</button>
              <button 
                onClick={() => handleDelete(doc.id)} 
                disabled={deletingId === doc.id}
                style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '550', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer', color: '#EF4444' }}
              >
                {deletingId === doc.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No documents available.</div>
        )}
      </div>
    </div>
  );
}