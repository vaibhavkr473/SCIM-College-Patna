import express from 'express';
import TestSubmission from '../models/TestSubmission.js';
import Test from '../models/Test.js';
import { authRequired, attachProfile, staffOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, attachProfile, async (req, res) => {
  try {
    if (['admin', 'co_member'].includes(req.userRole)) {
      const submissions = await TestSubmission.find().populate('test_id', 'title').sort({ created_at: -1 });
      const result = submissions.map(s => {
        const obj = s.toJSON();
        obj.tests = s.test_id ? { title: s.test_id.title } : null;
        return obj;
      });
      return res.json(result);
    }
    const submissions = await TestSubmission.find({ student_id: req.userId }).sort({ created_at: -1 });
    res.json(submissions);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/student/:studentId', authRequired, attachProfile, staffOnly, async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ student_id: req.params.studentId })
      .populate('test_id', 'title').sort({ submitted_at: -1 });
    const result = submissions.map(s => {
      const obj = s.toJSON();
      obj.tests = s.test_id ? { title: s.test_id.title } : null;
      return obj;
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const { test_id, answers, score, total_marks, status, violation_flags } = req.body;
    const existing = await TestSubmission.findOne({ test_id, student_id: req.userId });
    if (existing) {
      existing.answers = answers || existing.answers;
      existing.score = score ?? existing.score;
      existing.total_marks = total_marks ?? existing.total_marks;
      existing.status = status || existing.status;
      existing.violation_flags = violation_flags ?? existing.violation_flags;
      existing.submitted_at = status === 'submitted' ? new Date() : existing.submitted_at;
      await existing.save();
      return res.json(existing);
    }
    const submission = await TestSubmission.create({
      test_id, student_id: req.userId, answers, score, total_marks,
      status: status || 'submitted', violation_flags: violation_flags || 0,
      submitted_at: status === 'submitted' ? new Date() : null,
    });
    res.json(submission);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
