// File: src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (adminData) => api.post("/auth/register", adminData),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get("/events"),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post("/events", eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
};

// Participants API
export const participantsAPI = {
  getAll: () => api.get("/attendance/participants"),
  search: (searchTerm) => api.get(`/attendance/participants/search?search=${searchTerm}`),
  create: (participantData) => api.post("/attendance/participants", participantData),
  addToEvent: (data) => api.post("/attendance/events/participants", data),
  getByEvent: (eventId) => api.get(`/attendance/events/${eventId}/participants`),
};

// Attendance API
export const attendanceAPI = {
  record: (attendanceData) => api.post("/attendance/record", attendanceData),
  recordBulk: (bulkData) => api.post("/attendance/record/bulk", bulkData),
  getReport: (eventId) => api.get(`/attendance/report/${eventId}`),
};

export default api;
