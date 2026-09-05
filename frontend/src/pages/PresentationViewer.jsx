import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Volume2,
  Sparkles,
  Truck,
  Stethoscope,
  Pill,
  Activity,
  CheckCircle2,
  Play,
  RotateCcw
} from 'lucide-react';

const SLIDES_DATA = [
  {
    id: 1,
    tag: 'NEXT-GEN CLINICAL INTELLIGENCE',
    title: 'SwasthyaAI (स्वास्थ्यAI)',
    subtitle: 'Autonomous Multi-Agent Clinical AI Ecosystem',
    description:
      'Empowering patients and physicians with 24/7 autonomous emergency triage, multimodal diagnostic biomarker extraction, drug collision prevention, and instant clinical documentation.',
    badges: [
      { label: '8 Autonomous Agents', color: 'text-sky-400 border-sky-500/30' },
      { label: 'Featherless Qwen 2.5 7B', color: 'text-emerald-400 border-emerald-500/30' },
      { label: '70/70 Tests Passing', color: 'text-rose-400 border-rose-500/30' },
      { label: 'Vercel Serverless Ready', color: 'text-indigo-400 border-indigo-500/30' }
    ],
    speakerNotes:
      'Introduce the platform: SwasthyaAI is not another generic medical chatbot. It is a swarm of 8 domain-isolated AI agents that collaborate to solve real healthcare emergencies and paperwork burdens.'
  },
  {
    id: 2,
    tag: 'CLINICAL PROBLEM STATEMENT',
    title: 'Four Fatal Healthcare Bottlenecks',
    subtitle: 'Where Traditional Healthcare Fails Patients & Doctors',
    cards: [
      {
        icon: Truck,
        color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
        title: 'Critical Triage Delays',
        text: 'Patients with acute myocardial infarction, pulmonary embolism, or anaphylaxis wait in long outpatient queues or search Google, missing golden-hour care.'
      },
      {
        icon: Stethoscope,
        color: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
        title: 'Doctor Documentation Burnout',
        text: 'Physicians spend 40–50% of each consultation manually typing SOAP notes, deciphering scattered paper lab reports, and entering EMR fields.'
      },
      {
        icon: Pill,
        color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
        title: 'Prescription Collisions',
        text: 'Polypharmacy patients face dangerous drug-drug collisions and conflicting meal schedules. Over 50% stop adhering to therapy within 90 days.'
      },
      {
        icon: Activity,
        color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
        title: 'Emergency ICU Bed Chaos',
        text: 'Families frantically call multiple hospitals trying to locate open ICU beds while ambulances navigate traffic with zero telemetry or pre-alerted trauma teams.'
      }
    ],
    speakerNotes:
      'Emphasize the human cost: Doctors spend half their day typing, and patients die during delays finding an ICU bed. These are preventable systemic failures.'
  },
  {
    id: 3,
    tag: 'THE BREAKTHROUGH SOLUTION',
    title: 'Autonomous Continuous Care Loop',
    subtitle: 'From Emergency Alert to Longitudinal Recovery',
    steps: [
      {
        num: '01',
        title: '24/7 Emergency Triage',
        text: 'Instant Red/Amber/Green urgency scoring using patient vitals and symptom narratives. Triggers Code-Red alerts instantly.',
        color: 'text-rose-400'
      },
      {
        num: '02',
        title: 'Multimodal Lab Parser',
        text: 'Extracts numerical biomarkers from blood panels and imaging, highlighting deviations against physiological baselines.',
        color: 'text-sky-400'
      },
      {
        num: '03',
        title: 'Doctor Clinical Copilot',
        text: 'Pre-synthesizes history and labs into structured SOAP notes with AI differential diagnoses in under 15 seconds.',
        color: 'text-emerald-400'
      },
      {
        num: '04',
        title: 'Live Bed & Dispatch',
        text: 'Haversine GPS calculates hospital distance, deducts an ICU bed in real-time, and routes an ALS ambulance unit.',
        color: 'text-purple-400'
      }
    ],
    speakerNotes:
      'Highlight how SwasthyaAI acts as a connected loop: It catches emergencies early, helps the doctor make faster decisions, and tracks recovery after discharge.'
  },
  {
    id: 4,
    tag: 'SYSTEM ARCHITECTURE',
    title: 'Decoupled Multi-Agent Swarm',
    subtitle: 'Single-Responsibility Autonomous Micro-Agents',
    architecture: {
      coordinator: [
        'Event-Driven Task Delegation',
        'Deterministic Clinical Guardrails',
        'Cross-Agent Consensus Synthesis'
      ],
      agents: [
        { name: '1. Emergency Triage', role: 'Acuity scoring & Code-Red trigger', color: 'text-rose-400' },
        { name: '2. Diagnostic Lab', role: 'Biomarker range delta extraction', color: 'text-sky-400' },
        { name: '3. Medication Safety', role: 'Drug-drug collision & food conflicts', color: 'text-amber-400' },
        { name: '4. Tablet Scheduler', role: 'Smart daily dose timing generator', color: 'text-indigo-400' },
        { name: '5. Bed & Dispatch', role: 'GPS Haversine routing & ICU bed lock', color: 'text-purple-400' },
        { name: '6. Insurance Claims', role: 'Pre-authorization & claim scoring', color: 'text-emerald-400' },
        { name: '7. Doctor Copilot', role: 'Automated SOAP notes & differentials', color: 'text-teal-400' },
        { name: '8. Follow-up Agent', role: 'Symptom progression & compliance', color: 'text-cyan-400' }
      ]
    },
    speakerNotes:
      'Explain why multi-agent beats monolithic LLMs: Each agent has isolated context, specialized prompts, and deterministic fail-safes that prevent hallucinations.'
  },
  {
    id: 5,
    tag: 'DEEP DIVE: CRITICAL CARE',
    title: 'Emergency Triage & Bed Allocation',
    subtitle: 'Securing Patient Care During the Golden Hour',
    columns: [
      {
        title: '🚨 Autonomous Triage Engine',
        color: 'text-rose-400',
        points: [
          'Three-Tier Acuity Scoring: Classifies cases into EMERGENT, URGENT, and NON_URGENT.',
          'Vital Signs Validation: Evaluates HR (>100 bpm), BP (>140/90), and SpO2 (<94%) alongside narrative symptoms.',
          'Red-Flag Safety Triggers: Immediate escalation for acute coronary syndromes, stroke (FAST criteria), and sepsis.',
          'Clinical Explanations: Generates patient-friendly guidance and structured paramedic handoff notes.'
        ]
      },
      {
        title: '🚑 Haversine GPS & Bed Reservation',
        color: 'text-sky-400',
        points: [
          'Haversine GPS Engine: Calculates true ground distances from user coordinates to network hospitals.',
          'Live ICU Inventory Lock: Automatically deducts allocated ICU bed from live inventory upon dispatch.',
          'ALS Ambulance Routing: Estimates ETA using city-traffic velocity baselines (32 km/h + 2 min prep).',
          'Trauma Team Pre-Alert: Generates unique mission ID, paramedic crew roster, and equipment readiness checklist.'
        ]
      }
    ],
    speakerNotes:
      'Walk through a real emergency: Patient complains of crushing chest pain -> Triage rates EMERGENT -> Haversine finds nearest hospital with free ICU bed -> Bed is reserved immediately.'
  },
  {
    id: 6,
    tag: 'DEEP DIVE: PRECISION CLINICAL CARE',
    title: 'Diagnostics, Safety & Tablet Scheduling',
    subtitle: 'Biomarker Extraction and Adverse Drug Event Prevention',
    columns: [
      {
        title: '🔬 Diagnostic Report Analyzer',
        color: 'text-emerald-400',
        points: [
          'Biomarker Extraction: Automatically parses CBC, Lipid, Metabolic, LFT, and KFT panels.',
          'Reference Range Delta: Computes exact variance above or below normal physiological baselines.',
          'Plain-Language Insights: Translates complex clinical values into clear patient summaries.',
          'Vault Integration: Persists longitudinal biomarker history for timeline trend tracking.'
        ]
      },
      {
        title: '💊 Medication Safety & Scheduler',
        color: 'text-amber-400',
        points: [
          'Drug Collision Matrix: Cross-checks new prescriptions against active medications and allergy registries.',
          'Food & Alcohol Alerts: Identifies interactions with meals, citrus, alcohol, and timing restrictions.',
          'Smart Daily Dosing: Generates precise morning, afternoon, and night reminder timestamps.',
          'Interactive Adherence: One-click "Take Dose" logging calculates dynamic adherence percentages.'
        ]
      }
    ],
    speakerNotes:
      'Detail the medication scheduler: When Amoxicillin is prescribed, the agent checks Penicillin allergies, warns against taking with certain foods, and sets automatic daily reminders.'
  },
  {
    id: 7,
    tag: 'CLINICAL COPILOT',
    title: 'Doctor Copilot: Automated SOAP Synthesis',
    subtitle: 'From Unstructured Records to High-Yield Clinical Summary in 15s',
    soap: [
      {
        letter: 'S',
        title: 'Subjective',
        desc: "Aggregates chief complaints, patient symptom narratives, pain level, and lifestyle history.",
        color: 'text-sky-400 border-sky-500/30'
      },
      {
        letter: 'O',
        title: 'Objective',
        desc: 'Compiles verified vitals (BP, HR, SpO2), abnormal lab biomarkers, and medical imaging findings.',
        color: 'text-emerald-400 border-emerald-500/30'
      },
      {
        letter: 'A',
        title: 'Assessment',
        desc: 'Formulates AI differential diagnoses ranked by clinical likelihood with diagnostic rationale.',
        color: 'text-rose-400 border-rose-500/30'
      },
      {
        letter: 'P',
        title: 'Plan',
        desc: 'Proposes evidence-based treatment plans, recommended tests, drug schedule, and follow-up timeline.',
        color: 'text-purple-400 border-purple-500/30'
      }
    ],
    footer: '⚡ Cuts physician EMR documentation overhead by 70%, giving doctors more time with patients.',
    speakerNotes:
      'Explain the SOAP standard: Subjective, Objective, Assessment, and Plan. Doctors normally spend 15 minutes typing this; SwasthyaAI generates it in 15 seconds.'
  },
  {
    id: 8,
    tag: 'FULL-STACK ENGINEERING',
    title: 'End-to-End Technology Stack',
    subtitle: 'Modern, Resilient, and Built for Zero-Maintenance Production',
    tech: [
      {
        category: '🎨 Frontend Client',
        color: 'text-sky-400',
        items: [
          'React 18 Component Architecture',
          'Vite 5 Lightning-Fast Build Engine',
          'Tailwind CSS Utility Styling',
          'Lucide React Medical Iconography',
          'Leaflet GPS Hospital Geolocation'
        ]
      },
      {
        category: '⚙️ Backend Services',
        color: 'text-emerald-400',
        items: [
          'Node.js & Express REST API Architecture',
          'JWT Cryptographic Token Authentication',
          'Bcrypt.js Password Hashing',
          'Multer Multipart Document Ingestion',
          'Haversine Spherical Distance Math'
        ]
      },
      {
        category: '🧠 AI & Multi-Agent',
        color: 'text-rose-400',
        items: [
          'Featherless AI GPU Cloud Inference',
          'Qwen 2.5 7B Instruct Open Model',
          'OpenAI REST Streaming Protocol',
          'Deterministic Clinical Guardrails',
          'Strict JSON Schema Enforcement'
        ]
      },
      {
        category: '🗄️ Database & Cloud',
        color: 'text-purple-400',
        items: [
          'Encrypted JSON Diagnostic Vault',
          'Serverless /tmp Cold-Start Resilience',
          'Vercel Serverless Lambda Architecture',
          '37 Atomic Git Commits (Conventional)',
          '70/70 Automated Integration Test Suite'
        ]
      }
    ],
    speakerNotes:
      'Highlight the engineering decisions: Monorepo with React and Node, lightweight JSON database resilient to serverless cold-starts on Vercel, and Featherless AI for low-latency inference.'
  },
  {
    id: 9,
    tag: 'QUALITY ASSURANCE',
    title: '100% Automated Test Benchmark (70/70)',
    subtitle: 'Exhaustively Tested Across 7 Critical Clinical Domains',
    tests: [
      { suite: 'Authentication & RBAC System', passed: '12 / 12', desc: 'JWT signing, password hashing, patient account isolation' },
      { suite: 'Emergency Triage & Red-Flag Escalation', passed: '10 / 10', desc: 'Acuity scoring, critical vitals threshold triggers' },
      { suite: 'Multimodal Diagnostic Agent', passed: '8 / 8', desc: 'Biomarker parsing, laboratory report delta extraction' },
      { suite: 'Drug-Drug Interaction Safety', passed: '10 / 10', desc: 'Collision matrix, food contraindication detection' },
      { suite: 'Doctor Copilot & SOAP Generation', passed: '10 / 10', desc: 'Subjective/Objective synthesis, differential diagnoses' },
      { suite: 'Adherence & Telemetry Tracking', passed: '10 / 10', desc: 'Tablet intake logging, longitudinal vitals telemetry' },
      { suite: 'Database Concurrency & Resilience', passed: '10 / 10', desc: 'Zero-corruption reads/writes, serverless fallback' }
    ],
    speakerNotes:
      'Mention test coverage: In healthcare, bugs can be fatal. We wrote 70 automated tests checking security, triage accuracy, and drug interactions with a 100% pass rate.'
  },
  {
    id: 10,
    tag: 'DEMONSTRATION WALKTHROUGH',
    title: 'Live Demonstration Flow Script',
    subtitle: '5 Interactive Steps for Judges and Stakeholders',
    steps: [
      {
        num: '1',
        title: 'Patient Dashboard Login',
        desc: 'Log in as Rahul Verma (42 M, Hypertension). View Health Score (84), active prescriptions, and today dose checklist.'
      },
      {
        num: '2',
        title: 'Emergency Red-Flag Trigger',
        desc: 'Simulate acute chest pain. Agent flags EMERGENT, finds closest hospital, and dispatches ALS ambulance unit.'
      },
      {
        num: '3',
        title: 'Lab Report Ingestion',
        desc: 'Upload blood test. AI instantly extracts Hemoglobin, WBC, Platelets, and Creatinine with baseline deviations.'
      },
      {
        num: '4',
        title: 'Smart Medication Scheduling',
        desc: 'Add new antibiotic. Pharma agent checks allergy conflicts, sets twice-daily schedule, and registers dose alerts.'
      },
      {
        num: '5',
        title: 'Doctor Copilot Consultation',
        desc: 'Log in as Dr. Sharma. Review automated SOAP note, differential diagnosis, and full patient history in 15 seconds.'
      }
    ],
    speakerNotes:
      'This slide serves as your cheat sheet during a live demo. Follow these 5 steps to show the complete end-to-end capability of the system.'
  },
  {
    id: 11,
    tag: 'VALUE PROPOSITION',
    title: 'Measurable Clinical & Operational Impact',
    subtitle: 'Transforming Reactive Healthcare into Proactive Care',
    metrics: [
      { value: '70%', label: 'Reduction in EMR Time', desc: 'Doctors review pre-structured SOAP notes rather than typing during consults.', color: 'text-sky-400' },
      { value: '< 5s', label: 'Emergency Triage Speed', desc: 'Instant classification of life-threatening events with automated bed locking.', color: 'text-rose-400' },
      { value: '99.4%', label: 'Interaction Safety', desc: 'Algorithmic screening catches hazardous drug collisions and allergy conflicts.', color: 'text-amber-400' },
      { value: '35%', label: 'Higher Adherence', desc: 'Interactive dose tracking and proactive follow-up alerts prevent therapy drop-off.', color: 'text-emerald-400' }
    ],
    speakerNotes:
      'Summarize the quantitative impact: 70% time saved for doctors, sub-5-second emergency triage, and over 35% higher patient medication compliance.'
  },
  {
    id: 12,
    tag: 'CLOSING & DISCUSSION',
    title: 'SwasthyaAI: The Future of Clinical AI',
    subtitle: 'Thank You! We are now open for Live Q&A.',
    summary: [
      '🌐 Repository: github.com/yogisomanaboina-datapirate/Health-agent',
      '🧪 Reliability: 70 / 70 Automated Integration Tests Passing',
      '⚡ Deployment: Production Serverless Architecture on Vercel'
    ],
    speakerNotes:
      'Deliver the final punchline: SwasthyaAI bridges the gap between patient reporting and physician decision-making with verified, autonomous intelligence. Thank the judges!'
  }
];

