const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('infrawatch_token');
  }
  return null;
};

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      // Token expired or invalid
      localStorage.removeItem('infrawatch_token');
      localStorage.removeItem('infrawatch_user');
      window.location.href = '/login';
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API error: ${res.statusText}`);
  }

  return data;
}

export async function downloadAuthenticatedFile(endpoint: string, filename: string) {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Download failed: ${res.statusText}`);
  }
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const api = {
  // Auth
  login: (credentials: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi('/auth/me'),
  updateProfile: (data: any) => fetchApi('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Projects
  getProjects: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchApi(`/projects?${q}`);
  },
  getProjectById: (id: string) => fetchApi(`/projects/${id}`),
  createProject: (data: any) => fetchApi('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => fetchApi(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetchApi(`/projects/${id}`, { method: 'DELETE' }),

  // Monitoring
  getMonitoringDossier: (projectId: string) => fetchApi(`/monitoring/${projectId}`),
  submitProgressUpdate: (projectId: string, data: any) => fetchApi(`/monitoring/${projectId}/updates`, { method: 'POST', body: JSON.stringify(data) }),
  reviewProgressUpdate: (updateId: string, data: any) => fetchApi(`/monitoring/updates/${updateId}/review`, { method: 'PUT', body: JSON.stringify(data) }),

  // Analytics
  getDashboardAnalytics: () => fetchApi('/analytics/dashboard'),

  // AI Assistant
  getAiStatus: () => fetchApi('/ai/status'),
  resetTokenStats: (totalBudget?: number) =>
    fetchApi('/ai/tokens/reset', {
      method: 'POST',
      body: JSON.stringify(totalBudget ? { totalBudget } : {})
    }),
  queryAi: (data: {
    message: string;
    projectId?: string;
    image?: { data: string; mimeType: string };
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  }) => fetchApi('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
  getProjectAiAudit: (projectId: string) => fetchApi(`/ai/audit/${projectId}`),

  // Issues
  getIssues: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchApi(`/issues?${q}`);
  },
  createIssue: (data: any) => fetchApi('/issues', { method: 'POST', body: JSON.stringify(data) }),
  updateIssue: (id: string, data: any) => fetchApi(`/issues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Milestones
  getMilestones: (projectId?: string) => fetchApi(`/milestones${projectId ? `?projectId=${projectId}` : ''}`),
  createMilestone: (data: any) => fetchApi('/milestones', { method: 'POST', body: JSON.stringify(data) }),
  updateMilestone: (id: string, data: any) => fetchApi(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Financials
  getFinancialOverview: (projectId?: string) => fetchApi(`/financials/overview${projectId ? `?projectId=${projectId}` : ''}`),
  addExpenditure: (data: any) => fetchApi('/financials/expenditures', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getComprehensiveReport: () => fetchApi('/reports/comprehensive'),
  downloadExcelUrl: `${API_BASE_URL}/reports/export/excel`,
  downloadCsvUrl: `${API_BASE_URL}/reports/export/csv`,
  downloadExcel: () => downloadAuthenticatedFile('/reports/export/excel', 'DevFlow_Projects_Report.xlsx'),
  downloadCsv: () => downloadAuthenticatedFile('/reports/export/csv', 'DevFlow_Projects_Report.csv'),

  // Settings
  getSettings: () => fetchApi('/settings'),
  updateSettings: (data: {
    geminiApiKey?: string;
    cpiCutoff?: number;
    spiCutoff?: number;
    criticalCutoff?: number;
    emailAlerts?: boolean;
    tokenBudgetLimit?: number;
  }) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Users
  getUsers: () => fetchApi('/users'),
  updateUserRole: (userId: string, data: any) => fetchApi(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (userId: string) => fetchApi(`/users/${userId}`, { method: 'DELETE' })
};

