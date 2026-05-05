import axios from 'axios';

const rawBase =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = rawBase.replace(/\/+$/, '');

// Create axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — session expiry on protected routes only.
// Login/register return 401 for bad credentials; must not redirect or clear storage then.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String(error.config?.url || '');
    const isAuthAttempt =
      reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User API calls
export const userAPI = {
  getQueues: () => api.get('/users/queues'),
  getNearbyQueues: (params) => api.get('/users/queues/nearby', { params }),
  joinQueue: (queueId) => api.post(`/users/queues/${queueId}/join`),
  joinQueueViaQR: (token) => api.post(`/qr/${token}/join`),
  leaveQueue: (queueId) => api.delete(`/users/queues/${queueId}/leave`),
  getMyPosition: () => api.get('/users/my-position'),
  getHistory: () => api.get('/users/history'),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  createQueue: (data) => api.post('/admin/queues', data),
  deleteQueue: (queueId) => api.delete(`/admin/queues/${queueId}`),
  callNextCustomer: (queueId) => api.post(`/admin/queues/${queueId}/call-next`),
  completeCustomer: (queueId, entryId) =>
    api.post(`/admin/queues/${queueId}/complete/${entryId}`),
  pauseQueue: (queueId) => api.post(`/admin/queues/${queueId}/pause`),
  resumeQueue: (queueId) => api.post(`/admin/queues/${queueId}/resume`),
  removeCustomer: (queueId, entryId) =>
    api.delete(`/admin/queues/${queueId}/customers/${entryId}`),
  getQueueCustomers: (queueId) => api.get(`/admin/queues/${queueId}/customers`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  generateQueueJoinQR: (queueId) => api.post(`/qr/queues/${queueId}/generate`),
};

// Public queue API calls
export const queueAPI = {
  getAll: () => api.get('/queues'),
  getById: (id) => api.get(`/queues/${id}`),
  getWaitTime: (queueId) => api.get(`/queues/${queueId}/wait-time`),
  getStats: (queueId) => api.get(`/queues/${queueId}/stats`),
  getQRQueueDetails: (token) => api.get(`/qr/${token}/details`),
};

// AI API calls
export const aiAPI = {
  predictWaitTime: (data) => api.post('/ai/predict-wait-time', data),
  notifyUser: (data) => api.post('/ai/notify-user', data),
  generateQR: (data) => api.post('/ai/generate-qr', data),
  getMyQR: () => api.get('/ai/my-qr'),
  scanQR: (data) => api.post('/ai/scan-qr', data),
  checkinAdminQR: (data) => api.post('/ai/checkin-admin-qr', data),
  chatbot: (data) => api.post('/ai/chatbot', data),
  getChatHistory: () => api.get('/ai/chat-history'),
  recommendTime: (queueId) => api.get(`/ai/recommend-time/${queueId}`),
  updateLocation: (data) => api.post('/ai/location', data),
};

export default api;
