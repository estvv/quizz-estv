import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import type { Choice, Question } from '../types';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { ResultsSummary, type AnsweredQuestion } from '../components/quiz/ResultsSummary';

interface LocationState {
  questions: Question[];
  categoryName: string;
}

export function QuizSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [finished, setFinished] = useState(false);

  if (!state || !state.questions || state.questions.length === 0) {
    return <Navigate to="/" replace />;
  }

  const { questions, categoryName } = state;
  const currentQuestion = questions[index];

  function handleAnswer(choice: Choice) {
    const question = questions[index];
    const correct = choice === question.correct_choice;
    setChosen(choice);
    setRevealed(true);
    setAnswers((prev) => [...prev, { question, chosen: choice, correct }]);
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setChosen(null);
    setRevealed(false);
  }

  function handleRestart() {
    setIndex(0);
    setChosen(null);
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
          <ProgressBar current={index} total={questions.length} />
          <QuestionCard
            question={currentQuestion}
            chosen={chosen}
            revealed={revealed}
            onAnswer={handleAnswer}
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!revealed}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {index + 1 >= questions.length ? 'Voir les résultats' : 'Suivant →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
