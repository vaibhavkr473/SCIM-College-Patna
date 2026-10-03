const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('scim_token');
}

function setToken(token) {
  if (token) localStorage.setItem('scim_token', token);
  else localStorage.removeItem('scim_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}${path}`, opts);
    if (res.status === 401) {
      setToken(null);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check your connection.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  getSession: () => request('GET', '/auth/session'),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),
  resetPassword: (email, otp_code, new_password) => request('POST', '/auth/reset-password', { email, otp_code, new_password }),

  // Admin
  getStudents: () => request('GET', '/admin/students'),
  createStudent: (data) => request('POST', '/admin/create-student', data),
  getMembers: () => request('GET', '/admin/members'),
  createMember: (data) => request('POST', '/admin/create-member', data),
  getStats: () => request('GET', '/admin/stats'),

  // Notices
  getNotices: (activeOnly) => request('GET', `/notices${activeOnly ? '?active_only=true' : ''}`),
  createNotice: (data) => request('POST', '/notices', data),
  updateNotice: (id, data) => request('PUT', `/notices/${id}`, data),
  deleteNotice: (id) => request('DELETE', `/notices/${id}`),

  // Materials
  getMaterials: (course, semester) => {
    const params = new URLSearchParams();
    if (course) params.append('course', course);
    if (semester) params.append('semester', semester);
    const qs = params.toString();
    return request('GET', `/materials${qs ? `?${qs}` : ''}`);
  },
  getMaterial: (id) => request('GET', `/materials/${id}`),
  createMaterial: (data) => request('POST', '/materials', data),
  deleteMaterial: (id) => request('DELETE', `/materials/${id}`),

  // Tests
  getTests: (course, semester, isActive) => {
    const params = new URLSearchParams();
    if (course) params.append('course', course);
    if (semester) params.append('semester', semester);
    if (isActive !== undefined) params.append('is_active', isActive);
    const qs = params.toString();
    return request('GET', `/tests${qs ? `?${qs}` : ''}`);
  },
  getTest: (id) => request('GET', `/tests/${id}`),
  createTest: (data) => request('POST', '/tests', data),
  updateTest: (id, data) => request('PUT', `/tests/${id}`, data),
  deleteTest: (id) => request('DELETE', `/tests/${id}`),

  // Submissions
  getSubmissions: () => request('GET', '/submissions'),
  getStudentSubmissions: (studentId) => request('GET', `/submissions/student/${studentId}`),
  submitTest: (data) => request('POST', '/submissions', data),

  // Doubts
  getDoubts: () => request('GET', '/doubts'),
  createDoubt: (data) => request('POST', '/doubts', data),
  updateDoubt: (id, data) => request('PUT', `/doubts/${id}`, data),
  getDoubtResponses: (doubtId) => request('GET', `/doubts/${doubtId}/responses`),
  replyDoubt: (doubtId, response_text) => request('POST', `/doubts/${doubtId}/responses`, { response_text }),

  // Calendar
  getEvents: () => request('GET', '/calendar'),
  createEvent: (data) => request('POST', '/calendar', data),
  deleteEvent: (id) => request('DELETE', `/calendar/${id}`),

  // Feedback
  submitFeedback: (data) => request('POST', '/feedback', data),
  getFeedback: () => request('GET', '/feedback'),
  updateFeedback: (id, data) => request('PUT', `/feedback/${id}`, data),
  deleteFeedback: (id) => request('DELETE', `/feedback/${id}`),

  // Bookmarks
  getBookmarks: () => request('GET', '/bookmarks'),
  addBookmark: (material_id) => request('POST', '/bookmarks', { material_id }),
  removeBookmark: (material_id) => request('DELETE', `/bookmarks/${material_id}`),

  // AI Tutor
  askTutor: (data) => request('POST', '/ai-tutor', data),

  // Token management
  setToken,
  getToken,
};
