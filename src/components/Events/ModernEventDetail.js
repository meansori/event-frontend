import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert } from "react-bootstrap";
import { eventsAPI, participantsAPI, testAPI } from "../../services/api";
import { formatDate, formatTime, formatDateTime, getAttendanceColor } from "../../utils/helpers";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import ModernAttendanceForm from "../Attendance/ModernAttendanceForm";
import QRGenerator from "../QR/QRGenerator";
import QRScanner from "../QR/QRScanner";
import { QrCode, Scan, RefreshCw } from "lucide-react";
import "./ModernEventDetail.css";

const ModernEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadEventDetails();
  }, [id, retryCount]);

  const loadEventDetails = async () => {
    setLoading(true);
    setError("");

    try {
      // Test API connection first
      await testAPI.health();

      const [eventResponse, participantsResponse] = await Promise.all([
        eventsAPI.getById(id).catch((err) => {
          console.error("Event API Error:", err);
          throw new Error(`Failed to load event: ${err.response?.data?.message || err.message}`);
        }),
        participantsAPI.getByEvent(id).catch((err) => {
          console.error("Participants API Error:", err);
          // Continue without participants if this fails
          return { data: { participants: [] } };
        }),
      ]);

      setEvent(eventResponse.data.event || eventResponse.data);
      setParticipants(participantsResponse.data.participants || []);
    } catch (error) {
      console.error("Error loading event details:", error);

      if (error.response?.status === 404) {
        setError("Event not found. It may have been deleted.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this event.");
      } else if (error.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError(error.message || "Failed to load event details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleTakeAttendance = () => {
    setShowAttendanceModal(true);
  };

  const handleBulkAttendance = () => {
    localStorage.setItem("selectedEvent", id);
    navigate("/bulk-attendance");
  };

  const handleGenerateQR = () => {
    setShowQRGenerator(true);
  };

  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleAttendanceSuccess = () => {
    setShowAttendanceModal(false);
    loadEventDetails();
  };

  const handleScanSuccess = (result) => {
    loadEventDetails();
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

  if (error && !event) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <h5>Error Loading Event</h5>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={handleRetry}>
              <RefreshCw size={16} className="me-2" />
              Retry
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate("/events")}>
              Back to Events
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <h5>Event Not Found</h5>
          <p>The event you're looking for doesn't exist or may have been deleted.</p>
          <Button variant="primary" onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </Alert>
      </Container>
    );
  }

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
                  {/* QR Code Actions */}
                  <Button className="btn-modern-qr me-2" onClick={handleGenerateQR}>
                    <QrCode size={16} className="me-2" />
                    QR Code
                  </Button>
                  <Button className="btn-modern-scan me-2" onClick={handleScanQR}>
                    <Scan size={16} className="me-2" />
                    Scan QR
                  </Button>
                  {/* Existing buttons */}
                  <Button className="btn-modern-primary me-2" onClick={handleTakeAttendance}>
                    ✅ Take Attendance
                  </Button>
                  <Button variant="outline" onClick={handleBulkAttendance}>
                    📝 Bulk Attendance
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="warning" dismissible onClose={() => setError("")}>
                <strong>Partial Data Loaded:</strong> {error}
                <div className="mt-2">
                  <Button size="sm" variant="outline-warning" onClick={handleRetry}>
                    <RefreshCw size={14} className="me-1" />
                    Retry Load Data
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        )}

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

        {/* QR Code Modals */}
        <QRGenerator event={event} show={showQRGenerator} onHide={() => setShowQRGenerator(false)} />

        <QRScanner
          event={event}
          show={showQRScanner}
          onHide={() => setShowQRScanner(false)}
          onScanSuccess={handleScanSuccess}
        />

        {/* Existing Attendance Modal */}
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
