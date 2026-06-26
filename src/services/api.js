const BASE_URL = '/api';

/** Read JWT from localStorage */
function getToken() {
  return localStorage.getItem('scholar_track_token');
}

/** Build headers, optionally with Authorization */
function buildHeaders(auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Core request wrapper */
async function request(method, path, body = null, auth = true) {
  const opts = { method, headers: buildHeaders(auth) };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export const api = {
  // ── Auth ─────────────────────────────────────────────────
  register: (name, email, password) =>
    request('POST', '/auth/register', { name, email, password }, false),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }, false),

  getMe: () => request('GET', '/auth/me'),

  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }, false),

  resetPassword: (email, code, password, confirm_password) =>
    request('POST', '/auth/reset-password', { email, code, password, confirm_password }, false),

  // ── Tasks ────────────────────────────────────────────────
  getTasks: () => request('GET', '/tasks'),

  createTask: (task) => request('POST', '/tasks', task),

  updateTask: (id, task) => request('PUT', `/tasks/${id}`, task),

  deleteTask: (id) => request('DELETE', `/tasks/${id}`),

  /** Save multiple tasks at once — used by "Confirm & Save" */
  batchSaveTasks: (tasks) => request('POST', '/tasks/batch', { tasks }),

  /** Increment focus sessions count for a task */
  incrementTaskFocus: (id) => request('POST', `/tasks/${id}/focus`),

  // ── Analytics ────────────────────────────────────────────
  getSummary:    () => request('GET', '/analytics/summary'),
  getStatus:     () => request('GET', '/analytics/status'),
  getCategories: () => request('GET', '/analytics/categories'),
  getInsights:   () => request('GET', '/analytics/insights'),
  getTimeline:   () => request('GET', '/analytics/timeline'),
  getAnalyticsAll: () => request('GET', '/analytics/all'),

  // ── Priority & Recommendations ───────────────────────────
  scoreAllTasks:      () => request('POST', '/priority/score-all'),
  getRecommendations: () => request('GET', '/priority/recommendations'),
  scoreTask:          (task) => request('POST', '/priority/score-task', task),
  getQuadrants:       () => request('GET', '/priority/quadrants'),

  // ── Token management ─────────────────────────────────────
  setToken:   (token) => localStorage.setItem('scholar_track_token', token),
  clearToken: ()      => localStorage.removeItem('scholar_track_token'),
  hasToken:   ()      => !!localStorage.getItem('scholar_track_token'),
};
