import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Plus,
  UploadCloud,
  Pill,
  Activity,
  FileText,
  ShieldCheck,
  TrendingUp,
  User,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function AIAssistant() {
  const { user, stats, speakText, stopSpeaking, setActiveTab } = useHealth();
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'user',
      text: 'What does my latest blood test say about my health?',
      time: '10:30 AM'
    },
    {
      id: 'm2',
      sender: 'assistant',
      text: "I've analyzed your latest blood test from 20 May 2025. Here's what I found:\n\n• **Hemoglobin (13.2 g/dL)** — Normal. Good oxygen-carrying capacity.\n• **WBC Count (6,800 cells/µL)** — Normal. No active infection detected.\n• **Platelet Count (1.85 lakh/µL)** — Normal. Good clotting function.\n• **Eosinophils (6%)** — Borderline high. This may indicate seasonal allergies.\n\nOverall, your blood test looks good. Consider discussing the eosinophils level with your doctor if you have allergy symptoms.",
      time: '10:31 AM'
    },
    {
      id: 'm3',
      sender: 'user',
      text: 'Show me the trend of my Vitamin D levels',
      time: '10:32 AM'
    },
    {
      id: 'm4',
      sender: 'assistant',
      text: "Here is the trend of your **Vitamin D** levels over the last 6 months. Your level has risen steadily from 18 ng/mL to 28 ng/mL following your weekly 60K IU supplementation.",
      time: '10:33 AM',
      chartWidget: {
        title: "Vitamin D (ng/mL)",
        current: "28 ng/mL",
        change: "+8 ng/mL",
        status: "Normal",
        points: [
          { month: "Dec", val: 16 },
          { month: "Jan", val: 18 },
          { month: "Feb", val: 20 },
          { month: "Mar", val: 22 },
          { month: "Apr", val: 25 },
          { month: "May", val: 28 }
        ]
      }
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What do my recent reports indicate?",
    "Are my medicines working effectively?",
    "Show my health trends over time",
    "Do I have any pending follow-ups?",
    "What lifestyle changes do you suggest?"
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleResetChat = () => {
    setMessages([
      {
        id: 'm_welcome_' + Date.now(),
        sender: 'assistant',
        text: `Hello **${user?.name || 'Priya'}**, I am your **AI Health Assistant**.\n\nI have loaded your complete clinical profile (CBC, Lipid Panel, Vitamin D, and 5 active prescriptions). How can I assist you with your health today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      if (res.success && res.data) {
        const botMsg = {
          id: 'bot_' + Date.now(),
          sender: 'assistant',
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chartWidget: res.data.chartWidget
        };
        setMessages((prev) => [...prev, botMsg]);
        if (res.data.suggestedPrompts && Array.isArray(res.data.suggestedPrompts) && res.data.suggestedPrompts.length > 0) {
          setSuggestedQuestions(res.data.suggestedPrompts);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: "I experienced a brief connection interruption. Please rest assured your health data is safe.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Stats Strip (Matching Page 7) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center md:text-left px-3">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Documents Analyzed</span>
          <div className="text-lg font-bold text-slate-800 mt-0.5">24 <span className="text-xs text-slate-400 font-normal">All time</span></div>
        </div>

        <div className="text-center md:text-left px-3 border-l border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Insights Generated</span>
          <div className="text-lg font-bold text-blue-600 mt-0.5">18 <span className="text-xs text-slate-400 font-normal">This month</span></div>
        </div>

        <div className="text-center md:text-left px-3 border-l border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Health Score</span>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">{stats.healthScore || 78}/100 <span className="text-xs text-emerald-600 font-normal">Good</span></div>
        </div>

        <div className="text-center md:text-left px-3 border-l border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Next Follow-up</span>
          <div className="text-xs font-bold text-slate-800 mt-1 truncate">23 May 2025 • Dr. Anil Mehta</div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Interactive Chat Window */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[640px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>AI Health Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </h3>
                <p className="text-[10px] text-slate-400">Context: {user?.name || 'Priya Sharma'} • Qwen2.5 Medical Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetChat}
                className="text-[11px] text-slate-500 hover:text-blue-600 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                title="Start a new consultation session"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Chat</span>
              </button>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:inline-block">
                End-to-End Encrypted
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-xl ${m.sender === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-sm rounded-br-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 shadow-sm rounded-bl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Chart Widget Rendering (Matching Page 7) */}
                    {m.chartWidget && (() => {
                      const chartPoints = m.chartWidget.points || m.chartWidget.data || [];
                      const maxVal = Math.max(...chartPoints.map(p => Number(p.val || p.value) || 1), 30);
                      return (
                        <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs">{m.chartWidget.title}</span>
                            <span className="text-emerald-600 font-bold text-xs">
                              {m.chartWidget.current || m.chartWidget.currentValue}{m.chartWidget.change ? ` (${m.chartWidget.change})` : ''}
                            </span>
                          </div>
                          <div className="h-24 flex items-end justify-between gap-2 px-2 pt-3 border-b border-slate-100 pb-1">
                            {chartPoints.map((pt, idx) => {
                              const numVal = Number(pt.val || pt.value) || 0;
                              const heightPct = Math.min(Math.max((numVal / maxVal) * 100, 10), 100);
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                                  <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {numVal}
                                  </span>
                                  <div
                                    style={{ height: `${heightPct}%` }}
                                    className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                                  ></div>
                                  <span className="text-[9px] text-slate-400 truncate w-full text-center">{pt.month}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                    {m.sender === 'assistant' && (
                      <button
                        onClick={() => toggleSpeech(m.text)}
                        className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-0.5"
                        title="Listen with voice speech"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span>AI Assistant analyzing your clinical context...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompt Chips */}
          <div className="px-5 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium whitespace-nowrap">Suggested:</span>
            {["What should I do to improve it?", "Check medication timing", "Show trend of blood pressure"].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask anything about your health, medicines, symptoms..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl px-4 py-2.5 border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm shadow-blue-500/30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right 4 Cols: Quick Actions & Suggested Questions (Matching Page 7) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Quick Actions</h3>

            <button
              onClick={() => setActiveTab('upload')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Upload New Report</div>
                <div className="text-[10px] text-slate-400">Add lab reports, prescriptions etc.</div>
              </div>
              <UploadCloud className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={() => setActiveTab('doctor-summary')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Generate Health Summary</div>
                <div className="text-[10px] text-slate-400">Get AI summary of your records</div>
              </div>
              <FileText className="w-4 h-4 text-purple-500" />
            </button>

            <button
              onClick={() => setActiveTab('medications')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Ask About Medicines</div>
                <div className="text-[10px] text-slate-400">Learn about your medicines</div>
              </div>
              <Pill className="w-4 h-4 text-indigo-500" />
            </button>

            <button
              onClick={() => handleSend("I have a persistent headache and mild fever. Please evaluate.")}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">Check Symptoms</div>
                <div className="text-[10px] text-slate-400">Understand symptoms better</div>
              </div>
              <Activity className="w-4 h-4 text-emerald-500" />
            </button>
          </div>

          {/* Suggested Questions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Suggested Questions</h3>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-blue-600 transition-colors flex items-center justify-between group"
              >
                <span>{q}</span>
                <span className="text-slate-400 group-hover:text-blue-600">→</span>
              </button>
            ))}
          </div>

          {/* Privacy Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-800">Your data is private & secure</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                We use end-to-end encryption and HIPAA compliant storage to keep your health data safe.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
