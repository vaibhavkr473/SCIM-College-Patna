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

router.put('/users/:id', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !['student', 'co_member'].includes(user.role)) {
      return res.status(404).json({ error: 'Student or co-member account not found' });
    }

    const { full_name, email, phone, course, semester, permissions, password } = req.body;
    const update = {};
    if (full_name !== undefined) update.full_name = String(full_name).trim();
    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ error: 'A user with this email already exists' });
      update.email = normalizedEmail;
    }
    if (phone !== undefined) update.phone = phone || null;

    if (user.role === 'student') {
      if (course !== undefined) update.course = course;
      if (semester !== undefined) update.semester = Number(semester);
    } else if (permissions !== undefined) {
      update.permissions = permissions;
    }

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      update.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: update }, {
      new: true,
      runValidators: true,
    }).select('full_name email role course semester phone permissions created_at');
    res.json({ success: true, user: updated });
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Account update failed:', err);
    res.status(500).json({ error: 'Could not update account' });
  }
});

router.delete('/users/:id', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !['student', 'co_member'].includes(user.role)) {
      return res.status(404).json({ error: 'Student or co-member account not found' });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ success: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid user ID' });
    console.error('Account deletion failed:', err);
    res.status(500).json({ error: 'Could not delete account' });
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
