import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Activity,
  Calendar,
  FileCheck
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function LabReports() {
  const { setActiveTab } = useHealth();
  const [selectedReport, setSelectedReport] = useState('cbc');
  const [dbReports, setDbReports] = useState(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.getLabReports();
        if (res.success && res.data) {
          setDbReports(res.data);
        }
      } catch (err) {
        console.error("Failed to load lab reports from DB:", err);
      }
    }
    loadReports();
  }, []);

  const reportCards = [
    { id: 'cbc', name: 'Complete Blood Count', type: 'Blood Test', date: '20 May 2025', lab: 'City Diagnostics', status: 'Normal' },
    { id: 'lipid', name: 'Lipid Profile', type: 'Blood Test', date: '08 May 2025', lab: 'City Diagnostics', status: 'Abnormal' },
    { id: 'vitd', name: 'Vitamin D, B12', type: 'Blood Test', date: '15 Apr 2025', lab: 'City Diagnostics', status: 'Normal' },
    { id: 'urine', name: 'Urine Routine', type: 'Urine Test', date: '28 Mar 2025', lab: 'City Diagnostics', status: 'Normal' }
  ];

  const cbcParameters = [
    { name: "Hemoglobin (Hb)", result: "13.2", unit: "g/dL", reference: "12.0 - 15.0", status: "Normal", trend: [11.5, 12.0, 12.6, 13.2] },
    { name: "Total RBC Count", result: "4.45", unit: "million/µL", reference: "3.80 - 5.20", status: "Normal", trend: [4.2, 4.3, 4.4, 4.45] },
    { name: "WBC Count", result: "6,800", unit: "cells/µL", reference: "4,000 - 11,000", status: "Normal", trend: [7100, 6900, 6850, 6800] },
    { name: "Platelet Count", result: "1.85", unit: "lakh/µL", reference: "1.50 - 4.50", status: "Normal", trend: [1.7, 1.75, 1.8, 1.85] },
    { name: "Neutrophils", result: "65", unit: "%", reference: "40 - 75", status: "Normal", trend: [68, 66, 65, 65] },
    { name: "Lymphocytes", result: "28", unit: "%", reference: "20 - 45", status: "Normal", trend: [24, 26, 27, 28] },
    { name: "Eosinophils", result: "6", unit: "%", reference: "1 - 6", status: "Borderline", trend: [4, 5, 5.5, 6] },
    { name: "Monocytes", result: "7", unit: "%", reference: "2 - 10", status: "Normal", trend: [6, 7, 7, 7] }
  ];

  const lipidParameters = [
    { name: "Total Cholesterol", result: "210", unit: "mg/dL", reference: "< 200", status: "High" },
    { name: "LDL Cholesterol", result: "135", unit: "mg/dL", reference: "< 100", status: "High" },
    { name: "HDL Cholesterol", result: "42", unit: "mg/dL", reference: "> 40", status: "Normal" },
    { name: "Triglycerides", result: "165", unit: "mg/dL", reference: "< 150", status: "Borderline" }
  ];

  const vitdParameters = [
    { name: "Vitamin D (25-OH)", result: "28", unit: "ng/mL", reference: "30 - 100", status: "Borderline" },
    { name: "Vitamin B12", result: "450", unit: "pg/mL", reference: "200 - 900", status: "Normal" },
    { name: "Serum Calcium", result: "9.4", unit: "mg/dL", reference: "8.5 - 10.2", status: "Normal" },
    { name: "Serum Ferritin", result: "58", unit: "ng/mL", reference: "15 - 150", status: "Normal" }
  ];

  const urineParameters = [
    { name: "Specific Gravity", result: "1.018", unit: "ratio", reference: "1.005 - 1.030", status: "Normal" },
    { name: "pH", result: "6.2", unit: "pH", reference: "4.5 - 8.0", status: "Normal" },
    { name: "Protein / Albumin", result: "Nil", unit: "", reference: "Negative", status: "Normal" },
    { name: "Pus Cells", result: "1 - 2", unit: "/HPF", reference: "0 - 5", status: "Normal" },
    { name: "Glucose", result: "Nil", unit: "", reference: "Negative", status: "Normal" }
  ];

  const reportDetails = {
    cbc: {
      name: 'Complete Blood Count',
      type: 'Blood Test',
      date: '20 May 2025 • 10:15 AM',
      lab: 'City Diagnostic Laboratory',
      doctor: 'Dr. Anil Mehta',
      parameters: cbcParameters,
      impression: 'Your complete blood count is within normal physiological limits. Oxygen-carrying and immune markers are healthy.',
      observations: [
        { label: 'Hemoglobin levels are good (13.2 g/dL). No signs of anemia.', type: 'good' },
        { label: 'WBC count is normal (6,800 cells/µL). No acute infection detected.', type: 'good' },
        { label: 'Eosinophils (6%) are at upper threshold. Correlates with seasonal rhinitis.', type: 'warning' }
      ],
      trendLabel: 'Hemoglobin (Hb)',
      trendValue: '13.2',
      trendData: [60, 65, 75, 80, 88, 95]
    },
    lipid: {
      name: 'Lipid Profile Panel',
      type: 'Blood Test',
      date: '08 May 2025 • 08:30 AM',
      lab: 'City Diagnostic Laboratory',
      doctor: 'Dr. Anil Mehta',
      parameters: lipidParameters,
      impression: 'Mild dyslipidemia detected. Elevated LDL and borderline triglycerides suggest continuing dietary changes and evening Atorvastatin.',
      observations: [
        { label: 'Total Cholesterol (210 mg/dL) is slightly above the 200 threshold.', type: 'warning' },
        { label: 'LDL (135 mg/dL) is elevated. Continue low-fat diet and prescribed statin.', type: 'warning' },
        { label: 'HDL (42 mg/dL) is protective against cardiovascular risks.', type: 'good' }
      ],
      trendLabel: 'Total Cholesterol',
      trendValue: '210',
      trendData: [92, 90, 88, 85, 84, 82]
    },
    vitd: {
      name: 'Vitamin D & B12 Panel',
      type: 'Blood Test',
      date: '15 Apr 2025 • 09:00 AM',
      lab: 'City Diagnostic Laboratory',
      doctor: 'Dr. Anil Mehta',
      parameters: vitdParameters,
      impression: 'Sub-optimal Vitamin D level. Weekly Vitamin D3 60K supplementation is actively addressing this baseline.',
      observations: [
        { label: 'Vitamin D (28 ng/mL) is slightly below standard (30-100 ng/mL).', type: 'warning' },
        { label: 'Vitamin B12 is robust at 450 pg/mL with optimal neurological support.', type: 'good' },
        { label: 'Serum Calcium is normal at 9.4 mg/dL.', type: 'good' }
      ],
      trendLabel: 'Vitamin D (25-OH)',
      trendValue: '28',
      trendData: [40, 48, 55, 65, 72, 80]
    },
    urine: {
      name: 'Urine Routine & Microscopy',
      type: 'Urine Test',
      date: '28 Mar 2025 • 11:30 AM',
      lab: 'City Diagnostic Laboratory',
      doctor: 'Dr. Anil Mehta',
      parameters: urineParameters,
      impression: 'Routine urinalysis is completely normal. Kidney filtration, urinary tract integrity, and hydration status are excellent.',
      observations: [
        { label: 'No proteinuria or microalbuminuria detected (Kidney function intact).', type: 'good' },
        { label: 'Pus cells and bacteria are absent; no urinary tract infection.', type: 'good' },
        { label: 'Specific gravity 1.018 indicates healthy baseline hydration.', type: 'good' }
      ],
      trendLabel: 'Specific Gravity',
      trendValue: '1.018',
      trendData: [50, 50, 50, 50, 50, 50]
    }
  };

  const activeReportCards = (dbReports && dbReports.reportCards) || reportCards;
  const mergedDetails = { ...reportDetails, ...(dbReports || {}) };
  const currentReport = mergedDetails[selectedReport] || mergedDetails.cbc || reportDetails.cbc;
  const activeParameters = currentReport.parameters || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Dashboard &gt; <span className="text-slate-600 font-medium">Lab Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lab Reports</h1>
          <p className="text-xs text-slate-500">Track your lab test results over time and understand your health better.</p>
        </div>

        <button
          onClick={() => setActiveTab('upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Report Cards Row (Page 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {activeReportCards.map((rc) => (
          <button
            key={rc.id}
            onClick={() => setSelectedReport(rc.id)}
            className={`text-left p-3.5 rounded-2xl border transition-all ${
              selectedReport === rc.id
                ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                {rc.type}
              </span>
              <span className="text-[10px] text-slate-400">{rc.date}</span>
            </div>

            <h4 className="font-bold text-xs text-slate-800 truncate mb-1">{rc.name}</h4>
            <p className="text-[10px] text-slate-400 mb-2">{rc.lab}</p>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              rc.status === 'Normal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {rc.status}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Parameters Table + AI Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Dynamic Parameters Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  {currentReport.name}
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">
                  {currentReport.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentReport.date} • {currentReport.lab}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export / Print</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Reference Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Trend Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeParameters.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.result}</td>
                    <td className="py-3 px-4 text-slate-400">{p.unit}</td>
                    <td className="py-3 px-4 text-slate-500">{p.reference}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Normal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        p.status === 'Borderline' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-16 h-3 flex items-center gap-0.5">
                        <div className="h-1 bg-blue-300 w-3 rounded"></div>
                        <div className="h-1.5 bg-blue-400 w-3 rounded"></div>
                        <div className="h-2 bg-blue-500 w-3 rounded"></div>
                        <div className="h-2.5 bg-blue-600 w-3 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Notes: Analyzed and structured for clinical record storage.</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              Reviewed by {currentReport.doctor}
            </span>
          </div>

        </div>

        {/* Right 4 Cols: Dynamic AI Report Summary (Page 5) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Report Summary</span>
              </h3>
              <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                Autonomous
              </span>
            </div>

            {/* Overall Impression */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Overall impression</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                {currentReport.impression}
              </p>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">AI Observations</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {currentReport.observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      obs.type === 'good' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    <span>{obs.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Trend Chart */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-800">Parameter Trends</span>
                <span className="text-blue-600 font-medium">{currentReport.trendLabel}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                  <span>Dec</span>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span className="font-bold text-blue-600">Latest ({currentReport.trendValue})</span>
                </div>
                <div className="h-16 flex items-end justify-between gap-2 px-1">
                  {currentReport.trendData.map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${val}%` }}
                      className={`w-full rounded-t transition-all ${
                        i === currentReport.trendData.length - 1 ? 'bg-blue-600' : 'bg-blue-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Disclaimer: AI insights are for informational purposes only. Consult your doctor for medical advice.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
