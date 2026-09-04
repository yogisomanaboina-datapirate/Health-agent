import React, { useState } from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
  Droplets,
  Utensils,
  Ban,
  UploadCloud,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function Medications() {
  const { todayDoses, triggerMedicineReminder, handleTakeDose, setActiveTab } = useHealth();
  const [checkingInteraction, setCheckingInteraction] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');

  const medicines = [
    {
      id: "med_1",
      name: "Metformin 500mg",
      type: "Tablet • For Diabetes",
      schedule: "08:30 AM • 08:30 PM",
      timing: "After Food",
      duration: "1 Apr - 30 Jun 2025",
      status: "Active",
      adherence: 95
    },
    {
      id: "med_2",
      name: "Vitamin D3 60K IU",
      type: "Capsule • For Bone Health",
      schedule: "10:30 AM • Weekly (Sun)",
      timing: "After Food",
      duration: "12 Apr - 12 Jul 2025",
      status: "Active",
      adherence: 90
    },
    {
      id: "med_3",
      name: "Calcium Tablet 500mg",
      type: "Tablet • For Bone Health",
      schedule: "07:00 PM • Daily",
      timing: "After Food",
      duration: "25 Apr - 25 Jun 2025",
      status: "Active",
      adherence: 85
    },
    {
      id: "med_4",
      name: "Atorvastatin 10mg",
      type: "Tablet • For Cholesterol",
      schedule: "09:00 PM • Daily",
      timing: "Before Bed",
      duration: "10 Mar - 10 Jun 2025",
      status: "Active",
      adherence: 92
    },
    {
      id: "med_5",
      name: "Levocetirizine 5mg",
      type: "Tablet • For Allergy",
      schedule: "09:00 AM • Daily",
      timing: "Before Food",
      duration: "15 May - 25 May 2025",
      status: "Active",
      adherence: 100
    }
  ];

  // AI Drug Interaction Check
  const runInteractionCheck = async (medicineToTest) => {
    setCheckingInteraction(true);
    setInteractionResult(null);
    try {
      const res = await api.runCoordinator('MEDICATION_ADD', {
        medication: { name: medicineToTest || "Aspirin 81mg" }
      });
      if (res.success) {
        setInteractionResult(res.data.decisions?.medication);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingInteraction(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Dashboard &gt; <span className="text-slate-600 font-medium">Medications</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Medications</h1>
          <p className="text-xs text-slate-500">Manage your medicines, schedules and adherence in one place.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => runInteractionCheck("Warfarin 5mg")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Check Interaction</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-400">Active Medicines</span>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">5</div>
          <span className="text-[10px] text-slate-400">Currently taking</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-400">Today's Doses</span>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">8</div>
          <span className="text-[10px] text-slate-400">Across all medicines</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-400">Taken Today</span>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">5</div>
          <span className="text-[10px] text-emerald-600 font-medium">Doses taken</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-400">Pending Doses</span>
          <div className="text-2xl font-bold text-amber-600 mt-0.5">3</div>
          <span className="text-[10px] text-amber-600 font-medium">Remaining today</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 col-span-2 md:col-span-1">
          <span className="text-[11px] font-medium text-slate-400">Next Dose</span>
          <div className="text-xl font-bold text-blue-600 mt-1">10:30 AM</div>
          <span className="text-[10px] text-slate-400 truncate block">Vitamin D3 60K</span>
        </div>
      </div>

      {/* Drug Interaction Alert Drawer (If Checked) */}
      {interactionResult && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-amber-900">
                AI Interaction Analysis: Severity {interactionResult.interactionSeverity}
              </h4>
            </div>
            <button onClick={() => setInteractionResult(null)} className="text-xs text-amber-700 hover:underline">
              Dismiss
            </button>
          </div>
          <p className="text-xs text-amber-800 mb-2">{interactionResult.interactionDetails}</p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {interactionResult.foodContraindications?.map((fc, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 font-medium">
                • {fc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Your Medicines List & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Your Medicines Table & Medication Insights */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Your Medicines Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Your Medicines</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>View Calendar</span>
                <span>•</span>
                <span>All Status</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Medicine Details</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-slate-700 block">{m.timing}</span>
                          <span className="text-[10px] text-slate-400">{m.schedule}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{m.duration}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medication Insights (Page 4) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Medication Insights</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Adherence Gauge */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Adherence This Week</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-slate-900">
                    85%
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600">Great!</span>
                    <p className="text-[10px] text-slate-500">You took 17 out of 20 doses this week</p>
                  </div>
                </div>
              </div>

              {/* Most Taken Medicine */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Most Taken Medicine</span>
                <div className="mt-2">
                  <div className="font-bold text-xs text-slate-900">Metformin 500mg</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">95% adherence</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full w-[95%]"></div>
                  </div>
                </div>
              </div>

              {/* Take Medicine With Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Take Medicine With</span>
                <div className="flex items-center justify-around mt-3 text-center">
                  <div>
                    <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-600">Water</span>
                  </div>
                  <div>
                    <Utensils className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-600">Food</span>
                  </div>
                  <div>
                    <Ban className="w-4 h-4 text-red-500 mx-auto mb-1" />
                    <span className="text-[10px] text-red-600 font-semibold">Avoid Grapefruit</span>
                  </div>
                </div>
              </div>

            </div>

            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Always follow your doctor's instructions. Do not stop or change any medicine without consulting your doctor.
            </p>
          </div>

        </div>

        {/* Right 4 Cols: Today's Schedule & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Today's Schedule Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Today's Schedule</h3>
              <span className="text-[11px] text-slate-400">20 May 2025</span>
            </div>

            <div className="space-y-3">
              {todayDoses.map((td) => (
                <div key={td.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 w-16 text-[11px]">{td.time}</span>
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">{td.medicine}</span>
                      <span className="text-[10px] text-slate-400">{td.detail}</span>
                    </div>
                  </div>

                  <div>
                    {td.status === 'Taken' ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Taken
                      </span>
                    ) : td.status === 'Due' ? (
                      <button
                        onClick={() => triggerMedicineReminder(td.medicine, td.time)}
                        className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        Take Now
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (Matching Page 4) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Quick Actions</h3>

            <button
              onClick={() => setActiveTab('upload')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Upload Prescription</div>
                <div className="text-[10px] text-slate-400">Extract medicines using AI</div>
              </div>
              <UploadCloud className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={() => triggerMedicineReminder()}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Set Reminder</div>
                <div className="text-[10px] text-slate-400">Test audio reminder modal</div>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => runInteractionCheck("Atorvastatin + Clarithromycin")}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">View Interactions</div>
                <div className="text-[10px] text-slate-400">Check medicine interactions</div>
              </div>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
