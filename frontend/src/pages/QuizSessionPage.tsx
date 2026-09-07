import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import type { Exercise } from '../types';
import { gradeExercise, type Response } from '../utils/grade';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { ExerciseCard } from '../components/exercise/ExerciseCard';
import { ResultsSummary, type AnsweredExercise } from '../components/quiz/ResultsSummary';

interface LocationState {
  exercises: Exercise[];
  categoryName: string;
}

export function QuizSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnsweredExercise[]>([]);
  const [finished, setFinished] = useState(false);

  if (!state || !state.exercises || state.exercises.length === 0) {
    return <Navigate to="/" replace />;
  }

  const { exercises, categoryName } = state;
  const current = exercises[index];

  function commit(response: Response) {
    if (revealed) return;
    setRevealed(true);
    setAnswers((prev) => [...prev, { exercise: current, grade: gradeExercise(current, response) }]);
  }

  function handleNext() {
    if (index + 1 >= exercises.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  function handleRestart() {
    setIndex(0);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <p className="text-sm text-neutral-500 mb-4">{categoryName}</p>

      {finished ? (
        <ResultsSummary
          answers={answers}
          onRestart={handleRestart}
          onHome={() => navigate('/')}
        />
      ) : (
        <>
          <ProgressBar current={index} total={exercises.length} />
          <ExerciseCard
            key={`${index}-${current.id}`}
            exercise={current}
            revealed={revealed}
            onCommit={commit}
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!revealed}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {index + 1 >= exercises.length ? 'Voir les résultats' : 'Suivant →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
