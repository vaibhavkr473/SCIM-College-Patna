import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authRequired, attachProfile, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, attachProfile, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.userId }).sort({ created_at: -1 });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/broadcast', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const recipients = await User.find({ is_active: true, _id: { $ne: req.userId } })
      .select('_id')
      .lean();
    const notifications = recipients.length
      ? await Notification.insertMany(recipients.map(({ _id }) => ({
        user_id: _id,
        title,
        message,
        type: 'admin',
      })))
      : [];

    res.json({ success: true, recipient_count: notifications.length });
  } catch (err) {
    console.error('Notification broadcast failed:', err);
    res.status(500).json({ error: 'Could not send notification' });
  }
});

router.patch('/:id/read', authRequired, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: { is_read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
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
