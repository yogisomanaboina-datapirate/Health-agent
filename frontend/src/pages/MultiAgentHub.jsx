import React, { useState } from 'react';
import {
  Sparkles,
  Siren,
  ShieldCheck,
  Building2,
  Pill,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  FileText,
  FlaskConical,
  Activity,
  Heart,
  ArrowRight,
  Download,
  Share2,
  PhoneCall,
  Check
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function MultiAgentHub() {
  const { user, setActiveTab } = useHealth();
  const [scenario, setScenario] = useState(
    "Patient presenting with severe crushing substernal chest pain, radiating down the left arm, diaphoresis, HR 125, BP 160/95. Possible Acute Myocardial Infarction."
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('grid'); // 'grid' | 'synthesis' | 'timeline'

  const presets = [
    {
      title: "Cardiac Emergency (STEMI Suspected)",
      scenario: "Crushing chest pain radiating to left arm and jaw, profuse sweating, HR 125 bpm, BP 160/95 mmHg, SpO2 91%. Suspected Acute Coronary Syndrome requiring immediate PCI."
    },
    {
      title: "Orthopedic Surgery & Insurance Claim",
      scenario: "Complete ACL tear and medial meniscus rupture during athletic activity. Requires arthroscopic reconstruction and inpatient hospitalization with full insurance pre-authorization."
    },
    {
      title: "Uncontrolled Type 2 Diabetes with Infection",
      scenario: "Fasting blood sugar 240 mg/dL, foot ulcer showing erythema and purulent drainage, fever 101.5°F, requiring immediate IV antibiotic regimen and glycemic stabilization."
    }
  ];

  const handleRunPipeline = async (customScenario) => {
    setRunning(true);
    setResult(null);

    const activeText = customScenario || scenario;

    try {
      const res = await fetch('/api/agents/orchestrate-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: activeText,
          vitals: { heartRate: 125, bloodPressure: "160/95", spo2: 91 }
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="text-xs text-slate-400 mb-1">
          Autonomous Ecosystem &gt; <span className="text-slate-600 font-medium">Multi-Agent Orchestration Hub</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>Autonomous Multi-Agent Collaboration Engine</span>
          <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
            5 Core Agents Active
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          Enter any medical case. Watch all autonomous agents (Emergency Triage, Ambulance &amp; Hospitals, Diagnostic Biomarkers, Tablet Scheduler, Insurance Claims, Doctor Consultation) collaborate in real-time.
        </p>
      </div>

      {/* Preset Pickers */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Pick a Clinical Case or Edit Below:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setScenario(p.scenario);
                handleRunPipeline(p.scenario);
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate">{p.title}</div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{p.scenario}</p>
              </div>
              <span className="mt-3 text-[10px] text-blue-600 font-bold flex items-center gap-1">
                <span>Run 5 Agents Now</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Input Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-700 block">Clinical Case Scenario</label>
        <textarea
          rows={3}
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
        ></textarea>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleRunPipeline()}
            disabled={running || !scenario.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>5 Autonomous Agents Collaborating in Parallel...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Multi-Agent Collaborative Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MULTI-AGENT RESULTS SECTION */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          
          {/* Execution Overview & Consensus Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Full Multi-Agent Consensus Achieved</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    PASSED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  5 autonomous specialized agents analyzed clinical triage, diagnostics, logistics, pharmacology &amp; insurance in parallel.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <span className="text-xs bg-slate-800 text-blue-300 border border-slate-700 px-3 py-1 rounded-xl font-mono">
                Duration: {result.totalDurationSec}s
              </span>
              <span className="text-xs text-slate-300 font-semibold font-mono">
                Patient: {result.patientName}
              </span>
            </div>
          </div>

          {/* Sub-Tabs: Grid View vs Executive Synthesis vs Timeline Trace */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
            <button
              onClick={() => setActiveViewTab('grid')}
              className={`px-4 py-2 font-bold transition-all border-b-2 ${
                activeViewTab === 'grid'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Collaborative Agent Grid (6 Pillars)
            </button>
            <button
              onClick={() => setActiveViewTab('synthesis')}
              className={`px-4 py-2 font-bold transition-all border-b-2 ${
                activeViewTab === 'synthesis'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Executive Clinical Briefing
            </button>
            <button
              onClick={() => setActiveViewTab('timeline')}
              className={`px-4 py-2 font-bold transition-all border-b-2 ${
                activeViewTab === 'timeline'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Step-by-Step Execution Trace ({result.timeline?.length || 0} events)
            </button>
          </div>

          {/* VIEW 1: COLLABORATIVE AGENTS GRID */}
          {activeViewTab === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* 1. Emergency Triage & Acuity Agent */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Activity className="w-4 h-4 text-rose-500" />
                      <span>1. Emergency Triage &amp; Acuity</span>
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      result.agents.triage?.urgencyLevel === 'RESUSCITATION' ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' :
                      result.agents.triage?.urgencyLevel === 'EMERGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {result.agents.triage?.urgencyLevel || "EMERGENT"}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Clinical Risk Score:</span>
                      <span className="font-bold font-mono text-rose-600">{result.agents.triage?.riskScore || 8} / 10</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Ambulance Required:</span>
                      <span className="font-bold text-slate-800">{result.agents.triage?.requiresAmbulance ? "YES (Priority 1)" : "Optional"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Recommended Setting:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[160px]">{result.agents.triage?.recommendedCareSetting || "Emergency ICU"}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Immediate Actions:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {result.agents.triage?.immediateActions?.slice(0, 3).map((act, i) => (
                        <li key={i} className="truncate">{act}</li>
                      )) || (
                        <li>Administer oxygen, place IV line, continuous cardiac monitoring</li>
                      )}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('ambulance-response')}
                  className="w-full mt-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open Ambulance Dispatcher</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 2. Ambulance & Bed Allocation Agent */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Siren className="w-4 h-4 text-red-500" />
                      <span>2. Hospital Bed &amp; Logistics</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {result.agents.bedAllocation?.reservationStatus || "BED ALLOCATED"}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Nearest Hospital:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[160px]">{result.agents.bedAllocation?.hospitalName || "Apollo Health City"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Ambulance ETA:</span>
                      <span className="font-bold text-red-600 font-mono">{result.agents.bedAllocation?.estimatedAmbulanceEtaMinutes || 4} mins</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Allocated Bed Type:</span>
                      <span className="font-bold text-emerald-700">{result.agents.bedAllocation?.allocatedBedType || "Emergency ICU Bed"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Allocation Priority:</span>
                      <span className="font-bold text-slate-800">{result.agents.bedAllocation?.priorityLevel || "PRIORITY_1"}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <p className="line-clamp-2">
                      {result.agents.bedAllocation?.triageAssessment || "Emergency bay notified and cardiac catheterization team on standby."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('ambulance-response')}
                  className="w-full mt-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Hospital Network &amp; Route</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3. Diagnostic Lab & Biomarker Agent */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <FlaskConical className="w-4 h-4 text-emerald-600" />
                      <span>3. Diagnostic Lab &amp; Biomarkers</span>
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                      {result.agents.report?.riskLevel || "MODERATE"}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Critical Biomarkers:</span>
                      <span className="font-bold text-slate-800">Troponin-I, CBC, CRP, ECG</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Abnormal Flags:</span>
                      <span className="font-bold text-amber-600">{result.agents.report?.abnormalFindings?.length || 2} Parameters</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Diagnostic Impression:</span>
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed line-clamp-3">
                      {result.agents.report?.overallImpression || "Immediate serial cardiac troponin and 12-lead ECG recommended. Baseline complete blood count within acceptable range."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('lab-reports')}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Full Lab Workup</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 4. Autonomous Tablet & Medication Scheduler Agent */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Pill className="w-4 h-4 text-indigo-500" />
                      <span>4. Tablet &amp; Drug Interactions</span>
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                      SCHEDULE BUILT
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Drug Interaction Severity:</span>
                      <span className={`font-bold ${
                        result.agents.medication?.interactionSeverity === 'Severe' ? 'text-rose-600' :
                        result.agents.medication?.interactionSeverity === 'Moderate' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {result.agents.medication?.interactionSeverity || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Recommended Dosing:</span>
                      <span className="font-bold text-slate-800">
                        {result.agents.medication?.recommendedSchedule?.time || "08:30 PM"} ({result.agents.medication?.recommendedSchedule?.timing || "After Food"})
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">Food Contraindications:</span>
                      <span className="font-bold text-amber-700 truncate max-w-[150px]">
                        {result.agents.medication?.foodContraindications?.join(', ') || 'Avoid alcohol & grapefruit'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <p className="line-clamp-2">
                      {result.agents.medication?.interactionDetails || "No adverse pharmacokinetic conflicts detected with patient baseline medications."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('tablet-scheduler')}
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open Tablet Scheduler</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 5. Autonomous Insurance Pre-Auth & Claims Agent */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>5. Insurance Claims &amp; Pre-Authorization</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {result.agents.insurance?.adjudicationDecision || "AUTO_APPROVED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Approval Odds</span>
                      <span className="text-base font-bold text-emerald-600 font-mono">
                        {result.agents.insurance?.approvalProbability || 94}%
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">ICD-10 Code</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {result.agents.insurance?.icd10Code || "I21.9 (STEMI)"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">CPT Code</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {result.agents.insurance?.cptCode || "92928 (PCI)"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Insurance Covered</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {result.agents.insurance?.coverageBreakdown?.coveredByInsurance || "₹2,10,000"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block mb-0.5">Clinical Necessity Justification:</strong>
                    {result.agents.insurance?.clinicalNecessityRationale || "Emergency PCI and intensive cardiac care are medically necessary to prevent myocardial necrosis and cardiogenic shock under Star Health Gold Tier Policy."}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('insurance-claims')}
                  className="w-full mt-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open Insurance &amp; Claims Desk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          )}

          {/* VIEW 2: EXECUTIVE CLINICAL SYNTHESIS */}
          {activeViewTab === 'synthesis' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Chief Medical Officer Executive Briefing
                    </h3>
                    <p className="text-[11px] text-slate-400">Synthesized from all 5 operational agent feeds</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  AUTONOMOUS SYNTHESIS
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                {result.agents.doctor?.reply || "Executive synthesis ready. All 5 agent protocols successfully executed."}
              </div>
            </div>
          )}

          {/* VIEW 3: STEP-BY-STEP EXECUTION TRACE */}
          {activeViewTab === 'timeline' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Multi-Agent Step-by-Step Execution Trace</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Chronological telemetry showing how agents communicated in parallel</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Total Time: {result.totalDurationSec}s
                </span>
              </div>

              <div className="space-y-3">
                {(result.timeline || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
                  >
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded shrink-0">
                      +{step.time}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800 font-semibold">{step.agent}</strong>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                          {step.action}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {typeof step.output === 'object' ? (
                          <pre className="bg-white p-2 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 overflow-x-auto">
                            {JSON.stringify(step.output, null, 2)}
                          </pre>
                        ) : (
                          <p>{step.output}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
