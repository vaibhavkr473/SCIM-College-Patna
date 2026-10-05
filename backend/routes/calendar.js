import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import { authRequired, attachProfile, staffOnly, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ event_date: 1 });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, staffOnly, hasPermission('manage_calendar'), async (req, res) => {
  try {
    const { title, description, event_type, course, event_date, end_date } = req.body;
    const event = await CalendarEvent.create({
      title, description: description || '', event_type: event_type || 'event',
      course: course || null, event_date, end_date: end_date || null, created_by: req.userId,
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_calendar'), async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_calendar'), async (req, res) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
