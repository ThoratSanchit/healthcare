import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://helth-42uq.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const appointmentService = {
  // Get appointments
  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/appointments?${queryString}`);
    return response.data;
  },

  // Get single appointment
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Get available slots
  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/appointments/slots/available?doctor=${doctorId}&date=${date}`);
    return response.data;
  },

  // Rate appointment
  rateAppointment: async (id, rating) => {
    const response = await api.put(`/appointments/${id}/rate`, rating);
    return response.data;
  },
};

export default appointmentService;
