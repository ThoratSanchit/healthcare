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

const doctorService = {
  getDoctors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/doctors?${queryString}`);
    return response.data;
  },

  getDoctor: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  updateAvailability: async (availability) => {
    const response = await api.put('/doctors/availability', { availability });
    return response.data;
  },

  getDoctorStats: async () => {
    const response = await api.get('/doctors/stats/dashboard');
    return response.data;
  },
};

export default doctorService;
