import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Siren,
  ShieldCheck,
  Pill,
  FolderArchive,
  FileSearch,
  FlaskConical,
  History,
  CalendarClock,
  BotMessageSquare,
  Settings,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useHealth();

  const primaryAgents = [
    { id: 'ambulance-response', label: '1. Ambulance & Hospitals', icon: Siren, badge: 'Live SOS' },
    { id: 'insurance-claims', label: '2. Insurance & Claims', icon: ShieldCheck, badge: 'AI Pre-Auth' },
    { id: 'tablet-scheduler', label: '3. Tablet Scheduler', icon: Pill, badge: 'Auto' },
    { id: 'doctor-shareable', label: '4. Doctor Share Vault', icon: FolderArchive, badge: 'HIPAA' },
    { id: 'multi-agent-hub', label: 'Multi-Agent Hub', icon: Zap, badge: 'AI Engine' },
  ];

  const clinicalViews = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Document', icon: Sparkles, badge: 'AI Scan' },
    { id: 'records', label: 'Health Records Vault', icon: FolderArchive },
    { id: 'report-analyzer', label: 'Report Analyzer', icon: FileSearch, badge: 'AI' },
    { id: 'lab-reports', label: 'Lab Reports', icon: FlaskConical },
    { id: 'timeline', label: 'Health Timeline', icon: History },
    { id: 'follow-ups', label: 'Follow-ups & Signals', icon: CalendarClock },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: BotMessageSquare },
    { id: 'profile', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 p-4 border-r border-slate-800 select-none overflow-y-auto">
      
      <div className="space-y-5">
        
        {/* Brand Header (Clickable Redirection to Dashboard / Home) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 px-2 py-1 text-left w-full hover:opacity-90 active:scale-95 transition-all group focus:outline-none"
          title="Go to Home / Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-sm group-hover:text-blue-400 transition-colors">LifeLink / HealthTrack</div>
            <div className="text-[10px] text-blue-400 font-medium">Autonomous Multi-Agent AI</div>
          </div>
        </button>

        {/* Section 1: The 5 Core Operational AI Agents */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            5 Core Autonomous Agents
          </span>
          <nav className="space-y-1">
            {primaryAgents.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm shrink-0 ${
                      item.badge === 'All 5 AI' ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white animate-pulse' :
                      item.badge === 'Live SOS' ? 'bg-red-600 text-white' :
                      'bg-indigo-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Clinical Views & Dashboard */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
            Clinical Records &amp; Views
          </span>
          <nav className="space-y-1">
            {clinicalViews.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Bottom Mascot Card */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="relative rounded-2xl bg-gradient-to-b from-blue-950/80 to-slate-900 border border-blue-800/40 p-3 overflow-hidden shadow-lg">
          <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
            <span>AI Doctor Assistant</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
            Featherless Qwen2.5 active &amp; ready.
          </p>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-900/50 hover:bg-blue-900/80 border border-blue-700/50 px-2 py-1 rounded-lg transition-all"
          >
            Start Dialogue →
          </button>
        </div>
      </div>

    </aside>
  );
}
