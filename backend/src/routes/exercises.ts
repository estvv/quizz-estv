import { Router } from 'express';
import {
  getExercisesBrief, getExercisesFullByCategory, getExercisesFullByIds, getExerciseById,
} from '../db/index.js';

const router = Router();

// A "par choix" session can only pick from the exercises of one category, so
// this many ids is already far more than any real request. It also bounds the
// work of parsing and the size of the response.
const MAX_IDS = 300;

function parseId(raw: unknown): number | null {
  const id = parseInt(String(raw), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Public: brief exercise list for browsing a category (prompt + type, no answers).
router.get('/', (req, res) => {
  const categoryId = parseId(req.query.category_id);
  if (!categoryId) {
    return res.status(400).json({ success: false, error: 'category_id query param required' });
  }
  res.json({ success: true, data: getExercisesBrief(categoryId) });
});

// Public: full exercise data (including the payload with the answers) to power a
// session. The frontend just doesn't reveal the answer until the user commits.
router.get('/quiz', (req, res) => {
  const { category_id, ids } = req.query;

  if (category_id) {
    const categoryId = parseId(category_id);
    if (!categoryId) {
      return res.status(400).json({ success: false, error: 'Invalid category_id' });
    }
    return res.json({ success: true, data: getExercisesFullByCategory(categoryId) });
  }

  if (typeof ids === 'string') {
    const idList = ids.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n > 0);
    if (idList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid ids' });
    }
    if (idList.length > MAX_IDS) {
      return res.status(400).json({ success: false, error: `Too many ids (max ${MAX_IDS})` });
    }
    return res.json({ success: true, data: getExercisesFullByIds(idList) });
  }

  return res.status(400).json({ success: false, error: 'category_id or ids query param required' });
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const exercise = getExerciseById(id);
  if (!exercise) {
    return res.status(404).json({ success: false, error: 'Exercise not found' });
  }
  res.json({ success: true, data: exercise });
});

export default router;
