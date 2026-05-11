import api from './axiosInstance';

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  getMe:    ()      => api.get('/auth/me'),
};

// ── Exams ─────────────────────────────────────────────────────────────────
export const examAPI = {
  getAll:   ()          => api.get('/exams'),
  getById:  (id)        => api.get(`/exams/${id}`),
  create:   (data)      => api.post('/exams', data),
  update:   (id, data)  => api.patch(`/exams/${id}`, data),
  remove:   (id)        => api.delete(`/exams/${id}`),
  publish:  (id)        => api.patch(`/exams/${id}`, { isPublished: true }),
  unpublish:(id)        => api.patch(`/exams/${id}`, { isPublished: false }),
};

// ── Questions ─────────────────────────────────────────────────────────────
export const questionAPI = {
  getAll:  ()      => api.get('/questions'),
  create:  (data)  => api.post('/questions', data),
  remove:  (id)    => api.delete(`/questions/${id}`),
};

// ── Attempts ──────────────────────────────────────────────────────────────
export const attemptAPI = {
  submit:    (data)  => api.post('/attempts', data),
  getMyAll:  ()      => api.get('/attempts/my'),
  getById:   (id)    => api.get(`/attempts/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  leaderboard: (examId) => api.get(`/analytics/leaderboard/${examId}`),
  insights:    ()       => api.get('/analytics/insights'),
  summary:     ()       => api.get('/analytics/summary'),
};
