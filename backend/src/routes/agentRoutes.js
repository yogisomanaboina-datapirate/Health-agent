import express from 'express';
import { coordinateAutonomousEvent, orchestrateFullMedicalCase } from '../agents/coordinatorAgent.js';
import { processChatConsultation } from '../agents/chatAgent.js';
import { evaluateTriage } from '../agents/triageAgent.js';
import { analyzeMedication } from '../agents/medicationAgent.js';
import { analyzeDocument } from '../agents/documentAgent.js';
import { generateDoctorSummary } from '../agents/summaryAgent.js';
import { analyzeMedicalReport } from '../agents/reportAnalyzerAgent.js';
import { adjudicateInsuranceClaim, verifyInsurancePolicy } from '../agents/insuranceAgent.js';
import { allocateHospitalBedAndDispatch } from '../agents/bedAllocationAgent.js';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = express.Router();

function getRequestUser(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], config.jwtSecret);
      if (decoded && decoded.id) {
        const u = db.getUserById(decoded.id);
        if (u) return u;
      }
    } catch (e) {}
  }
  return db.getUser();
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * 1. NEARBY HOSPITALS & AMBULANCE ARRIVAL TIMES
 * Calculates distance from user GPS coordinates to all network hospitals and estimates ambulance arrival time.
 */
