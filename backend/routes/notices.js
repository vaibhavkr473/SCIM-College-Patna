import express from 'express';
import Notice from '../models/Notice.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authRequired, attachProfile, staffOnly, hasPermission, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    const filter = active_only === 'true' ? { is_active: true } : {};
    const notices = await Notice.find(filter).sort({ created_at: -1 });
    res.json(notices);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, staffOnly, hasPermission('manage_notices'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const notice = await Notice.create({ title, content: content || '', is_active: true, created_by: req.userId });
    const recipients = await User.find({ is_active: true, _id: { $ne: req.userId } }).select('_id').lean();
    if (recipients.length) {
      await Notification.insertMany(recipients.map(({ _id }) => ({
        user_id: _id,
        title: `New notice: ${notice.title}`,
        message: notice.content || notice.title,
        type: 'notice',
        related_id: notice._id,
      })));
    }
    res.json(notice);
  } catch (err) {
    console.error('Notice creation failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_notices'), async (req, res) => {
  try {
    const update = {};
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.content !== undefined) update.content = req.body.content;
    if (req.body.is_active !== undefined) update.is_active = req.body.is_active;
    const notice = await Notice.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    res.json(notice);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
