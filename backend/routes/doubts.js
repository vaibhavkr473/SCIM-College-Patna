import express from 'express';
import Doubt from '../models/Doubt.js';
import DoubtResponse from '../models/DoubtResponse.js';
import { authRequired, attachProfile, staffOnly, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, attachProfile, async (req, res) => {
  try {
    if (['admin', 'co_member'].includes(req.userRole)) {
      const doubts = await Doubt.find().sort({ created_at: -1 });
      return res.json(doubts);
    }
    const doubts = await Doubt.find({ student_id: req.userId }).sort({ created_at: -1 });
    res.json(doubts);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, async (req, res) => {
  try {
    const { subject, question } = req.body;
    const doubt = await Doubt.create({
      student_id: req.userId, student_name: req.profile.full_name,
      course: req.profile.course, semester: req.profile.semester,
      subject, question,
    });
    res.json(doubt);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_doubts'), async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(doubt);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:doubtId/responses', authRequired, attachProfile, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) return res.status(404).json({ error: 'Doubt not found' });

    const isStaff = ['admin', 'co_member'].includes(req.userRole);
    const isOwner = doubt.student_id.toString() === req.userId.toString();
    if (!isStaff && !isOwner) return res.status(403).json({ error: 'Not authorized' });

    const responses = await DoubtResponse.find({ doubt_id: req.params.doubtId }).sort({ created_at: 1 });
    res.json(responses);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:doubtId/responses', authRequired, attachProfile, staffOnly, hasPermission('manage_doubts'), async (req, res) => {
  try {
    const { response_text } = req.body;
    const response = await DoubtResponse.create({
      doubt_id: req.params.doubtId, responder_id: req.userId,
      responder_name: req.profile.full_name, response_text,
    });
    await Doubt.findByIdAndUpdate(req.params.doubtId, { $set: { is_answered: true } });
    res.json(response);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
