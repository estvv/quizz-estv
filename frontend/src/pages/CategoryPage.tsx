import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Category, QuestionBrief } from '../types';
import { categoriesApi, questionsApi } from '../utils/api';
import { getCategoryColorClasses } from '../utils/colors';
import { QuestionListRow } from '../components/questions/QuestionListRow';

type RandomCount = 'all' | 5 | 10;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<QuestionBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<'browse' | 'select'>('browse');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [randomCount, setRandomCount] = useState<RandomCount>('all');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const categoryId = parseInt(id);
    setLoading(true);
    Promise.all([categoriesApi.get(categoryId), questionsApi.brief(categoryId)])
      .then(([cat, qs]) => {
        setCategory(cat);
        setQuestions(qs);
      })
      .catch((err) => setError(err.message || 'Catégorie introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const colors = useMemo(() => getCategoryColorClasses(category?.color ?? 'slate'), [category]);

  function toggleSelected(qid: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  async function startRandom() {
    if (!category) return;
    setStarting(true);
    try {
      const full = await questionsApi.quiz({ category_id: category.id });
      const shuffled = shuffle(full);
      const sliced = randomCount === 'all' ? shuffled : shuffled.slice(0, randomCount);
      navigate('/quiz', { state: { questions: sliced, categoryName: category.name } });
    } catch (err: any) {
      setError(err.message || 'Impossible de démarrer le quiz');
      setStarting(false);
    }
  }

  async function startSelected() {
    if (!category || selectedIds.size === 0) return;
    setStarting(true);
    try {
      const ids = questions.filter((q) => selectedIds.has(q.id)).map((q) => q.id);
      const full = await questionsApi.quiz({ ids });
      navigate('/quiz', { state: { questions: full, categoryName: category.name } });
    } catch (err: any) {
      setError(err.message || 'Impossible de démarrer le quiz');
      setStarting(false);
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-neutral-500">Chargement...</div>;
  }

  if (error || !category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600 mb-4">{error || 'Catégorie introuvable'}</p>
        <Link to="/" className="text-emerald-700 font-medium">← Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-800 mb-4 inline-block">← Toutes les catégories</Link>

      <div className="flex items-center gap-2 mb-6">
        <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
        <h1 className="text-2xl font-bold text-neutral-900">{category.name}</h1>
        <span className="text-sm text-neutral-400">({questions.length} question{questions.length !== 1 ? 's' : ''})</span>
      </div>

      {questions.length === 0 ? (
        <p className="text-neutral-500">Aucune question dans cette catégorie pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {mode === 'browse' && questions.length > 5 && (
              <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm">
                {(['5', '10', 'all'] as const).map((opt) => {
                  const value: RandomCount = opt === 'all' ? 'all' : (parseInt(opt) as 5 | 10);
                  const active = randomCount === value;
                  return (
                    <button
                      key={opt}
                      onClick={() => setRandomCount(value)}
                      className={`px-3 py-1.5 font-medium transition-colors ${
                        active ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {opt === 'all' ? 'Toutes' : opt}
                    </button>
                  );
                })}
              </div>
            )}

            {mode === 'browse' ? (
              <>
                <button
                  onClick={startRandom}
                  disabled={starting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Aléatoire
                </button>
                <button
                  onClick={() => setMode('select')}
                  className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Par choix
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMode('browse'); setSelectedIds(new Set()); }}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Annuler la sélection
              </button>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white mb-4">
            {questions.map((q, i) => (
              <QuestionListRow
                key={q.id}
                question={q}
                index={i}
                selectable={mode === 'select'}
                selected={selectedIds.has(q.id)}
                onToggle={toggleSelected}
              />
            ))}
          </div>

          {mode === 'select' && selectedIds.size > 0 && (
            <div className="sticky bottom-4 flex justify-center">
              <button
                onClick={startSelected}
                disabled={starting}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Lancer ({selectedIds.size})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
