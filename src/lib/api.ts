const BASE_URL = '';

async function getToken(): Promise<string | null> {
  try {
    const stored = localStorage.getItem('mudaris_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    }
  } catch { /* ignore */ }
  return null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const isLoginRequest = endpoint === '/api/auth/login';
    if (!isLoginRequest) {
      localStorage.removeItem('mudaris_auth');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error('Sesi habis. Silakan login ulang.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || body.details || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => apiFetch<{ user: any }>('/api/auth/me'),
};

// Pipeline
export const pipelineApi = {
  create: (input: any) =>
    apiFetch<{ pipeline: any }>('/api/pipeline/create', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  generateAnalisisCP: (pipelineId: number, input: any) =>
    apiFetch<{ analisisCP: any }>('/api/pipeline/generate-analisis-cp', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, ...input }),
    }),

  generateTP: (pipelineId: number, analisisCP: any) =>
    apiFetch<{ tp: any }>('/api/pipeline/generate-tp', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, analisisCP }),
    }),

  generateATP: (pipelineId: number, tp: any) =>
    apiFetch<{ atp: any }>('/api/pipeline/generate-atp', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, tp }),
    }),

  generateProtaProsem: (pipelineId: number, data: any) =>
    apiFetch<{ protaProsem: any }>('/api/pipeline/generate-prota-prosem', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, ...data }),
    }),

  generateModulAjar: (pipelineId: number, data: any) =>
    apiFetch<{ modulAjar: any }>('/api/pipeline/generate-modul-ajar', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, ...data }),
    }),

  generateLKPD: (pipelineId: number, data: any) =>
    apiFetch<{ lkpd: any }>('/api/pipeline/generate-lkpd', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, ...data }),
    }),

  generateAssessmentRubrik: (pipelineId: number, data: any) =>
    apiFetch<{ asesmenRubrik: any }>('/api/pipeline/generate-assessment-rubrik', {
      method: 'POST',
      body: JSON.stringify({ pipelineId, ...data }),
    }),

  getPipeline: (id: number) =>
    apiFetch<{ pipeline: any }>(`/api/pipeline/${id}`),

  listPipeline: () =>
    apiFetch<{ pipelines: any[] }>('/api/pipeline'),

  updatePipeline: (id: number, data: any) =>
    apiFetch<{ pipeline: any }>(`/api/pipeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePipeline: (id: number) =>
    apiFetch<{ success: boolean }>(`/api/pipeline/${id}`, {
      method: 'DELETE',
    }),
};

// Users (admin only)
export const usersApi = {
  list: () =>
    apiFetch<{ users: any[] }>('/api/users'),
  create: (data: any) =>
    apiFetch<{ user: any }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch<{ user: any }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),
};
