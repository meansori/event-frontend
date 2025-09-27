// File: src/components/Events/ModernEventDetail.js (Updated)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert } from "react-bootstrap";
import { eventsAPI, participantsAPI } from "../../services/api";
import { formatDate, formatTime, formatDateTime, getAttendanceColor } from "../../utils/helpers";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import ModernAttendanceForm from "../Attendance/ModernAttendanceForm"; // Tambahkan import ini
import "./ModernEventDetail.css";

const ModernEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false); // State untuk modal

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const [eventResponse, participantsResponse] = await Promise.all([
        eventsAPI.getById(id),
        participantsAPI.getByEvent(id),
      ]);

      setEvent(eventResponse.data.event);
      setParticipants(participantsResponse.data.participants);
    } catch (error) {
      setError("Failed to load event details");
      console.error("Error loading event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAttendance = () => {
    setShowAttendanceModal(true);
  };

  const handleBulkAttendance = () => {
    localStorage.setItem("selectedEvent", id);
    navigate("/bulk-attendance");
  };

  const handleAttendanceSuccess = () => {
    setShowAttendanceModal(false);
    loadEventDetails(); // Reload data untuk update terbaru
  };

  // Calculate stats from participants data
  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      late: 0,
      absent: 0,
      total: participants.length,
    };

    participants.forEach((participant) => {
      if (participant.attendance_status === "present") stats.present++;
      else if (participant.attendance_status === "late") stats.late++;
      else if (participant.attendance_status === "absent") stats.absent++;
    });

    return stats;
  };

  const stats = getAttendanceStats();

  if (loading) return <ModernLoadingSpinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!event) return <Alert variant="warning">Event not found</Alert>;

  return (
    <div className="modern-event-detail">
      <Container fluid>
        {/* Header */}
        <Row className="page-header">
          <Col>
            <div className="header-content">
              <div>
                <h1>{event.title}</h1>
                <p className="event-meta">
                  📅 {formatDate(event.event_date)} • ⏰ {formatTime(event.event_time)} • 📍{" "}
                  {event.location || "Online"}
                </p>
              </div>
              <div className="action-buttons">
                <Button variant="outline" className="me-2" onClick={() => navigate("/events")}>
                  ← Back to Events
                </Button>
                <div className="attendance-actions">
                  <Button
                    className="btn-modern-primary me-2"
                    onClick={handleTakeAttendance} // Modal attendance
                  >
                    ✅ Take Attendance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkAttendance} // Bulk attendance page
                  >
                    📝 Bulk Attendance
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats & Info */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="modern-card">
              <Card.Body>
                <h5>Event Information</h5>
                <div className="event-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Description</span>
                    <p>{event.description || "No description provided"}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <Badge className={`status-badge status-${event.status}`}>{event.status}</Badge>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Max Participants</span>
                    <span>{event.max_participants || "Unlimited"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created</span>
                    <span>{formatDateTime(event.created_at)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="modern-card stats-card">
              <Card.Body>
                <h5>Attendance Summary</h5>
                <div className="attendance-stats">
                  <div className="stat-item">
                    <span className="stat-value">{stats.present}</span>
                    <span className="stat-label">Present</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.late}</span>
                    <span className="stat-label">Late</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.absent}</span>
                    <span className="stat-label">Absent</span>
                  </div>
                  <div className="stat-item total">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Participants</span>
                  </div>
                </div>
                <div className="attendance-rate">
                  <div className="rate-label">Attendance Rate</div>
                  <div className="rate-value">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Participants List */}
        <Row>
          <Col>
            <Card className="modern-card">
              <Card.Header className="modern-card-header">
                <h5 className="mb-0">Participants ({participants.length})</h5>
                <Button size="sm" variant="outline" onClick={() => navigate("/participants")}>
                  👥 Manage Participants
                </Button>
              </Card.Header>
              <Card.Body className="modern-card-body">
                {participants.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h6>No participants registered</h6>
                    <p>Add participants to this event to start tracking attendance</p>
                    <Button className="btn-modern-primary" onClick={() => navigate("/participants")}>
                      Add Participants
                    </Button>
                  </div>
                ) : (
                  <div className="participants-list">
                    {participants.map((participant) => (
                      <ParticipantItem key={participant.id} participant={participant} />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Attendance Modal */}
        <ModernAttendanceForm
          show={showAttendanceModal}
          onHide={() => setShowAttendanceModal(false)}
          event={event}
          onSuccess={handleAttendanceSuccess}
        />
      </Container>
    </div>
  );
};

// Participant Item Component
const ParticipantItem = ({ participant }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "✅";
      case "late":
        return "⏰";
      case "absent":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="participant-item">
      <div
        className="participant-avatar"
        style={{
          backgroundColor: stringToColor(participant.name),
          color: "white",
        }}
      >
        {getInitials(participant.name)}
      </div>

      <div className="participant-info">
        <h6>{participant.name}</h6>
        <div className="participant-meta">
          {participant.email && <span>📧 {participant.email}</span>}
          {participant.phone && <span>📱 {participant.phone}</span>}
          {participant.institution && <span>🏢 {participant.institution}</span>}
        </div>
      </div>

      <div className="attendance-status">
        <Badge bg={getAttendanceColor(participant.attendance_status)}>
          {getStatusIcon(participant.attendance_status)} {participant.attendance_status || "Not recorded"}
        </Badge>
        {participant.attendance_time && (
          <span className="attendance-time">{formatDateTime(participant.attendance_time)}</span>
        )}
      </div>
    </div>
  );
};

// Helper function
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
  return colors[Math.abs(hash) % colors.length];
};

export default ModernEventDetail;
