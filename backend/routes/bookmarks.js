import express from 'express';
import MaterialBookmark from '../models/MaterialBookmark.js';
import StudyMaterial from '../models/StudyMaterial.js';
import { authRequired, attachProfile } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, attachProfile, async (req, res) => {
  try {
    const bookmarks = await MaterialBookmark.find({ student_id: req.userId });
    const ids = bookmarks.map(b => b.material_id);
    const materials = await StudyMaterial.find({ _id: { $in: ids } }).sort({ created_at: -1 });
    res.json({ bookmarks: bookmarks.map(b => b.material_id.toString()), materials });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authRequired, attachProfile, async (req, res) => {
  try {
    const { material_id } = req.body;
    const existing = await MaterialBookmark.findOne({ student_id: req.userId, material_id });
    if (!existing) {
      await MaterialBookmark.create({ student_id: req.userId, material_id });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:material_id', authRequired, attachProfile, async (req, res) => {
  try {
    await MaterialBookmark.deleteOne({ student_id: req.userId, material_id: req.params.material_id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
