// File: src/services/api.js (Updated with better error handling)
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
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

    // Enhanced error logging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

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

// QR Code API
export const qrAPI = {
  generate: (eventId) => api.post("/attendance/qr/generate", { event_id: eventId }),
  getEventQR: (eventId) => api.get(`/attendance/qr/event/${eventId}`),
  scan: (qrData, participantData) =>
    api.post("/attendance/qr/scan", {
      qr_data: qrData,
      participant_data: participantData,
    }),
  attend: (qrData, participantInfo) =>
    api.post("/attendance/qr/attend", {
      qr_data: qrData,
      ...participantInfo,
    }),
};

// Test API connection
export const testAPI = {
  health: () => api.get("/health"),
  testAuth: () => api.get("/auth/test"),
};

export default api;
