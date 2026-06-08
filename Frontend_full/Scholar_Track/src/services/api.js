const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('scholar_track_token');
}

function buildHeaders(auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(method, path, body = null, auth = true) {
  const opts = { method, headers: buildHeaders(auth) };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : { error: `Expected JSON from ${path}, but the server returned ${res.status}.` };

  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export const api = {
  register: (name, email, password, confirmPassword) =>
    request('POST', '/auth/register', {
      name,
      email,
      password,
      confirm_password: confirmPassword,
    }, false),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }, false),

  requestPasswordReset: (email) =>
    request('POST', '/auth/forgot-password', { email }, false),

  resetPassword: (email, code, password, confirmPassword) =>
    request('POST', '/auth/reset-password', {
      email,
      code,
      password,
      confirm_password: confirmPassword,
    }, false),

  getMe: () => request('GET', '/auth/me'),

  getTasks: () => request('GET', '/tasks'),
  createTask: (task) => request('POST', '/tasks', task),
  updateTask: (id, task) => request('PUT', `/tasks/${id}`, task),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
  batchSaveTasks: (tasks) => request('POST', '/tasks/batch', { tasks }),

  getSummary: () => request('GET', '/analytics/summary'),
  getStatus: () => request('GET', '/analytics/status'),
  getCategories: () => request('GET', '/analytics/categories'),
  getInsights: () => request('GET', '/analytics/insights'),
  getTimeline: () => request('GET', '/analytics/timeline'),

  setToken: (token) => localStorage.setItem('scholar_track_token', token),
  clearToken: () => localStorage.removeItem('scholar_track_token'),
  hasToken: () => !!localStorage.getItem('scholar_track_token'),
};
