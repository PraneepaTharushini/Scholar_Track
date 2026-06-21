const BASE_URL = '/api';
const AUTH_EXPIRED_EVENT = 'scholar-track-auth-expired';

function getToken() {
  return localStorage.getItem('scholar_track_token');
}

function clearToken() {
  localStorage.removeItem('scholar_track_token');
}

function decodeJwtPayload(token) {
  const payload = token?.split('.')?.[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

function hasValidToken() {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}

function notifyAuthExpired() {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
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
  if (auth && !hasValidToken()) {
    clearToken();
    notifyAuthExpired();
    throw new Error('Your session has expired. Please sign in again.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  const opts = { method, headers: buildHeaders(auth), signal: controller.signal };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, opts);
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : { error: `Expected JSON from ${path}, but the server returned ${res.status}.` };

    if (res.status === 401) {
      clearToken();
      notifyAuthExpired();
    }

    if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${path} timed out. Please check your connection.`);
    }
    throw err;
  }
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
  getRecommendations: () => request('GET', '/analytics/recommendations'),
  incrementTaskFocus: (taskId) => request('POST', `/tasks/${taskId}/focus`),

  // Combined fetch for AnalyticsDashboard — calls all endpoints in parallel
  getAnalyticsAll: async () => {
    const [summaryRes, statusRes, categoriesRes, insightsRes] = await Promise.all([
      request('GET', '/analytics/summary'),
      request('GET', '/analytics/status'),
      request('GET', '/analytics/categories'),
      request('GET', '/analytics/insights'),
    ]);
    return {
      summary:    summaryRes,
      status:     statusRes.status     || [],
      categories: categoriesRes.categories || [],
      insights:   insightsRes.insights  || [],
    };
  },

  // Batch save tasks from Review Tasks page
  batchSaveTasks: (tasks) => request('POST', '/tasks/batch', { tasks }),

  setToken: (token) => localStorage.setItem('scholar_track_token', token),
  clearToken,
  hasToken: () => !!getToken(),
  hasValidToken,
  authExpiredEvent: AUTH_EXPIRED_EVENT,
};
