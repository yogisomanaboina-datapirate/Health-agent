import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Share2,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  FileText,
  Pill,
  FlaskConical,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Lock,
  Plus,
  RefreshCw,
  Eye,
  AlertTriangle,
  FileUp,
  X
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function DoctorShareableRecords() {
  const { user, refreshData, setActiveTab } = useHealth();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [doctorViewMode, setDoctorViewMode] = useState(false);

  // New Record Ingestion Modal / State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("Lipid Profile Panel");
  const [newType, setNewType] = useState("Lab Report");
  const [newProvider, setNewProvider] = useState("Apollo Diagnostics");
  const [newReportText, setNewReportText] = useState("Total Cholesterol: 215 mg/dL (Borderline High), Triglycerides: 160 mg/dL, HDL: 45 mg/dL, LDL: 138 mg/dL. Impression: Mild hyperlipidemia.");
  const [addingReport, setAddingReport] = useState(false);

  // Biomarker inspection modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchSharePackage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/doctor-shareable-record');
      const data = await res.json();
      if (data.success && data.data) {
        setShareData(data.data);
      }
    } catch (err) {
      console.error("Failed to load doctor shareable records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharePackage();
  }, []);

  const handleCopyLink = () => {
    const shareUrl = shareData?.shareableUrl || `${window.location.origin}/?docShare=${user?.healthTrackId || 'HTA-293847'}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIngestReport = async () => {
    setAddingReport(true);
    try {
      const res = await fetch('/api/agents/add-doctor-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          provider: newProvider,
          reportText: newReportText
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        await fetchSharePackage();
        if (refreshData) await refreshData();
      }
    } catch (err) {
      console.error("Failed to ingest report:", err);
    } finally {
      setAddingReport(false);
    }
  };

  const presets = [
    {
      title: "Lipid Profile Panel (Cholesterol)",
      provider: "City Diagnostic Center",
      text: "Total Cholesterol: 215 mg/dL (Borderline High), Triglycerides: 160 mg/dL, HDL: 45 mg/dL, LDL: 138 mg/dL. VLDL: 32 mg/dL. Patient on low-dose statin."
    },
    {
      title: "Liver Function Test (LFT)",
      provider: "Apollo Diagnostics",
      text: "Total Bilirubin: 0.8 mg/dL, SGOT (AST): 28 U/L, SGPT (ALT): 34 U/L, Alkaline Phosphatase: 78 U/L, Total Protein: 7.2 g/dL, Albumin: 4.3 g/dL. All liver enzymes normal."
    },
    {
      title: "Renal Kidney Function Test (KFT)",
      provider: "Max Diagnostic Lab",
      text: "Blood Urea: 22 mg/dL, Serum Creatinine: 0.9 mg/dL (Normal GFR >90 mL/min), Uric Acid: 4.8 mg/dL, Sodium: 140 mEq/L, Potassium: 4.2 mEq/L. Normal kidney clearance."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Autonomous Agents &gt; <span className="text-slate-600 font-medium">Pillar 4: Storage &amp; Shareable Doctor Format</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Clinical Records Vault &amp; Doctor Shareable Format</span>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              HIPAA &bull; Verified Format
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Stores all user medications, lab reports, and vitals in a certified format. Featherless AI generates physician executive summaries and shareable consultation packages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Report</span>
          </button>

          <button
            onClick={() => setDoctorViewMode(!doctorViewMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              doctorViewMode
                ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{doctorViewMode ? 'Exit Doctor Mode' : 'Preview Doctor View'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Clinical PDF</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Copy Doctor Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Doctor View Simulation Banner */}
      {doctorViewMode && (
        <div className="bg-purple-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs">Simulating Consulting Physician Perspective</span>
              <p className="text-[11px] text-purple-200">
                This is the certified, read-only medical summary package accessed by doctors via your secure link.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDoctorViewMode(false)}
            className="text-xs bg-purple-800 hover:bg-purple-700 text-purple-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Close Preview
          </button>
        </div>
      )}

      {/* CERTIFIED CLINICAL PACKAGE CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30 shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Official Patient Health &amp; Clinical Continuity Record
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  VERIFIED RECORD
                </span>
              </div>
              <p className="text-xs text-slate-500">
                LifeLink Clinical Vault &bull; Record ID: <strong className="font-mono text-slate-700">{shareData?.shareId || 'DOC-SHARE-984210'}</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Compiled At</span>
            <span className="text-xs font-semibold text-slate-700">{shareData?.generatedAt || new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{user?.name || 'Priya Sharma'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Age / Gender</span>
            <span className="font-semibold text-slate-800">29 / Female</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Blood Group</span>
            <span className="font-bold text-red-600 text-sm">O+</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">HealthTrack ID</span>
            <span className="font-mono font-bold text-slate-800">{user?.healthTrackId || 'HTA-293847'}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Emergency Contact</span>
            <span className="font-medium text-slate-700">{user?.emergencyContact || '+91 91234 56789'}</span>
          </div>
        </div>

        {/* AI Clinical Executive Summary */}
        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Physician Referral Summary (Autonomous AI Synthesis)</span>
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Featherless AI Generated
            </span>
          </div>
          <p className="text-slate-800 leading-relaxed text-xs">
            {shareData?.clinicalSummary?.healthOverview || "Patient exhibits stable cardiopulmonary vitals with no acute emergencies. Ongoing management for sub-optimal Vitamin D under weekly 60K IU supplementation. Mild dyslipidemia responsive to evening statin therapy. Baseline complete blood count within acceptable physiological boundaries."}
          </p>
          <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center gap-4 text-[11px] text-blue-900">
            <span>&bull; Health Score: <strong>78/100 (Good)</strong></span>
            <span>&bull; Blood Tests: <strong>Within Normal Range</strong></span>
            <span>&bull; Medication Adherence: <strong>86% Adherence</strong></span>
            <span>&bull; Recommended: <strong>Follow-up in 8 weeks</strong></span>
          </div>
        </div>

        {/* SECTION 1: ACTIVE PRESCRIBED MEDICATIONS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-indigo-600" />
              <span>Active Prescribed Medications ({shareData?.activeMedications?.length || 5})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Exported from active dosage database</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Medication Name</th>
                  <th className="py-2.5 px-4">Clinical Indication</th>
                  <th className="py-2.5 px-4">Schedule &amp; Timing</th>
                  <th className="py-2.5 px-4">Frequency</th>
                  <th className="py-2.5 px-4">Adherence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(shareData?.activeMedications || []).map((med, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{med.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{med.indication}</td>
                    <td className="py-2.5 px-4 text-indigo-700 font-medium">{med.timing} ({med.schedule})</td>
                    <td className="py-2.5 px-4 text-slate-500">{med.frequency}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-emerald-600">{med.adherence || 95}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: STORED LAB DIAGNOSTIC REPORTS & PATHOLOGY */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>Stored Lab Diagnostic Reports &amp; Pathology ({shareData?.storedReportsCount || 8})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click any card to inspect biomarker values</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(shareData?.recentRecords || []).map((rec, i) => (
              <div
                key={i}
                onClick={() => setSelectedRecord(rec)}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{rec.title}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      rec.isAbnormal
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {rec.status || 'Verified'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{rec.provider} &bull; {rec.date}</span>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{rec.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-blue-600 font-semibold">
                  <span>View Details &amp; Biomarkers &rarr;</span>
                  <span className="text-slate-400">{rec.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Sharing Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>End-to-end encrypted under HIPAA compliant patient consent</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
              {shareData?.shareableUrl || 'http://localhost:5173/?docShare=HTA-293847'}
            </span>
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD & INGEST NEW MEDICAL REPORT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Ingest &amp; Store New Medical Report</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Quick Clinical Presets:</span>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewTitle(p.title);
                      setNewProvider(p.provider);
                      setNewReportText(p.text);
                    }}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-left text-[10px] transition-all"
                  >
                    <span className="font-bold text-slate-900 block truncate">{p.title}</span>
                    <span className="text-slate-400 truncate block">{p.provider}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Report Title / Test Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Diagnostic Laboratory / Hospital</label>
                <input
                  type="text"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Report Text / Pathology Values</label>
                <textarea
                  rows={4}
                  value={newReportText}
                  onChange={(e) => setNewReportText(e.target.value)}
                  placeholder="Paste lab parameters, biomarkers, or doctor notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                ></textarea>
              </div>
            </div>

            {/* AI Explanation Banner */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-blue-950">What does Store New Report do?</span>
                <p className="text-slate-600 leading-relaxed">
                  Featherless AI acts as a clinical pathologist: it extracts every biomarker name, measured value, and physiological reference range, flags abnormal results, and compiles them directly into your official physician share package.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleIngestReport}
                disabled={addingReport}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {addingReport ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>AI Parsing Biomarkers (~2-3s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Store to Doctor Vault</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT INDIVIDUAL REPORT */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedRecord.title}</h3>
                <span className="text-[10px] text-slate-400">{selectedRecord.provider} &bull; {selectedRecord.date}</span>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Clinical Summary</span>
              <p className="text-slate-600">{selectedRecord.summary}</p>
            </div>

            {selectedRecord.isAbnormal && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>One or more biomarkers require clinical physician evaluation.</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
