// File: src/App.js (Updated)
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ModernLanding from "./components/Landing/ModernLanding";
import AppNavbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import EventList from "./components/Events/EventList";
import EventDetail from "./components/Events/EventDetail";
import ParticipantList from "./components/Participants/ParticipantList";
import AttendanceReport from "./components/Attendance/AttendanceReport";
import BulkAttendance from "./components/Attendance/BulkAttendance";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/landing" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

const DashboardLayout = ({ children }) => {
  return (
    <>
      <AppNavbar />
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-4">{children}</div>
      </div>
    </>
  );
};

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h2>Dashboard</h2>
      <p>Welcome to Community Attendance System</p>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Events</h5>
              <p>Manage your community events</p>
              <a href="/events" className="text-white">
                View Events →
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5>Participants</h5>
              <p>Manage community members</p>
              <a href="/participants" className="text-white">
                View Participants →
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5>Bulk Attendance</h5>
              <p>Record attendance in bulk</p>
              <a href="/bulk-attendance" className="text-white">
                Quick Record →
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5>Reports</h5>
              <p>View attendance reports</p>
              <a href="/reports" className="text-white">
                View Reports →
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const AppContent = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<ModernLanding />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EventList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EventDetail />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/participants"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ParticipantList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AttendanceReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-attendance"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BulkAttendance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to landing */}
          <Route path="/" element={<Navigate to="/landing" />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
