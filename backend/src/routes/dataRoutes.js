import express from 'express';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aggregated Dashboard data (strictly isolated by authenticated user)
router.get('/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const user = req.user;
  const stats = db.getStats(userId);
  const timeline = db.getTimeline(userId);
  const todayDoses = db.getTodayDoses(userId);
  const insights = db.getInsights(userId);
  const riskSignals = db.getRiskSignals(userId);
  const followUps = db.getFollowUps(userId);
  const records = db.getRecords(null, userId);
  const medications = db.getMedications(userId);

  return res.json({
    success: true,
    user,
    stats,
    timeline,
    todayDoses,
    insights,
    riskSignals,
    followUps,
    records,
    medications
  });
});

// Records
router.get('/records', authenticateToken, (req, res) => {
  const { category } = req.query;
  const records = db.getRecords(category, req.user.id);
  return res.json({ success: true, data: records });
});

router.post('/records', authenticateToken, (req, res) => {
  const newRecord = {
    id: 'rec_' + uuidv4().slice(0, 8),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "Analyzed",
    userId: req.user.id,
    ...req.body
  };
  db.addRecord(newRecord, req.user.id);
  return res.json({ success: true, data: newRecord });
});

// Medications
router.get('/medications', authenticateToken, (req, res) => {
  const meds = db.getMedications(req.user.id);
  const todayDoses = db.getTodayDoses(req.user.id);
  return res.json({ success: true, data: { medications: meds, todayDoses } });
});

router.post('/medications', authenticateToken, (req, res) => {
  const newMed = {
    id: 'med_' + uuidv4().slice(0, 8),
    status: 'Active',
    adherence: 100,
    takenToday: false,
    userId: req.user.id,
    ...req.body
  };
  db.addMedication(newMed, req.user.id);
  return res.json({ success: true, data: newMed });
});

router.patch('/doses/:id/take', authenticateToken, (req, res) => {
  const updated = db.markDoseTaken(req.params.id, req.user.id);
  if (!updated) {
    return res.status(404).json({ error: "Dose not found or access denied" });
  }
  return res.json({ success: true, data: updated });
});

router.post('/doses', authenticateToken, (req, res) => {
  const { time, medicine, detail, status } = req.body;
  if (!time || !medicine) {
    return res.status(400).json({ error: "Time and medicine name are required" });
  }
  const newDose = {
    id: 'td_' + uuidv4().slice(0, 8),
    time,
    medicine,
    detail: detail || '1 Tablet • As directed',
    status: status || 'Pending',
    timeTaken: null,
    userId: req.user.id
  };
  db.addTodayDose(newDose, req.user.id);
  return res.json({ success: true, data: newDose });
});

router.put('/doses/:id', authenticateToken, (req, res) => {
  const updated = db.updateTodayDose(req.params.id, req.body, req.user.id);
  if (!updated) {
    return res.status(404).json({ error: "Dose not found or access denied" });
  }
  return res.json({ success: true, data: updated });
});

router.delete('/doses/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteTodayDose(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ error: "Dose not found or access denied" });
  }
  return res.json({ success: true, message: "Dose deleted" });
});

// Lab Reports
router.get('/lab-reports', (req, res) => {
  const labs = db.getLabResults();
  return res.json({ success: true, data: labs });
});

// Hospitals & Beds
router.get('/hospitals', (req, res) => {
  const hospitals = db.getHospitals();
  return res.json({ success: true, data: hospitals });
});

