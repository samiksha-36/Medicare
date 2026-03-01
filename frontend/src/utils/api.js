import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// Response interceptor - handle 401
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data)
};

// Doctor APIs
export const doctorAPI = {
  getAll: (params) => API.get('/doctors', { params }),
  getOne: (id) => API.get(`/doctors/${id}`),
  create: (data) => API.post('/doctors', data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  delete: (id) => API.delete(`/doctors/${id}`),
  getAppointments: (id = 'me') => API.get(`/doctors/${id}/appointments`)
};

// Appointment APIs
export const appointmentAPI = {
  book: (data) => API.post('/appointments', data),
  getAll: (params) => API.get('/appointments', { params }),
  getOne: (id) => API.get(`/appointments/${id}`),
  updateStatus: (id, data) => API.put(`/appointments/${id}/status`, data),
  cancel: (id) => API.put(`/appointments/${id}/cancel`),
  getAnalytics: () => API.get('/appointments/analytics')
};

// Prescription APIs
export const prescriptionAPI = {
  create: (data) => API.post('/prescriptions', data),
  getAll: () => API.get('/prescriptions'),
  getOne: (id) => API.get(`/prescriptions/${id}`),
  saveAiExplanation: (id, data) => API.put(`/prescriptions/${id}/ai-explanation`, data)
};

// User APIs (admin)
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getOne: (id) => API.get(`/users/${id}`),
  updateStatus: (id, data) => API.put(`/users/${id}/status`, data),
  delete: (id) => API.delete(`/users/${id}`)
};

// AI APIs
export const aiAPI = {
  symptomCheck: (data) => API.post('/ai/symptom-check', data),
  explainPrescription: (data) => API.post('/ai/explain-prescription', data),
  chat: (data) => API.post('/ai/chat', data),
  summarizeReport: (data) => API.post('/ai/summarize-report', data)
};

export default API;