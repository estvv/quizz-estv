import { Router } from 'express';
import {
  getQuestionsBrief, getQuestionsFullByCategory, getQuestionsFullByIds, getQuestionById,
} from '../db/index.js';

const router = Router();

// A quiz "par choix" session can only pick from the questions of one category,
// so this many ids is already far more than any real request. It also bounds the
// work of parsing and the size of the response.
const MAX_IDS = 300;

function parseId(raw: unknown): number | null {
  const id = parseInt(String(raw), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Public: brief question list for browsing a category (text only, no answers).
router.get('/', (req, res) => {
  const categoryId = parseId(req.query.category_id);
  if (!categoryId) {
    return res.status(400).json({ success: false, error: 'category_id query param required' });
  }
  res.json({ success: true, data: getQuestionsBrief(categoryId) });
});

// Public: full question data (including correct_choice) to power a quiz session.
// The frontend just doesn't render the answer until the user has picked one.
router.get('/quiz', (req, res) => {
  const { category_id, ids } = req.query;

  if (category_id) {
    const categoryId = parseId(category_id);
    if (!categoryId) {
      return res.status(400).json({ success: false, error: 'Invalid category_id' });
    }
    return res.json({ success: true, data: getQuestionsFullByCategory(categoryId) });
  }

  if (typeof ids === 'string') {
    const idList = ids.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n > 0);
    if (idList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid ids' });
    }
    if (idList.length > MAX_IDS) {
      return res.status(400).json({ success: false, error: `Too many ids (max ${MAX_IDS})` });
    }
    return res.json({ success: true, data: getQuestionsFullByIds(idList) });
  }

  return res.status(400).json({ success: false, error: 'category_id or ids query param required' });
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const question = getQuestionById(id);
  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }
  res.json({ success: true, data: question });
});

export default router;
