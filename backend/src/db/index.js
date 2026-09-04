import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialSeedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = process.env.VERCEL
  ? path.join('/tmp', 'database.json')
  : path.join(__dirname, 'database.json');

// In-memory cache fallback for serverless read-only environments
let memoryDb = null;

// Initialize database file if it does not exist
function initDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Filesystem read-only or error initializing DB file, using in-memory store:', err.message);
    if (!memoryDb) {
      memoryDb = JSON.parse(JSON.stringify(initialSeedData));
    }
  }
}

initDb();

export function getDb() {
  if (memoryDb) return memoryDb;
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (fs.existsSync(path.join(__dirname, 'database.json'))) {
      try {
        const raw = fs.readFileSync(path.join(__dirname, 'database.json'), 'utf-8');
        return JSON.parse(raw);
      } catch (e) {}
    }
    console.warn('Error reading DB file, using seed data in memory:', err.message);
    memoryDb = JSON.parse(JSON.stringify(initialSeedData));
    return memoryDb;
  }
}

export function saveDb(data) {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Expected on serverless environments
    return true;
  }
}

export const db = {
  getUser: () => {
    const state = getDb();
    return state.user || (state.users && state.users[0]) || null;
  },

  getUsers: () => {
    const state = getDb();
    return state.users || [];
  },

  getUserById: (id) => {
    const state = getDb();
    return (state.users || []).find(u => u.id === id) || null;
  },

  getUserByEmail: (email) => {
    const state = getDb();
    if (!email) return null;
    return (state.users || []).find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  addUser: (userData) => {
    const state = getDb();
    state.users = [...(state.users || []), userData];
    state.user = userData; // switch to newly created user
    saveDb(state);
    return userData;
  },

  setActiveUser: (id) => {
    const state = getDb();
    const user = (state.users || []).find(u => u.id === id);
    if (user) {
      state.user = user;
      saveDb(state);
      return user;
    }
    return null;
  },

  updateUser: (updates, userId) => {
    const state = getDb();
    const targetUserId = userId || updates.id || (state.user && state.user.id) || 'usr_priya_01';
    let targetUser = null;
    if (state.users) {
      const idx = state.users.findIndex(u => u.id === targetUserId);
      if (idx !== -1) {
        state.users[idx] = { ...state.users[idx], ...updates };
        targetUser = state.users[idx];
      }
    }
    if (state.user && state.user.id === targetUserId) {
      state.user = { ...state.user, ...updates };
      targetUser = state.user;
    }
    saveDb(state);
    return targetUser || state.user;
  },

  getStats: (userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    const userRecords = (state.records || []).filter(r => r.userId === targetUserId || (!r.userId && targetUserId === 'usr_priya_01'));
    const userMeds = (state.medications || []).filter(m => (m.userId === targetUserId || (!m.userId && targetUserId === 'usr_priya_01')) && m.status === 'Active');
    const userFollowUps = (state.followUps || []).filter(f => f.userId === targetUserId || (!f.userId && targetUserId === 'usr_priya_01'));
    const currentUser = (state.users || []).find(u => u.id === targetUserId) || state.user;

    return {
      healthScore: currentUser?.healthScore || 78,
      recordsCount: userRecords.length,
      activeMedsCount: userMeds.length,
      upcomingFollowUpsCount: userFollowUps.length || 2,
      newInsightsCount: 3
    };
  },

  getRecords: (category, userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    const records = (state.records || []).filter(r => r.userId === targetUserId || (!r.userId && targetUserId === 'usr_priya_01'));

    if (!category || category === 'All Records' || category === 'all') return records;
    return records.filter(r => (r.category && r.category.toLowerCase() === category.toLowerCase()) || (r.type && r.type.toLowerCase() === category.toLowerCase()));
  },

  addRecord: (record, userId) => {
    const state = getDb();
    const targetUserId = userId || record.userId || (state.user && state.user.id) || 'usr_priya_01';
    const recordWithUser = { ...record, userId: targetUserId };
    state.records = [recordWithUser, ...(state.records || [])];
    saveDb(state);
    return recordWithUser;
  },

  getMedications: (userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    return (state.medications || []).filter(m => m.userId === targetUserId || (!m.userId && targetUserId === 'usr_priya_01'));
  },

  addMedication: (med, userId) => {
    const state = getDb();
    const targetUserId = userId || med.userId || (state.user && state.user.id) || 'usr_priya_01';
    const medWithUser = { ...med, userId: targetUserId };
    state.medications = [medWithUser, ...(state.medications || [])];
    saveDb(state);
    return medWithUser;
  },

  updateMedication: (id, updates) => {
    const state = getDb();
    const idx = state.medications.findIndex(m => m.id === id);
    if (idx !== -1) {
      state.medications[idx] = { ...state.medications[idx], ...updates };
      saveDb(state);
      return state.medications[idx];
    }
    return null;
  },

  getTodayDoses: (userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    return (state.todayDoses || []).filter(d => d.userId === targetUserId || (!d.userId && targetUserId === 'usr_priya_01'));
  },

  markDoseTaken: (doseId, userId) => {
    const state = getDb();
    const dose = (state.todayDoses || []).find(d => d.id === doseId);
    if (dose) {
      if (userId && dose.userId && dose.userId !== userId) {
        return null;
      }
      dose.status = 'Taken';
      dose.timeTaken = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      saveDb(state);
      return dose;
    }
    return null;
  },

  addTodayDose: (dose, userId) => {
    const state = getDb();
    const targetUserId = userId || dose.userId || (state.user && state.user.id) || 'usr_priya_01';
    const doseWithUser = { ...dose, userId: targetUserId };
    state.todayDoses = [...(state.todayDoses || []), doseWithUser];
    saveDb(state);
    return doseWithUser;
  },

  deleteTodayDose: (doseId, userId) => {
    const state = getDb();
    const dose = (state.todayDoses || []).find(d => d.id === doseId);
    if (!dose) return false;
    if (userId && dose.userId && dose.userId !== userId) {
      return false;
    }
    state.todayDoses = (state.todayDoses || []).filter(d => d.id !== doseId);
    saveDb(state);
    return true;
  },

  updateTodayDose: (doseId, updates, userId) => {
    const state = getDb();
    const idx = (state.todayDoses || []).findIndex(d => d.id === doseId);
    if (idx !== -1) {
      if (userId && state.todayDoses[idx].userId && state.todayDoses[idx].userId !== userId) {
        return null;
      }
      state.todayDoses[idx] = { ...state.todayDoses[idx], ...updates };
      saveDb(state);
      return state.todayDoses[idx];
    }
    return null;
  },

  getLabResults: () => getDb().labResults || {},

  updateLabResults: (key, labData) => {
    const state = getDb();
    state.labResults[key] = labData;
    saveDb(state);
    return state.labResults;
  },

  getTimeline: (userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    return (state.timeline || []).filter(t => t.userId === targetUserId || (!t.userId && targetUserId === 'usr_priya_01'));
  },

  addTimelineItem: (item, userId) => {
    const state = getDb();
    const targetUserId = userId || item.userId || (state.user && state.user.id) || 'usr_priya_01';
    const itemWithUser = { ...item, userId: targetUserId };
    state.timeline = [itemWithUser, ...(state.timeline || [])];
    saveDb(state);
    return itemWithUser;
  },

  getFollowUps: () => getDb().followUps || [],

  addFollowUp: (fu) => {
    const state = getDb();
    state.followUps = [fu, ...(state.followUps || [])];
    state.stats.upcomingFollowUpsCount = state.followUps.length;
    saveDb(state);
    return fu;
  },

  getRiskSignals: () => getDb().riskSignals || [],

  addRiskSignal: (sig) => {
    const state = getDb();
    state.riskSignals = [sig, ...(state.riskSignals || [])];
    saveDb(state);
    return sig;
  },

  getInsights: () => getDb().insights || [],

  getHospitals: () => getDb().hospitals || [],

  updateHospitalBeds: (hospitalId, deltaBeds) => {
    const state = getDb();
    const hosp = state.hospitals.find(h => h.id === hospitalId);
    if (hosp) {
      hosp.icuBedsFree = Math.max(0, hosp.icuBedsFree + deltaBeds);
      saveDb(state);
      return hosp;
    }
    return null;
  },

  getChatHistory: () => getDb().chatHistory || [],

  addChatMessage: (msg) => {
    const state = getDb();
    state.chatHistory = [...(state.chatHistory || []), msg];
    saveDb(state);
    return msg;
  },

  getVitalsTrends: () => getDb().vitalsTrends || [],

  updateVitalsTrend: (title, updates) => {
    const state = getDb();
    const idx = (state.vitalsTrends || []).findIndex(t => t.title.toLowerCase() === title.toLowerCase());
    if (idx !== -1) {
      state.vitalsTrends[idx] = { ...state.vitalsTrends[idx], ...updates };
      saveDb(state);
      return state.vitalsTrends[idx];
    }
    return null;
  },

  getSymptoms: (userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    return (state.symptoms || []).filter(s => s.userId === targetUserId || (!s.userId && targetUserId === 'usr_priya_01'));
  },

  addSymptom: (symptom, userId) => {
    const state = getDb();
    const targetUserId = userId || symptom.userId || (state.user && state.user.id) || 'usr_priya_01';
    const symWithUser = { ...symptom, userId: targetUserId };
    state.symptoms = [symWithUser, ...(state.symptoms || [])];
    saveDb(state);
    return symWithUser;
  },

  getInsurancePolicy: () => getDb().insurancePolicy || {},

  updateInsurancePolicy: (updates) => {
    const state = getDb();
    state.insurancePolicy = { ...state.insurancePolicy, ...updates };
    saveDb(state);
    return state.insurancePolicy;
  },

  getClaimsHistory: () => getDb().claimsHistory || [],

  addClaim: (claim) => {
    const state = getDb();
    state.claimsHistory = [claim, ...(state.claimsHistory || [])];
    saveDb(state);
    return claim;
  },

  getReminders: (userId) => {
    const state = getDb();
    const targetUserId = userId || (state.user && state.user.id) || 'usr_priya_01';
    return (state.lifestyleReminders || []).filter(r => r.userId === targetUserId || (!r.userId && targetUserId === 'usr_priya_01'));
  },

  addReminder: (rem, userId) => {
    const state = getDb();
    const targetUserId = userId || rem.userId || (state.user && state.user.id) || 'usr_priya_01';
    const remWithUser = { ...rem, userId: targetUserId };
    state.lifestyleReminders = [...(state.lifestyleReminders || []), remWithUser];
    saveDb(state);
    return remWithUser;
  },

  updateReminder: (id, updates, userId) => {
    const state = getDb();
    const idx = (state.lifestyleReminders || []).findIndex(r => r.id === id);
    if (idx !== -1) {
      if (userId && state.lifestyleReminders[idx].userId && state.lifestyleReminders[idx].userId !== userId) {
        return null;
      }
      state.lifestyleReminders[idx] = { ...state.lifestyleReminders[idx], ...updates };
      saveDb(state);
      return state.lifestyleReminders[idx];
    }
    return null;
  },

  deleteReminder: (id, userId) => {
    const state = getDb();
    const rem = (state.lifestyleReminders || []).find(r => r.id === id);
    if (!rem) return false;
    if (userId && rem.userId && rem.userId !== userId) {
      return false;
    }
    state.lifestyleReminders = (state.lifestyleReminders || []).filter(r => r.id !== id);
    saveDb(state);
    return true;
  }
};