router.post('/nearby-hospitals', async (req, res) => {
  try {
    const { location, symptoms, vitals } = req.body;
    const userLat = location?.lat || 17.4123;
    const userLng = location?.lng || 78.4321;
    const userArea = location?.area || 'Banjara Hills, Hyderabad';

    const allHospitals = db.getHospitals();

    // Calculate distance and ambulance ETA for each hospital
    const mapped = allHospitals.map(h => {
      let dist = calculateDistanceKm(userLat, userLng, h.lat, h.lng);
      if (!dist) dist = h.distanceValue || 2.5;
      const eta = Math.max(3, Math.round((dist / 32) * 60 + 2)); // 32 km/h city avg + 2 min prep
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        address: h.address,
        phone: h.phone,
        emergencyPhone: h.emergencyPhone,
        lat: h.lat,
        lng: h.lng,
        distanceKm: dist,
        ambulanceEtaMinutes: eta,
        icuBedsFree: h.icuBedsFree,
        totalBedsFree: h.totalBedsFree,
        ambulanceAvailable: h.ambulanceAvailable,
        facilities: h.facilities || ["24/7 Emergency", "ICU Available"],
        rating: h.rating || 4.5
      };
    });

    // Sort by ETA
    mapped.sort((a, b) => a.ambulanceEtaMinutes - b.ambulanceEtaMinutes);

    // Optional quick triage if symptoms provided
    let triage = null;
    if (symptoms) {
      try {
        triage = await evaluateTriage({
          symptoms,
          vitals: vitals || { heartRate: 105, bloodPressure: "135/85", spo2: 95 },
          patientContext: db.getUser()
        });
      } catch (e) {
        console.error('Triage eval error in nearby-hospitals:', e.message);
      }
    }

    // Mark top recommendation
    if (mapped.length > 0) {
      mapped[0].isRecommended = true;
      mapped[0].recommendationReason = "Fastest ambulance response to your detected coordinates";
    }

    return res.json({
      success: true,
      data: {
        userLocation: { lat: userLat, lng: userLng, area: userArea },
        triage,
        hospitals: mapped
      }
    });
  } catch (error) {
    console.error('Nearby hospitals error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 1. AMBULANCE RESPONSE & EMERGENCY DISPATCH AGENT
 * Autonomously analyzes triage urgency, reserves hospital bed, and dispatches ambulance with live telemetry.
 */
router.post('/ambulance-dispatch', async (req, res) => {
  try {
    const { symptoms, vitals, location, hospitalId } = req.body;
    const user = getRequestUser(req);
    const allHospitals = db.getHospitals();

    // Step 1: Run AI Triage
    const triage = await evaluateTriage({
      symptoms: symptoms || "Acute chest pain and severe shortness of breath",
      vitals: vitals || { heartRate: 110, bloodPressure: "150/95", spo2: 93 },
      patientContext: user
    });

    let selectedHosp = allHospitals.find(h => h.id === hospitalId);

    // Step 2: Run AI Bed & Ambulance Optimizer if not manually specified
    let bedDispatch = null;
    if (!selectedHosp) {
      bedDispatch = await allocateHospitalBedAndDispatch({
        patientAcuity: triage.urgencyLevel,
        requiredCare: triage.urgencyLevel === 'EMERGENT' || triage.urgencyLevel === 'RESUSCITATION' ? 'ICU' : 'Emergency Trauma',
        patientLocation: location || { lat: 17.4123, lng: 78.4321, area: 'Banjara Hills, Hyderabad' }
      });
      selectedHosp = allHospitals.find(h => h.id === bedDispatch.selectedHospitalId) || allHospitals[0];
    }

    const dist = calculateDistanceKm(location?.lat || 17.4123, location?.lng || 78.4321, selectedHosp.lat, selectedHosp.lng) || selectedHosp.distanceValue || 2.0;
    const eta = Math.max(3, Math.round((dist / 32) * 60 + 2));

    // Deduct 1 bed from database
    db.updateHospitalBeds(selectedHosp.id, -1);

    const mission = {
      missionId: 'DISPATCH-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString(),
      patient: {
        name: user.name,
        age: user.age,
        bloodGroup: user.bloodGroup,
        contact: user.phone
      },
      triageDecision: triage,
      hospital: selectedHosp.name,
      hospitalAddress: selectedHosp.address,
      hospitalPhone: selectedHosp.emergencyPhone || selectedHosp.phone,
      allocatedBed: triage.urgencyLevel === 'EMERGENT' || triage.urgencyLevel === 'RESUSCITATION' ? 'Emergency Cardiac ICU Bed #04' : 'Emergency Trauma Observation Bed #12',
      reservationStatus: "ICU Bed Locked & ER Trauma Team Alerted",
      ambulance: {
        unit: 'ALS Advanced Life Support Unit #' + Math.floor(10 + Math.random() * 89),
        etaMinutes: eta,
        priority: triage.urgencyLevel === 'RESUSCITATION' || triage.urgencyLevel === 'EMERGENT' ? "CODE_RED_CRITICAL" : "PRIORITY_ORANGE",
        paramedicCrew: "Dr. K. Rao (Emergency Medicine) + 2 Paramedics",
        equipmentReady: ["Defibrillator", "Supplemental Oxygen", "IV Resuscitation", "Continuous ECG"]
      },
      advisory: triage.urgencyLevel === 'RESUSCITATION' || triage.urgencyLevel === 'EMERGENT'
        ? "Keep patient seated upright. Do not administer oral liquids. Prepare for immediate ALS paramedic handover upon arrival."
        : "Patient vitals stable. Paramedic crew notified. Avoid strenuous exertion while awaiting arrival.",
      distanceKm: dist
    };

    return res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Ambulance dispatch error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. INSURANCE MANAGEMENT, CLAIM HELP & POLICY VERIFICATION AGENT
 */
router.post('/insurance-adjudicate', async (req, res) => {
  try {
    const { diagnosis, procedure, estimatedCost, policyNumber, policyType } = req.body;
    const user = getRequestUser(req);

    const result = await adjudicateInsuranceClaim({
      diagnosis: diagnosis || "Acute Appendicitis with Localized Peritonitis",
      procedure: procedure || "Laparoscopic Appendectomy & Inpatient Hospitalization",
      estimatedCost: estimatedCost || "₹2,20,000",
      policyNumber: policyNumber || "POL-HLTH-884219",
      policyType: policyType || "Comprehensive Health PPO (Gold Tier)",
      patientName: user?.name || "Priya Sharma"
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Insurance adjudication error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2B. INSURANCE POLICY EXISTENCE & REGISTRY FINDER
 */
router.post('/verify-policy', async (req, res) => {
  try {
    const { policyNumber, insurerName } = req.body;
    const user = getRequestUser(req);

    const result = await verifyInsurancePolicy({
      policyNumber: policyNumber || "POL-HLTH-884219",
      insurerName: insurerName || "Star Health & Allied Insurance",
      patientName: user?.name || "Priya Sharma"
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Verify policy error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. AUTONOMOUS TABLET & MEDICATION SCHEDULING AGENT
 * Analyzes medicines, checks drug-drug & food interactions, autonomously generates daily schedule,
 * and updates the active database.
 */
router.post('/tablet-schedule', async (req, res) => {
  try {
    const { medicineName, dosage, frequency, instructions, existingMeds } = req.body;
    const user = getRequestUser(req);
    const currentMeds = existingMeds || db.getMedications(user.id);

    // Call Featherless AI Medication Agent
    const analysis = await analyzeMedication({
      newMedication: { name: medicineName || "Amoxicillin 500mg", dosage, frequency, instructions },
      existingMedications: currentMeds
    });

    // Autonomously persist new medication and schedule into DB
    const newMedId = 'med_' + uuidv4().slice(0, 8);
    const scheduledMed = {
      id: newMedId,
      name: medicineName || "Amoxicillin 500mg",
      form: "Tablet",
      indication: "Prescribed antibiotic / therapeutic therapy",
      schedule: analysis.recommendedSchedule?.timing || "After Food",
      timing: analysis.recommendedSchedule?.time || "09:00 AM",
      frequency: analysis.recommendedSchedule?.frequency || "Twice Daily",
      duration: "10 Days",
      status: "Active",
      adherence: 100,
      takenToday: false,
      instructions: analysis.foodContraindications?.join('. ') || "Take with plenty of water.",
      nextDose: analysis.recommendedSchedule?.time || "09:00 AM",
      userId: user.id
    };

    db.addMedication(scheduledMed, user.id);

    // Automatically register into today's active reminder doses
    const todayDose = {
      id: 'td_' + uuidv4().slice(0, 6),
      time: analysis.recommendedSchedule?.time || "09:00 AM",
      medicine: medicineName || "Amoxicillin 500mg",
      detail: `${dosage || '1 Tablet'} • ${analysis.recommendedSchedule?.timing || 'After Food'}`,
      status: "Due",
      timeTaken: null,
      userId: user.id
    };
    db.addTodayDose(todayDose, user.id);

    return res.json({
      success: true,
      data: {
        scheduledMedication: scheduledMed,
        analysis
      }
    });
  } catch (error) {
    console.error('Tablet schedule error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. STORAGE & ACCESS TO MEDICATIONS & REPORTS IN SHAREABLE DOCTOR FORMAT
 */
router.get('/doctor-shareable-record', async (req, res) => {
  try {
    const user = getRequestUser(req);
    const records = db.getRecords('all', user.id);
    const medications = db.getMedications(user.id);
    const labResults = db.getLabResults();
    const followUps = db.getFollowUps();

    // AI Generates Clinical Executive Summary
    const doctorSummary = await generateDoctorSummary();

    const shareablePackage = {
      shareId: 'DOC-SHARE-' + Math.floor(100000 + Math.random() * 900000),
      generatedAt: new Date().toLocaleString(),
      patient: user,
      clinicalSummary: doctorSummary,
      activeMedications: medications,
      storedReportsCount: records.length,
      recentRecords: records.slice(0, 10),
      labResults,
      upcomingFollowUps: followUps,
      shareableUrl: `http://localhost:5173/?docShare=${user.healthTrackId}`
    };

    return res.json({
      success: true,
      data: shareablePackage
    });
  } catch (error) {
    console.error('Shareable record error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Medical Record & Report Analyzer
 */
router.post('/analyze-report', async (req, res) => {
  try {
    const { reportText, reportTitle } = req.body;
    if (!reportText) {
      return res.status(400).json({ error: "reportText is required" });
    }

    const user = getRequestUser(req);
    const result = await analyzeMedicalReport({
      reportText,
      reportTitle: reportTitle || "Medical Lab Diagnostic Report",
      patientAge: user?.age || 29,
      patientGender: user?.gender || 'Female'
    });

    // Automatically save into database records vault
    const newRecId = 'rec_' + uuidv4().slice(0, 8);
    const newRecord = {
      id: newRecId,
      title: reportTitle || result.reportType || "Diagnostic Lab Report",
      type: "Lab Report",
      provider: "HealthTrack Diagnostic Vault",
      doctor: "Dr. Anil Mehta",
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Analyzed by AI",
      category: "Lab Reports",
      fileUrl: "/sample-reports/analyzed_report.pdf",
      summary: result.executiveSummary || result.summary || "Biomarkers parsed and analyzed by AI",
      isAbnormal: (result.abnormalFindings && result.abnormalFindings.length > 0) || false,
      details: result,
      userId: user.id
    };
    db.addRecord(newRecord, user.id);

    return res.json({
      success: true,
      data: {
        analysis: result,
        record: newRecord
      }
    });
  } catch (error) {
    console.error('Analyze report error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DIRECT MEDICAL VAULT RECORD INGESTION
 */
router.post('/add-doctor-record', async (req, res) => {
  try {
    const { title, type, provider, reportText } = req.body;
    const user = getRequestUser(req);

    let analysis = null;
    if (reportText) {
      analysis = await analyzeMedicalReport({
        reportText,
        reportTitle: title || "Uploaded Clinical Report",
        patientAge: user?.age || 29,
        patientGender: user?.gender || 'Female'
      });
    }

    const newRec = {
      id: 'rec_' + uuidv4().slice(0, 8),
      title: title || "New Clinical Diagnostic Record",
      type: type || "Lab Report",
      provider: provider || "City Diagnostic Center",
      doctor: "Dr. Anil Mehta",
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Verified & Stored",
      category: type || "Lab Reports",
      summary: analysis?.executiveSummary || "Clinical record stored and verified in patient vault.",
      isAbnormal: (analysis?.abnormalFindings && analysis?.abnormalFindings.length > 0) || false,
      analysis,
      userId: user.id
    };

    db.addRecord(newRec, user.id);

    return res.json({
      success: true,
      data: newRec
    });
  } catch (error) {
    console.error('Add doctor record error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * FULL AUTONOMOUS MULTI-AGENT COLLABORATION ORCHESTRATOR
 */
router.post('/orchestrate-full', async (req, res) => {
  try {
    const { scenario, vitals, reportText, proposedTreatment, insurancePolicy } = req.body;
    const user = getRequestUser(req);
    const result = await orchestrateFullMedicalCase({
      scenario,
      patientInfo: user,
      vitals,
      reportText,
      proposedTreatment,
      insurancePolicy
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Orchestrate full error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * AUTONOMOUS COORDINATOR EVENT DISPATCHER
 */
router.post('/coordinate', async (req, res) => {
  try {
    const { eventType, payload } = req.body;
    const result = await coordinateAutonomousEvent({ eventType, payload });
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Coordinate event error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Conversational AI Assistant
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userMsg = {
      id: 'ch_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    db.addChatMessage(userMsg);

    const history = db.getChatHistory();
    const aiResponse = await processChatConsultation({ message, chatHistory: history });

    const assistantMsg = {
      id: 'ch_' + (Date.now() + 1),
      sender: 'assistant',
      text: aiResponse.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: aiResponse.chartWidget ? { type: 'chart_widget', ...aiResponse.chartWidget } : null
    };
    db.addChatMessage(assistantMsg);

    return res.json({
      success: true,
      data: {
        reply: aiResponse.reply,
        chartWidget: aiResponse.chartWidget,
        suggestedPrompts: aiResponse.suggestedPrompts
      }
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
