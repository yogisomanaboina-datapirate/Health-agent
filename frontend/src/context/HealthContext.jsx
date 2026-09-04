import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('healthtrack_active_tab') || 'insurance-claims';
  });

  const setActiveTab = (tab) => {
    localStorage.setItem('healthtrack_active_tab', tab);
    setActiveTabState(tab);
  };
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('healthtrack_token');
  });

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    healthScore: 78,
    recordsCount: 24,
    activeMedsCount: 5,
    upcomingFollowUpsCount: 2,
    newInsightsCount: 3
  });
  const [timeline, setTimeline] = useState([]);
  const [todayDoses, setTodayDoses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [riskSignals, setRiskSignals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [records, setRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Alerts
  const [activeReminder, setActiveReminder] = useState(null);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Medication Due", detail: "Vitamin D3 60K IU is due at 10:30 AM", time: "10 min ago", unread: true, type: "dose" },
    { id: 2, title: "Cardiology Follow-up", detail: "Appointment with Dr. Anil Mehta in 3 days", time: "1 hr ago", unread: true, type: "appointment" },
    { id: 3, title: "Lab Report Analyzed", detail: "Complete Blood Count is ready for review", time: "Yesterday", unread: false, type: "lab" }
  ]);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getDashboard();
      if (res.success) {
        setUser(res.user);
        setStats(res.stats);
        setTimeline(res.timeline || []);
        setTodayDoses(res.todayDoses || []);
        setInsights(res.insights || []);
        setRiskSignals(res.riskSignals || []);
        setFollowUps(res.followUps || []);
        setRecords(res.records || []);
        setMedications(res.medications || []);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn('Dashboard load requires authentication or network:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = async (userObj) => {
    setUser(userObj);
    setIsAuthenticated(true);
    await loadData();
  };

  const logoutUser = async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (localStorage.getItem('healthtrack_token')) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [loadData]);

  // Check if any medication is due to show reminder modal
  const triggerMedicineReminder = (medName = "Amlodipine 5mg", time = "08:00 AM Today") => {
    setActiveReminder({
      medicine: medName,
      time: time,
      dosage: "Take 1 tablet with water",
      instructions: "After food"
    });
  };

  const handleTakeDose = async (doseId) => {
    try {
      await api.markDoseTaken(doseId);
      await loadData();
      setActiveReminder(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDose = async (doseData) => {
    try {
      const res = await api.addDose(doseData);
      await loadData();
      return res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleUpdateDose = async (doseId, updates) => {
    try {
      const res = await api.updateDose(doseId, updates);
      await loadData();
      return res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteDose = async (doseId) => {
    try {
      const res = await api.deleteDose(doseId);
      await loadData();
      return res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Text-to-speech for AI Assistant Voice
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active speech
      const cleanText = text.replace(/[*_#`[\]()]/g, ''); // Strip markdown
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <HealthContext.Provider value={{
      isAuthenticated,
      loginUser,
      logoutUser,
      activeTab,
      setActiveTab,
      user,
      setUser,
      stats,
      timeline,
      todayDoses,
      insights,
      riskSignals,
      followUps,
      records,
      medications,
      loading,
      refreshData: loadData,
      searchQuery,
      setSearchQuery,
      activeReminder,
      setActiveReminder,
      triggerMedicineReminder,
      handleTakeDose,
      handleAddDose,
      handleUpdateDose,
      handleDeleteDose,
      activeDispatch,
      setActiveDispatch,
      notifications,
      setNotifications,
      speakText,
      stopSpeaking
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) throw new Error('useHealth must be used within a HealthProvider');
  return context;
}
