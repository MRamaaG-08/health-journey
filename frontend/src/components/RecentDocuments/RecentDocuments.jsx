import React, { useState } from 'react';
import { deleteMedicalDocument, getDocumentContentUrl } from '../../services/api';
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
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Only uploaded documents have a file behind them. The seeded sample records
  // have no `storedAs`, so View is shown disabled rather than opening a 404.
  const hasFile = (doc) => Boolean(doc.storedAs);

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '22px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Recent Documents</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {documents.map(doc => (
          <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'rgba(248, 250, 252, 0.5)' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '550', fontSize: '14px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{doc.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{doc.meta}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {hasFile(doc) ? (
                <a
                  href={getDocumentContentUrl(doc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '550', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block' }}
                >
                  View
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Sample record — upload a document to view it"
                  style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '550', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'not-allowed', color: 'var(--text-muted)', opacity: 0.55 }}
                >
                  View
                </button>
              )}
              <button
                type="button"
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
