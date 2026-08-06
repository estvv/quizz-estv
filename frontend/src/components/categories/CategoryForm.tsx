import { useState } from 'react';
import { CATEGORY_COLOR_TOKENS, getCategoryColorClasses } from '../../utils/colors';
import type { Category } from '../../types';

interface Props {
  initial?: Pick<Category, 'name' | 'color' | 'parent_id'>;
  parentOptions: Category[];
  onSubmit: (input: { name: string; color: string; parent_id: number | null }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial, parentOptions, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? 'slate');
  const [parentId, setParentId] = useState<number | null>(initial?.parent_id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), color, parent_id: parentId });
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nom</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Réseaux"
          className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Couleur</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_COLOR_TOKENS.map((token) => {
            const c = getCategoryColorClasses(token);
            const active = color === token;
            return (
              <button
                key={token}
                type="button"
                onClick={() => setColor(token)}
                title={token}
                className={`w-7 h-7 rounded-full ${c.solid} transition-transform ${
                  active ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : 'hover:scale-105'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Catégorie parente</label>
        <select
          value={parentId ?? ''}
          onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
          className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:border-neutral-500"
        >
          <option value="">Aucune (niveau supérieur)</option>
          {parentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-white transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
