import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function HealthTimeline() {
  const { timeline, stats, setActiveTab } = useHealth();
  const [activeFilter, setActiveFilter] = useState('Overview');

  const filterTabs = ['Overview', 'Vitals', 'Blood Tests', 'Medications', 'Symptoms', 'Consultations'];

  const defaultTrends = [
    { title: "Hemoglobin", value: "13.2 g/dL", delta: "+0.8", isPositive: true, data: [11.8, 12.2, 12.6, 12.9, 13.0, 13.2] },
    { title: "Vitamin D", value: "28 ng/mL", delta: "+6.0", isPositive: true, data: [16, 18, 20, 22, 25, 28] },
    { title: "Fasting Blood Sugar", value: "98 mg/dL", delta: "-4.0", isPositive: true, data: [108, 105, 102, 100, 99, 98] },
    { title: "Weight", value: "68.5 kg", delta: "+1.5", isPositive: false, data: [67.0, 67.2, 67.5, 68.0, 68.2, 68.5] }
  ];

  const defaultSymptoms = [
    { id: "sym_01", date: "18 May 2025", symptom: "Felt better", note: "No fever or fatigue", feeling: "good" },
    { id: "sym_02", date: "02 May 2025", symptom: "Mild fatigue", note: "Felt tired in the evening", feeling: "neutral" },
    { id: "sym_03", date: "20 Apr 2025", symptom: "Back pain", note: "Lower-back pain post-exercise", feeling: "bad" },
    { id: "sym_04", date: "10 Apr 2025", symptom: "Good energy", note: "Morning walking routine felt great", feeling: "good" }
  ];

  const [trends, setTrends] = useState(defaultTrends);
  const [symptoms, setSymptoms] = useState(defaultSymptoms);

  const [showLogModal, setShowLogModal] = useState(false);
  const [newSymptom, setNewSymptom] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newFeeling, setNewFeeling] = useState("good");
  const [savingSymptom, setSavingSymptom] = useState(false);

  // Fetch trends and symptoms from Database API
  useEffect(() => {
    async function loadData() {
      try {
        const [trendsRes, symptomsRes] = await Promise.all([
          api.getTrends(),
          api.getSymptoms()
        ]);
        if (trendsRes && trendsRes.success && trendsRes.data && trendsRes.data.length > 0) {
          setTrends(trendsRes.data);
        }
        if (symptomsRes && symptomsRes.success && symptomsRes.data && symptomsRes.data.length > 0) {
          setSymptoms(symptomsRes.data);
        }
      } catch (err) {
        console.error("Failed to load timeline trends/symptoms from DB:", err);
      }
    }
    loadData();
  }, []);

  const handleAddSymptom = async (e) => {
    e.preventDefault();
    if (!newSymptom.trim()) return;
    setSavingSymptom(true);
    const item = {
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      symptom: newSymptom,
      note: newNote || "Logged by user",
      feeling: newFeeling
    };

    try {
      const res = await api.addSymptom(item);
      if (res && res.success && res.data) {
        setSymptoms([res.data, ...symptoms]);
      } else {
        setSymptoms([item, ...symptoms]);
      }
      setNewSymptom("");
      setNewNote("");
      setShowLogModal(false);
    } catch (err) {
      console.error("Failed to save symptom:", err);
      setSymptoms([item, ...symptoms]);
      setShowLogModal(false);
    } finally {
      setSavingSymptom(false);
    }
  };

  const filteredTimeline = timeline.filter(item => {
    if (activeFilter === 'Overview') return true;
    if (activeFilter === 'Vitals') return item.type === 'Vitals';
    if (activeFilter === 'Blood Tests') return item.type === 'Lab Report';
    if (activeFilter === 'Medications') return item.type === 'Prescription';
    if (activeFilter === 'Consultations') return item.type === 'Consultation';
    if (activeFilter === 'Symptoms') return item.type === 'Symptom';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="text-xs text-slate-400 mb-1">
          Dashboard &gt; <span className="text-slate-600 font-medium">Health Timeline</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Health Timeline</h1>
        <p className="text-xs text-slate-500">Your health journey over time. Track changes, detect patterns and stay ahead.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === tab
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 4 Health Trends Grid (Page 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trends.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">{t.title}</span>
              <span className={`text-[11px] font-bold flex items-center gap-0.5 ${t.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                <ArrowUpRight className="w-3 h-3" />
                {t.delta}
              </span>
            </div>

            <div className="text-2xl font-extrabold text-slate-900 my-2">{t.value}</div>

            {/* Mini SVG Sparkline */}
            <div className="h-10 w-full flex items-end justify-between gap-1 pt-2">
              {t.data.map((val, idx) => {
                const min = Math.min(...t.data);
                const max = Math.max(...t.data);
                const heightPercent = Math.max(20, Math.round(((val - min) / (max - min || 1)) * 80) + 20);
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all ${
                      idx === t.data.length - 1 ? 'bg-blue-600' : 'bg-blue-200'
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Health Journey Feed + Health Score & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Health Journey & Symptoms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Health Journey Chronological Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">Health Journey</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  {filteredTimeline.length} events
                </span>
              </div>
              <span className="text-xs text-blue-600 font-medium cursor-pointer" onClick={() => setActiveFilter('Overview')}>
                {activeFilter !== 'Overview' ? 'Clear Filter' : 'All Events'}
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {filteredTimeline.length > 0 ? (
                filteredTimeline.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.date}</span>
                        <h4 className="font-bold text-xs text-slate-900 mt-0.5">{item.title}</h4>
                        <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No events found under "{activeFilter}". Switch to "Overview" to see all events.
                </div>
              )}
            </div>
          </div>

          {/* Symptoms & Notes Over Time */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Symptoms & Notes Over Time</h3>
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Symptom</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {symptoms.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    s.feeling === 'good' ? 'bg-emerald-100 text-emerald-700' :
                    s.feeling === 'neutral' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {s.feeling === 'good' ? '😊' : s.feeling === 'neutral' ? '😐' : '🤕'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{s.symptom}</span>
                      <span className="text-[10px] text-slate-400">{s.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Health Score & Milestones */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Health Score Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Health Score</h3>
            
            <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-emerald-500/20 border-t-emerald-500 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{stats.healthScore || 78}</span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mb-1">
              Good Health Status
            </span>
            <p className="text-xs text-slate-500">You are doing well! +6 points from last month.</p>
          </div>

          {/* Your Milestones */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Your Milestones</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Completed 3 health check-ups</span>
                  <span className="text-[10px] text-slate-400">22 May 2025</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Medication adherence 85% this month</span>
                  <span className="text-[10px] text-slate-400">18 May 2025</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Improved Hemoglobin levels</span>
                  <span className="text-[10px] text-slate-400">20 May 2025</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Log Symptom Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Log Daily Symptom or Note</h3>
                <p className="text-[10px] text-slate-400">Record how you are feeling in your personal health timeline</p>
              </div>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSymptom} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">How do you feel?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFeeling('good')}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      newFeeling === 'good' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    😊 Good
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFeeling('neutral')}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      newFeeling === 'neutral' ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    😐 Okay
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFeeling('bad')}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      newFeeling === 'bad' ? 'bg-red-50 border-red-400 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🤕 Unwell
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Symptom Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild headache, Energetic morning, Cough"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Note (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add any context, timing, or activities..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25"
                >
                  Save to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
