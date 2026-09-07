import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Category, Flashcard, Exercise, StudyCard } from '../types';
import { categoriesApi, flashcardsApi, exercisesApi } from '../utils/api';
import { getCategoryColorClasses } from '../utils/colors';
import { FlashcardDeck } from '../components/flashcards/FlashcardDeck';

type Source = 'cards' | 'quiz' | 'all';

function isSource(value: string | null): value is Source {
  return value === 'cards' || value === 'quiz' || value === 'all';
}

function toCard(flashcard: Flashcard): StudyCard {
  return { key: `card-${flashcard.id}`, front: flashcard.front, back: flashcard.back };
}

// An exercise read as a card: the prompt on the front, the answer spelled out on
// the back. Only mcq / type_answer carry a self-contained answer string.
function exerciseToCard(exercise: Exercise): StudyCard {
  let front = exercise.prompt;
  let answer: string;
  switch (exercise.type) {
    case 'mcq':
      answer = exercise.payload.choices[exercise.payload.correct];
      break;
    case 'type_answer':
      answer = exercise.payload.accept[0];
      break;
    case 'vocab':
      front = exercise.payload.ko;
      answer = `${exercise.payload.fr[0]}  ${exercise.payload.rr}`;
      break;
  }
  return {
    key: `exercise-${exercise.id}`,
    front,
    back: exercise.explanation && exercise.type !== 'vocab' ? `${answer}\n\n${exercise.explanation}` : answer,
  };
}

export function FlashcardSessionPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const sourceParam = searchParams.get('source');
  const source: Source = isSource(sourceParam) ? sourceParam : 'all';

  const [category, setCategory] = useState<Category | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const categoryId = parseInt(id);
    setLoading(true);
    Promise.all([
      categoriesApi.get(categoryId),
      flashcardsApi.list(categoryId),
      exercisesApi.session({ category_id: categoryId }),
    ])
      .then(([cat, cards, ex]) => {
        setCategory(cat);
        setFlashcards(cards);
        setExercises(ex);
      })
      .catch((err) => setError(err.message || 'Impossible de charger les cartes'))
      .finally(() => setLoading(false));
  }, [id]);

  const cardsBySource = useMemo(() => ({
    cards: flashcards.map(toCard),
    quiz: exercises.map(exerciseToCard),
    all: [...flashcards.map(toCard), ...exercises.map(exerciseToCard)],
  }), [flashcards, exercises]);

  const deck = cardsBySource[source];

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-neutral-500">Chargement...</div>;
  }

  if (error || !category) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-red-600 mb-4">{error || 'Catégorie introuvable'}</p>
        <Link to="/" className="text-emerald-700 font-medium">← Retour à l'accueil</Link>
      </div>
    );
  }

  const colors = getCategoryColorClasses(category.color);

  const sourceOptions: { value: Source; label: string; count: number }[] = [
    { value: 'cards', label: 'Mes cartes', count: cardsBySource.cards.length },
    { value: 'quiz', label: 'Questions du quiz', count: cardsBySource.quiz.length },
    { value: 'all', label: 'Tout', count: cardsBySource.all.length },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to={`/category/${category.id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800 mb-4 inline-block transition-colors"
      >
        ← {category.name}
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
        <h1 className="text-2xl font-bold text-neutral-900">Flashcards  {category.name}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-1">Source</span>
        {sourceOptions.map((option) => {
          const active = source === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSearchParams({ source: option.value }, { replace: true })}
              disabled={option.count === 0}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                active ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {option.label}
              <span className={active ? 'text-neutral-400 ml-1.5' : 'text-neutral-400 ml-1.5'}>{option.count}</span>
            </button>
          );
        })}
      </div>

      {deck.length === 0 ? (
        <p className="text-neutral-500">Aucune carte dans cette source.</p>
      ) : (
        // Remounting on source change resets the flip, the verdicts and the
        // shuffle in one go, instead of threading a reset through the deck.
        <FlashcardDeck key={source} cards={deck} accentDot={colors.dot} />
      )}
    </div>
  );
}
