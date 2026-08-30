import React, { useRef, useState } from 'react';
import { uploadMedicalDocument } from '../../services/api';
import './QuickActions.css';

export default function QuickActions({ onDocumentUploaded, onNavigate, onToast, counts = {} }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const documentCount = counts.documents ?? 0;
  const familyCount = counts.family ?? 0;
  const appointmentCount = counts.appointments ?? 0;

  const notify = (message, tone = 'success') => {
    if (onToast) {
      onToast(message, tone);
    }
  };

  const goTo = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  const handleUploadClick = () => {
    if (uploading) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMedicalDocument(file);
      if (result && result.status === 'success') {
        if (onDocumentUploaded) {
          onDocumentUploaded();
        }
        notify(`"${file.name}" uploaded. IBM Bob has catalogued it into your records.`);
        // Demo review 3A: the smooth scroll and the refetch race each other. A
        // short head start means the list is current before the scroll lands.
        await new Promise(resolve => setTimeout(resolve, 300));
        goTo('section-records');
      }
    } catch (error) {
      notify('Upload failed. Please check the backend is running and try again.', 'error');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Ask AI: scroll the assistant into view, then put the cursor in its input
  // so the user can start typing straight away.
  const handleAskAI = () => {
    // The assistant sits in the right-hand column of the timeline section, well
    // below its top edge, so scrolling to the section itself stops short of it.
    // Target the card directly and centre it in the viewport.
    const card = document.querySelector('.ai-assistant-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      goTo('section-journey');
    }
    setTimeout(() => {
      const input = document.querySelector('.ai-input-field');
      if (input) {
        input.focus({ preventScroll: true });
      }
    }, 700);
  };

  const cards = [
    {
      className: 'upload',
      title: uploading ? 'Uploading…' : 'Upload Report',
      subtitle: 'PDF, image or scan',
      onActivate: handleUploadClick,
      icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 10.8V3.4M8 3.4L5.2 6.2M8 3.4l2.8 2.8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"></path><path d="M2.8 10.6v1.4a1.4 1.4 0 001.4 1.4h7.6a1.4 1.4 0 001.4-1.4v-1.4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"></path></svg>
    },
    {
      className: 'ask-ai',
      title: 'Ask AI',
      subtitle: 'Explain my results',
      onActivate: handleAskAI,
      icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M7.4 2.2l1.15 2.85L11.4 6.2 8.55 7.35 7.4 10.2 6.25 7.35 3.4 6.2l2.85-1.15L7.4 2.2z" fill="#7C3AED"></path><path d="M11.8 9.6l.5 1.25 1.25.5-1.25.5-.5 1.25-.5-1.25-1.25-.5 1.25-.5.5-1.25z" fill="#3B82F6"></path></svg>
    },
    {
      className: 'journey',
      title: 'Journey',
      subtitle: 'Full timeline',
      onActivate: () => goTo('section-journey'),
      icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M4 13V8.5a4 4 0 018 0V3" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"></path><circle cx="4" cy="13" r="1.6" fill="#0D9488"></circle><circle cx="12" cy="3" r="1.6" fill="#5EEAD4"></circle></svg>
    },
    {
      className: 'appointments',
      title: 'Appointments',
      subtitle: appointmentCount === 1 ? '1 upcoming' : `${appointmentCount} upcoming`,
      onActivate: () => goTo('section-appointments'),
      icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><rect x="2.6" y="3.4" width="10.8" height="10" rx="2.6" stroke="#334155" strokeWidth="1.4"></rect><path d="M5.6 2.2v2.4M10.4 2.2v2.4M2.8 6.8h10.4" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"></path><circle cx="6" cy="9.8" r="1" fill="#3B82F6"></circle></svg>
    },
    {
      className: 'family',
      title: 'Family Health',
      subtitle: familyCount === 1 ? '1 profile' : `${familyCount} profiles`,
      onActivate: () => goTo('section-family'),
      icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><circle cx="6.2" cy="5.8" r="2.4" stroke="#0D9488" strokeWidth="1.4"></circle><circle cx="11.4" cy="7" r="1.8" stroke="#5EEAD4" strokeWidth="1.4"></circle><path d="M2.6 13.2c.5-2.1 1.9-3.3 3.6-3.3s3.1 1.2 3.6 3.3" stroke="#0D9488" strokeWidth="1.4" strokeLinecap="round"></path></svg>
    },
    {
      className: 'emergency',
      title: 'Emergency',
      subtitle: 'Profile & contacts',
      onActivate: () => goTo('section-emergency'),
      icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 13.4S2.6 10.5 2.6 6.7A2.95 2.95 0 018 5.15 2.95 2.95 0 0113.4 6.7c0 3.8-5.4 6.7-5.4 6.7z" stroke="#E11D48" strokeWidth="1.4" strokeLinejoin="round"></path></svg>
    }
  ];

  return (
    <div className="qa-grid">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
      />

      {/* React review R-07: these were div[role=button]. Native <button>
          brings real disabled semantics, a guaranteed focus ring and correct
          Enter/Space handling for free. */}
      {cards.map(card => (
        <button
          key={card.className}
          type="button"
          className={`qa-card ${card.className}`}
          onClick={card.onActivate}
          disabled={card.className === 'upload' && uploading}
        >
          <div className="qa-icon-wrapper">{card.icon}</div>
          <div className="qa-title">{card.title}</div>
          <div className="qa-subtitle">
            {card.className === 'upload' && documentCount > 0 && !uploading
              ? `${documentCount} in your vault`
              : card.subtitle}
          </div>
        </button>
      ))}
    </div>
  );
}