router.post('/hospitals/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const hospitals = db.getHospitals();
  const target = hospitals.find(h => h.id === id);

  if (!target) {
    return res.status(404).json({ error: "Hospital not found" });
  }

  // Deduct 1 free ICU bed to simulate real allocation
  db.updateHospitalBeds(id, -1);

  const dispatchMission = {
    missionId: 'SOS-' + Math.floor(100000 + Math.random() * 900000),
    hospital: target.name,
    hospitalAddress: target.address,
    emergencyPhone: target.emergencyPhone,
    ambulanceUnit: 'ALS Unit #' + Math.floor(10 + Math.random() * 89),
    etaMinutes: target.ambulanceEtaMinutes || 6,
    status: 'DISPATCHED',
    timestamp: new Date().toLocaleTimeString(),
    allocatedBed: "Emergency Trauma & ICU Bed #04",
    coordinates: {
      origin: { lat: 17.4123, lng: 78.4321, label: "Patient Location (Banjara Hills)" },
      destination: { lat: target.lat, lng: target.lng, label: target.name }
    }
  };

  return res.json({
    success: true,
    data: dispatchMission
  });
});

// Follow ups
router.get('/follow-ups', (req, res) => {
  const followUps = db.getFollowUps();
  const riskSignals = db.getRiskSignals();
  return res.json({ success: true, data: { followUps, riskSignals } });
});

// Chat history
router.get('/chat-history', (req, res) => {
  const history = db.getChatHistory();
  return res.json({ success: true, data: history });
});

// Vitals Trends
router.get('/trends', (req, res) => {
  const trends = db.getVitalsTrends();
  return res.json({ success: true, data: trends });
});

// Symptoms
router.get('/symptoms', authenticateToken, (req, res) => {
  const symptoms = db.getSymptoms(req.user.id);
  return res.json({ success: true, data: symptoms });
});

router.post('/symptoms', authenticateToken, (req, res) => {
  const { symptom, note, feeling, date } = req.body;
  if (!symptom) {
    return res.status(400).json({ error: "Symptom is required" });
  }
  const newSymptom = {
    id: 'sym_' + uuidv4().slice(0, 8),
    date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    symptom,
    note: note || 'Logged by user',
    feeling: feeling || 'good',
    userId: req.user.id
  };
  db.addSymptom(newSymptom, req.user.id);
  return res.json({ success: true, data: newSymptom });
});

// Insurance & Claims
router.get('/insurance', (req, res) => {
  const policy = db.getInsurancePolicy();
  const claims = db.getClaimsHistory();
  return res.json({ success: true, data: { policy, claims } });
});

router.post('/claims', (req, res) => {
  const { type, hospital, amount, approvedAmount, status, approvalOdds } = req.body;
  const newClaim = {
    id: 'CLM-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    type: type || 'Medical Claim',
    hospital: hospital || 'Network Hospital',
    amount: amount || '₹0',
    approvedAmount: approvedAmount || amount || '₹0',
    status: status || 'Pre-Auth Granted',
    approvalOdds: approvalOdds || 95,
    ...req.body
  };
  db.addClaim(newClaim);
  return res.json({ success: true, data: newClaim });
});

// Lifestyle Reminders
router.get('/reminders', authenticateToken, (req, res) => {
  const reminders = db.getReminders(req.user.id);
  return res.json({ success: true, data: reminders });
});

router.post('/reminders', authenticateToken, (req, res) => {
  const { title, subtitle, time, frequency, enabled } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const newReminder = {
    id: 'rem_' + uuidv4().slice(0, 8),
    title,
    subtitle: subtitle || '',
    time: time || '08:00',
    frequency: frequency || 'Daily',
    enabled: enabled !== undefined ? enabled : true,
    userId: req.user.id
  };
  db.addReminder(newReminder, req.user.id);
  return res.json({ success: true, data: newReminder });
});

router.patch('/reminders/:id', authenticateToken, (req, res) => {
  const updated = db.updateReminder(req.params.id, req.body, req.user.id);
  if (!updated) {
    return res.status(404).json({ error: "Reminder not found or access denied" });
  }
  return res.json({ success: true, data: updated });
});

router.delete('/reminders/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteReminder(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ error: "Reminder not found or access denied" });
  }
  return res.json({ success: true, message: "Reminder deleted" });
});

export default router;
