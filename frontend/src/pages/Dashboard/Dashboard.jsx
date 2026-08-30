import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import QuickActions from '../../components/QuickActions/QuickActions';
import JourneyTimeline from '../../components/JourneyTimeline/JourneyTimeline';
import Calendar from '../../components/Calendar/Calendar';
import AIAssistant from '../../components/AIAssistant/AIAssistant';
import Insights from '../../components/Insights/Insights';
import RecentDocuments from '../../components/RecentDocuments/RecentDocuments';
import FamilyMembers from '../../components/FamilyMembers/FamilyMembers';
import EmergencyCard from '../../components/EmergencyCard/EmergencyCard';
import Footer from '../../components/Footer/Footer';
import { fetchHealthDashboardData, fetchExtraDashboardData, toggleMedicationAPI, toggleFocusTaskAPI } from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    user: { firstName: "Ramaa", fullName: "Ramaa Iyer", score: 87 },
    vitals: { restingHR: 62, bp: "118/76", spo2: 98, steps: 8412 },
    medications: [],
    appointments: [],
    focus: [],
    loading: true
  });

  const [extraData, setExtraData] = useState({
    timeline: [],
    calendar: [],
    documents: [],
    family: [],
    emergency: { contacts: [] },
    loading: true
  });

  const [toast, setToast] = useState(null);

  const loadData = async () => {
    const dash = await fetchHealthDashboardData();
    if (dash) {
      setDashboardData(prev => ({
        ...prev,
        user: dash.user || prev.user,
        vitals: dash.vitals || prev.vitals,
        medications: dash.medications || [],
        appointments: dash.appointments || [],
        focus: dash.focus || [],
        loading: false
      }));
    }

    const extra = await fetchExtraDashboardData();
    if (extra) {
      setExtraData({ ...extra, loading: false });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Toast notifications (replaces blocking window.alert) ---------------
  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  // --- In-page navigation --------------------------------------------------
  // Pure client-side scrolling. No routing library, no API call, no AI call.
  const scrollToSection = useCallback((sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Brief highlight so the user can see where they landed.
    target.classList.remove('section-focused');
    // Force reflow so the animation can be retriggered on repeat clicks.
    void target.offsetWidth;
    target.classList.add('section-focused');
    setTimeout(() => target.classList.remove('section-focused'), 1400);
  }, []);

  const handleMedicationToggle = async (id) => {
    try {
      const response = await toggleMedicationAPI(id);
      if (response && response.status === 'success') {
        setDashboardData(prevData => ({
          ...prevData,
          medications: prevData.medications.map(med =>
            med.id === id ? { ...med, taken: !med.taken } : med
          )
        }));
      }
    } catch (error) {
      console.error("Failed to toggle medication:", error);
      showToast("Could not update that medication. Please try again.", "error");
    }
  };

  const handleFocusToggle = async (id) => {
    try {
      const response = await toggleFocusTaskAPI(id);
      if (response && response.status === 'success') {
        setDashboardData(prevData => ({
          ...prevData,
          focus: prevData.focus.map(task =>
            task.id === id ? { ...task, done: !task.done } : task
          )
        }));
      }
    } catch (error) {
      console.error("Failed to toggle focus task:", error);
      showToast("Could not update that task. Please try again.", "error");
    }
  };

  const counts = {
    documents: extraData.documents.length,
    family: extraData.family.length,
    appointments: extraData.calendar.length
  };

  return (
    <div className="dashboard-wrapper">
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>
      <div className="ambient-blob blob-4"></div>

      <Navbar userName={dashboardData.user.fullName} onNavigate={scrollToSection} />

      <main className="dashboard-main">
        <section className="dashboard-section hero-section" id="section-dashboard">
          <Hero
            data={dashboardData}
            onMedicationToggle={handleMedicationToggle}
            onFocusToggle={handleFocusToggle}
          />
        </section>

        <section className="dashboard-section quick-actions-section">
          <QuickActions
            onDocumentUploaded={loadData}
            onNavigate={scrollToSection}
            onToast={showToast}
            counts={counts}
          />
        </section>

        <section className="dashboard-section timeline-section" id="section-journey">
          <div className="timeline-section-grid">
            <JourneyTimeline events={extraData.timeline} />

            <aside className="dashboard-side-column" id="section-appointments">
              <Calendar appointments={extraData.calendar} />
              <AIAssistant />
            </aside>
          </div>
        </section>

        <section className="dashboard-section insights-section" id="section-insights">
          <Insights data={dashboardData} />
        </section>

        <section className="dashboard-section bottom-section">
          <div className="bottom-grid">
            <div className="section-anchor" id="section-records">
              <RecentDocuments documents={extraData.documents} onDocumentDeleted={loadData} />
            </div>
            <div className="section-anchor" id="section-family">
              <FamilyMembers members={extraData.family} />
            </div>
            <div className="section-anchor" id="section-emergency">
              <EmergencyCard data={extraData.emergency} />
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {toast && (
        <div key={toast.key} className={`app-toast app-toast-${toast.tone}`} role="status" aria-live="polite">
          <span className="app-toast-icon" aria-hidden="true">
            {toast.tone === 'error' ? (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.5"></circle><path d="M8 5v3.6M8 10.8v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"></path></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.5"></circle><path d="M5.3 8.2l1.9 1.9 3.5-3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            )}
          </span>
          <span className="app-toast-text">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
