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

// A category can be a parent (hold children) or a child (hold a parent_id), never
// both, so the tree never exceeds two levels — see documentation/ARCHITECTURE.md.
function validateParentId(parentId: number, selfId: number | null): string | null {
  if (selfId !== null && parentId === selfId) {
    return 'A category cannot be its own parent';
  }
  const parent = getCategoryById(parentId);
  if (!parent) {
    return 'Parent category not found';
  }
  if (parent.parent_id !== null) {
    return 'Parent category cannot itself be a sub-category (max two levels)';
  }
  if (selfId !== null && getCategories().some((c) => c.parent_id === selfId)) {
    return 'Category already has sub-categories and cannot become a sub-category itself';
  }
  return null;
}

router.post('/', authMiddleware, (req, res) => {
  const { name, color, parent_id } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Name required' });
  }
  const finalColor = COLOR_TOKENS.includes(color) ? color : 'slate';

  let parentId: number | null = null;
  if (parent_id !== undefined && parent_id !== null) {
    const error = validateParentId(parent_id, null);
    if (error) {
      return res.status(400).json({ success: false, error });
    }
    parentId = parent_id;
  }

  const category = createCategory(name, finalColor, parentId);
  res.json({ success: true, data: category });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, color, parent_id } = req.body;
  const id = parseInt(req.params.id);

  if (color !== undefined && !COLOR_TOKENS.includes(color)) {
    return res.status(400).json({ success: false, error: 'Invalid color' });
  }

  if (parent_id !== undefined && parent_id !== null) {
    const error = validateParentId(parent_id, id);
    if (error) {
      return res.status(400).json({ success: false, error });
    }
  }

  const category = updateCategory(id, { name, color, parent_id });
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
