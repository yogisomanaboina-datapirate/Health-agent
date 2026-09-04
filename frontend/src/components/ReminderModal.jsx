import React from 'react';
import { Bell, Clock, X, Check, Droplets, Utensils } from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function ReminderModal() {
  const { activeReminder, setActiveReminder, handleTakeDose } = useHealth();

  if (!activeReminder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-800/50 text-center overflow-hidden">
        
        {/* Top bar with Snooze button */}
        <div className="flex items-center justify-between text-xs text-indigo-300 mb-6">
          <span className="text-[10px] font-medium tracking-wide text-indigo-400 uppercase">Medication Alert</span>
          <button
            onClick={() => setActiveReminder(null)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[11px] font-medium transition-colors"
          >
            Snooze
          </button>
        </div>

        {/* Pulsing Bell Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/40 mb-4 animate-bounce">
          <Bell className="w-8 h-8" />
        </div>

        {/* Heading & Medicine Details */}
        <h3 className="text-base font-medium text-indigo-200 mb-1">Time to Take Medicine</h3>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          {activeReminder.medicine}
        </h2>

        {/* Digital Time Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-900/60 border border-indigo-700/50 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold text-indigo-200">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>{activeReminder.time}</span>
        </div>

        {/* Instructions */}
        <div className="flex items-center justify-center gap-4 text-xs text-indigo-300/90 mb-6 bg-slate-800/40 py-2.5 rounded-xl border border-slate-700/40">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>Take with water</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeReminder.instructions || "After food"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleTakeDose(activeReminder.id || 'td_03')}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>I've Taken It</span>
          </button>

          <button
            onClick={() => setActiveReminder(null)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Remind Me Later
          </button>
        </div>

        <button
          onClick={() => setActiveReminder(null)}
          className="mt-4 text-[10px] text-slate-400 hover:text-slate-300 underline"
        >
          Don't show again for this medication
        </button>

      </div>
    </div>
  );
}
