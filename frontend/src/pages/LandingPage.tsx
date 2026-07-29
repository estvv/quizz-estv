import { useEffect, useState } from 'react';
import type { Category } from '../types';
import { categoriesApi } from '../utils/api';
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quizz</h1>
        <p className="text-neutral-600">Choisis une catégorie pour tester tes connaissances.</p>
      </div>

      {loading && <p className="text-neutral-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-neutral-500">Aucune catégorie pour le moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
