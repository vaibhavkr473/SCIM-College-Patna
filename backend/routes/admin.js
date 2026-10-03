import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Test from '../models/Test.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Doubt from '../models/Doubt.js';
import Feedback from '../models/Feedback.js';
import { authRequired, attachProfile, adminOnly, staffOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-student', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const { full_name, email, course, semester, phone, password } = req.body;
    const existing = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (existing) return res.json({ success: false, message: 'A user with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name, email: email.toLowerCase().trim(), password: hashed,
      role: 'student', course, semester: parseInt(semester), phone: phone || null,
    });

    res.json({ success: true, user_id: user._id.toString() });
  } catch {
    res.json({ success: false, message: 'Failed to create student account' });
  }
});

router.post('/create-member', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const { full_name, email, password, permissions } = req.body;
    const existing = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (existing) return res.json({ success: false, message: 'A user with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name, email: email.toLowerCase().trim(), password: hashed,
      role: 'co_member', permissions: permissions || [],
    });

    res.json({ success: true, user_id: user._id.toString() });
  } catch {
    res.json({ success: false, message: 'Failed to create co-member account' });
  }
});

router.get('/students', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('full_name email course semester phone created_at')
      .sort({ created_at: -1 });
    res.json(students);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/members', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const members = await User.find({ role: { $in: ['admin', 'co_member'] } })
      .select('full_name email role permissions created_at')
      .sort({ created_at: -1 });
    res.json(members);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', authRequired, attachProfile, staffOnly, async (req, res) => {
  try {
    const [students, tests, materials, doubts, feedback] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Test.countDocuments(),
      StudyMaterial.countDocuments(),
      Doubt.countDocuments({ is_answered: false }),
      Feedback.countDocuments({ is_read: false }),
    ]);
    const recentFeedback = await Feedback.find().select('id name email created_at').sort({ created_at: -1 }).limit(5);
    res.json({ students, tests, materials, doubts, feedback, recentFeedback });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
