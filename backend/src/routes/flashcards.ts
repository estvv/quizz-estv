import { Router } from 'express';
import { getFlashcards, getFlashcardById } from '../db/index.js';

const router = Router();

function parseId(raw: unknown): number | null {
  const id = parseInt(String(raw), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Public: the whole deck for a category. Flashcards have no hidden side to
// protect  the back is the point  so there is no brief form.
router.get('/', (req, res) => {
  const categoryId = parseId(req.query.category_id);
  if (!categoryId) {
    return res.status(400).json({ success: false, error: 'category_id query param required' });
  }
  res.json({ success: true, data: getFlashcards(categoryId) });
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const flashcard = getFlashcardById(id);
  if (!flashcard) {
    return res.status(404).json({ success: false, error: 'Flashcard not found' });
  }
  res.json({ success: true, data: flashcard });
});

export default router;
