import { Router } from 'express';
import { getCategories, getCategoryById, getCategoryLesson } from '../db/index.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, data: getCategories() });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const category = getCategoryById(id);
  if (!category) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  res.json({ success: true, data: category });
});

// The Markdown body on its own: the category list carries only `has_lesson`, so
// a long lesson is never paid for by a page that just draws cards.
router.get('/:id/lesson', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const lesson = getCategoryLesson(id);
  if (lesson === undefined) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  res.json({ success: true, data: { lesson } });
});

export default router;
