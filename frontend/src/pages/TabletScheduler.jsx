import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Utensils,
  Ban,
  Calendar,
  Bell,
  BellRing,
  RefreshCw,
  Plus,
  Check,
  Volume2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Timer,
  X,
  Edit2,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function TabletScheduler() {
  const {
    todayDoses,
    handleTakeDose,
    handleAddDose,
    handleUpdateDose,
    handleDeleteDose,
    triggerMedicineReminder,
    refreshData,
    speakText
  } = useHealth();

  // Active form inputs
  const [medicineName, setMedicineName] = useState("Atorvastatin 20mg");
  const [dosage, setDosage] = useState("1 Tablet (20mg)");
  const [frequency, setFrequency] = useState("Once Daily at Bedtime");
  const [instructions, setInstructions] = useState("Take with water. Avoid grapefruit and grapefruit juice.");

  const [scheduling, setScheduling] = useState(false);
  const [scheduledResult, setScheduledResult] = useState(null);
  const [voiceAlertActive, setVoiceAlertActive] = useState(false);

  // Manual Reminders Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDose, setEditingDose] = useState(null);
  const [manualMedName, setManualMedName] = useState("");
  const [manualTime, setManualTime] = useState("08:00 AM");
  const [manualDetail, setManualDetail] = useState("1 Tablet • After Food");
  const [manualStatus, setManualStatus] = useState("Pending");
  const [savingManualDose, setSavingManualDose] = useState(false);

  // Browser & in-app notification state
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [activeDoseAlert, setActiveDoseAlert] = useState(null);
  const [lastFiredDoseMinute, setLastFiredDoseMinute] = useState(null);
  const [enabledAlertDoses, setEnabledAlertDoses] = useState({}); // doseId -> boolean (default true)

  // Soothing dual-tone synthesized chime via Web Audio API (offline & instant)
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
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.12); // B5
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (err) {
      console.warn("Audio chime error:", err);
    }
  };

  // Request browser desktop notification permission
  const requestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          playChime();
          new Notification("💊 Medication Notifications Enabled", {
            body: "You will now receive desktop alerts for scheduled tablet doses even when this tab is in the background.",
            icon: "/favicon.ico"
          });
        }
      } catch (err) {
        console.warn("Notification permission error:", err);
      }
    }
  };

  // Helper to parse time strings (e.g. "08:30 AM", "07:00 PM", "08:00") into { hours, minutes } in 24h
  const parseTimeStr = (str) => {
    if (!str) return null;
    const clean = str.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const parts = clean.replace(/[APM\s]/g, '').split(':');
    if (parts.length < 2) return null;
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return { h, m };
  };

  // Core trigger for both in-app modal, voice announcement, Web Audio chime, AND browser notification
  const handleTriggerAlarm = (medTitle, medTime, medTiming, options = {}) => {
    // 1. Play auditory chime
    playChime();

    // 2. Speak via text-to-speech
    const alertText = `Medication Reminder: It is time to take your ${medTitle}. Recommended: ${medTiming || "after food"}.`;
    speakText(alertText);
    setVoiceAlertActive(true);
    setTimeout(() => setVoiceAlertActive(false), 3500);

    // 3. Dispatch browser desktop notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`💊 Dose Due: ${medTitle}`, {
          body: `Scheduled for ${medTime || "Now"} • ${medTiming || "Follow doctor instructions"}\nClick to open HealthTrack.`,
          icon: "/favicon.ico",
          tag: `dose-${medTitle}-${Date.now()}`,
          renotify: true
        });
      } catch (e) {
        console.warn("Desktop notification dispatch error:", e);
      }
    }

    // 4. In-app global modal
    triggerMedicineReminder(medTitle, medTime || "Now");

    // 5. In-app top banner alert
    setActiveDoseAlert({
      id: options.id || 'custom',
      medicine: medTitle,
      time: medTime || "Now",
      detail: medTiming || "Follow prescription instructions"
    });
  };

  // Background Clock Monitor: Checks every 10 seconds against system time
  useEffect(() => {
    const checkDoses = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const minuteKey = `${currentH}:${currentM < 10 ? '0' : ''}${currentM}`;

      if (lastFiredDoseMinute === minuteKey) return; // already fired in this minute

      if (todayDoses && todayDoses.length > 0) {
        todayDoses.forEach((dose) => {
          if (dose.status === 'Taken') return; // already taken
          if (enabledAlertDoses[dose.id] === false) return; // user disabled alert for this dose

          const parsed = parseTimeStr(dose.time);
          if (parsed && parsed.h === currentH && parsed.m === currentM) {
            setLastFiredDoseMinute(minuteKey);
            handleTriggerAlarm(dose.medicine, dose.time, dose.detail, { id: dose.id });
          }
        });
      }
    };

    const interval = setInterval(checkDoses, 10000); // check every 10 seconds
    return () => clearInterval(interval);
  }, [todayDoses, lastFiredDoseMinute, enabledAlertDoses]);

  // Manual Reminders Handlers
  const handleOpenAddModal = () => {
    setEditingDose(null);
    setManualMedName("");
    setManualTime("08:00 AM");
    setManualDetail("1 Tablet • After Food");
    setManualStatus("Pending");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (dose) => {
    setEditingDose(dose);
    setManualMedName(dose.medicine);
    setManualTime(dose.time);
    setManualDetail(dose.detail);
    setManualStatus(dose.status || "Pending");
    setShowAddModal(true);
  };

  const handleSaveManualDose = async (e) => {
    if (e) e.preventDefault();
    if (!manualMedName.trim() || !manualTime.trim()) return;

    setSavingManualDose(true);
    try {
      if (editingDose) {
        await handleUpdateDose(editingDose.id, {
          medicine: manualMedName.trim(),
          time: manualTime.trim(),
          detail: manualDetail.trim(),
          status: manualStatus
        });
      } else {
        await handleAddDose({
          medicine: manualMedName.trim(),
          time: manualTime.trim(),
          detail: manualDetail.trim(),
          status: manualStatus
        });
      }
      setShowAddModal(false);
      setEditingDose(null);
    } catch (err) {
      console.error("Save manual dose error:", err);
    } finally {
      setSavingManualDose(false);
    }
  };

  const handleDeleteDoseItem = async (doseId) => {
    if (window.confirm("Are you sure you want to delete this medication reminder?")) {
      try {
        await handleDeleteDose(doseId);
      } catch (err) {
        console.error("Delete dose error:", err);
      }
    }
  };

  const presets = [
    {
      name: "Atorvastatin 20mg",
      dose: "1 Tablet (20mg)",
      freq: "Once daily at bedtime",
      instr: "Take with water. Avoid grapefruit or grapefruit juice as it increases drug concentration.",
      badge: "Food Warning: Grapefruit"
    },
    {
      name: "Ciprofloxacin 500mg",
      dose: "1 Tablet (500mg)",
      freq: "Twice daily (every 12 hrs)",
      instr: "Take with plenty of water. Do NOT take with milk, curd, or calcium supplements within 2 hours.",
      badge: "Food Warning: Dairy/Calcium"
    },
    {
      name: "Amoxicillin 500mg",
      dose: "1 Capsule (500mg)",
      freq: "Three times daily (TID)",
      instr: "Take after food every 8 hours. Complete full 7-day course.",
      badge: "Antibiotic Course"
    },
    {
      name: "Pantoprazole 40mg",
      dose: "1 Tablet (40mg)",
      freq: "Once daily in morning",
      instr: "Take 30 minutes before breakfast with a glass of water for acid reflux.",
      badge: "Empty Stomach"
    }
  ];

  const handleGenerateSchedule = async (customName, customDose, customFreq, customInstr) => {
    setScheduling(true);
    setScheduledResult(null);

    const targetName = customName || medicineName;
    const targetDose = customDose || dosage;
    const targetFreq = customFreq || frequency;
    const targetInstr = customInstr || instructions;

    try {
      const res = await fetch('/api/agents/tablet-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: targetName,
          dosage: targetDose,
          frequency: targetFreq,
          instructions: targetInstr
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setScheduledResult(data.data);
        await refreshData();
      }
    } catch (err) {
      console.error("Scheduling error:", err);
    } finally {
      setScheduling(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Autonomous Agents &gt; <span className="text-slate-600 font-medium">Pillar 3: Autonomous Tablet &amp; Medication Scheduling</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Autonomous Tablet &amp; Medication Scheduler</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Featherless AI Active
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Autonomous pharmacokinetics analyzer: identifies drug-drug interactions, flags food contraindications (e.g. grapefruit, dairy), structures optimal daily dosing intervals, and triggers live browser &amp; in-app reminders.
          </p>
        </div>
      </div>

      {/* ACTIVE REAL-TIME POPUP ALERT (IN-APP & BROWSER TOAST) */}
      {activeDoseAlert && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-4 border-2 border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 animate-bounce">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                  🔔 LIVE DOSE ALERT DUE NOW
                </span>
                <span className="text-xs font-bold font-mono opacity-90">{activeDoseAlert.time}</span>
              </div>
              <h4 className="text-base font-bold text-white mt-0.5">{activeDoseAlert.medicine}</h4>
              <p className="text-xs text-white/90">{activeDoseAlert.detail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {activeDoseAlert.id && activeDoseAlert.id !== 'custom' && (
              <button
                onClick={() => {
                  handleTakeDose(activeDoseAlert.id);
                  setActiveDoseAlert(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold shadow transition-all active:scale-95 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Taken</span>
              </button>
            )}
            <button
              onClick={() => setActiveDoseAlert(null)}
              className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP NOTIFICATION CONTROLLER BANNER */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Browser &amp; OS Desktop Notifications</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {notificationPermission === 'granted' ? 'Active & Enabled' : notificationPermission === 'denied' ? 'Blocked in Browser' : 'Permission Required'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Receive native notifications and sound chimes on your laptop/phone even when your browser is minimized or in another tab.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={requestDesktopPermission}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Desktop Alerts</span>
            </button>
          ) : (
            <button
              onClick={() => handleTriggerAlarm("Atorvastatin 20mg", "Bedtime", "Take with water")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test Alert &amp; Chime</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: 1-CLICK CLINICAL PRESETS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>1-Click Presets (Interaction &amp; Food Warning Scenarios):</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMedicineName(p.name);
                setDosage(p.dose);
                setFrequency(p.freq);
                setInstructions(p.instr);
                handleGenerateSchedule(p.name, p.dose, p.freq, p.instr);
              }}
              className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate">{p.name}</span>
                  <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{p.instr}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {p.badge}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
                  <span>Schedule</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: TABLET SCHEDULING FORM */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-indigo-600" />
            <span>Prescription Details &amp; Custom Medication Input</span>
          </span>
          <span className="text-[11px] text-slate-400">
            AI checks baseline: Metformin, Vitamin D3, Levocetirizine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tablet / Medication Name</label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Atorvastatin 20mg or Augmentin 625mg"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Prescribed Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 1 Tablet (20mg)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Prescribed Frequency</label>
            <input
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g. Once daily at bedtime or Twice daily"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Doctor's Instructions &amp; Dietary Notes</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with water, avoid citrus/milk"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleGenerateSchedule()}
            disabled={scheduling}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {scheduling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Analyzing Pharmacology &amp; Generating Reminders...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Autonomous Schedule &amp; Reminders</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 3: AUTONOMOUS AI ANALYSIS RESULT */}
      {scheduledResult && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-200 shadow-md space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {scheduledResult.scheduledMedication?.name}
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                      SCHEDULE ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prescribed: {scheduledResult.scheduledMedication?.frequency} &bull; Next Dose: <strong className="text-indigo-700">{scheduledResult.scheduledMedication?.timing}</strong>
                  </p>
                </div>
              </div>

              {/* Test Live Audio/Visual Reminder Button */}
              <button
                onClick={() => handleTriggerAlarm(
                  scheduledResult.scheduledMedication?.name,
                  scheduledResult.scheduledMedication?.timing,
                  scheduledResult.analysis?.recommendedSchedule?.timing
                )}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-95 text-xs font-bold shadow-md shadow-indigo-500/25 self-start sm:self-auto"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Test Live Reminder &amp; Voice Chime</span>
              </button>
            </div>

            {/* 3 Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              {/* Timing */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                <span className="text-[10px] text-indigo-700 font-bold uppercase block tracking-wider">Optimal Dosing Time</span>
                <div className="text-xl font-black text-indigo-950 font-mono">
                  {scheduledResult.analysis?.recommendedSchedule?.time || "08:30 PM"}
                </div>
                <div className="text-xs font-semibold text-indigo-800 flex items-center gap-1 mt-1">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{scheduledResult.analysis?.recommendedSchedule?.timing || "After Food"}</span>
                </div>
              </div>

              {/* Interaction Severity */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Drug-Drug Interaction Check</span>
                <div className={`text-xl font-black ${
                  scheduledResult.analysis?.interactionSeverity === 'Severe' ? 'text-red-600' :
                  scheduledResult.analysis?.interactionSeverity === 'Moderate' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {scheduledResult.analysis?.interactionSeverity || "None"}
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {scheduledResult.analysis?.interactionDetails || "No harmful conflicts with current baseline medications."}
                </p>
              </div>

              {/* Food Warnings */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[10px] text-amber-800 font-bold uppercase block tracking-wider flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5 text-amber-600" />
                  <span>Food &amp; Dietary Precautions</span>
                </span>
                <div className="text-xs font-bold text-amber-950 mt-1">
                  Avoid: {scheduledResult.analysis?.foodContraindications?.join(', ') || scheduledResult.analysis?.recommendedSchedule?.avoid || "Alcohol"}
                </div>
                <div className="text-[11px] text-amber-800 flex items-center gap-1 mt-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Take with: {scheduledResult.analysis?.recommendedSchedule?.takeWith || "Full glass of water"}</span>
                </div>
              </div>

            </div>

            {/* Missed Dose Protocol & Safety Advisory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Missed Dose Protocol:</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {scheduledResult.analysis?.missedDoseGuidance || "Take as soon as remembered unless close to the next scheduled dose. Never double up doses."}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pharmacological Safety Advisory:</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {scheduledResult.analysis?.safetyAdvisory || "Follow regular hydration and report any persistent nausea, rash, or dizziness to your physician."}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 4: TODAY'S ACTIVE DOSING SCHEDULE & LIVE REMINDERS */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Today's Live Medication Reminders &amp; Schedule</span>
            </h2>
            <p className="text-xs text-slate-500">
              Synchronized 24-hour daily timeline. Add manual reminders, edit times, click "Take Now", or test browser alarms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-xl border border-indigo-100">
              {todayDoses.filter(d => d.status === 'Taken').length}/{todayDoses.length} Doses Taken
            </span>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {todayDoses.map((dose) => {
            const isTaken = dose.status === 'Taken';
            const isDue = dose.status === 'Due';

            return (
              <div
                key={dose.id}
                className={`py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl transition-colors ${
                  isTaken ? 'bg-slate-50/60' : isDue ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 text-xs font-bold font-mono px-2.5 py-1 rounded-lg shrink-0 ${
                    isTaken ? 'bg-slate-200 text-slate-600' :
                    isDue ? 'bg-amber-500 text-white animate-pulse' :
                    'bg-indigo-50 text-indigo-700'
                  }`}>
                    {dose.time}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${isTaken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {dose.medicine}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {dose.detail}
                    </p>
                    {isTaken && dose.timeTaken && (
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                        ✓ Taken at {dose.timeTaken}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Toggle Alarm for this dose */}
                  <button
                    onClick={() => {
                      setEnabledAlertDoses(prev => ({
                        ...prev,
                        [dose.id]: prev[dose.id] === false ? true : false
                      }));
                    }}
                    className={`p-1.5 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
                      enabledAlertDoses[dose.id] !== false
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                    title={enabledAlertDoses[dose.id] !== false ? "Alerts Enabled (Click to Mute)" : "Alerts Muted (Click to Enable)"}
                  >
                    {enabledAlertDoses[dose.id] !== false ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] hidden md:inline">Alert On</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] hidden md:inline">Muted</span>
                      </>
                    )}
                  </button>

                  {/* Test Alarm & Browser Notification Button */}
                  <button
                    onClick={() => handleTriggerAlarm(dose.medicine, dose.time, dose.detail, { id: dose.id })}
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Test Voice, Chime & Desktop Notification for this dose"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Edit Dose Button */}
                  <button
                    onClick={() => handleOpenEditModal(dose)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit Medication Reminder"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Dose Button */}
                  <button
                    onClick={() => handleDeleteDoseItem(dose.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Taken Toggle Button */}
                  {!isTaken ? (
                    <button
                      onClick={() => handleTakeDose(dose.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Take Now</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* SECTION 5: MODAL FOR ADDING / EDITING MANUAL MEDICATION REMINDER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingDose ? "Edit Medication Reminder" : "Add Manual Medication Reminder"}
                  </h3>
                  <p className="text-[11px] text-indigo-100">
                    Custom reminder with live browser alerts &amp; audio chimes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveManualDose} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Medication / Tablet Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualMedName}
                  onChange={(e) => setManualMedName(e.target.value)}
                  placeholder="e.g. Lisinopril 10mg, Metformin 500mg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="e.g. 08:30 AM or 09:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Format: 08:30 AM / 08:00 PM</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Due">Due</option>
                    <option value="Taken">Taken</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Dosage &amp; Instructions
                </label>
                <input
                  type="text"
                  value={manualDetail}
                  onChange={(e) => setManualDetail(e.target.value)}
                  placeholder="e.g. 1 Tablet • After Food with warm water"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <BellRing className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  When the clock reaches this time, HealthTrack will automatically ring an audio chime, speak the voice prompt, and push a browser desktop notification to your screen.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingManualDose}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {savingManualDose ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingDose ? "Update Reminder" : "Save Reminder"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
