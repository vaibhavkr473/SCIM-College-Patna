import express from 'express';
import StudyMaterial from '../models/StudyMaterial.js';
import { authRequired, attachProfile, staffOnly, hasPermission, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  try {
    const { course, semester } = req.query;
    const filter = {};
    if (course) filter.course = course;
    if (semester) filter.semester = parseInt(semester);
    const materials = await StudyMaterial.find(filter).sort({ created_at: -1 });
    res.json(materials);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Not found' });
    res.json(material);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, staffOnly, hasPermission('manage_materials'), async (req, res) => {
  try {
    const { title, description, type, course, semester, url, text_content } = req.body;
    const material = await StudyMaterial.create({
      title, description: description || '', type, course,
      semester: parseInt(semester), url: type !== 'text' ? url : null,
      text_content: type === 'text' ? text_content : null, uploaded_by: req.userId,
    });
    res.json(material);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_materials'), async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(material);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authRequired, attachProfile, staffOnly, hasPermission('manage_materials'), async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
