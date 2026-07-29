import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getQuestionsBrief, getQuestionsFullByCategory, getQuestionsFullByIds,
  getQuestionById, createQuestion, updateQuestion, deleteQuestion
} from '../db/index.js';

const router = Router();

const VALID_CHOICES = ['A', 'B', 'C', 'D'];

function validateQuestionInput(body: any, requireAll: boolean) {
  const fields = ['category_id', 'question_text', 'choice_a', 'choice_b', 'choice_c', 'choice_d', 'correct_choice'];
  if (requireAll) {
    for (const f of fields) {
      if (body[f] === undefined || body[f] === null || body[f] === '') {
        return `Field "${f}" is required`;
      }
    }
  }
  if (body.correct_choice !== undefined && !VALID_CHOICES.includes(body.correct_choice)) {
    return 'correct_choice must be one of A, B, C, D';
  }
  return null;
}

// Public: brief question list for browsing a category (no choices/answer revealed)
router.get('/', (req, res) => {
  const categoryId = parseInt(req.query.category_id as string);
  if (!categoryId) {
    return res.status(400).json({ success: false, error: 'category_id query param required' });
  }
  res.json({ success: true, data: getQuestionsBrief(categoryId) });
});

// Public: full question data (including correct_choice) to power a quiz session.
// Not a security boundary here — anyone can already browse everything; this just
// avoids leaking answers in the plain browse view above.
router.get('/quiz', (req, res) => {
  const { category_id, ids } = req.query;

  if (category_id) {
    const categoryId = parseInt(category_id as string);
    return res.json({ success: true, data: getQuestionsFullByCategory(categoryId) });
  }

  if (ids) {
    const idList = (ids as string).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    return res.json({ success: true, data: getQuestionsFullByIds(idList) });
  }

  return res.status(400).json({ success: false, error: 'category_id or ids query param required' });
});

router.get('/:id', (req, res) => {
  const question = getQuestionById(parseInt(req.params.id));
  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }
  res.json({ success: true, data: question });
});

router.post('/', authMiddleware, (req, res) => {
  const error = validateQuestionInput(req.body, true);
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  const question = createQuestion({
    category_id: parseInt(req.body.category_id),
    question_text: req.body.question_text,
    choice_a: req.body.choice_a,
    choice_b: req.body.choice_b,
    choice_c: req.body.choice_c,
    choice_d: req.body.choice_d,
    correct_choice: req.body.correct_choice,
    explanation: req.body.explanation || null,
  });
  res.json({ success: true, data: question });
});

router.put('/:id', authMiddleware, (req, res) => {
  const error = validateQuestionInput(req.body, false);
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  const updates: any = { ...req.body };
  if (updates.category_id !== undefined) {
    updates.category_id = parseInt(updates.category_id);
  }

  const question = updateQuestion(parseInt(req.params.id), updates);
  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }
  res.json({ success: true, data: question });
});

router.delete('/:id', authMiddleware, (req, res) => {
  deleteQuestion(parseInt(req.params.id));
  res.json({ success: true });
});

export default router;
