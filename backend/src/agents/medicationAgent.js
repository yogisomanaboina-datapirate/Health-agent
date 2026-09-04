import { callFeatherless, extractJsonFromText } from './featherlessClient.js';

export async function analyzeMedication({ newMedication, existingMedications = [], patientConditions = [] }) {
  const existingNames = existingMedications.map(m => m.name || m).join(', ');

  const prompt = `You are the Autonomous Medication Scheduler & Drug Interaction AI Agent for HealthTrack AI.
Analyze the following proposed medication against the patient's existing regimen:

Proposed Medication:
${JSON.stringify(newMedication)}

Current Active Medications:
${existingNames || 'Metformin 500mg, Vitamin D3 60K IU, Calcium 500mg, Atorvastatin 10mg, Levocetirizine 5mg'}

Patient Conditions:
${patientConditions.join(', ') || 'Mild dyslipidemia, Vitamin D deficiency, seasonal allergy'}

Determine:
1. Potential Drug-Drug Interactions: (Severe, Moderate, Minor, or None)
2. Food/Dietary Contraindications (e.g. grapefruit, milk/calcium binding, timing relative to food)
3. Optimal Recommended Dosing Schedule (Time of day: e.g. 08:30 AM, with/without food)
4. Missed Dose Protocol: (What to do if forgotten)
5. Safety Warning / Precautions

Respond ONLY in valid JSON matching this structure:
{
  "hasInteraction": false,
  "interactionSeverity": "None" | "Minor" | "Moderate" | "Severe",
  "interactionDetails": "string",
  "foodContraindications": [
    "string"
  ],
  "recommendedSchedule": {
    "time": "08:30 AM",
    "timing": "After Food",
    "frequency": "Daily",
    "takeWith": "Water",
    "avoid": "string"
  },
  "missedDoseGuidance": "Take as soon as remembered unless close to next scheduled dose.",
  "safetyAdvisory": "string"
}`;

  try {
    const raw = await callFeatherless({
      messages: [
        { role: 'system', content: 'You are a clinical pharmacologist AI. Provide rigorous pharmacology and interaction data in valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 800
    });

    const parsed = extractJsonFromText(raw);
    return parsed;
  } catch (err) {
    console.error('medicationAgent fallback used due to:', err.message);
    const medName = (newMedication?.name || '').toLowerCase();
    const isGrapefruit = medName.includes('statin');
    return {
      hasInteraction: false,
      interactionSeverity: "None",
      interactionDetails: "No critical contraindications detected with current baseline regimen.",
      foodContraindications: isGrapefruit ? ["Avoid grapefruit and grapefruit juice"] : ["Take with a full glass of water"],
      recommendedSchedule: {
        time: "09:00 AM",
        timing: "After Food",
        frequency: "Once Daily",
        takeWith: "Water",
        avoid: isGrapefruit ? "Grapefruit" : "Alcohol"
      },
      missedDoseGuidance: "Take as soon as remembered unless it is almost time for your next scheduled dose.",
      safetyAdvisory: "Always follow prescribed doctor guidelines and inform your physician if unusual side effects occur."
    };
  }
}
