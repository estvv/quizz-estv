import { useEffect, useMemo, useState } from 'react';
import type { Category } from '../types';
import { categoriesApi } from '../utils/api';
import { buildCategoryTree } from '../utils/categoryTree';
import { CategoryCard } from '../components/categories/CategoryCard';

export function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.list()
      .then(setCategories)
      .catch((err) => setError(err.message || 'Impossible de charger les catégories'))
      .finally(() => setLoading(false));
  }, []);

  const roots = useMemo(() => buildCategoryTree(categories), [categories]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quizz</h1>
      </div>

      {loading && <p className="text-neutral-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && roots.length === 0 && (
        <p className="text-neutral-500">Aucune catégorie pour le moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roots.map((root) => (
          <CategoryCard
            key={root.id}
            category={{ ...root, question_count: root.totalQuestionCount }}
            subcategoryCount={root.children.length > 0 ? root.children.length : undefined}
          />
        ))}
      </div>
    </div>
  );
}
