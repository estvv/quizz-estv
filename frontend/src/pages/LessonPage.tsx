import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Category } from '../types';
import { categoriesApi } from '../utils/api';
import { getCategoryColorClasses } from '../utils/colors';
import { Markdown } from '../components/lesson/Markdown';

export function LessonPage() {
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const categoryId = parseInt(id);
    setLoading(true);
    Promise.all([categoriesApi.get(categoryId), categoriesApi.lesson(categoryId)])
      .then(([cat, body]) => {
        setCategory(cat);
        setLesson(body.lesson);
      })
      .catch((err) => setError(err.message || 'Leçon introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-neutral-500">Chargement...</div>;
  }

  if (error || !category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600 mb-4">{error || 'Leçon introuvable'}</p>
        <Link to="/" className="text-emerald-700 font-medium">← Retour à l'accueil</Link>
      </div>
    );
  }

  const colors = getCategoryColorClasses(category.color);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to={`/category/${category.id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800 mb-4 inline-block transition-colors"
      >
        ← {category.name}
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
        <h1 className="text-2xl font-bold text-neutral-900">Leçon  {category.name}</h1>
      </div>

      {lesson && lesson.trim() !== '' ? (
        <Markdown>{lesson}</Markdown>
      ) : (
        <p className="text-neutral-500">Aucune leçon pour cette catégorie pour le moment.</p>
      )}
    </div>
  );
}
