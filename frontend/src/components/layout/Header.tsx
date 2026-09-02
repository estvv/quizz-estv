import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
        <Link to="/" className="font-semibold text-neutral-900">Quizz</Link>
      </div>
    </header>
  );
}
