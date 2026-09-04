import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Activity,
  User,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Siren,
  FileText,
  Pill,
  Calendar,
  FlaskConical,
  X,
  ArrowRight,
  ExternalLink,
  LogOut,
  Users,
  RefreshCw,
  Check
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function Navbar() {
  const {
    user,
    notifications,
    setNotifications,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    records,
    medications,
    todayDoses,
    timeline,
    logoutUser
  } = useHealth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const notificationContainerRef = useRef(null);
  const profileMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(item => item.id === notification.id ? { ...item, unread: false } : item)
    );
    setShowNotifications(false);

    // Smart redirect based on notification type
    if (notification.type === 'dose') {
      setActiveTab('tablet-schedule');
    } else if (notification.type === 'lab') {
      setActiveTab('lab-reports');
    } else if (notification.type === 'appointment') {
      setActiveTab('follow-ups');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Close search, notification & profile dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search matches across medications, records, today's doses, and timeline events
  const q = (searchQuery || '').trim().toLowerCase();

  const matchedMeds = q
    ? (medications || []).filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.dosage?.toLowerCase().includes(q) ||
        m.purpose?.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedDoses = q
    ? (todayDoses || []).filter(d =>
        d.medicine?.toLowerCase().includes(q) ||
        d.detail?.toLowerCase().includes(q) ||
        d.time?.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedRecords = q
    ? (records || []).filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q) ||
        r.doctor?.toLowerCase().includes(q) ||
        r.provider?.toLowerCase().includes(q) ||
        r.summary?.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedTimeline = q
    ? (timeline || []).filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q) ||
        t.doctor?.toLowerCase().includes(q) ||
        t.summary?.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const totalMatchesCount = matchedMeds.length + matchedDoses.length + matchedRecords.length + matchedTimeline.length;

  const handleSelectResult = (tabName, clearSearch = false) => {
    setActiveTab(tabName);
    setIsSearchFocused(false);
    if (clearSearch) setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Brand / Title (Clickable Redirection to Dashboard / Home) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 text-left hover:opacity-90 active:scale-95 transition-all group focus:outline-none"
          title="Go to Home / Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                HealthTrack AI
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Autonomous
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Your intelligent health companion</p>
          </div>
        </button>

        {/* Center: Global Search with Live Results Dropdown */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl mx-4 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicines, tests, symptoms, doctors, records..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchFocused(false);
                } else if (e.key === 'Enter' && q) {
                  // Direct to Health Records by default or first match
                  handleSelectResult('records');
                }
              }}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full pl-10 pr-9 py-2 border border-transparent focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Portal */}
          {isSearchFocused && q.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto divide-y divide-slate-100">
              
              {/* Header result count */}
              <div className="px-4 pb-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Found <strong className="text-slate-800">{totalMatchesCount}</strong> results for &ldquo;<span className="text-blue-600 font-semibold">{q}</span>&rdquo;
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                  Press Esc to close
                </span>
              </div>

              {totalMatchesCount === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <Search className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                  <p className="font-semibold text-slate-600">No medical records or medicines found matching &ldquo;{q}&rdquo;</p>
                  <p className="text-[11px] text-slate-400">Try searching for &quot;Metformin&quot;, &quot;Blood Test&quot;, &quot;Dr. Mehta&quot;, or &quot;Lipid&quot;</p>
                </div>
              ) : (
                <>
                  {/* Category: Medications & Doses */}
                  {(matchedMeds.length > 0 || matchedDoses.length > 0) && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                        <Pill className="w-3 h-3 text-indigo-500" />
                        <span>Medications &amp; Today&apos;s Doses</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedDoses.map(dose => (
                          <div
                            key={dose.id}
                            onClick={() => handleSelectResult('tablet-schedule')}
                            className="p-2.5 rounded-xl hover:bg-indigo-50/70 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                {dose.time}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                                  {dose.medicine}
                                </h4>
                                <p className="text-[11px] text-slate-500">{dose.detail}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Scheduler</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}

                        {matchedMeds.map(med => (
                          <div
                            key={med.id}
                            onClick={() => handleSelectResult('tablet-schedule')}
                            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Pill className="w-3 h-3" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                                  {med.name} {med.dosage}
                                </h4>
                                <p className="text-[11px] text-slate-500">{med.purpose || med.instructions}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{med.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Medical Records & Documents */}
                  {matchedRecords.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span>Clinical Documents &amp; Lab Reports</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedRecords.map(rec => (
                          <div
                            key={rec.id}
                            onClick={() => {
                              if (rec.type === 'Lab Report') handleSelectResult('lab-reports');
                              else handleSelectResult('records');
                            }}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                                {rec.type === 'Lab Report' ? (
                                  <FlaskConical className="w-3.5 h-3.5" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate max-w-sm">
                                  {rec.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate max-w-sm">
                                  {rec.doctor || rec.provider} &bull; <span className="text-slate-400">{rec.date}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                {rec.type}
                              </span>
                              <ArrowRight className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Timeline History */}
                  {matchedTimeline.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        <span>Timeline History &amp; Vitals</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedTimeline.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectResult('timeline')}
                            className="p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Clock className="w-3 h-3" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                                  {item.title}
                                </h4>
                                <p className="text-[11px] text-slate-500">{item.date} &bull; {item.summary || item.details}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Timeline</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Footer navigation */}
              <div className="p-2.5 bg-slate-50 px-4 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Jump directly to modules:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectResult('records')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View in Records &rarr;
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleSelectResult('timeline')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View in Timeline &rarr;
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Agent Quick Switcher */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ambulance-response')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ambulance-response'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span>1. Ambulance</span>
          </button>
          <button
            onClick={() => setActiveTab('insurance-claims')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'insurance-claims'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 ring-2 ring-blue-400/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Insurance &amp; Claims</span>
            <span className="text-[9px] bg-blue-600 text-white px-1 rounded font-bold ml-0.5">NEW</span>
          </button>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Primary Quick Upload Button */}
          <button
            onClick={() => setActiveTab('upload')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New</span>
          </button>

          {/* Notifications Dropdown */}
          <div ref={notificationContainerRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-100">
                        {unreadCount} unread
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                        All caught up
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto stroke-1 mb-2" />
                      <p className="font-semibold text-slate-600">No active notifications</p>
                      <p className="text-[11px] text-slate-400">Scheduled alarms &amp; lab alerts will appear here</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer group ${
                          n.unread ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'dose' && (
                            <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'appointment' && (
                            <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'lab' && (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                              {n.title}
                            </p>
                            {n.unread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.detail}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                            <span className="text-[10px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <span>Open</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Quick Links */}
                <div className="p-2.5 bg-slate-50 px-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Quick views:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('follow-ups');
                        setShowNotifications(false);
                      }}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Follow-ups
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      onClick={() => {
                        setActiveTab('lab-reports');
                        setShowNotifications(false);
                      }}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Labs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Interactive Account Switcher */}
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all ${
                showProfileMenu
                  ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                  : 'hover:bg-slate-100 border-transparent hover:border-slate-200 text-slate-800'
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/20 shadow-sm">
                  {user?.name?.slice(0, 2).toUpperCase() || 'PS'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white"></span>
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold leading-tight truncate max-w-[120px]">
                  {user?.name || 'Priya Sharma'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {user?.bloodGroup ? `${user.bloodGroup} • ` : ''}{user?.healthTrackId || 'HTA-293847'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-200 ${
                showProfileMenu ? 'rotate-180 text-blue-600' : ''
              }`} />
            </button>

            {/* Profile & Switch Account Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active User Header */}
                <div className="px-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                      {user?.name?.slice(0, 2).toUpperCase() || 'PS'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{user?.name || 'Priya Sharma'}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'priya.sharma@email.com'}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {user?.healthTrackId || 'HTA-293847'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Score {user?.healthScore || 78}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full mt-3 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View &amp; Edit Full Profile</span>
                  </button>
                </div>

                {/* Account Security Notice */}
                <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Session encrypted &amp; isolated to this patient</span>
                </div>

                {/* Log Out Action */}
                <div className="pt-2 px-3">
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await logoutUser();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Switch Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
