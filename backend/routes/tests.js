import express from 'express';
import Test from '../models/Test.js';
import { authRequired, attachProfile, staffOnly, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  try {
    const { course, semester, is_active } = req.query;
    const filter = {};
    if (course) filter.course = course;
    if (semester) filter.semester = parseInt(semester);
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    const tests = await Test.find(filter).sort({ created_at: -1 });
    res.json(tests);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, staffOnly, hasPermission('manage_tests'), async (req, res) => {
  try {
    const { title, description, course, semester, duration_minutes, questions } = req.body;
    const test = await Test.create({
      title, description: description || '', course, semester: parseInt(semester),
      duration_minutes: parseInt(duration_minutes), questions: questions || [],
      is_active: true, created_by: req.userId,
    });
    res.json(test);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_tests'), async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(test);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_tests'), async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
