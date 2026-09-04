import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Plus,
  Search,
  Eye,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
  FileText,
  FileSignature,
  FlaskConical,
  Receipt,
  FileArchive,
  ArrowRight
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function HealthRecords() {
  const { setActiveTab, searchQuery, setSearchQuery } = useHealth();
  const [activeCategory, setActiveCategory] = useState('All Records');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All Records',
    'Prescriptions',
    'Lab Reports',
    'Bills',
    'Discharge Summaries',
    'Other Documents'
  ];

  useEffect(() => {
    async function loadRecords() {
      setLoading(true);
      try {
        const res = await api.getRecords(activeCategory);
        if (res.success) {
          setRecords(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [activeCategory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Dashboard &gt; <span className="text-slate-600 font-medium">Health Records</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Health Records</h1>
          <p className="text-xs text-slate-500">All your medical documents, organized and secured in one place.</p>
        </div>

        <button
          onClick={() => setActiveTab('upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-blue-50 text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Recent Documents + Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Recent Documents Cards & All Documents Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recent Documents Previews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Recent Documents</h3>
              <span className="text-xs text-slate-400">View all</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {records.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  {/* Mock Thumbnail / Icon */}
                  <div className="h-28 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors mb-2 overflow-hidden border border-slate-200/60">
                    {doc.type === 'Prescription' ? (
                      <FileSignature className="w-10 h-10" />
                    ) : doc.type === 'Lab Report' ? (
                      <FlaskConical className="w-10 h-10" />
                    ) : doc.type === 'Imaging' ? (
                      <div className="text-[10px] font-mono text-slate-600 bg-slate-800 text-white w-full h-full flex items-center justify-center">
                        X-RAY
                      </div>
                    ) : (
                      <FileText className="w-10 h-10" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{doc.doctor || doc.provider}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>{doc.date}</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3 hover:text-blue-600 cursor-pointer" />
                        <Download className="w-3 h-3 hover:text-blue-600 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Documents Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">All Documents</h3>
                {searchQuery && (
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    Filtered by: &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Clear search
                  </button>
                )}
                <span className="text-xs text-slate-400">Sort by: Newest</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Uploaded On</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records
                    .filter(r => {
                      if (!searchQuery || !searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase().trim();
                      return (
                        r.title?.toLowerCase().includes(q) ||
                        r.type?.toLowerCase().includes(q) ||
                        r.doctor?.toLowerCase().includes(q) ||
                        r.provider?.toLowerCase().includes(q) ||
                        r.summary?.toLowerCase().includes(q)
                      );
                    })
                    .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block truncate max-w-xs">{r.title}</span>
                            <span className="text-[10px] text-slate-400">{r.doctor || r.provider}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {r.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{r.date}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{r.date} • {r.time || '10:00 AM'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2 text-slate-400">
                          <button
                            onClick={() => {
                              if (r.type === 'Lab Report') setActiveTab('lab-reports');
                              else if (r.type === 'Prescription') setActiveTab('prescriptions');
                              else setActiveTab('doctor-summary');
                            }}
                            className="p-1 hover:text-blue-600 rounded"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:text-blue-600 rounded" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Records Summary & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Records Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Records Summary</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Documents</span>
                <span className="font-bold text-slate-900">24</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <FileSignature className="w-3.5 h-3.5 text-blue-500" />
                  Prescriptions
                </span>
                <span className="font-bold text-slate-800">9</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-500" />
                  Lab Reports
                </span>
                <span className="font-bold text-slate-800">7</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  Bills
                </span>
                <span className="font-bold text-slate-800">4</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <FileArchive className="w-3.5 h-3.5 text-purple-500" />
                  Discharge Summaries
                </span>
                <span className="font-bold text-slate-800">2</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Other Documents</span>
                <span className="font-bold text-slate-800">2</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Matching Page 3) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Quick Actions</h3>

            <button
              onClick={() => setActiveTab('doctor-summary')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                  Generate AI Summary
                </div>
                <div className="text-[10px] text-slate-400">Get clinical doctor-ready summary</div>
              </div>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                  Add Document Manually
                </div>
                <div className="text-[10px] text-slate-400">Upload and extract using AI</div>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('doctor-summary')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                  Share Records
                </div>
                <div className="text-[10px] text-slate-400">Share secure view with your doctor</div>
              </div>
              <Share2 className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Security & HIPAA Banner */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-emerald-900">Your Data is Secure</h4>
              <ul className="text-[10px] text-emerald-700 space-y-0.5 mt-1">
                <li>• End-to-end encrypted</li>
                <li>• HIPAA compliant storage</li>
                <li>• You control your data sharing</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
