import express from 'express';
import Notification from '../models/Notification.js';
import { authRequired, attachProfile } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, attachProfile, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.userId }).sort({ created_at: -1 });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    if (req.userRole === 'student' && user_id !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const notification = await Notification.create({
      user_id, title, message, type: type || 'info',
    });
    res.json(notification);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(notification);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
