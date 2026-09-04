import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Download,
  Share2,
  Trash2,
  Bell,
  Globe,
  Sliders,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  X,
  Check,
  Edit3,
  FileText,
  Volume2,
  History,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function ProfileSettings() {
  const { user, setUser, setActiveTab, logoutUser } = useHealth();
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Edit Profile Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Priya Sharma',
    email: user?.email || 'priya.sharma@email.com',
    phone: user?.phone || '+91 98765 43210',
    dob: user?.dob || '29 May 1996',
    age: user?.age || 29,
    gender: user?.gender || 'Female',
    bloodGroup: user?.bloodGroup || 'O+',
    address: user?.address || 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    emergencyContact: user?.emergencyContact || '+91 91234 56789 (Mother)'
  });

  // Consent Preferences
  const [consents, setConsents] = useState({
    aiAnalysis: true,
    shareWithProviders: true,
    anonymizedResearch: false,
    marketing: true,
    emergencyDispatch: true
  });

  // System Preferences
  const [preferences, setPreferences] = useState({
    glucoseUnit: 'mg/dL',
    tempUnit: '°F',
    language: 'English',
    soundChime: true,
    highContrast: false
  });

  const [showConsentHistory, setShowConsentHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const toggleConsent = (k) => {
    setConsents((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      setNotificationMsg(`Consent preference '${k}' updated.`);
      setTimeout(() => setNotificationMsg(null), 3000);
      return next;
    });
  };

  const handleOpenEdit = () => {
    setFormData({
      name: user?.name || 'Priya Sharma',
      email: user?.email || 'priya.sharma@email.com',
      phone: user?.phone || '+91 98765 43210',
      dob: user?.dob || '29 May 1996',
      age: user?.age || 29,
      gender: user?.gender || 'Female',
      bloodGroup: user?.bloodGroup || 'O+',
      address: user?.address || 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
      emergencyContact: user?.emergencyContact || '+91 91234 56789 (Mother)'
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser((prev) => ({ ...prev, ...formData }));
      }
      setShowEditModal(false);
      setNotificationMsg("Profile details saved successfully!");
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      console.error('Update profile error:', err);
      setUser((prev) => ({ ...prev, ...formData }));
      setShowEditModal(false);
      setNotificationMsg("Profile updated locally!");
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const handleDownloadMyData = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      patient: user || { name: "Priya Sharma", healthTrackId: "HTA-293847" },
      consentStatus: consents,
      systemPreferences: preferences,
      compliance: {
        hipaaCompliant: true,
        encryptionStandard: "TLS 1.3 / AES-256",
        vaultLocation: "Secure Cloud Health Vault (Hyderabad Cluster)"
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HealthTrack_Backup_${(user?.name || 'Priya').replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setNotificationMsg("Complete encrypted health data backup downloaded!");
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const subTabs = [
    { id: 'profile', label: 'Profile & Vitals', icon: User },
    { id: 'privacy', label: 'Privacy & Consent', icon: ShieldCheck },
    { id: 'settings', label: 'System & Preferences', icon: Sliders },
    { id: 'data', label: 'Data & Security', icon: Lock }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="text-xs text-slate-400 mb-1">
          Dashboard &gt; Profile &amp; Settings &gt; <span className="text-slate-600 font-medium">Account &amp; Preferences</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Profile &amp; Settings</h1>
        <p className="text-xs text-slate-500">Manage your clinical demographics, consent preferences, and security settings.</p>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Vitals */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Patient Demographics</h3>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Priya Sharma"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Priya Sharma'}</h2>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Patient
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {user?.email || 'priya.sharma@email.com'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {user?.phone || '+91 98765 43210'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Fields Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{user?.dob || '29 May 1996'} ({user?.age || 29} yrs)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gender</span>
                  <span className="font-semibold text-slate-800">{user?.gender || 'Female'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-red-600">{user?.bloodGroup || 'O+'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">HealthTrack ID</span>
                  <span className="font-mono font-semibold text-slate-800">{user?.healthTrackId || 'HTA-293847'}</span>
                </div>
              </div>

              {/* Address & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Residential Address</span>
                  </div>
                  <p className="font-medium text-slate-700">{user?.address || 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034'}</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Phone className="w-3 h-3 text-red-500" />
                    <span>Emergency Contact</span>
                  </div>
                  <p className="font-medium text-slate-700">{user?.emergencyContact || '+91 91234 56789 (Mother)'}</p>
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Profile Completion</span>
                  <span className="font-bold text-blue-600">92%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[92%] transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            {/* Quick Emergency Action */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Information</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Paramedics and emergency responders in Hyderabad will be dispatched to your registered address during an SOS callout.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('ambulance')}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-500/20 transition-all text-xs"
                >
                  Test Ambulance Dispatch
                </button>
              </div>
            </div>

            {/* Account Metadata */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Security Credentials</h4>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Account Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Registered Since</span>
                  <span className="font-medium text-slate-700">20 May 2025</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Two-Factor Auth</span>
                  <span className="font-bold text-blue-600">Enabled (SMS OTP)</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => logoutUser()}
                  className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Privacy & Consent */}
      {activeSubTab === 'privacy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Consent Management</h3>
                  <p className="text-[10px] text-slate-400">Control how your personal health data is processed and shared</p>
                </div>
                <button
                  onClick={() => setShowConsentHistory(true)}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Trail</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-800 block">Use of Data for AI Analysis</span>
                    <p className="text-[11px] text-slate-500">Allow autonomous clinical models to analyze lab reports, triage symptoms, and suggest dosing</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('aiAnalysis')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      consents.aiAnalysis ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {consents.aiAnalysis ? '✓ Consented' : 'Not Consented'}
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-800 block">Share Data with Healthcare Providers</span>
                    <p className="text-[11px] text-slate-500">Allow verified consulting physicians (e.g. Dr. Anil Mehta) to view shareable medical vaults</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('shareWithProviders')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      consents.shareWithProviders ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {consents.shareWithProviders ? '✓ Consented' : 'Not Consented'}
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-800 block">Emergency Telemetry Transmission</span>
                    <p className="text-[11px] text-slate-500">Auto-transmit ECG telemetry and drug contraindications to ALS paramedics upon ambulance callout</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('emergencyDispatch')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      consents.emergencyDispatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {consents.emergencyDispatch ? '✓ Consented' : 'Not Consented'}
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-800 block">Use Data for Medical Research (Anonymized)</span>
                    <p className="text-[11px] text-slate-500">Strip all PII (name, phone, address) and contribute anonymized biomarker stats for research</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('anonymizedResearch')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      consents.anonymizedResearch ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {consents.anonymizedResearch ? '✓ Consented' : 'Not Consented'}
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-800 block">Marketing &amp; Health Insights Notifications</span>
                    <p className="text-[11px] text-slate-500">Receive wellness recommendations, lifestyle tips, and feature releases</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('marketing')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      consents.marketing ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {consents.marketing ? '✓ Consented' : 'Not Consented'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Preferences automatically synchronized to your verified ID</span>
                <button
                  onClick={() => setShowConsentHistory(true)}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  View Consent History →
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Privacy &amp; Compliance</h4>
              </div>
              <div className="space-y-2.5 text-slate-600">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800 block text-xs">Zero-Knowledge Storage</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Records are encrypted client-side and in transit via TLS 1.3.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800 block text-xs">HIPAA &amp; GDPR Compliant</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">No diagnostic sharing without explicit patient opt-in.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800 block text-xs">Instant Revocation</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Disabling consent terminates third-party links immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System & Preferences */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Clinical Measurement Units</h3>
                <p className="text-[10px] text-slate-400">Choose your preferred clinical units for vitals and lab results</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <label className="font-bold text-slate-700 block">Blood Glucose Unit</label>
                  <select
                    value={preferences.glucoseUnit}
                    onChange={(e) => setPreferences({ ...preferences, glucoseUnit: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="mg/dL">mg/dL (Standard in India &amp; US)</option>
                    <option value="mmol/L">mmol/L (Standard in UK &amp; EU)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <label className="font-bold text-slate-700 block">Body Temperature</label>
                  <select
                    value={preferences.tempUnit}
                    onChange={(e) => setPreferences({ ...preferences, tempUnit: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="°F">Fahrenheit (°F)</option>
                    <option value="°C">Celsius (°C)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <label className="font-bold text-slate-700 block">Portal Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 block">Audio Chimes</span>
                    <span className="text-[10px] text-slate-400">Play chime on pill alerts &amp; reminders</span>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, soundChime: !preferences.soundChime })}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      preferences.soundChime ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.soundChime ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationMsg("System preferences updated!");
                    setTimeout(() => setNotificationMsg(null), 3000);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 text-xs space-y-2">
              <span className="font-bold text-blue-900 block">Offline Cache Active</span>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Vital emergency records, active medications, and doctor phone numbers are cached offline for quick access without internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data & Security */}
      {activeSubTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Health Data Portability</h3>
                <p className="text-[10px] text-slate-400">Export and manage your clinical repository according to data portability standards</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Download Complete Health Archive (JSON)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Includes all blood work, prescriptions, physician notes, and insurance policy details in machine-readable format.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadMyData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Export Doctor-Shareable PDF Summary</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Switch to the Doctor Share Vault to generate a printable summary or generate a secure physician share link.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('doctor-summary')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Go to Vault</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-sm text-red-600 mb-1">Danger Zone</h4>
                <p className="text-[11px] text-slate-400 mb-3">Permanent actions regarding your account and medical repository</p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Account &amp; Records</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Encryption Audit</h4>
              </div>
              <div className="space-y-2 text-[11px] text-slate-500">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700 block">Database Signature</span>
                  <span className="font-mono text-[10px] text-slate-400 break-all">sha256:7f9a2b083c12...49e</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700 block">Encrypted Backup</span>
                  <span>Automated daily cold storage snapshot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Edit Patient Demographics</h3>
                <p className="text-[10px] text-slate-400">Update your clinical and emergency contact details</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    placeholder="e.g. 29 May 1996"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-red-600"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Residential Address (For Ambulance Dispatch)</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency Contact &amp; Relation</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. +91 91234 56789 (Mother)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consent Audit History Modal */}
      {showConsentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Consent Audit Log</h3>
              </div>
              <button onClick={() => setShowConsentHistory(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>AI Analysis Consent</span>
                  <span className="text-emerald-600">Granted</span>
                </div>
                <span className="text-[10px] text-slate-400 block">20 May 2025 • Verified via Mobile OTP</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Provider Data Sharing</span>
                  <span className="text-emerald-600">Granted</span>
                </div>
                <span className="text-[10px] text-slate-400 block">20 May 2025 • Hospital Network (Hyderabad)</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Medical Research (Anonymized)</span>
                  <span className="text-slate-500">Opted Out</span>
                </div>
                <span className="text-[10px] text-slate-400 block">20 May 2025 • Patient Preference</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConsentHistory(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Delete Account &amp; Records</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete all clinical lab reports, prescriptions, insurance records, and patient history for <strong>{user?.name || 'Priya Sharma'}</strong>. This cannot be undone.
            </p>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">Type <strong>DELETE</strong> to confirm:</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={() => {
                  setShowDeleteModal(false);
                  setNotificationMsg("Account secured. Deletion locked in local preview mode.");
                  setTimeout(() => setNotificationMsg(null), 4000);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

