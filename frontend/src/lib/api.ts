import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminApi = {
  // Get all users
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id: string, role: 'user' | 'admin') => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get all tasks (admin view)
  getAllTasks: async (params?: { page?: number; limit?: number; status?: string; userId?: string }) => {
    const response = await api.get('/admin/tasks', { params });
    return response.data;
  },

  // Get tasks by user
  getTasksByUser: async (userId: string) => {
    const response = await api.get(`/admin/tasks/user/${userId}`);
    return response.data;
  },

  // Get platform statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};

export default api;
