import React, { useState, useEffect } from 'react';
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
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>
      <div className="ambient-blob blob-4"></div>

      <Navbar userName={dashboardData.user.fullName} />
      
      <main className="dashboard-main">
        <section className="dashboard-section hero-section">
          <Hero 
            data={dashboardData} 
            onMedicationToggle={handleMedicationToggle} 
            onFocusToggle={handleFocusToggle} 
          />
        </section>

        <section className="dashboard-section quick-actions-section">
          <QuickActions onDocumentUploaded={loadData} />
        </section>

        <section className="dashboard-section timeline-section">
          <div className="timeline-section-grid">
            <JourneyTimeline events={extraData.timeline} />
            
            <aside className="dashboard-side-column">
              <Calendar appointments={extraData.calendar} />
              <AIAssistant />
            </aside>
          </div>
        </section>

        <section className="dashboard-section insights-section">
          <Insights data={dashboardData} />
        </section>

        <section className="dashboard-section bottom-section">
          <div className="bottom-grid">
            <RecentDocuments documents={extraData.documents} onDocumentDeleted={loadData} />
            <FamilyMembers members={extraData.family} />
            <EmergencyCard data={extraData.emergency} />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}