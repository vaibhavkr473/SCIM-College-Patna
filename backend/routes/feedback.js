import express from 'express';
import Feedback from '../models/Feedback.js';
import { authRequired, attachProfile, staffOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
    const feedback = await Feedback.create({ name, email, message });
    res.json(feedback);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authRequired, attachProfile, staffOnly, async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ created_at: -1 });
    res.json(feedback);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, staffOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(feedback);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authRequired, attachProfile, adminOnly, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
