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

const patientService = {
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  updateMedicalHistory: async (data) => {
    const response = await api.put('/patients/medical-history', data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/patients/stats/dashboard');
    return response.data;
  },
};

export default patientService;
