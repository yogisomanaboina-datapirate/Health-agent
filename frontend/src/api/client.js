const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('healthtrack_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication & Users
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('healthtrack_token', data.token);
    }
    return data;
  },

  async signup(userData) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('healthtrack_token', data.token);
    }
    return data;
  },

  async getDemoUsers() {
    const res = await fetch(`${BASE_URL}/auth/demo-users`);
    return res.json();
  },

  async logout() {
    localStorage.removeItem('healthtrack_token');
    try {
      await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (e) {}
    return { success: true };
  },

  // Dashboard & Profile
  async getDashboard() {
    const res = await fetch(`${BASE_URL}/data/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async updateProfile(updates) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Records
  async getRecords(category) {
    const query = category && category !== 'All Records' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${BASE_URL}/data/records${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addRecord(record) {
    const res = await fetch(`${BASE_URL}/data/records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(record)
    });
    return res.json();
  },

  // Medications
  async getMedications() {
    const res = await fetch(`${BASE_URL}/data/medications`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markDoseTaken(doseId) {
    const res = await fetch(`${BASE_URL}/data/doses/${doseId}/take`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addDose(doseData) {
    const res = await fetch(`${BASE_URL}/data/doses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(doseData)
    });
    return res.json();
  },

  async updateDose(doseId, updates) {
    const res = await fetch(`${BASE_URL}/data/doses/${doseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteDose(doseId) {
    const res = await fetch(`${BASE_URL}/data/doses/${doseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addMedication(med) {
    const res = await fetch(`${BASE_URL}/data/medications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(med)
    });
    return res.json();
  },

  // Lab reports
  async getLabReports() {
    const res = await fetch(`${BASE_URL}/data/lab-reports`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Hospitals & Beds
  async getHospitals() {
    const res = await fetch(`${BASE_URL}/data/hospitals`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async dispatchAmbulance(hospitalId) {
    const res = await fetch(`${BASE_URL}/data/hospitals/${hospitalId}/dispatch`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Follow-ups & Risk signals
  async getFollowUps() {
    const res = await fetch(`${BASE_URL}/data/follow-ups`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // AI Agents
  async sendChatMessage(message) {
    const res = await fetch(`${BASE_URL}/agents/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async runTriage(symptoms, vitals) {
    const res = await fetch(`${BASE_URL}/agents/triage`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ symptoms, vitals })
    });
    return res.json();
  },

  async runScanExtract(documentText, fileName, fileType) {
    const res = await fetch(`${BASE_URL}/agents/scan-extract`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentText, fileName, fileType })
    });
    return res.json();
  },

  async triggerCoordinator(eventType, payload) {
    const res = await fetch(`${BASE_URL}/agents/coordinate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventType, payload })
    });
    return res.json();
  },

  async getDoctorSummary() {
    const res = await fetch(`${BASE_URL}/agents/doctor-summary`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Vitals Trends
  async getTrends() {
    const res = await fetch(`${BASE_URL}/data/trends`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Symptoms
  async getSymptoms() {
    const res = await fetch(`${BASE_URL}/data/symptoms`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addSymptom(symptomData) {
    const res = await fetch(`${BASE_URL}/data/symptoms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(symptomData)
    });
    return res.json();
  },

  // Insurance & Claims
  async getInsurance() {
    const res = await fetch(`${BASE_URL}/data/insurance`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async submitClaim(claimData) {
    const res = await fetch(`${BASE_URL}/data/claims`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(claimData)
    });
    return res.json();
  },

  // Lifestyle Reminders
  async getReminders() {
    const res = await fetch(`${BASE_URL}/data/reminders`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addReminder(remData) {
    const res = await fetch(`${BASE_URL}/data/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(remData)
    });
    return res.json();
  },

  async toggleReminder(id, enabled) {
    const res = await fetch(`${BASE_URL}/data/reminders/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled })
    });
    return res.json();
  },

  async deleteReminder(id) {
    const res = await fetch(`${BASE_URL}/data/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

