import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Activity,
  Heart,
  Droplets,
  Moon,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Plus,
  X,
  Bell,
  Check,
  Trash2,
  PlusCircle,
  Volume2,
  BellRing,
  Timer
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function FollowUps() {
  const { followUps, riskSignals, stats, setActiveTab } = useHealth();
  const [localFollowUps, setLocalFollowUps] = useState([]);
  
  const defaultReminders = [
    {
      id: 'rem_1',
      title: 'Take medications on time',
      subtitle: 'Morning Dose: Lisinopril 10mg, Metformin 500mg',
      time: '08:00',
      frequency: 'Daily',
      enabled: true
    },
    {
      id: 'rem_2',
      title: 'Stay active / Evening Walk',
      subtitle: 'Walk 30-45 mins in fresh air',
      time: '17:30',
      frequency: 'Daily',
      enabled: true
    },
    {
      id: 'rem_3',
      title: 'Hydration check',
      subtitle: 'Drink 2.5 - 3 liters daily',
      time: '11:00',
      frequency: 'Every 2 hours',
      enabled: true
    },
    {
      id: 'rem_4',
      title: 'Sleep on time',
      subtitle: 'Aim for 7 - 8 hours restorative sleep',
      time: '22:30',
      frequency: 'Daily',
      enabled: false
    }
  ];

  const [reminders, setReminders] = useState(defaultReminders);

  useEffect(() => {
    async function loadReminders() {
      try {
        const res = await api.getReminders();
        if (res && res.success && res.data && res.data.length > 0) {
          setReminders(res.data);
        }
      } catch (err) {
        console.error("Failed to load reminders from DB:", err);
      }
    }
    loadReminders();
  }, []);

  const [showEditReminders, setShowEditReminders] = useState(false);
  const [editRemindersList, setEditRemindersList] = useState([]);
  const [newRemTitle, setNewRemTitle] = useState("");
  const [newRemSubtitle, setNewRemSubtitle] = useState("");
  const [newRemTime, setNewRemTime] = useState("09:00");
  const [newRemFreq, setNewRemFreq] = useState("Daily");
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [activeAlert, setActiveAlert] = useState(null);
  const [lastFiredMinute, setLastFiredMinute] = useState(null);

  // Soothing synthesized chime via Web Audio API (100% offline & reliable)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (err) {
      console.warn("Audio chime error:", err);
    }
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "Anytime";
    const [h, m] = timeStr.split(':');
    if (h === undefined || m === undefined) return timeStr;
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const requestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification("HealthTrack Reminders Enabled", {
            body: "You will now receive desktop alerts for scheduled medications, vitals, and habits.",
            icon: "/favicon.ico"
          });
        }
      } catch (err) {
        console.warn("Notification permission error:", err);
      }
    }
  };

  const triggerReminderAlert = (rem) => {
    playChime();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Health Reminder: ${rem.title}`, {
          body: `${rem.subtitle} • Scheduled for ${formatTime12h(rem.time)} (${rem.frequency || 'Daily'})`,
          icon: "/favicon.ico"
        });
      } catch (e) {
        console.warn(e);
      }
    }
    setActiveAlert({
      ...rem,
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  // Background timer to trigger alerts when system time matches scheduled time
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (currentTimeStr !== lastFiredMinute) {
        reminders.forEach((r) => {
          if (r.enabled && r.time === currentTimeStr) {
            setLastFiredMinute(currentTimeStr);
            triggerReminderAlert(r);
          }
        });
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [reminders, lastFiredMinute]);

  const toggleReminder = async (id) => {
    const target = reminders.find(r => r.id === id);
    const newStatus = target ? !target.enabled : true;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: newStatus } : r))
    );
    try {
      await api.toggleReminder(id, newStatus);
    } catch (e) {
      console.warn("Failed to persist toggle:", e);
    }
  };

  const handleOpenEditReminders = () => {
    setEditRemindersList(JSON.parse(JSON.stringify(reminders)));
    setNewRemTitle("");
    setNewRemSubtitle("");
    setNewRemTime("09:00");
    setNewRemFreq("Daily");
    setShowEditReminders(true);
  };

  const handleUpdateReminderInDraft = (id, field, value) => {
    setEditRemindersList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteReminderFromDraft = (id) => {
    setEditRemindersList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddNewReminderToDraft = (e) => {
    e?.preventDefault();
    if (!newRemTitle.trim()) return;
    const newItem = {
      id: 'rem_' + Date.now(),
      title: newRemTitle.trim(),
      subtitle: newRemSubtitle.trim() || 'Scheduled health habit',
      time: newRemTime || '09:00',
      frequency: newRemFreq || 'Daily',
      enabled: true
    };
    setEditRemindersList((prev) => [...prev, newItem]);
    setNewRemTitle("");
    setNewRemSubtitle("");
  };

  const handleSaveReminderList = async (e) => {
    e?.preventDefault();
    setReminders(editRemindersList);
    setShowEditReminders(false);
    setNotificationMsg("Health reminders updated successfully!");
    setTimeout(() => setNotificationMsg(null), 4000);

    // Persist changes to DB
    try {
      for (const item of editRemindersList) {
        if (item.id && item.id.startsWith('rem_') && item.id.length > 10) {
          // newly added in draft
          await api.addReminder(item);
        }
      }
    } catch (err) {
      console.warn("Failed to persist new reminders:", err);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDoctor, setNewDoctor] = useState("Dr. Anil Mehta");
  const [newDate, setNewDate] = useState("28 May 2025");
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newPurpose, setNewPurpose] = useState("");
  const [notificationMsg, setNotificationMsg] = useState(null);

  const displayFollowUps = [...localFollowUps, ...followUps];

  const handleAddFollowUp = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry = {
      id: 'fu_' + Date.now(),
      title: newTitle,
      doctor: newDoctor,
      department: "Scheduled Consultation",
      date: newDate,
      dayTime: newTime,
      status: "Upcoming",
      purpose: newPurpose || "Routine review & assessment"
    };

    setLocalFollowUps([newEntry, ...localFollowUps]);
    setShowAddModal(false);
    setNewTitle("");
    setNewPurpose("");
    setNotificationMsg(`Follow-up '${newTitle}' scheduled successfully!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="text-xs text-slate-400 mb-1">
          Dashboard &gt; <span className="text-slate-600 font-medium">Follow-ups & Risk Signals</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-ups & Risk Signals</h1>
        <p className="text-xs text-slate-500">We monitor your health and help you stay ahead of potential complications.</p>
      </div>

      {/* Top 4 Metrics Strip (Page 14) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Due Soon</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">2</div>
          <span className="text-[10px] text-amber-600 font-medium">Next in 3 days</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Upcoming</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">5</div>
          <span className="text-[10px] text-slate-500 font-medium">Within 30 days</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">18</div>
          <span className="text-[10px] text-emerald-600 font-medium">This month</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Risk Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">3</div>
          <span className="text-[10px] text-red-600 font-medium">Needs attention</span>
        </div>
      </div>

      {/* Main Grid: Upcoming Follow-ups & AI Risk Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Upcoming Follow-ups List */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">Upcoming Follow-ups</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                  {displayFollowUps.length} scheduled
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Follow-up</span>
                </button>
              </div>
            </div>

            {notificationMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{notificationMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              {displayFollowUps.map((fu) => (
                <div
                  key={fu.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{fu.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fu.status === 'Due Soon'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {fu.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{fu.doctor || fu.department}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fu.purpose}</p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs font-bold text-slate-800 block">{fu.date}</span>
                    <span className="text-[10px] text-slate-400">{fu.dayTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preventive Care & Health Guidance (Page 15) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Personalized Preventive Recommendations</span>
              </h3>
              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                AI Driven
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Improve Your Diet
                </span>
                <p className="text-[11px] text-slate-500">
                  Add more fiber-rich foods, oats, and leafy greens to naturally balance lipid levels.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs">
                  <Heart className="w-3.5 h-3.5 text-blue-500" />
                  Stay Active
                </span>
                <p className="text-[11px] text-slate-500">
                  Maintain 30 mins of daily brisk walking or light cardio workouts for vascular health.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  Sleep Better
                </span>
                <p className="text-[11px] text-slate-500">
                  Maintain 7-8 hours of quality sleep to optimize blood pressure regulation.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: AI Risk Signals & Health Reminders (Page 14) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* AI Risk Signals (Page 14) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>AI Risk Signals</span>
              </h3>
              <span className="text-[10px] text-slate-400">How it works</span>
            </div>

            <div className="space-y-2.5">
              {riskSignals.map((rs) => (
                <div key={rs.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{rs.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      rs.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rs.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{rs.description}</p>
                  <p className="text-[10px] text-blue-600 font-medium pt-0.5">Rec: {rs.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Reminders Toggles (Page 14) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Health Reminders</h3>
                  <p className="text-[10px] text-slate-400">Audio chime + browser alerts on scheduled time</p>
                </div>
              </div>
              <button
                onClick={handleOpenEditReminders}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-0.5 rounded hover:bg-blue-50 transition-all cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Desktop Notification Banner */}
            {notificationPermission !== 'granted' ? (
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between gap-2 text-[11px] text-blue-900">
                <div className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Receive reminders outside this tab?</span>
                </div>
                <button
                  onClick={requestDesktopPermission}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] shrink-0 shadow-sm transition-all"
                >
                  Enable Desktop Alerts
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Desktop alerts active (Sound chime + notification enabled)</span>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              {reminders.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No reminders configured.<br />
                  <button
                    onClick={handleOpenEditReminders}
                    className="mt-2 text-blue-600 font-semibold hover:underline"
                  >
                    + Add your first reminder
                  </button>
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      rem.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-xs">{rem.title}</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime12h(rem.time)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{rem.frequency || 'Daily'}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">{rem.subtitle}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => triggerReminderAlert(rem)}
                          title="Test alert sound & notification now"
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 flex items-center gap-1 transition-all"
                        >
                          <Volume2 className="w-3 h-3 text-blue-500" />
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => toggleReminder(rem.id)}
                          className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                            rem.enabled ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            rem.enabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Schedule Follow-up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Schedule Doctor Follow-up</h3>
                <p className="text-[10px] text-slate-400">Set a reminder for clinical consultation or lab check</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Follow-up Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology Review, Endocrinology Check"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor / Clinic</label>
                  <input
                    type="text"
                    required
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Purpose (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Review blood pressure chart and check cholesterol response..."
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Health Reminders Modal */}
      {showEditReminders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Manage Health Reminders</h3>
                <p className="text-[10px] text-slate-400">Add new reminders, modify targets, or remove existing ones</p>
              </div>
              <button onClick={() => setShowEditReminders(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Reminders List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Active Reminders ({editRemindersList.length})
              </div>
              
              {editRemindersList.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  No reminders left. Add a new reminder below.
                </div>
              ) : (
                editRemindersList.map((rem, idx) => (
                  <div key={rem.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReminderFromDraft(rem.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Reminder Title</label>
                        <input
                          type="text"
                          value={rem.title}
                          onChange={(e) => handleUpdateReminderInDraft(rem.id, 'title', e.target.value)}
                          placeholder="e.g. Take medications on time"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Target / Instruction</label>
                        <input
                          type="text"
                          value={rem.subtitle}
                          onChange={(e) => handleUpdateReminderInDraft(rem.id, 'subtitle', e.target.value)}
                          placeholder="e.g. Morning Dose: Lisinopril 10mg"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Alert Time</label>
                        <input
                          type="time"
                          value={rem.time || '09:00'}
                          onChange={(e) => handleUpdateReminderInDraft(rem.id, 'time', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Repeat Frequency</label>
                        <select
                          value={rem.frequency || 'Daily'}
                          onChange={(e) => handleUpdateReminderInDraft(rem.id, 'frequency', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekdays">Weekdays (Mon-Fri)</option>
                          <option value="Every 2 hours">Every 2 hours</option>
                          <option value="Weekly">Weekly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Add New Reminder Section */}
              <div className="mt-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <span>+ Add More Reminder</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Title</label>
                    <input
                      type="text"
                      value={newRemTitle}
                      onChange={(e) => setNewRemTitle(e.target.value)}
                      placeholder="e.g. Check Blood Sugar"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Target / Instruction</label>
                    <input
                      type="text"
                      value={newRemSubtitle}
                      onChange={(e) => setNewRemSubtitle(e.target.value)}
                      placeholder="e.g. Before breakfast fasting check"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Alert Time</label>
                    <input
                      type="time"
                      value={newRemTime}
                      onChange={(e) => setNewRemTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Frequency</label>
                    <div className="flex gap-2">
                      <select
                        value={newRemFreq}
                        onChange={(e) => setNewRemFreq(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekdays">Weekdays</option>
                        <option value="Every 2 hours">Every 2 hours</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddNewReminderToDraft}
                        disabled={!newRemTitle.trim()}
                        className="px-3.5 py-1.5 bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 transition-colors shadow-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditReminders(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReminderList}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Reminder Alert Modal / Toast */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-blue-500 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 animate-pulse">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    ⏰ Reminder Alert Due Now
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{activeAlert.triggeredAt}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeAlert.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{activeAlert.subtitle}</p>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Scheduled: {formatTime12h(activeAlert.time)}</span>
              </div>
              <span className="text-slate-400 font-medium text-[11px]">{activeAlert.frequency || 'Daily'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveAlert(null);
                  setNotificationMsg(`Snoozed '${activeAlert.title}' for 10 minutes`);
                  setTimeout(() => setNotificationMsg(null), 3000);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-all text-center"
              >
                Snooze 10m
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAlert(null);
                  setNotificationMsg(`✓ '${activeAlert.title}' marked completed!`);
                  setTimeout(() => setNotificationMsg(null), 3500);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
