import { callFeatherless, extractJsonFromText } from './featherlessClient.js';
import { db } from '../db/index.js';

export async function allocateHospitalBedAndDispatch({ patientAcuity = 'URGENT', requiredCare = 'ICU', patientLocation = { lat: 17.4123, lng: 78.4321, area: 'Banjara Hills' } }) {
  const hospitals = db.getHospitals();

  const prompt = `You are the Emergency Hospital Bed Allocation & Dispatch Optimizer Agent for HealthTrack AI.
Patient condition:
Acuity: ${patientAcuity}
Required Resource: ${requiredCare}
Location: ${patientLocation.area || 'Banjara Hills, Hyderabad'} (lat: ${patientLocation.lat}, lng: ${patientLocation.lng})

Available Hospitals in Network:
${JSON.stringify(hospitals.map(h => ({
  id: h.id,
  name: h.name,
  distance: h.distance,
  distanceValue: h.distanceValue,
  icuBedsFree: h.icuBedsFree,
  totalBedsFree: h.totalBedsFree,
  ambulanceAvailable: h.ambulanceAvailable,
  ambulanceEtaMinutes: h.ambulanceEtaMinutes,
  rating: h.rating
})))}

Evaluate and select:
1. Best Primary Hospital match based on urgency, free ICU beds, distance, and ambulance response time.
2. Secondary Backup Hospital.
3. Priority level: ("CRITICAL_CODE_RED", "PRIORITY_ORANGE", "STANDARD_YELLOW", "ROUTINE_GREEN")
4. Bed Reservation status: (e.g. "Reserved 1 ICU Bed tentatively")
5. Emergency Dispatch Advisory: Clinical instructions for dispatch crew.

Respond ONLY in valid JSON matching this exact structure:
{
  "selectedHospitalId": "hosp_01",
  "hospitalName": "Greenview Hospital",
  "priorityLevel": "CRITICAL_CODE_RED",
  "allocatedBedType": "ICU Bed with Cardiac Monitor",
  "estimatedAmbulanceEtaMinutes": 6,
  "distanceKm": 1.7,
  "backupHospitalName": "City Care Hospital",
  "reservationStatus": "ICU Bed Reserved & Trauma Team Notified",
  "dispatchAdvisory": "Immediate paramedic response with oxygen and continuous ECG monitoring.",
  "routingWaypoints": [
    { "lat": 17.4123, "lng": 78.4321, "step": "Patient Residence, Rd 12 Banjara Hills" },
    { "lat": 17.4140, "lng": 78.4335, "step": "Turn onto Banjara Hills Main Rd" },
    { "lat": 17.4156, "lng": 78.4350, "step": "Arrive at Greenview Hospital Emergency Bay" }
  ]
}`;

  try {
    const raw = await callFeatherless({
      messages: [
        { role: 'system', content: 'You are an emergency medical dispatch controller AI. Output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 800
    });

    const parsed = extractJsonFromText(raw);
    return parsed;
  } catch (err) {
    console.error('bedAllocationAgent fallback used due to:', err.message);
    const primary = hospitals[0] || { id: "hosp_01", name: "Greenview Hospital", distanceValue: 1.7, ambulanceEtaMinutes: 6 };
    return {
      selectedHospitalId: primary.id,
      hospitalName: primary.name,
      priorityLevel: patientAcuity === 'EMERGENT' || patientAcuity === 'RESUSCITATION' ? "CRITICAL_CODE_RED" : "PRIORITY_ORANGE",
      allocatedBedType: "ICU Bed with Telemetry Monitoring",
      estimatedAmbulanceEtaMinutes: primary.ambulanceEtaMinutes || 6,
      distanceKm: primary.distanceValue || 1.7,
      backupHospitalName: "City Care Hospital",
      reservationStatus: "Emergency Bed Tagged & Trauma Triage Alerted",
      dispatchAdvisory: "Rapid transit via primary arterial road. Notify emergency triage desk upon ambulance departure.",
      routingWaypoints: [
        { lat: 17.4123, lng: 78.4321, step: "Patient Residence, Banjara Hills" },
        { lat: 17.4140, lng: 78.4335, step: "Banjara Hills Main Road Junction" },
        { lat: 17.4156, lng: 78.4350, step: "Greenview Hospital Emergency Entrance" }
      ]
    };
  }
}
