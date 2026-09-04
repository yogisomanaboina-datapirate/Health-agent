import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';

/**
 * Middleware to enforce strict authentication and isolation.
 * Verifies JWT token from Authorization header and attaches the authenticated user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access your clinical health data.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or session has expired.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired session token. Access denied.'
    });
  }
}
