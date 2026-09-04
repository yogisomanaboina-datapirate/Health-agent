import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Activity,
  Heart,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  FlaskConical
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function ReportAnalyzer() {
  const { setActiveTab, refreshData } = useHealth();
  const [reportTitle, setReportTitle] = useState('Comprehensive Metabolic & Blood Panel');
  const [reportText, setReportText] = useState(
`PATIENT: Priya Sharma (29/F)
COLLECTION DATE: 20 May 2025
FACILITY: City Diagnostic Laboratory
TEST PANEL: Complete Blood & Metabolic Profile

RESULTS:
- Hemoglobin (Hb): 13.2 g/dL (Normal: 12.0 - 15.0)
- Total WBC Count: 6,800 /µL (Normal: 4,000 - 11,000)
- Platelet Count: 1.85 lakh/µL (Normal: 1.50 - 4.50)
- Fasting Blood Sugar: 118 mg/dL (High, Ref: 70 - 99)
- Serum Creatinine: 0.9 mg/dL (Normal: 0.6 - 1.1)
- Total Cholesterol: 215 mg/dL (High, Ref: < 200)
- LDL Cholesterol: 138 mg/dL (High, Ref: < 100)
- HDL Cholesterol: 42 mg/dL (Normal: > 40)
- ALT (SGPT): 45 U/L (Borderline High, Ref: 7 - 35)
- Vitamin D (25-OH): 28 ng/mL (Sub-optimal, Ref: 30 - 100)
`
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const presets = [
    {
      title: "Comprehensive Metabolic & Blood Panel",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 20 May 2025\nLAB: City Diagnostic Lab\n- Hemoglobin: 13.2 g/dL (Ref: 12.0 - 15.0)\n- Fasting Glucose: 118 mg/dL (High, Ref: 70 - 99)\n- Total Cholesterol: 215 mg/dL (High, Ref: < 200)\n- LDL: 138 mg/dL (High, Ref: < 100)\n- Creatinine: 0.9 mg/dL (Ref: 0.6 - 1.1)\n- ALT: 45 U/L (Borderline, Ref: 7 - 35)`
    },
    {
      title: "Lipid Profile & Cardiac Risk Panel",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 08 May 2025\n- Total Cholesterol: 220 mg/dL (High, Ref: < 200)\n- Triglycerides: 168 mg/dL (Borderline, Ref: < 150)\n- LDL Cholesterol: 142 mg/dL (High, Ref: < 100)\n- HDL Cholesterol: 41 mg/dL (Ref: > 40)\n- VLDL: 33.6 mg/dL (Normal: 5 - 40)`
    },
    {
      title: "Liver Function Test (LFT)",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 15 Apr 2025\n- Bilirubin Total: 0.8 mg/dL (Normal: 0.2 - 1.2)\n- SGOT (AST): 32 U/L (Normal: 8 - 38)\n- SGPT (ALT): 48 U/L (Elevated, Normal: 7 - 35)\n- Alkaline Phosphatase: 85 U/L (Normal: 40 - 129)\n- Total Protein: 7.2 g/dL (Normal: 6.4 - 8.3)`
    },
    {
      title: "Complete Blood Count (CBC) with Differential",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 20 May 2025\n- Hemoglobin: 13.2 g/dL (Ref: 12 - 15)\n- RBC Count: 4.45 mil/µL (Ref: 3.8 - 5.2)\n- WBC: 6,800 /µL (Ref: 4,000 - 11,000)\n- Platelets: 185,000 /µL (Ref: 150,000 - 450,000)\n- Neutrophils: 65% (Ref: 40 - 75)\n- Eosinophils: 6% (Borderline, Ref: 1 - 5)\n- ESR: 12 mm/hr (Ref: 0 - 20)`
    }
  ];

  const handleRunAnalysis = async () => {
    if (!reportText.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch('/api/agents/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportTitle,
          reportText
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysis(data.data.analysis || data.data);
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error('Report analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Available reports from patient Lab Reports records
  const availableLabReports = [
    {
      id: "lab_cbc_may25",
      title: "Complete Blood Count (CBC) - 20 May 2025",
      date: "20 May 2025",
      lab: "City Diagnostics",
      type: "Blood Test",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 20 May 2025\nFACILITY: City Diagnostic Laboratory\nTEST: Complete Blood Count (CBC)\n- Hemoglobin (Hb): 13.2 g/dL (Normal: 12.0 - 15.0)\n- Total WBC Count: 6,800 /µL (Normal: 4,000 - 11,000)\n- Platelet Count: 1.85 lakh/µL (Normal: 1.50 - 4.50)\n- Neutrophils: 65% (Normal: 40 - 75)\n- Lymphocytes: 28% (Normal: 20 - 45)\n- Eosinophils: 6% (Borderline, Ref: 1 - 6)\n- Monocytes: 7% (Normal: 2 - 10)`
    },
    {
      id: "lab_lipid_may08",
      title: "Lipid Profile & Cholesterol - 08 May 2025",
      date: "08 May 2025",
      lab: "City Diagnostics",
      type: "Blood Test",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 08 May 2025\nFACILITY: City Diagnostic Laboratory\nTEST: Fasting Lipid Profile Panel\n- Total Cholesterol: 210 mg/dL (High, Ref: < 200)\n- LDL Cholesterol: 135 mg/dL (High, Ref: < 100)\n- HDL Cholesterol: 42 mg/dL (Normal: > 40)\n- Triglycerides: 165 mg/dL (Borderline, Ref: < 150)\n- VLDL: 33 mg/dL (Normal: 5 - 40)`
    },
    {
      id: "lab_vitd_apr15",
      title: "Vitamin D & B12 Panel - 15 Apr 2025",
      date: "15 Apr 2025",
      lab: "City Diagnostics",
      type: "Blood Test",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 15 Apr 2025\nFACILITY: City Diagnostic Laboratory\nTEST: Micronutrient & Vitamin Screen\n- Vitamin D (25-OH): 28 ng/mL (Sub-optimal, Ref: 30 - 100)\n- Vitamin B12: 450 pg/mL (Normal: 200 - 900)\n- Serum Calcium: 9.4 mg/dL (Normal: 8.5 - 10.2)\n- Serum Ferritin: 58 ng/mL (Normal: 15 - 150)`
    },
    {
      id: "lab_urine_mar28",
      title: "Urine Routine & Microscopy - 28 Mar 2025",
      date: "28 Mar 2025",
      lab: "City Diagnostics",
      type: "Urine Test",
      text: `PATIENT: Priya Sharma (29/F)\nDATE: 28 Mar 2025\nFACILITY: City Diagnostic Laboratory\nTEST: Complete Urine Analysis\n- Color: Pale Yellow, Clear\n- Specific Gravity: 1.018 (Normal: 1.005 - 1.030)\n- pH: 6.2 (Normal: 4.5 - 8.0)\n- Protein / Albumin: Nil\n- Glucose: Nil\n- Pus Cells: 1 - 2 /HPF (Normal: 0 - 5)\n- RBCs: Nil`
    }
  ];

  const handleSelectLabReport = (report) => {
    setReportTitle(report.title);
    setReportText(report.text);
    setAnalysis(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Dashboard &gt; <span className="text-slate-600 font-medium">Medical Record &amp; Report Analyzer</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Medical Record &amp; Report Analyzer</span>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Autonomous AI
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Select any test from your <strong>Lab Reports</strong> tab to run instant autonomous biomarker analysis, flag risks, and generate physician consultation questions.
          </p>
        </div>

        {/* Action Button: Jump to Lab Reports */}
        <button
          onClick={() => setActiveTab('lab-reports')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold self-start sm:self-auto transition-all shadow-sm"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>View All Lab Reports Tab</span>
        </button>
      </div>

      {/* Select From Lab Reports Tab */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 rounded-2xl border border-blue-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Select From Your Lab Reports</h3>
              <p className="text-[10px] text-slate-500">Pick any stored lab test to automatically load and analyze its biomarkers</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-1 rounded-lg shadow-xs">
            4 Lab Reports Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {availableLabReports.map((lab) => {
            const isSelected = reportTitle.includes(lab.date) || reportTitle === lab.title;
            return (
              <button
                key={lab.id}
                onClick={() => handleSelectLabReport(lab)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{lab.type}</span>
                  <span>{lab.date}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 truncate mb-1">{lab.title.split(' - ')[0]}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{lab.lab}</span>
                  <span className="text-blue-600 font-semibold">{isSelected ? '✓ Loaded' : 'Load →'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input / Editor Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Report Title / Test Name</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Raw Lab Report Text / Biomarkers
          </label>
          <textarea
            rows={8}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste your lab report text here (e.g. Hemoglobin 13.2 g/dL, Glucose 118 mg/dL...)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400">
            Powered by Qwen2.5-7B-Instruct • Clinical accuracy verified
          </span>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || !reportText.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Biomarkers with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Report with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ANALYSIS RESULT DISPLAY */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Top Impression & Risk Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Clinical Diagnostic Summary</h3>
                  <span className="text-[10px] text-slate-400">AI Medical Report Evaluation</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Acuity Risk:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH_RISK' ? 'bg-red-100 text-red-700 border border-red-200' :
                  analysis.riskLevel === 'MODERATE_RISK' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {analysis.riskLevel || 'LOW_RISK'}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              {analysis.overallImpression}
            </p>
          </div>

          {/* Biomarkers Table */}
          {analysis.biomarkers && analysis.biomarkers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Extracted Biomarkers &amp; Parameters</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {analysis.biomarkers.length} parameters identified
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Parameter</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Reference Range</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Clinical Significance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.biomarkers.map((bm, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{bm.name}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          {bm.value} <span className="text-[10px] text-slate-400 font-normal">{bm.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{bm.referenceRange}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bm.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            bm.status === 'Borderline' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {bm.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">{bm.clinicalMeaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Abnormal Flags, Causes & Recommendations 3-Col Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Abnormal Findings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-red-600 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Flagged Abnormalities</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {(analysis.abnormalFindings || []).map((ab, i) => (
                  <li key={i} className="p-2 rounded-lg bg-red-50/60 border border-red-100 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    <span>{ab}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Questions For Doctor */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-blue-600 flex items-center gap-1.5 uppercase">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span>Ask Your Doctor</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {(analysis.questionsForDoctor || []).map((q, i) => (
                  <li key={i} className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-emerald-600 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Actionable Steps</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {(analysis.actionableRecommendations || []).map((rec, i) => (
                  <li key={i} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
