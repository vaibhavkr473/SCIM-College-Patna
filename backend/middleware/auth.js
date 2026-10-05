import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function staffOnly(req, res, next) {
  if (!['admin', 'co_member'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
}

export function adminOnly(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export async function attachProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.profile = user;
    next();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

export function hasPermission(perm) {
  return (req, res, next) => {
    if (req.userRole === 'admin') return next();
    if (req.userRole === 'co_member' && req.profile?.permissions?.includes(perm)) return next();
    return res.status(403).json({ error: 'Permission denied' });
  };
}
