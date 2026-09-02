import { useMemo, useState } from 'react';
import type { StudyCard } from '../../types';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Props {
  cards: StudyCard[];
  accentDot: string;
}

// Verdicts stay in component state and are never sent anywhere: the app tracks no
// attempt history by design (see documentation/ARCHITECTURE.md), same as the quiz.
export function FlashcardDeck({ cards, accentDot }: Props) {
  const [deck, setDeck] = useState<StudyCard[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<StudyCard[]>([]);
  const [knownCount, setKnownCount] = useState(0);

  const finished = index >= deck.length;
  const card = finished ? null : deck[index];
  const progress = useMemo(
    () => (deck.length === 0 ? 0 : Math.round((index / deck.length) * 100)),
    [index, deck.length]
  );

  function restart(next: StudyCard[]) {
    setDeck(next);
    setIndex(0);
    setFlipped(false);
    setMissed([]);
    setKnownCount(0);
  }

  function answer(known: boolean) {
    if (!card) return;
    if (known) setKnownCount((c) => c + 1);
    else setMissed((m) => [...m, card]);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (finished) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Terminé</p>
        <p className="text-4xl font-bold text-neutral-900 mb-1">
          {knownCount} <span className="text-neutral-300">/</span> {deck.length}
        </p>
        <p className="text-sm text-neutral-500 mb-6">
          {missed.length === 0
            ? 'Tout su, rien à revoir.'
            : `${missed.length} carte${missed.length > 1 ? 's' : ''} à revoir.`}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {missed.length > 0 && (
            <button
              onClick={() => restart(missed)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Rejouer les ratées ({missed.length})
            </button>
          )}
          <button
            onClick={() => restart(cards)}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Tout reprendre
          </button>
          <button
            onClick={() => restart(shuffle(cards))}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Mélanger
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full bg-neutral-900 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-neutral-400 shrink-0">{index + 1} / {deck.length}</span>
        <button
          onClick={() => restart(shuffle(deck))}
          className="text-xs text-neutral-400 hover:text-neutral-700 shrink-0 transition-colors"
        >
          Mélanger
        </button>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="w-full min-h-64 p-8 mb-4 rounded-lg border border-neutral-200 bg-white text-left hover:border-neutral-300 transition-colors flex flex-col"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${accentDot}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {flipped ? 'Verso' : 'Recto'}
          </span>
        </div>
        <p className="text-lg text-neutral-900 whitespace-pre-wrap flex-1">
          {flipped ? card!.back : card!.front}
        </p>
        {!flipped && (
          <span className="mt-4 text-sm text-neutral-400">Clique pour retourner</span>
        )}
      </button>

      {flipped ? (
        <div className="flex gap-2">
          <button
            onClick={() => answer(false)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Pas su
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Su
          </button>
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
        >
          Retourner
        </button>
      )}
    </>
  );
}
