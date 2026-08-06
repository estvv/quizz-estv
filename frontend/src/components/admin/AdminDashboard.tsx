import { useEffect, useState } from 'react';
import type { Category, Question } from '../../types';
import { categoriesApi, questionsApi, type QuestionInput } from '../../utils/api';
import { getCategoryColorClasses } from '../../utils/colors';
import { CategoryForm } from '../categories/CategoryForm';
import { QuestionForm } from '../questions/QuestionForm';
import { logout } from '../../utils/auth';

type CategoryEditTarget = 'new' | number | null;
type QuestionEditTarget = 'new' | number | null;

export function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');

  const [categoryEdit, setCategoryEdit] = useState<CategoryEditTarget>(null);
  const [questionEdit, setQuestionEdit] = useState<QuestionEditTarget>(null);

  function loadCategories() {
    categoriesApi.list()
      .then((cats) => {
        setCategories(cats);
        if (selectedCategoryId === null && cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }

  useEffect(loadCategories, []);

  useEffect(() => {
    if (selectedCategoryId === null) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    questionsApi.quiz({ category_id: selectedCategoryId })
      .then(setQuestions)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingQuestions(false));
  }, [selectedCategoryId]);

  function reloadQuestions() {
    if (selectedCategoryId === null) return;
    questionsApi.quiz({ category_id: selectedCategoryId }).then(setQuestions);
  }

  async function handleCreateCategory(input: { name: string; color: string; parent_id: number | null }) {
    const created = await categoriesApi.create(input);
    setCategoryEdit(null);
    loadCategories();
    setSelectedCategoryId(created.id);
  }

  async function handleUpdateCategory(id: number, input: { name: string; color: string; parent_id: number | null }) {
    await categoriesApi.update(id, input);
    setCategoryEdit(null);
    loadCategories();
  }

  // Only top-level categories are valid parents (max two levels), and a category
  // can't be its own parent.
  function parentOptionsFor(excludeId: number | null) {
    return categories.filter((c) => c.parent_id === null && c.id !== excludeId);
  }

  function renderCategoryRow(cat: Category, indented: boolean) {
    const colors = getCategoryColorClasses(cat.color);
    if (categoryEdit === cat.id) {
      return (
        <div key={cat.id} className={`p-3 ${indented ? 'pl-7' : ''}`}>
          <CategoryForm
            initial={cat}
            parentOptions={parentOptionsFor(cat.id)}
            onSubmit={(input) => handleUpdateCategory(cat.id, input)}
            onCancel={() => setCategoryEdit(null)}
          />
        </div>
      );
    }
    return (
      <div
        key={cat.id}
        className={`flex items-center justify-between px-3 py-2.5 cursor-pointer ${indented ? 'pl-7' : ''} ${
          selectedCategoryId === cat.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'
        }`}
        onClick={() => setSelectedCategoryId(cat.id)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {indented && <span className="text-neutral-300 shrink-0">└</span>}
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />
          <span className="text-sm text-neutral-800 truncate">{cat.name}</span>
          <span className="text-xs text-neutral-400 shrink-0">({cat.question_count})</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setCategoryEdit(cat.id); }}
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            Éditer
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
            className="text-xs text-neutral-400 hover:text-red-600"
          >
            Suppr.
          </button>
        </div>
      </div>
    );
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm('Supprimer cette catégorie et toutes ses questions ?')) return;
    await categoriesApi.delete(id);
    if (selectedCategoryId === id) setSelectedCategoryId(null);
    loadCategories();
  }

  async function handleCreateQuestion(input: QuestionInput) {
    await questionsApi.create(input);
    setQuestionEdit(null);
    reloadQuestions();
    loadCategories();
  }

  async function handleUpdateQuestion(id: number, input: QuestionInput) {
    await questionsApi.update(id, input);
    setQuestionEdit(null);
    reloadQuestions();
  }

  async function handleDeleteQuestion(id: number) {
    if (!confirm('Supprimer cette question ?')) return;
    await questionsApi.delete(id);
    reloadQuestions();
    loadCategories();
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Administration</h1>
        <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-800">
          Se déconnecter
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left pane: categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Catégories</h2>
            <button
              onClick={() => setCategoryEdit('new')}
              className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
            >
              + Nouvelle
            </button>
          </div>

          {categoryEdit === 'new' && (
            <div className="mb-3">
              <CategoryForm
                parentOptions={parentOptionsFor(null)}
                onSubmit={handleCreateCategory}
                onCancel={() => setCategoryEdit(null)}
              />
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
            {categories
              .filter((cat) => cat.parent_id === null)
              .map((cat) => {
                const children = categories.filter((c) => c.parent_id === cat.id);
                return (
                  <div key={cat.id}>
                    {renderCategoryRow(cat, false)}
                    {children.map((child) => renderCategoryRow(child, true))}
                  </div>
                );
              })}
            {categories.length === 0 && (
              <p className="px-3 py-4 text-sm text-neutral-400">Aucune catégorie.</p>
            )}
          </div>
        </div>

        {/* Right pane: questions of selected category */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              Questions {selectedCategory ? ` ${selectedCategory.name}` : ''}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setQuestionEdit('new')}
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
              >
                + Nouvelle question
              </button>
            )}
          </div>

          {!selectedCategory && (
            <p className="text-sm text-neutral-400">Sélectionne une catégorie à gauche.</p>
          )}

          {selectedCategory && (
            <>
              {questionEdit === 'new' && (
                <div className="mb-3">
                  <QuestionForm
                    categoryId={selectedCategory.id}
                    onSubmit={handleCreateQuestion}
                    onCancel={() => setQuestionEdit(null)}
                  />
                </div>
              )}

              {loadingQuestions ? (
                <p className="text-sm text-neutral-400">Chargement...</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q.id}>
                      {questionEdit === q.id ? (
                        <QuestionForm
                          categoryId={selectedCategory.id}
                          initial={q}
                          onSubmit={(input) => handleUpdateQuestion(q.id, input)}
                          onCancel={() => setQuestionEdit(null)}
                        />
                      ) : (
                        <div className="p-3 rounded-lg border border-neutral-200 bg-white flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-neutral-800">{q.question_text}</p>
                            <p className="text-xs text-neutral-400 mt-1">
                              Bonne réponse : {q.correct_choice}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setQuestionEdit(q.id)}
                              className="text-xs text-neutral-400 hover:text-neutral-700"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-xs text-neutral-400 hover:text-red-600"
                            >
                              Suppr.
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <p className="text-sm text-neutral-400">Aucune question dans cette catégorie.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
