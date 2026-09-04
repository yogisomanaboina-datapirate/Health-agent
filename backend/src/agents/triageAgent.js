import { callFeatherless, extractJsonFromText } from './featherlessClient.js';

export async function evaluateTriage({ symptoms, vitals = {}, patientContext = {} }) {
  const prompt = `You are the Clinical Risk & Emergency Triage Autonomous Agent for HealthTrack AI.
Analyze patient symptoms, vital signs, and clinical context to determine acuity and emergency status.

Patient:
Name: ${patientContext.name || 'Priya Sharma'}
Age: ${patientContext.age || 29}, Gender: ${patientContext.gender || 'Female'}
Known Conditions: ${patientContext.conditions || 'Mild intermittent allergy, Vitamin D deficiency'}
Active Meds: ${patientContext.medications || 'Metformin 500mg, Atorvastatin 10mg, Vitamin D3, Levocetirizine'}

Reported Symptoms:
"${symptoms || 'Mild headache and sore throat for 1 day'}"

Vital Signs:
- Heart Rate: ${vitals.heartRate ? vitals.heartRate + ' bpm' : '76 bpm (normal)'}
- Blood Pressure: ${vitals.bloodPressure || '120/80 mmHg (normal)'}
- Oxygen Saturation (SpO2): ${vitals.spo2 ? vitals.spo2 + '%' : '98% (normal)'}
- Temperature: ${vitals.temperature ? vitals.temperature + ' °F' : '98.6 °F'}
- Pain Severity (1-10): ${vitals.painSeverity || 3}

Determine:
1. Urgency Level: One of ["RESUSCITATION", "EMERGENT", "URGENT", "LESS_URGENT", "NON_URGENT"]
2. Clinical Risk Score: integer between 1 and 10 (1=minimal risk, 10=extreme life threat)
3. Immediate First-Aid / Action Steps
4. Red Flags identified (if any)
5. Recommended Care Setting: ["Emergency Department", "Urgent Care Clinic", "Outpatient General Physician", "Home Care & Teleconsult"]
6. Ambulance Dispatch Recommendation: true if RESUSCITATION or EMERGENT, false otherwise
7. Rationale: Concise medical explanation

Respond ONLY in valid JSON matching this structure:
{
  "urgencyLevel": "NON_URGENT",
  "riskScore": 2,
  "requiresAmbulance": false,
  "recommendedCareSetting": "Home Care & Teleconsult",
  "redFlags": [],
  "immediateActions": [
    "Stay hydrated with warm fluids",
    "Rest and monitor temperature"
  ],
  "rationale": "Symptoms are mild and vital signs are stable without red flag features.",
  "warningSignals": []
}`;

  try {
    const raw = await callFeatherless({
      messages: [
        { role: 'system', content: 'You are an experienced emergency triage physician AI. Provide objective, clinically sound triage in valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const parsed = extractJsonFromText(raw);
    return parsed;
  } catch (err) {
    console.error('triageAgent fallback used due to:', err.message);
    const isChestPain = symptoms && symptoms.toLowerCase().includes('chest pain');
    return {
      urgencyLevel: isChestPain ? "EMERGENT" : "LESS_URGENT",
      riskScore: isChestPain ? 8 : 3,
      requiresAmbulance: !!isChestPain,
      recommendedCareSetting: isChestPain ? "Emergency Department" : "Outpatient General Physician",
      redFlags: isChestPain ? ["Acute chest pain / pressure"] : [],
      immediateActions: isChestPain
        ? ["Rest in seated position", "Call emergency services immediately", "Avoid exertion"]
        : ["Hydrate with water", "Rest and monitor symptoms", "Take prescribed medications"],
      rationale: isChestPain
        ? "Acute chest discomfort warrants rapid evaluation to rule out cardiac ischemia."
        : "Mild symptoms without vital sign compromise.",
      warningSignals: []
    };
  }
}
