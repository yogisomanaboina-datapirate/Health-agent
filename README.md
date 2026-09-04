# HealthTrack AI — Autonomous Multi-Agent Healthcare Platform

HealthTrack AI is an intelligent healthcare web application powered by autonomous AI agents operating on top of **Featherless AI** (`Qwen/Qwen2.5-7B-Instruct`). It coordinates clinical decision-making, patient triage, document extraction, medication safety, hospital bed capacity, and doctor referrals.

---

## Key Features & UI Sections

1. **Dashboard (`/`)**
   - High-level metric cards: Health Score (78/100 Good), 24 Records, 5 Active Medications, 2 Follow-ups, 3 New Insights.
   - Chronological Health Timeline feed.
   - Today's Medication checklist (Taken, Due, Pending).
   - Real-time Hospital & Emergency shortcut.

2. **Health Records**
   - Categorized document archive (Prescriptions, Lab Reports, Hospital Bills, Discharge Summaries, X-Rays).
   - Instant document previews and actions.
   - One-click trigger for AI Clinical Doctor Summary.

3. **Smart Medications & Dosage Management**
   - Active prescriptions with schedule and adherence tracking (85% weekly score).
   - Today's dosing timeline with "Take Now" reminder buttons.
   - Autonomous Drug-Drug Interaction Checker powered by Featherless AI.
   - Interactive "Time to Take Medicine" audio/visual alert modal.

4. **Lab Reports & Biomarker Diagnostics**
   - Detailed Complete Blood Count (CBC) and Lipid Profile tables with status badges and reference ranges.
   - Autonomous AI Report Summary with clinical impressions and bullet observations.
   - Multi-month parameter trend graphs (Hemoglobin, Vitamin D).

5. **Health Timeline & Longitudinal Trends**
   - Multi-metric health journey with interactive sparklines for Hemoglobin, Vitamin D, Fasting Glucose, and Weight.
   - Symptoms & Notes logger with mood indicators.

6. **AI Health Assistant (Clinical Consultation)**
   - Context-aware dialogue grounded in patient records and vitals.
   - Embedded interactive chart widgets (e.g. Vitamin D 6-month trajectory).
   - Web Speech API integration for audio voice responses.

7. **Doctor / Referral Summary**
   - Formal clinical summary with patient overview, health highlights, and timeline snapshot.
   - Printable view and one-click PDF export / link sharing.

8. **Hospital Finder & Emergency ICU Bed Matrix**
   - Interactive map centered on Hyderabad with live hospital cards.
   - Real-time ICU bed availability counters and ambulance response times.
   - **Emergency SOS Mode**: Automatically identifies the best hospital match, reserves an ICU bed, and dispatches an ambulance with live ETA countdown.

9. **AI Document Scan & Autonomous Extraction**
   - Drag-and-drop document uploader with 1-click preset sample reports.
   - 5-stage live OCR extraction pipeline displaying confidence percentages per field.
   - Automatic cascade across Document, Triage, Medication, and Follow-up agents.

10. **Profile, Privacy & Consent Management**
    - Patient demographic details, health track ID (`HTA-293847`), and emergency contact.
    - Granular AI data analysis and provider sharing consent switches.

---

## How to Run the Platform

### Option 1: Unified One-Command Run
In the root directory `c:\Krishna\health care`:
```bash
npm run dev
```
This concurrently launches:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`

### Option 2: Run Separately

#### 1. Start Backend:
```bash
cd backend
npm install
npm run dev
```

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Autonomous Multi-Agent Engine Architecture

- **Coordinator Agent**: Master orchestrator listening for document uploads, symptom checks, or emergency triggers.
- **Document / OCR Extractor Agent**: Parses document text, identifies clinical entities, and assigns confidence ratings.
- **Clinical Risk & Triage Agent**: Assesses patient acuity (Emergency, Urgent, Routine) and computes risk score (1-10).
- **Medication & Interaction Agent**: Validates drug-drug compatibility and advises on food contraindications.
- **Follow-Up & Preventive Care Agent**: Generates scheduled follow-up visits, re-tests, and lifestyle guidance.
- **Bed Allocation & Dispatch Agent**: Queries network hospitals, matches ICU acuity, and computes ambulance dispatch routes.
- **Conversational Health Assistant**: Employs Qwen2.5-7B-Instruct with patient context memory and speech synthesis.