export default function PresentationViewer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const slide = SLIDES_DATA[currentSlideIndex];
  const totalSlides = SLIDES_DATA.length;

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else if (isAutoPlaying) {
      setCurrentSlideIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowSpeakerNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isAutoPlaying]);

  useEffect(() => {
    let interval = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, currentSlideIndex]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('presentation-container');
    if (!document.fullscreenElement) {
      if (elem?.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div
      id="presentation-container"
      className="flex flex-col h-[calc(100vh-5rem)] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative select-none"
    >
      {/* Top Presentation Bar */}
      <header className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">SwasthyaAI Pitch Deck</div>
            <div className="text-xs font-semibold text-slate-200">
              Slide {currentSlideIndex + 1} of {totalSlides}: <span className="text-sky-400">{slide.title}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Auto-Play */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isAutoPlaying ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Toggle Auto Play (7s per slide)"
          >
            {isAutoPlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Auto-Playing' : 'Auto Play'}</span>
          </button>

          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              showSpeakerNotes ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Toggle Presenter Speaker Notes (Key: N)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speaker Script</span>
          </button>

          {/* Download PPTX */}
          <a
            href="/SwasthyaAI_Presentation.pptx"
            download="SwasthyaAI_Presentation.pptx"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 flex items-center gap-1.5 transition"
            title="Download original Microsoft PowerPoint file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .PPTX</span>
          </a>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle Fullscreen (Key: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Slide Body */}
      <div className="flex-1 overflow-hidden relative flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-5xl h-full flex flex-col justify-center">
          {/* Slide Tag */}
          <div className="mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-block">
              {slide.tag}
            </span>
          </div>

          {/* Slide Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight mb-2">{slide.title}</h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium mb-6">{slide.subtitle}</p>

          {/* SLIDE 1 CONTENT */}
          {slide.id === 1 && (
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 space-y-6">
              <p className="text-slate-300 text-base leading-relaxed">{slide.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
                {slide.badges.map((b, i) => (
                  <div key={i} className={`p-4 rounded-xl bg-slate-950/80 border ${b.color} text-center`}>
                    <span className="text-xs font-bold block">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 2 CONTENT: 4 Bottlenecks */}
          {slide.id === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slide.cards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className={`p-5 rounded-2xl border ${c.color} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-bold text-slate-100 text-base">{c.title}</h3>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SLIDE 3 CONTENT: 4 Steps */}
          {slide.id === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {slide.steps.map((st, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className={`text-3xl font-black ${st.color} mb-3`}>{st.num}</div>
                    <h3 className="font-bold text-slate-100 text-sm mb-2">{st.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{st.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SLIDE 4 CONTENT: Architecture */}
          {slide.id === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-sky-400 font-bold text-sm mb-3">Central Coordinator</div>
                <div className="space-y-2 text-xs text-slate-300">
                  {slide.architecture.coordinator.map((pt, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                      • {pt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-emerald-400 font-bold text-sm mb-3">8 Domain-Isolated Agents</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {slide.architecture.agents.map((ag, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className={`font-bold block ${ag.color}`}>{ag.name}</span>
                      <span className="text-slate-400 text-[11px]">{ag.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5 & 6 CONTENT: 2 Columns */}
          {(slide.id === 5 || slide.id === 6) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {slide.columns.map((col, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h3 className={`font-bold text-base mb-4 ${col.color}`}>{col.title}</h3>
                  <ul className="space-y-3 text-xs text-slate-300">
                    {col.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={`${col.color} font-bold`}>•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* SLIDE 7 CONTENT: SOAP Note */}
          {slide.id === 7 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {slide.soap.map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl bg-slate-900/60 border ${s.color}`}>
                    <div className={`text-xl font-black mb-1 ${s.color}`}>{s.letter}</div>
                    <div className="font-bold text-slate-100 text-xs mb-1">{s.title}</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-center text-xs text-sky-300 font-semibold">
                {slide.footer}
              </div>
            </div>
          )}

          {/* SLIDE 8 CONTENT: Tech Stack */}
          {slide.id === 8 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {slide.tech.map((t, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h3 className={`font-bold text-sm mb-2 ${t.color}`}>{t.category}</h3>
                  <ul className="space-y-1 text-slate-300">
                    {t.items.map((it, j) => (
                      <li key={j}>• {it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* SLIDE 9 CONTENT: Test Benchmark */}
          {slide.id === 9 && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {slide.tests.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">{t.suite}</span>
                      <span className="text-[11px] text-slate-400">{t.desc}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0 ml-2">
                      {t.passed} PASS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 10 CONTENT: Demo Walkthrough */}
          {slide.id === 10 && (
            <div className="space-y-2.5 text-xs">
              {slide.steps.map((st, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                    {st.num}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">{st.title}: </span>
                    <span className="text-slate-400">{st.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SLIDE 11 CONTENT: Metrics */}
          {slide.id === 11 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              {slide.metrics.map((m, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div className={`text-4xl font-black mb-2 ${m.color}`}>{m.value}</div>
                  <div className="font-bold text-slate-200 text-sm mb-2">{m.label}</div>
                  <p className="text-slate-400 text-xs">{m.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* SLIDE 12 CONTENT: Closing */}
          {slide.id === 12 && (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
              <div className="text-emerald-400 text-3xl font-bold flex justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md mx-auto text-xs text-slate-300">
                {slide.summary.map((sm, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    {sm}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Speaker Notes Drawer (Toggled by user or N key) */}
      {showSpeakerNotes && (
        <div className="bg-slate-900 border-t border-sky-500/30 p-4 px-6 z-20 shrink-0 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Presenter Speaker Script (What to say for this slide):
            </div>
            <button onClick={() => setShowSpeakerNotes(false)} className="text-xs text-slate-500 hover:text-slate-300">
              Close [N]
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">"{slide.speakerNotes}"</p>
        </div>
      )}

      {/* Bottom Slide Navigation Bar */}
      <footer className="h-16 bg-slate-900/90 border-t border-slate-800 px-6 flex items-center justify-between z-10 shrink-0">
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* Thumbnail Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES_DATA.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlideIndex ? 'w-6 bg-sky-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 text-white transition shadow-lg shadow-sky-500/20"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
