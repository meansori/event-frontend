// File: src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Modern Components
import ModernLanding from "./components/Landing/ModernLanding";
import ModernLogin from "./components/Auth/ModernLogin";
import ModernRegister from "./components/Auth/ModernRegister";
import ModernDashboard from "./components/Dashboard/ModernDashboard";
import ModernEventList from "./components/Events/ModernEventList";
import ModernEventDetail from "./components/Events/ModernEventDetail";
import ModernParticipantList from "./components/Participants/ModernParticipantList";
import ModernParticipantForm from "./components/Participants/ModernParticipantForm";
import ModernBulkAttendance from "./components/Attendance/ModernBulkAttendance";
import ModernAttendanceReport from "./components/Attendance/ModernAttendanceReport";

// Layout Components
import ModernNavbar from "./components/Layout/ModernNavbar";
import ModernSidebar from "./components/Layout/ModernSidebar";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/DesignSystem.css";
import "./styles/App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="modern-loading-container">
          <div className="modern-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          <span className="loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/landing" />;
};

// Public Route Component (for auth pages when already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="modern-loading-container">
          <div className="modern-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          <span className="loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  return (
    <div className="modern-app">
      <ModernNavbar />
      <div className="dashboard-container">
        <ModernSidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

// Main App Content with Routing
const AppContent = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<ModernLanding />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <ModernLogin />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <ModernRegister />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Dashboard Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModernDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModernEventList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModernEventDetail />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/participants"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModernParticipantList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bulk-attendance"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModernBulkAttendance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModernAttendanceReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="*" element={<Navigate to="/landing" />} />
        </Routes>
      </div>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
