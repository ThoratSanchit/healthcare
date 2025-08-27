import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://helth-42uq.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/analytics?${queryString}`);
    return response.data;
  },

  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users?${queryString}`);
    return response.data;
  },

  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/appointments?${queryString}`);
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  createDoctor: async (data) => {
    const response = await api.post('/admin/doctors', data);
    return response.data;
  },

  createPatient: async (data) => {
    const response = await api.post('/admin/patients', data);
    return response.data;
  },
};

export default adminService;
