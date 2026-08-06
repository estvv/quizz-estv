import type { Category, QuestionBrief, Question } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Public request: no auth token attached, no redirect on 401. Used for reads.
async function publicRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

// Authenticated request: attaches Bearer token, surfaces auth errors to caller.
async function authRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const err = new Error('Authentication required');
    (err as any).status = 401;
    throw err;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

export const categoriesApi = {
  list: (): Promise<Category[]> => publicRequest('/categories'),
  get: (id: number): Promise<Category> => publicRequest(`/categories/${id}`),

  create: (input: { name: string; color: string; parent_id?: number | null }): Promise<Category> =>
    authRequest('/categories', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, updates: Partial<{ name: string; color: string; parent_id: number | null }>): Promise<Category> =>
    authRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id: number): Promise<void> => authRequest(`/categories/${id}`, { method: 'DELETE' }),
};

export interface QuestionInput {
  category_id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: 'A' | 'B' | 'C' | 'D';
  explanation?: string | null;
  diagram_svg?: string | null;
}

export const questionsApi = {
  brief: (categoryId: number): Promise<QuestionBrief[]> =>
    publicRequest(`/questions?category_id=${categoryId}`),

  quiz: (params: { category_id: number } | { ids: number[] }): Promise<Question[]> => {
    if ('category_id' in params) {
      return publicRequest(`/questions/quiz?category_id=${params.category_id}`);
    }
    return publicRequest(`/questions/quiz?ids=${params.ids.join(',')}`);
  },

  get: (id: number): Promise<Question> => publicRequest(`/questions/${id}`),

  create: (input: QuestionInput): Promise<Question> =>
    authRequest('/questions', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, updates: Partial<QuestionInput>): Promise<Question> =>
    authRequest(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id: number): Promise<void> => authRequest(`/questions/${id}`, { method: 'DELETE' }),
};
