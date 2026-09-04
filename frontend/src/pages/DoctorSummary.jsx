import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  Activity,
  Heart
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function DoctorSummary() {
  const { user, stats } = useHealth();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await api.getDoctorSummary();
        if (res.success) {
          setSummaryData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Dashboard &gt; <span className="text-slate-600 font-medium">Doctor / Referral Summary</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor / Referral Summary</h1>
          <p className="text-xs text-slate-500">Share your health summary with your doctor for better continuity of care.</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Summary</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 text-xs font-medium border-b border-slate-200 pb-2">
        <span className="text-blue-600 border-b-2 border-blue-600 pb-2 font-bold cursor-pointer">Summary</span>
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer">Shared Summaries</span>
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer">Export History</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Full Clinical Summary Document */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Top Bar of Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Latest Generated Summary</span>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Generated on: <strong>{summaryData?.generatedAt || '20 May 2025, 10:45 AM'}</strong></span>
                  <span>•</span>
                  <span>By: <strong>{summaryData?.generatedBy || 'AI Health Assistant'}</strong></span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Summary ID: {summaryData?.summaryId || 'HS-2025-05-20-1045'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Patient Overview Box (Page 8) */}
            <div>
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Patient Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Name</span>
                  <span className="font-bold text-slate-800">{user?.name || 'Priya Sharma'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Age / Gender</span>
                  <span className="font-semibold text-slate-800">29 / Female</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Blood Group</span>
                  <span className="font-bold text-red-600">O+</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Phone</span>
                  <span className="font-semibold text-slate-800">{user?.phone || '+91 98765 43210'}</span>
                </div>
              </div>
            </div>

            {/* Health Overview & Score */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-blue-50/40 p-4 rounded-xl border border-blue-100">
              <div className="sm:col-span-8">
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider mb-1">Health Overview</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {summaryData?.healthOverview || "No major chronic conditions recorded. Actively managing Vitamin D deficiency. Overall health status is good with stable vitals and improving trends."}
                </p>
              </div>
              <div className="sm:col-span-4 text-center border-t sm:border-t-0 sm:border-l border-blue-200/60 pt-3 sm:pt-0">
                <span className="text-[10px] text-slate-500 font-medium">Overall Health Score</span>
                <div className="text-2xl font-black text-emerald-600 my-0.5">78<span className="text-xs text-slate-400">/100</span></div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">Good</span>
              </div>
            </div>

            {/* Key Health Highlights (Page 8) */}
            <div>
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Key Health Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    Blood Tests
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    All major blood parameters (Hb 13.2 g/dL, WBC 6,800) are within normal clinical range.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    Vitamin D
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Levels improved from 18 to 28 ng/mL in 3 months with weekly supplementation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    Medications
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    2 active medicines. High adherence (85%) recorded throughout this cycle.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Follow-ups
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Next follow-up consultation with Dr. Anil Mehta scheduled for 23 May 2025.
                  </p>
                </div>
              </div>
            </div>

            {/* Health Timeline Snapshot */}
            <div>
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Health Timeline Snapshot</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">10 Apr 2025</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">Lab Report</span>
                  <span className="text-[10px] text-emerald-600 font-medium">CBC Normal</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">18 Apr 2025</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">Prescription</span>
                  <span className="text-[10px] text-blue-600 font-medium">2 Medicines</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">28 Apr 2025</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">Follow-up</span>
                  <span className="text-[10px] text-slate-600 font-medium">BP 120/80</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">05 May 2025</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">Lab Report</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Vit D 28 ng/mL</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-semibold block">20 May 2025</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">Summary</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Score 78 Good</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right 4 Cols: Included Breakdown & Sharing Options */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Included in this Summary (Page 8) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2.5 text-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Included in this Summary</h3>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Prescriptions</span>
              <span className="font-bold text-slate-800">3</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Lab Reports</span>
              <span className="font-bold text-slate-800">4</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Medications</span>
              <span className="font-bold text-slate-800">2</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Vital Trends</span>
              <span className="font-bold text-slate-800">6 Months</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Follow-ups</span>
              <span className="font-bold text-slate-800">2</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Allergies</span>
              <span className="font-bold text-slate-800">0</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Medical Notes</span>
              <span className="font-bold text-slate-800">3</span>
            </div>
          </div>

          {/* Share This Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Share This Summary</h3>

            <button
              onClick={handleCopy}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Share with Doctor</div>
                <div className="text-[10px] text-slate-400">Email or WhatsApp to your doctor</div>
              </div>
              <Share2 className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handlePrint}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Print Summary</div>
                <div className="text-[10px] text-slate-400">Print for your next visit</div>
              </div>
              <Printer className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handlePrint}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Download PDF</div>
                <div className="text-[10px] text-slate-400">Save or share as PDF file</div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleCopy}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  {copied ? 'Link Copied!' : 'Copy Share Link'}
                </div>
                <div className="text-[10px] text-slate-400">Secure link to share summary</div>
              </div>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Important Note */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
            <h4 className="font-bold text-amber-900 mb-1">Important Note</h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This summary is AI-generated from your records. Please verify and discuss with your doctor for clinical decisions.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
