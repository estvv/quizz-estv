import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types';

interface Mode {
  to: string;
  icon: JSX.Element;
  label: string;
  detail: string;
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Open book.
const LessonIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z" />
    <path d="M12 6.5v13" />
  </svg>
);

// Stacked cards.
const FlashcardsIcon = (
  <svg {...iconProps} aria-hidden="true">
    <rect x="3" y="7" width="13" height="14" rx="2" />
    <path d="M8 3.5h9a2 2 0 0 1 2 2V17" />
  </svg>
);

// Only the modes that actually have content show up, so a category holding just a
// quiz looks exactly as it did before lessons and flashcards existed.
export function StudyModes({ category }: { category: Category }) {
  const modes: Mode[] = [];

  if (category.has_lesson) {
    modes.push({ to: `/category/${category.id}/lesson`, icon: LessonIcon, label: 'Leçon', detail: 'À lire' });
  }

  const cardCount = category.flashcard_count + category.question_count;
  if (cardCount > 0) {
    const source = category.flashcard_count > 0 ? 'cards' : 'quiz';
    const detail = category.flashcard_count > 0
      ? `${category.flashcard_count} carte${category.flashcard_count !== 1 ? 's' : ''}`
      : `${category.question_count} question${category.question_count !== 1 ? 's' : ''} du quiz`;
    modes.push({
      to: `/category/${category.id}/flashcards?source=${source}`,
      icon: FlashcardsIcon,
      label: 'Flashcards',
      detail,
    });
  }

  if (modes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {modes.map((mode) => (
        <Link
          key={mode.to}
          to={mode.to}
          className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <span className="shrink-0 text-neutral-500">{mode.icon}</span>
          <span className="min-w-0">
            <span className="block font-semibold text-neutral-900">{mode.label}</span>
            <span className="block text-sm text-neutral-500 truncate">{mode.detail}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
