import { useNavigate } from 'react-router-dom';
import type { Category } from '../../types';
import { getCategoryColorClasses } from '../../utils/colors';

export function CategoryCard({ category, subcategoryCount }: { category: Category; subcategoryCount?: number }) {
  const navigate = useNavigate();
  const colors = getCategoryColorClasses(category.color);

  return (
    <button
      onClick={() => navigate(`/category/${category.id}`)}
      className={`text-left p-5 rounded-lg border ${colors.border} bg-white hover:shadow-md hover:-translate-y-0.5 transition-all`}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${colors.badge}`}>
          {category.question_count} question{category.question_count !== 1 ? 's' : ''}
        </span>
        {subcategoryCount !== undefined && (
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
            {subcategoryCount} sous-catégorie{subcategoryCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">{category.name}</h2>
    </button>
  );
}
