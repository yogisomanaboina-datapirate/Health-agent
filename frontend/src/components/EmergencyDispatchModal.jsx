import React, { useState, useEffect } from 'react';
import { Siren, Phone, MapPin, CheckCircle, ShieldAlert, X, Navigation } from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function EmergencyDispatchModal() {
  const { activeDispatch, setActiveDispatch } = useHealth();
  const [secondsLeft, setSecondsLeft] = useState(360); // 6 mins default

  useEffect(() => {
    if (!activeDispatch) return;
    const initialSeconds = (activeDispatch.etaMinutes || 6) * 60;
    setSecondsLeft(initialSeconds);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeDispatch]);

  if (!activeDispatch) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-red-500/60 overflow-hidden">
        
        {/* Glowing Red Emergency Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-red-500/50">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-red-400 uppercase tracking-wider">Emergency Dispatch</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                  CODE RED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Mission #{activeDispatch.missionId || 'SOS-948210'}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveDispatch(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live ETA Countdown */}
        <div className="my-6 text-center bg-gradient-to-b from-red-950/40 to-slate-950 rounded-2xl p-4 border border-red-900/50">
          <p className="text-xs font-semibold text-slate-400 mb-1">AMBULANCE ARRIVAL IN</p>
          <div className="text-4xl font-extrabold text-white tracking-tight font-mono text-red-400">
            0{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{activeDispatch.ambulanceUnit || 'ALS Unit #42'} en route to your location</span>
          </p>
        </div>

        {/* Allocated Hospital & Bed Details */}
        <div className="space-y-3 text-xs bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400">Destination Hospital</span>
              <p className="font-bold text-white text-sm mt-0.5">{activeDispatch.hospital}</p>
              <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{activeDispatch.hospitalAddress}</span>
              </p>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-700/60 flex justify-between items-center">
            <span className="text-slate-400">Bed Allocation</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {activeDispatch.allocatedBed || "Emergency Trauma & ICU Bed #04"}
            </span>
          </div>
        </div>

        {/* Emergency Hotline Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${activeDispatch.emergencyPhone || '108'}`}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver / Desk</span>
          </a>

          <button
            onClick={() => setActiveDispatch(null)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>View Map Route</span>
          </button>
        </div>

      </div>
    </div>
  );
}
