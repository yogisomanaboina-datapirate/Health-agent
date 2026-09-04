import React from 'react';
import {
  Heart,
  FileText,
  Pill,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Siren,
  BotMessageSquare,
  TrendingUp,
  Activity,
  ShieldCheck,
  FolderArchive,
  ArrowRight
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function Dashboard() {
  const {
    user,
    stats,
    timeline,
    todayDoses,
    insights,
    setActiveTab,
    triggerMedicineReminder,
    handleTakeDose
  } = useHealth();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Title & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hello, {user?.name ? user.name.split(' ')[0] : 'Priya'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your complete health overview, organized and explained by AI.
          </p>
        </div>

        {/* Quick Agent Launcher Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('ambulance-response')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold shadow-sm transition-all"
          >
            <Siren className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>1. Ambulance &amp; Hospitals</span>
          </button>
          <button
            onClick={() => setActiveTab('insurance-claims')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Insurance &amp; Claims</span>
          </button>
          <button
            onClick={() => setActiveTab('tablet-scheduler')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <span>3. Tablet Scheduler</span>
          </button>
          <button
            onClick={() => setActiveTab('doctor-shareable')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
            <span>4. Doctor Vault</span>
          </button>
        </div>
      </div>

      {/* Autonomous Insurance & Claim Help Spotlight Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-blue-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-white">Active Policy: Star Health Comprehensive PPO</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                ACTIVE &amp; VERIFIED
              </span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                POL-HLTH-884219
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-1">
              Autonomous Claim Help &bull; Sum Insured: <strong className="text-white">₹10,00,000</strong> (Remaining: ₹8,50,000) &bull; Cashless at 8,500+ Hospitals &bull; Featherless AI Pre-Auth Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setActiveTab('insurance-claims')}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition-all"
          >
            <span>Open Insurance &amp; Claim Agent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Stats Cards Row (Matching Page 2) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Health Score */}
        <div
          onClick={() => setActiveTab('timeline')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Health Score</span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.healthScore || 78}</span>
            <span className="text-xs text-slate-400 font-medium">/100</span>
            <span className="ml-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Good
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+6 points from last month</span>
          </p>
        </div>

        {/* 2. Records */}
        <div
          onClick={() => setActiveTab('records')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Records</span>
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.recordsCount || 24}</span>
            <span className="text-xs text-slate-500 font-medium">Documents</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 truncate">
            Reports, prescriptions, bills
          </p>
        </div>

        {/* 3. Medications */}
        <div
          onClick={() => setActiveTab('medications')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Medications</span>
            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Pill className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.activeMedsCount || 5}</span>
            <span className="text-xs text-slate-500 font-medium">Active</span>
          </div>
          <p className="text-[10px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>2 due in next 2 hours</span>
          </p>
        </div>

        {/* 4. Follow-ups */}
        <div
          onClick={() => setActiveTab('follow-ups')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Follow-ups</span>
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.upcomingFollowUpsCount || 2}</span>
            <span className="text-xs text-slate-500 font-medium">Upcoming</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 truncate">
            Next: 23 May 2025
          </p>
        </div>

        {/* 5. Health Insights */}
        <div
          onClick={() => setActiveTab('insights')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Health Insights</span>
            <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.newInsightsCount || 3}</span>
            <span className="text-xs text-slate-500 font-medium">New Insights</span>
          </div>
          <p className="text-[10px] text-purple-600 font-medium mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>AI detected changes</span>
          </p>
        </div>

      </div>

      {/* Two Column Layout: Health Timeline & Today's Care */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Health Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">Health Timeline</h2>
            <button
              onClick={() => setActiveTab('timeline')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {timeline.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'Lab Report') setActiveTab('lab-reports');
                  else if (item.type === 'Prescription') setActiveTab('prescriptions');
                  else setActiveTab('records');
                }}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-xs text-slate-400 font-medium whitespace-nowrap w-24">
                    {item.date}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.status === 'Analyzed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                    item.status === 'Normal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Medications, Insights & Emergency (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Today's Medications */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-900">Today's Medications</h2>
              <button
                onClick={() => setActiveTab('medications')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {todayDoses.slice(0, 3).map((dose) => (
                <div
                  key={dose.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{dose.medicine}</h4>
                      <p className="text-[10px] text-slate-400">{dose.detail}</p>
                    </div>
                  </div>

                  <div>
                    {dose.status === 'Taken' ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Taken</span>
                      </span>
                    ) : dose.status === 'Due' ? (
                      <button
                        onClick={() => triggerMedicineReminder(dose.medicine, dose.time)}
                        className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg shadow-sm shadow-blue-500/30 transition-all"
                      >
                        Due Now
                      </button>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Pending {dose.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Health Insight Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>AI Health Insight</span>
              </span>
              <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                New
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Your <strong>Vitamin D</strong> has improved compared to last month. From <span className="text-slate-500">18 ng/mL</span> to <strong className="text-emerald-700">28 ng/mL</strong>.
            </p>
            <button
              onClick={() => setActiveTab('insights')}
              className="mt-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Details</span>
              <span>→</span>
            </button>
          </div>

          {/* Emergency & Hospitals Quick Card */}
          <div className="bg-gradient-to-br from-rose-50 via-white to-red-50 rounded-2xl p-4 border border-rose-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Siren className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-bold text-slate-900">Emergency & Hospitals</span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                  New
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Check nearby hospitals and bed availability in an emergency.
              </p>
              <button
                onClick={() => setActiveTab('hospital-finder')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 pt-1"
              >
                <span>Find Hospitals</span>
                <span>→</span>
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Floating Banner: Ask AI Health Assistant (Matching Page 2) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <BotMessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Ask AI Health Assistant</h3>
            <p className="text-xs text-blue-200/80">
              Get instant answers about your reports, medications, symptoms, and more.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
        >
          <span>Ask Now</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
