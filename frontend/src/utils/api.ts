import type { Category, QuestionBrief, Question, Flashcard } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// The API is read-only and public: no auth token, no writes.
async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

export const categoriesApi = {
  list: (): Promise<Category[]> => request('/categories'),
  get: (id: number): Promise<Category> => request(`/categories/${id}`),
  lesson: (id: number): Promise<{ lesson: string | null }> => request(`/categories/${id}/lesson`),
};

export const questionsApi = {
  brief: (categoryId: number): Promise<QuestionBrief[]> =>
    request(`/questions?category_id=${categoryId}`),

  quiz: (params: { category_id: number } | { ids: number[] }): Promise<Question[]> => {
    if ('category_id' in params) {
      return request(`/questions/quiz?category_id=${params.category_id}`);
    }
    return request(`/questions/quiz?ids=${params.ids.join(',')}`);
  },

  get: (id: number): Promise<Question> => request(`/questions/${id}`),
};

export const flashcardsApi = {
  list: (categoryId: number): Promise<Flashcard[]> =>
    request(`/flashcards?category_id=${categoryId}`),
};
