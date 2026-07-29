import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../../utils/auth';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await login(password);
      setToken(token);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Mot de passe invalide');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin</h1>
          <p className="text-neutral-600">Connecte-toi pour gérer les catégories et questions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
            autoFocus
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
