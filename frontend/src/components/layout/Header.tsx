import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-neutral-900">Quizz</Link>
        <Link to="/login" className="text-xs text-neutral-400 hover:text-neutral-600">
          Admin
        </Link>
      </div>
    </header>
  );
}
