import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Menu ────────────────────────────────────────────────────────────────────
export const menuApi = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/availability`),
};

// ─── Cart ────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  add: (foodItemId, quantity = 1) => api.post('/cart/add', { foodItemId, quantity }),
  update: (foodItemId, quantity) => api.put('/cart/update', { foodItemId, quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  trackByToken: (token) => api.get(`/orders/track/${token}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  getPickupSlots: () => api.get('/ai/pickup-slots'),
  getRecommendations: () => api.get('/ai/recommendations'),
  getKitchenPredictions: () => api.get('/ai/kitchen-predictions'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getKitchenQueue: () => api.get('/admin/kitchen-queue'),
  getAnalytics: (days) => api.get('/admin/analytics', { params: { days } }),
  getAIPredictions: () => api.get('/admin/ai-predictions'),
  // Menu
  getMenu: (params) => api.get('/admin/menu', { params }),
  createMenuItem: (data) => api.post('/admin/menu', data),
  updateMenuItem: (id, data) => api.put(`/admin/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/admin/menu/${id}`),
  toggleMenuItemAvailability: (id) => api.patch(`/admin/menu/${id}/availability`),
};

export default api;
