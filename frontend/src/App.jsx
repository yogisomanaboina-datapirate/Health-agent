import React from 'react';
import { HealthProvider, useHealth } from './context/HealthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ReminderModal from './components/ReminderModal.jsx';
import EmergencyDispatchModal from './components/EmergencyDispatchModal.jsx';

// The Core Operational Agents + Multi-Agent Hub
import MultiAgentHub from './pages/MultiAgentHub.jsx';
import AmbulanceResponse from './pages/AmbulanceResponse.jsx';
import InsuranceClaims from './pages/InsuranceClaims.jsx';
import TabletScheduler from './pages/TabletScheduler.jsx';
import DoctorShareableRecords from './pages/DoctorShareableRecords.jsx';

// Clinical Views
import Dashboard from './pages/Dashboard.jsx';
import ReportAnalyzer from './pages/ReportAnalyzer.jsx';
import HealthRecords from './pages/HealthRecords.jsx';
import Medications from './pages/Medications.jsx';
import LabReports from './pages/LabReports.jsx';
import HealthTimeline from './pages/HealthTimeline.jsx';
import FollowUps from './pages/FollowUps.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import HospitalFinder from './pages/HospitalFinder.jsx';
import DoctorSummary from './pages/DoctorSummary.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import UploadDocument from './pages/UploadDocument.jsx';

// Authentication Page
import AuthPage from './pages/AuthPage.jsx';

function MainLayout() {
  const { activeTab } = useHealth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Navbar */}
        <Navbar />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Core Operational Agents & Hub */}
            {activeTab === 'multi-agent-hub' && <MultiAgentHub />}
            {activeTab === 'ambulance-response' && <AmbulanceResponse />}
            {activeTab === 'insurance-claims' && <InsuranceClaims />}
            {activeTab === 'tablet-scheduler' && <TabletScheduler />}
            {activeTab === 'doctor-shareable' && <DoctorShareableRecords />}

            {/* Clinical & Patient Views */}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'report-analyzer' && <ReportAnalyzer />}
            {activeTab === 'records' && <HealthRecords />}
            {activeTab === 'medications' && <Medications />}
            {activeTab === 'lab-reports' && <LabReports />}
            {activeTab === 'prescriptions' && <HealthRecords />}
            {activeTab === 'timeline' && <HealthTimeline />}
            {activeTab === 'follow-ups' && <FollowUps />}
            {activeTab === 'ai-assistant' && <AIAssistant />}
            {activeTab === 'hospital-finder' && <HospitalFinder />}
            {activeTab === 'doctor-summary' && <DoctorSummary />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'upload' && <UploadDocument />}
          </div>
        </main>
      </div>

      {/* Interactive Global Modals */}
      <ReminderModal />
      <EmergencyDispatchModal />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loginUser } = useHealth();

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={(u) => loginUser(u)} />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
