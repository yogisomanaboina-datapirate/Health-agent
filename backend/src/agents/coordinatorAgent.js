import { analyzeDocument } from './documentAgent.js';
import { evaluateTriage } from './triageAgent.js';
import { analyzeMedication } from './medicationAgent.js';
import { generateFollowUpsAndSignals } from './followUpAgent.js';
import { allocateHospitalBedAndDispatch } from './bedAllocationAgent.js';
import { adjudicateInsuranceClaim } from './insuranceAgent.js';
import { analyzeMedicalReport } from './reportAnalyzerAgent.js';
import { processChatConsultation } from './chatAgent.js';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Autonomous Multi-Agent Orchestrator
 * Fully runs the 6-agent collaborative ecosystem on any patient case or clinical event.
 */
export async function orchestrateFullMedicalCase({ scenario, patientInfo, vitals, reportText, proposedTreatment, insurancePolicy }) {
  const patient = patientInfo || db.getUser();
  const timeline = [];
  const start = Date.now();

  function logStep(agent, action, output) {
    timeline.push({
      time: `${((Date.now() - start) / 1000).toFixed(2)}s`,
      agent,
      action,
      output
    });
  }

  logStep("Orchestrator", "Case Received", `Initiating multi-agent collaboration for ${patient.name}. Scenario: "${scenario || 'Clinical Evaluation'}"`);

  // Phase 1: Clinical Triage & Lab Diagnostic Analysis in parallel
  logStep("Orchestrator", "Parallel Phase 1", "Triggering Triage Agent and Diagnostic Lab Agent simultaneously.");

  const diagnosticContext = reportText || `Clinical laboratory and vital workup for scenario: ${scenario}. Heart Rate: ${vitals?.heartRate || 120} bpm, BP: ${vitals?.bloodPressure || "150/90"} mmHg, SpO2: ${vitals?.spo2 || 92}%. CBC, Troponin, Metabolic Panel, and Inflammatory Markers.`;

  const [triageResult, labReportResult] = await Promise.all([
    evaluateTriage({
      symptoms: scenario || "Acute clinical symptoms needing assessment",
      vitals: vitals || {},
      patientContext: patient
    }),
    analyzeMedicalReport({
      reportText: diagnosticContext,
      reportTitle: "Clinical & Emergency Lab Workup",
      patientAge: patient.age,
      patientGender: patient.gender
    })
  ]);

  logStep("TriageAgent", "Acuity Evaluated", {
    urgencyLevel: triageResult.urgencyLevel,
    riskScore: `${triageResult.riskScore}/10`,
    requiresAmbulance: triageResult.requiresAmbulance,
    recommendedSetting: triageResult.recommendedCareSetting
  });

  if (labReportResult) {
    logStep("ReportAnalyzerAgent", "Biomarkers Extracted", {
      impression: labReportResult.overallImpression,
      riskLevel: labReportResult.riskLevel,
      abnormalCount: labReportResult.abnormalFindings?.length || 0
    });
  }

  // Phase 2: Medication Scheduling, Hospital Bed Allocation & Insurance Adjudication in parallel
  logStep("Orchestrator", "Parallel Phase 2", "Dispatching Medication Scheduler, Bed Allocation, and Insurance Adjudication agents.");

  const isEmergency = triageResult.urgencyLevel === 'EMERGENT' || triageResult.urgencyLevel === 'RESUSCITATION' || triageResult.riskScore >= 7;

  const [medScheduleResult, bedResult, insuranceResult] = await Promise.all([
    analyzeMedication({
      newMedication: proposedTreatment ? { name: proposedTreatment } : { name: "Clinical Therapeutic Regimen" },
      existingMedications: db.getMedications()
    }),
    allocateHospitalBedAndDispatch({
      patientAcuity: triageResult.urgencyLevel,
      requiredCare: isEmergency ? "ICU" : "General Inpatient",
      patientLocation: { lat: 17.4123, lng: 78.4321, area: "Banjara Hills" }
    }),
    adjudicateInsuranceClaim({
      diagnosis: scenario || "Clinical Intervention Required",
      procedure: proposedTreatment || "Inpatient Care & Diagnostics",
      estimatedCost: isEmergency ? "₹2,50,000" : "₹45,000",
      patientName: patient.name
    })
  ]);

  logStep("MedicationSchedulerAgent", "Regimen & Interactions Optimized", {
    interactionSeverity: medScheduleResult.interactionSeverity,
    schedule: medScheduleResult.recommendedSchedule,
    foodAdvice: medScheduleResult.foodContraindications
  });

  logStep("BedAllocationAgent", "Hospital & Bed Matched", {
    hospital: bedResult.hospitalName,
    priority: bedResult.priorityLevel,
    bedType: bedResult.allocatedBedType,
    ambulanceEta: `${bedResult.estimatedAmbulanceEtaMinutes} mins`,
    status: bedResult.reservationStatus
  });

  logStep("InsuranceClaimsAgent", "Adjudication Decided", {
    decision: insuranceResult.adjudicationDecision,
    approvalOdds: `${insuranceResult.approvalProbability}%`,
    icd10: insuranceResult.icd10Code,
    cpt: insuranceResult.cptCode,
    coveredAmount: insuranceResult.coverageBreakdown?.coveredByInsurance,
    patientOutOfPocket: insuranceResult.coverageBreakdown?.patientOutOfPocket
  });

  // Phase 3: Conversational Synthesis
  const synthesisPrompt = `You are the Chief Medical Director AI for LifeLink / HealthTrack. Produce a thorough, executive multi-agent clinical consensus briefing for patient ${patient.name} (Age: ${patient.age}, Gender: ${patient.gender}):
- Case Scenario: ${scenario}
- Triage Acuity: ${triageResult.urgencyLevel} (Risk: ${triageResult.riskScore}/10). Care Setting: ${triageResult.recommendedCareSetting}. Immediate Actions: ${triageResult.immediateActions?.join('; ')}
- Diagnostic Biomarkers: ${labReportResult?.overallImpression || 'Under review'} (Key Findings: ${labReportResult?.keyFindings?.join(', ') || 'Cardiac/metabolic panel ordered'})
- Hospital & Logistics: Allocated at ${bedResult.hospitalName} (${bedResult.allocatedBedType}), Ambulance ETA: ${bedResult.estimatedAmbulanceEtaMinutes} mins.
- Medication Regimen: ${medScheduleResult.recommendedSchedule?.timing || 'As prescribed'}, Interaction Check: ${medScheduleResult.interactionSeverity}. Food Precautions: ${medScheduleResult.foodContraindications?.join(', ') || 'Standard precautions'}.
- Insurance Pre-Auth: ${insuranceResult.adjudicationDecision} (${insuranceResult.approvalProbability}% approval likelihood, ICD-10: ${insuranceResult.icd10Code}, CPT: ${insuranceResult.cptCode}). Estimated Coverage: ${insuranceResult.coverageBreakdown?.coveredByInsurance || '₹2,10,000'}, Patient Co-pay: ${insuranceResult.coverageBreakdown?.patientOutOfPocket || '₹35,000'}.

Format your response with clear markdown headings:
1. Executive Clinical Assessment & Acuity
2. Immediate Hospitalization & Emergency Logistics
3. Diagnostic Laboratory & Biomarker Highlights
4. Pharmacological Strategy & Contraindication Guardrails
5. Insurance Pre-Authorization & Financial Clearance`;

  const consultation = await processChatConsultation({
    message: synthesisPrompt
  });

  logStep("DoctorChatAgent", "Consultation Synthesis Generated", {
    summary: consultation.reply?.substring(0, 180) + '...'
  });

  return {
    patientName: patient.name,
    scenario,
    totalDurationSec: ((Date.now() - start) / 1000).toFixed(2),
    timeline,
    agents: {
      triage: triageResult,
      report: labReportResult,
      medication: medScheduleResult,
      bedAllocation: bedResult,
      insurance: insuranceResult,
      doctor: consultation
    }
  };
}

