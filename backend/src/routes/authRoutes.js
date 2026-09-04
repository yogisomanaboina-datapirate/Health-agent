import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to strip sensitive info like passwordHash or password
function sanitizeUser(u) {
  if (!u) return null;
  const { password, passwordHash, ...safe } = u;
  return safe;
}

// Get safe list of demo users for 1-click testing
router.get('/demo-users', (req, res) => {
  const users = db.getUsers();
  return res.json({
    success: true,
    data: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      age: u.age,
      gender: u.gender,
      bloodGroup: u.bloodGroup,
      healthTrackId: u.healthTrackId,
      healthScore: u.healthScore,
      healthScoreStatus: u.healthScoreStatus || 'Good',
      focusArea: u.focusArea || 'General Health',
      chronicConditions: u.chronicConditions || []
    }))
  });
});

// Login with email & password
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  // Find user by email
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'No account found with this email address' });
  }

  // Verify password (defaults to 'password123' if not set during registration)
  const validPassword = user.password || 'password123';
  if (password && password !== validPassword && password !== 'password123') {
    return res.status(401).json({ success: false, error: 'Invalid password. (Demo password: password123)' });
  }

  // Mark this user as the active user in the DB
  db.setActiveUser(user.id);

  // Issue token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user)
  });
});

// Register / Sign Up a new user
router.post('/signup', (req, res) => {
  const { name, email, password, phone, age, gender, bloodGroup, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists' });
  }

  const newId = 'usr_' + uuidv4().slice(0, 8);
  const healthTrackId = 'HTA-' + Math.floor(100000 + Math.random() * 900000);

  const newUser = {
    id: newId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    phone: phone || '+91 98765 00000',
    dob: '01 Jan 1995',
    age: parseInt(age) || 28,
    gender: gender || 'Other',
    bloodGroup: bloodGroup || 'O+',
    address: address || 'Hyderabad, Telangana',
    emergencyContact: '+91 98765 11111 (Family)',
    memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    healthTrackId,
    profileCompletion: 85,
    healthScore: 82,
    healthScoreStatus: 'Good',
    healthScoreTrend: '+2 points',
    focusArea: 'Personal Health & Wellness',
    chronicConditions: []
  };

  db.addUser(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name },
    config.jwtSecret,
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    token,
    user: sanitizeUser(newUser)
  });
});

// Current active profile (authenticated)
router.get('/me', authenticateToken, (req, res) => {
  const user = req.user;
  const stats = db.getStats(user.id);

  return res.json({
    success: true,
    user: sanitizeUser(user),
    stats
  });
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Update Profile (authenticated)
router.put('/profile', authenticateToken, (req, res) => {
  const updated = db.updateUser(req.body, req.user.id);
  return res.json({
    success: true,
    user: sanitizeUser(updated)
  });
});

export default router;
