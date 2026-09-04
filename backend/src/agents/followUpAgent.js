import { callFeatherless, extractJsonFromText } from './featherlessClient.js';

export async function generateFollowUpsAndSignals({ clinicalFindings, patientContext = {} }) {
  const prompt = `You are the Preventive Care & Follow-Up Autonomous Agent for HealthTrack AI.
Analyze recent clinical findings and patient history to suggest proactive follow-up care.

Clinical Findings:
${JSON.stringify(clinicalFindings)}

Patient Profile:
Name: ${patientContext.name || 'Priya Sharma'}
Age: ${patientContext.age || 29}, Blood Group: ${patientContext.bloodGroup || 'O+'}

Output requirements:
1. Recommended follow-up consultations (Specialty, reasonable date/timeframe, clinical reason)
2. Recommended follow-up laboratory tests (Test name, reason, timeframe)
3. New Risk Signals or lifestyle flags
4. Personalized preventive recommendations (Diet, Exercise, Hydration, Sleep)

Respond ONLY in valid JSON matching this exact structure:
{
  "recommendedFollowUps": [
    {
      "title": "Cardiology Follow-up",
      "doctor": "Dr. Anil Mehta",
      "department": "Internal Medicine / Cardiology",
      "date": "23 May 2025",
      "dayTime": "Friday, 10:30 AM",
      "status": "Due Soon",
      "daysLeft": 3,
      "purpose": "Review blood pressure stability and lab progress"
    }
  ],
  "recommendedTests": [
    {
      "title": "Complete Blood Count (CBC)",
      "facility": "City Diagnostic Lab",
      "date": "25 May 2025",
      "purpose": "Monitor eosinophil counts and red blood cell count"
    }
  ],
  "riskSignals": [
    {
      "severity": "Moderate",
      "title": "High Blood Pressure Risk",
      "description": "Systolic readings peaked at 136 mmHg during evening checks.",
      "recommendation": "Continue low sodium diet and regular evening blood pressure logging."
    }
  ],
  "preventiveRecommendations": [
    {
      "category": "Diet",
      "advice": "Incorporate soluble fiber (oats, leafy greens) to support healthy lipid metabolism."
    },
    {
      "category": "Activity",
      "advice": "Aim for 30 minutes of brisk walking 5 days a week."
    },
    {
      "category": "Hydration",
      "advice": "Drink 2.5 to 3 liters of water daily to maintain cellular hydration."
    }
  ]
}`;

  try {
    const raw = await callFeatherless({
      messages: [
        { role: 'system', content: 'You are a preventive healthcare specialist AI. Output strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 900
    });

    const parsed = extractJsonFromText(raw);
    return parsed;
  } catch (err) {
    console.error('followUpAgent fallback used due to:', err.message);
    return {
      recommendedFollowUps: [
        {
          title: "General Follow-up Consultation",
          doctor: "Dr. Anil Mehta",
          department: "General Medicine",
          date: "25 May 2025",
          dayTime: "Sunday, 10:00 AM",
          status: "Due Soon",
          daysLeft: 5,
          purpose: "Routine clinical assessment and medication progress review"
        }
      ],
      recommendedTests: [
        {
          title: "Follow-up Blood Panel",
          facility: "City Diagnostic Lab",
          date: "30 May 2025",
          purpose: "Re-evaluate biomarker trend after therapy"
        }
      ],
      riskSignals: [
        {
          severity: "Moderate",
          title: "Blood Pressure Monitoring",
          description: "Evening readings fluctuate slightly higher than baseline.",
          recommendation: "Log blood pressure twice daily."
        }
      ],
      preventiveRecommendations: [
        { category: "Diet", advice: "Add more fiber-rich foods, fresh vegetables, and reduce processed sodium." },
        { category: "Activity", advice: "Maintain 30 mins of daily brisk walking." },
        { category: "Hydration", advice: "Drink 2-3 liters of water daily for kidney and blood volume support." }
      ]
    };
  }
}