export async function coordinateAutonomousEvent({ eventType, payload }) {
  const executionLog = [];
  const timestamp = new Date().toISOString();
  const patient = db.getUser();
  const existingMeds = db.getMedications();

  executionLog.push({
    step: 1,
    agent: "CoordinatorAgent",
    status: "TRIGGERED",
    message: `Received event '${eventType}' at ${new Date().toLocaleTimeString()}. Initiating autonomous multi-agent pipeline.`
  });

  const results = {
    eventType,
    timestamp,
    executionLog,
    decisions: {}
  };

  if (eventType === 'DOCUMENT_UPLOAD' || eventType === 'SCAN_EXTRACT') {
    const docResult = await analyzeDocument({
      documentText: payload.documentText,
      fileName: payload.fileName,
      fileType: payload.fileType
    });

    results.decisions.document = docResult;

    const [triageResult, followUpResult, medCheck] = await Promise.all([
      evaluateTriage({
        symptoms: docResult.clinicalSummary || "Routine lab evaluation",
        vitals: payload.vitals || {},
        patientContext: patient
      }),
      generateFollowUpsAndSignals({
        clinicalFindings: docResult,
        patientContext: patient
      }),
      (docResult.extractedPrescriptions && docResult.extractedPrescriptions.length > 0)
        ? analyzeMedication({
            newMedication: docResult.extractedPrescriptions[0],
            existingMedications: existingMeds
          })
        : Promise.resolve(null)
    ]);

    results.decisions.triage = triageResult;
    results.decisions.followUp = followUpResult;
    if (medCheck) results.decisions.medication = medCheck;

    const newRecordId = 'rec_' + uuidv4().slice(0, 8);
    const newRecord = {
      id: newRecordId,
      title: payload.fileName ? payload.fileName.replace(/\.[^/.]+$/, '') : `${docResult.documentType} - Auto Analyzed`,
      type: docResult.documentType,
      provider: docResult.facility || "City Diagnostic Lab",
      doctor: docResult.doctor || "Dr. Anil Mehta",
      date: docResult.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Analyzed",
      category: docResult.documentType === 'Lab Report' ? 'Lab Reports' : (docResult.documentType === 'Prescription' ? 'Prescriptions' : 'All Records'),
      fileUrl: payload.fileUrl || "/sample-reports/auto_uploaded.pdf",
      summary: docResult.clinicalSummary,
      isAbnormal: docResult.isAbnormal
    };

    db.addRecord(newRecord);

    if (docResult.extractedPrescriptions && docResult.extractedPrescriptions.length > 0) {
      docResult.extractedPrescriptions.forEach(p => {
        db.addMedication({
          id: 'med_' + uuidv4().slice(0, 8),
          name: p.medicine,
          form: "Tablet",
          indication: "Extracted from new prescription",
          schedule: p.instructions || "After Food",
          timing: p.frequency || "09:00 AM",
          frequency: p.frequency || "Daily",
          duration: p.duration || "14 Days",
          status: "Active",
          adherence: 100,
          takenToday: false,
          instructions: p.instructions || "Take as directed.",
          nextDose: "09:00 AM"
        });
      });
    }

    if (followUpResult.recommendedFollowUps) {
      followUpResult.recommendedFollowUps.forEach(fu => {
        db.addFollowUp({
          id: 'fu_' + uuidv4().slice(0, 8),
          ...fu
        });
      });
    }

    executionLog.push({
      step: 2,
      agent: "CoordinatorAgent",
      status: "FINALIZED",
      message: `Autonomous pipeline finished. Stored record #${newRecordId}, updated patient health timeline, and synced dashboard.`
    });
  } else if (eventType === 'SYMPTOM_TRIAGE' || eventType === 'EMERGENCY_SOS') {
    const triageResult = await evaluateTriage({
      symptoms: payload.symptoms,
      vitals: payload.vitals || {},
      patientContext: patient
    });

    results.decisions.triage = triageResult;

    if (triageResult.urgencyLevel === 'EMERGENT' || triageResult.urgencyLevel === 'RESUSCITATION' || triageResult.requiresAmbulance || eventType === 'EMERGENCY_SOS') {
      const bedResult = await allocateHospitalBedAndDispatch({
        patientAcuity: triageResult.urgencyLevel,
        requiredCare: "ICU",
        patientLocation: payload.location || { lat: 17.4123, lng: 78.4321, area: 'Banjara Hills' }
      });
      results.decisions.bedAllocation = bedResult;
    }

    const followUpResult = await generateFollowUpsAndSignals({
      clinicalFindings: triageResult,
      patientContext: patient
    });
    results.decisions.followUp = followUpResult;
  } else if (eventType === 'MEDICATION_ADD') {
    const medResult = await analyzeMedication({
      newMedication: payload.medication,
      existingMedications: existingMeds,
      patientConditions: payload.conditions || []
    });

    results.decisions.medication = medResult;

    const newMedId = 'med_' + uuidv4().slice(0, 8);
    const addedMed = {
      id: newMedId,
      name: payload.medication.name,
      form: payload.medication.form || "Tablet",
      indication: payload.medication.indication || "Prescribed medication",
      schedule: medResult.recommendedSchedule?.timing || "After Food",
      timing: medResult.recommendedSchedule?.time || "08:30 AM",
      frequency: medResult.recommendedSchedule?.frequency || "Daily",
      duration: payload.medication.duration || "30 Days",
      status: "Active",
      adherence: 100,
      takenToday: false,
      instructions: medResult.foodContraindications?.join('. ') || "Take with water.",
      nextDose: medResult.recommendedSchedule?.time || "08:30 AM"
    };

    db.addMedication(addedMed);
    results.decisions.addedMedication = addedMed;
  }

  return results;
}
