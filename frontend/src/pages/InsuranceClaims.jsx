import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Receipt,
  FileText,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Building,
  Printer,
  Copy,
  Check,
  Lock,
  Download
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function InsuranceClaims() {
  const { user } = useHealth();
  const [activeTab, setActiveTab] = useState('adjudication'); // 'adjudication' | 'policy-finder' | 'claims-tracker'

  // Policy Verification State
  const [searchPolicyNum, setSearchPolicyNum] = useState("POL-HLTH-884219");
  const [insurerName, setInsurerName] = useState("Star Health & Allied Insurance");
  const [verifyingPolicy, setVerifyingPolicy] = useState(false);
  const [policyDetails, setPolicyDetails] = useState({
    policyStatus: "ACTIVE_VERIFIED",
    policyNumber: "POL-HLTH-884219",
    insurerName: "Star Health & Allied Insurance",
    planTier: "Comprehensive Health PPO (Gold Tier)",
    validFrom: "01 Jan 2025",
    validUntil: "31 Dec 2025",
    totalSumInsured: "₹10,00,000",
    remainingSumInsured: "₹8,50,000",
    cashlessStatus: "ELIGIBLE_FULL_CASHLESS",
    networkHospitalCount: 8500,
    subLimits: {
      roomRent: "Single Private AC Room (No capping)",
      icuCharges: "Covered up to Sum Insured (No sub-limit)",
      prePostHospitalization: "60 days pre / 90 days post covered",
      dayCareSurgeries: "Covered 100% with no overnight stay requirement"
    },
    tpaInfo: {
      tpaName: "Medi Assist TPA Services Ltd.",
      preAuthEmail: "preauth@mediassist.in",
      tollFree: "1800-425-9449"
    }
  });

  // Claim Adjudication State
  const [diagnosis, setDiagnosis] = useState("Acute Appendicitis with Localized Peritonitis");
  const [procedure, setProcedure] = useState("Laparoscopic Appendectomy & Inpatient Hospitalization");
  const [estimatedCost, setEstimatedCost] = useState("₹2,20,000");
  const [adjudicating, setAdjudicating] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Claims History State (persisted in DB)
  const defaultClaimsHistory = [
    {
      id: "CLM-884192",
      date: "05 May 2025",
      type: "Inpatient Hospitalization & Observation",
      hospital: "Life Care Hospitals",
      amount: "₹45,000",
      approvedAmount: "₹41,200",
      status: "Approved & Settled",
      approvalOdds: 96
    },
    {
      id: "CLM-772910",
      date: "10 May 2025",
      type: "Diagnostic Chest X-Ray & ECG Panel",
      hospital: "City Diagnostic Center",
      amount: "₹4,800",
      approvedAmount: "₹4,800",
      status: "Pre-Auth Granted",
      approvalOdds: 100
    },
    {
      id: "CLM-992415",
      date: "20 May 2025",
      type: "Laparoscopic Appendectomy (Emergency Pre-Auth)",
      hospital: "Greenview Hospital",
      amount: "₹2,20,000",
      approvedAmount: "₹1,85,000",
      status: "Auto Approved by AI",
      approvalOdds: 92
    }
  ];

  const [claimsHistory, setClaimsHistory] = useState(defaultClaimsHistory);

  // Load insurance and claims from DB
  useEffect(() => {
    async function loadInsuranceData() {
      try {
        const res = await api.getInsurance();
        if (res && res.success && res.data) {
          if (res.data.policy && res.data.policy.policyNumber) {
            setPolicyDetails(res.data.policy);
          }
          if (res.data.claims && res.data.claims.length > 0) {
            setClaimsHistory(res.data.claims);
          }
        }
      } catch (err) {
        console.error("Failed to fetch insurance details from DB:", err);
      }
    }
    loadInsuranceData();
  }, []);

  const presets = [
    {
      title: "Laparoscopic Appendectomy (Emergency)",
      diagnosis: "Acute Appendicitis with Localized Peritonitis",
      procedure: "Laparoscopic Appendectomy & 2-day Inpatient Observation",
      cost: "₹2,20,000"
    },
    {
      title: "Knee Arthroscopy & Meniscal Repair",
      diagnosis: "Medial Meniscal Tear of Right Knee",
      procedure: "Arthroscopic Partial Meniscectomy & Physiotherapy",
      cost: "₹1,45,000"
    },
    {
      title: "Coronary Angioplasty with Stent",
      diagnosis: "Coronary Artery Disease with 85% LAD Stenosis",
      procedure: "Percutaneous Transluminal Coronary Angioplasty (PTCA) with Drug-Eluting Stent",
      cost: "₹3,80,000"
    },
    {
      title: "Diagnostic Brain MRI with Contrast",
      diagnosis: "Chronic Intractable Migraine & Secondary Cephalea",
      procedure: "Brain Magnetic Resonance Imaging (MRI) with and without Gadolinium",
      cost: "₹18,500"
    }
  ];

  const handleVerifyPolicy = async () => {
    setVerifyingPolicy(true);
    try {
      const res = await fetch('/api/agents/verify-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNumber: searchPolicyNum,
          insurerName
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPolicyDetails(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingPolicy(false);
    }
  };

  const handleAdjudicate = async (customDiag, customProc, customCost) => {
    setAdjudicating(true);
    setClaimResult(null);

    try {
      const res = await fetch('/api/agents/insurance-adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: customDiag || diagnosis,
          procedure: customProc || procedure,
          estimatedCost: customCost || estimatedCost,
          policyNumber: policyDetails.policyNumber,
          policyType: policyDetails.planTier
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setClaimResult(data.data);
        // Persist adjudicated pre-auth claim into DB
        try {
          const newClaimRecord = {
            type: customProc || procedure,
            hospital: "Network Hospital (Pre-Auth)",
            amount: customCost || estimatedCost,
            approvedAmount: data.data.approvedAmountEstimate || (customCost || estimatedCost),
            status: data.data.adjudicationDecision === 'APPROVED' ? 'Pre-Auth Granted' : 'Under Investigation',
            approvalOdds: data.data.approvalProbability || 90
          };
          const savedClaim = await api.submitClaim(newClaimRecord);
          if (savedClaim && savedClaim.success && savedClaim.data) {
            setClaimsHistory(prev => [savedClaim.data, ...prev]);
          }
        } catch (e) {
          console.warn("Could not persist claim to DB:", e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjudicating(false);
    }
  };

  const handleCopyLetter = () => {
    if (claimResult?.preAuthLetterDraft) {
      navigator.clipboard.writeText(claimResult.preAuthLetterDraft);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Autonomous Agents &gt; <span className="text-slate-600 font-medium">Pillar 2: Insurance Management &amp; Claim Help</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Insurance Management &amp; Claim Adjudication Agent</span>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Featherless AI Active
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Autonomous verification of policy existence, real-time ICD-10 &amp; CPT matching, approval probability calculation, and pre-auth assistance.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('adjudication')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'adjudication' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Claim Adjudication
          </button>
          <button
            onClick={() => setActiveTab('policy-finder')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'policy-finder' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Policy Existence Finder
          </button>
          <button
            onClick={() => setActiveTab('claims-tracker')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'claims-tracker' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Claims Tracker
          </button>
        </div>
      </div>

      {/* TAB 1: CLAIM ADJUDICATION & PRE-AUTH */}
      {activeTab === 'adjudication' && (
        <div className="space-y-6">
          
          {/* Active Policy Status Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{policyDetails.planTier}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                    {policyDetails.policyStatus}
                  </span>
                </div>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  Policy #{policyDetails.policyNumber} • Member: {user?.name || 'Priya Sharma'} • Insurer: {policyDetails.insurerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-blue-200 border-t sm:border-t-0 sm:border-l border-blue-800/80 pt-3 sm:pt-0 sm:pl-4">
              <div>
                <span className="text-[10px] text-blue-400 block">Available Sum</span>
                <span className="font-bold text-white">{policyDetails.remainingSumInsured}</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-400 block">Cashless Network</span>
                <span className="font-bold text-emerald-300">{policyDetails.networkHospitalCount}+ Hospitals</span>
              </div>
            </div>
          </div>

          {/* 1-Click Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Click Pre-Authorization &amp; Claim Scenarios (Test with Featherless AI):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDiagnosis(p.diagnosis);
                    setProcedure(p.procedure);
                    setEstimatedCost(p.cost);
                    handleAdjudicate(p.diagnosis, p.procedure, p.cost);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group shadow-sm"
                >
                  <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate block">{p.title}</span>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{p.procedure}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-700">{p.cost}</span>
                    <span className="text-blue-600 font-semibold group-hover:underline">Adjudicate →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Claim Form Inputs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Medical Diagnosis / Clinical Indication</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Procedure / Surgery / Treatment</label>
                <input
                  type="text"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Hospital / Treatment Cost</label>
                <input
                  type="text"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hospital / In-Network Provider</label>
                <input
                  type="text"
                  defaultValue="Greenview Hospital (In-Network)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleAdjudicate()}
                  disabled={adjudicating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {adjudicating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI Adjudicating Claim...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Adjudicate Claim with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ADJUDICATION RESULTS */}
          {claimResult && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                
                {/* Decision Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Autonomous Adjudication Decision</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h3 className="text-lg font-bold text-slate-900">
                        {claimResult.adjudicationDecision}
                      </h3>
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                        Pre-Auth {claimResult.preAuthStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Approval Odds:</span>
                    <div className="text-2xl font-black text-emerald-600">
                      {claimResult.approvalProbability}%
                    </div>
                  </div>
                </div>

                {/* Medical Coding Tags */}
                <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">ICD-10 Diagnosis Code:</span>
                    <span className="font-mono font-bold text-blue-600">{claimResult.icd10Code}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">CPT Procedure Code:</span>
                    <span className="font-mono font-bold text-purple-600">{claimResult.cptCode}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">Claim ID:</span>
                    <span className="font-mono font-bold text-slate-700">{claimResult.claimId}</span>
                  </div>
                </div>

                {/* Financial Coverage Breakdown */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2.5">
                    Coverage &amp; Out-of-Pocket Cost Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Total Cost</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {claimResult.coverageBreakdown?.totalCost || estimatedCost}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 block font-semibold">Insurance Covered</span>
                      <span className="font-extrabold text-emerald-800 text-sm mt-0.5 block">
                        {claimResult.coverageBreakdown?.coveredByInsurance}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[10px] text-amber-700 block font-semibold">Patient Out-of-Pocket</span>
                      <span className="font-extrabold text-amber-900 text-sm mt-0.5 block">
                        {claimResult.coverageBreakdown?.patientOutOfPocket}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Deductible Applied</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {claimResult.coverageBreakdown?.deductibleApplied}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinical Rationale */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                  <span className="font-bold text-blue-900 block mb-1">Clinical Necessity Justification</span>
                  <p className="text-slate-700 leading-relaxed">
                    {claimResult.clinicalNecessityRationale}
                  </p>
                </div>

                {/* Required Documents Checklist */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
                    Required Supporting Documents for Instant Cashless Approval
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(claimResult.requiredDocuments || []).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-[11px] font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Drafted Pre-Auth Letter */}
                {claimResult.preAuthLetterDraft && (
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>AI Generated Pre-Authorization Letter Draft</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyLetter}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                        >
                          {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLetter ? 'Copied' : 'Copy Letter'}</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                      {claimResult.preAuthLetterDraft}
                    </pre>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: POLICY EXISTENCE FINDER */}
      {activeTab === 'policy-finder' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Search &amp; Verify Policy Existence</h3>
            <p className="text-xs text-slate-500">
              Check policy validity, active member status, remaining balance, and cashless network hospitals across the national payer registry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Policy Number</label>
                <input
                  type="text"
                  value={searchPolicyNum}
                  onChange={(e) => setSearchPolicyNum(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Insurer / Payer</label>
                <input
                  type="text"
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleVerifyPolicy}
                  disabled={verifyingPolicy}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {verifyingPolicy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Verify Policy with AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verified Policy Card */}
          {policyDetails && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{policyDetails.planTier}</h3>
                  <p className="text-xs text-slate-500">{policyDetails.insurerName} • Policy #{policyDetails.policyNumber}</p>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {policyDetails.policyStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Total Sum Insured</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{policyDetails.totalSumInsured}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block font-semibold">Remaining Balance</span>
                  <span className="font-bold text-emerald-900 text-sm mt-0.5 block">{policyDetails.remainingSumInsured}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Valid Until</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{policyDetails.validUntil}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Cashless Hospitals</span>
                  <span className="font-bold text-blue-600 text-sm mt-0.5 block">{policyDetails.networkHospitalCount}+ Network</span>
                </div>
              </div>

              {/* Sub limits */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Policy Sub-Limits &amp; Cappings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800 block">Room Rent:</span>
                    <span className="text-slate-600">{policyDetails.subLimits?.roomRent}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800 block">ICU Charges:</span>
                    <span className="text-slate-600">{policyDetails.subLimits?.icuCharges}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800 block">Pre &amp; Post Hospitalization:</span>
                    <span className="text-slate-600">{policyDetails.subLimits?.prePostHospitalization}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800 block">Day Care Surgeries:</span>
                    <span className="text-slate-600">{policyDetails.subLimits?.dayCareSurgeries}</span>
                  </div>
                </div>
              </div>

              {/* TPA Help Desk */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">{policyDetails.tpaInfo?.tpaName}</span>
                  <span className="text-slate-500 text-[11px]">Direct Pre-Auth Email: {policyDetails.tpaInfo?.preAuthEmail}</span>
                </div>
                <span className="font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200">
                  Toll Free: {policyDetails.tpaInfo?.tollFree}
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: CLAIMS TRACKER */}
      {activeTab === 'claims-tracker' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Hospital Claims History &amp; Status</h3>
              <span className="text-xs text-slate-400">Policy: {policyDetails.policyNumber}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {claimsHistory.map((cl) => (
                <div key={cl.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{cl.id}</span>
                      <span className="text-[10px] text-slate-400">• {cl.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{cl.type}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cl.hospital}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Claim Amount</span>
                      <span className="font-bold text-slate-800 block">{cl.amount}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Approved: {cl.approvedAmount}</span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cl.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
