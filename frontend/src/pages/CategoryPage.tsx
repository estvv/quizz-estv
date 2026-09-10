import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Category, ExerciseBrief } from '../types';
import { categoriesApi, exercisesApi } from '../utils/api';
import { getCategoryColorClasses } from '../utils/colors';
import { buildCategoryTree, findNode, getAncestors } from '../utils/categoryTree';
import { ExerciseListRow } from '../components/exercise/ExerciseListRow';
import { StudyModes } from '../components/categories/StudyModes';
import { CategoryCard } from '../components/categories/CategoryCard';

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
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [exercises, setExercises] = useState<ExerciseBrief[]>([]);
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
    setExercises([]);
    Promise.all([categoriesApi.get(categoryId), categoriesApi.list()])
      .then(async ([cat, all]) => {
        setCategory(cat);
        setAllCategories(all);
        // A category with sub-categories is a pure container: skip fetching its
        // own exercises, it never has any directly attached.
        if (!all.some((c) => c.parent_id === categoryId)) {
          setExercises(await exercisesApi.brief(categoryId));
        }
      })
      .catch((err) => setError(err.message || 'Catégorie introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const colors = useMemo(() => getCategoryColorClasses(category?.color ?? 'slate'), [category]);

  const node = useMemo(
    () => (category ? findNode(buildCategoryTree(allCategories), category.id) : undefined),
    [allCategories, category]
  );
  const children = node?.children ?? [];

  const ancestors = useMemo(
    () => (category ? getAncestors(allCategories, category.id) : []),
    [allCategories, category]
  );

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
      const full = await exercisesApi.session({ category_id: category.id });
      const shuffled = shuffle(full);
      const sliced = randomCount === 'all' ? shuffled : shuffled.slice(0, randomCount);
      navigate('/quiz', { state: { exercises: sliced, categoryName: category.name } });
    } catch (err: any) {
      setError(err.message || 'Impossible de démarrer le quiz');
      setStarting(false);
    }
  }

  async function startSelected() {
    if (!category || selectedIds.size === 0) return;
    setStarting(true);
    try {
      const ids = exercises.filter((e) => selectedIds.has(e.id)).map((e) => e.id);
      const full = await exercisesApi.session({ ids });
      navigate('/quiz', { state: { exercises: full, categoryName: category.name } });
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

  // The tree has no depth limit, so a plain "back" link isn't enough to get out
  // of a deep branch  every ancestor is a hop.
  const breadcrumb = (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500 mb-4">
      <Link to="/" className="hover:text-neutral-800 transition-colors">Accueil</Link>
      {ancestors.map((ancestor) => (
        <span key={ancestor.id} className="flex items-center gap-1.5">
          <span className="text-neutral-300">/</span>
          <Link to={`/category/${ancestor.id}`} className="hover:text-neutral-800 transition-colors">
            {ancestor.name}
          </Link>
        </span>
      ))}
    </nav>
  );

  if (children.length > 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        {breadcrumb}

        <div className="flex items-center gap-2 mb-8">
          <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
          <h1 className="text-2xl font-bold text-neutral-900">{category.name}</h1>
          <span className="text-sm text-neutral-400">
            ({node?.totalQuestionCount ?? 0} question{(node?.totalQuestionCount ?? 0) !== 1 ? 's' : ''})
          </span>
        </div>

        <StudyModes category={category} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <CategoryCard
              key={child.id}
              category={{ ...child, question_count: child.totalQuestionCount }}
              subcategoryCount={child.children.length > 0 ? child.children.length : undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {breadcrumb}

      <div className="flex items-center gap-2 mb-6">
        <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
        <h1 className="text-2xl font-bold text-neutral-900">{category.name}</h1>
      </div>

      <StudyModes category={category} />

      {exercises.length === 0 ? (
        !category.has_lesson && category.flashcard_count === 0 && (
          <p className="text-neutral-500">Aucun contenu dans cette catégorie pour le moment.</p>
        )
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {mode === 'browse' && exercises.length > 5 && (
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
            {exercises.map((e, i) => (
              <ExerciseListRow
                key={e.id}
                exercise={e}
                index={i}
                selectable={mode === 'select'}
                selected={selectedIds.has(e.id)}
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
