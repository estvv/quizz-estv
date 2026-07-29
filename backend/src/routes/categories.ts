import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../db/index.js';

const router = Router();

const COLOR_TOKENS = ['blue', 'violet', 'amber', 'rose', 'emerald', 'cyan', 'orange', 'teal', 'indigo', 'pink', 'slate', 'red'];

router.get('/', (req, res) => {
  res.json({ success: true, data: getCategories() });
});

router.get('/:id', (req, res) => {
  const category = getCategoryById(parseInt(req.params.id));
  if (!category) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  res.json({ success: true, data: category });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Name required' });
  }
  const finalColor = COLOR_TOKENS.includes(color) ? color : 'slate';

  const category = createCategory(name, finalColor);
  res.json({ success: true, data: category });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, color } = req.body;

  if (color !== undefined && !COLOR_TOKENS.includes(color)) {
    return res.status(400).json({ success: false, error: 'Invalid color' });
  }

  const category = updateCategory(parseInt(req.params.id), { name, color });
  if (!category) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  res.json({ success: true, data: category });
});

router.delete('/:id', authMiddleware, (req, res) => {
  deleteCategory(parseInt(req.params.id));
  res.json({ success: true });
});

export default router;
