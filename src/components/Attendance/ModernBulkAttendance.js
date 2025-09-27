// File: src/components/Attendance/ModernBulkAttendance.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Badge } from "react-bootstrap";
import { eventsAPI, participantsAPI, attendanceAPI } from "../../services/api";
import { formatDate, formatTime, getAttendanceColor } from "../../utils/helpers";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernBulkAttendance.css";

const ModernBulkAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEvents();

    // Check if coming from event detail page
    const selectedEventId = localStorage.getItem("selectedEvent");
    if (selectedEventId) {
      handleEventSelect(selectedEventId);
      localStorage.removeItem("selectedEvent");
    }
  }, []);

  // Di bagian loadEvents dan handleEventSelect, tambahkan error handling:
  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(`Failed to load events: ${errorMessage}`);
      console.error("Events load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (eventId) => {
    if (!eventId) {
      setSelectedEvent(null);
      setParticipants([]);
      setAttendanceRecords({});
      return;
    }

    setLoading(true);
    try {
      const [eventResponse, participantsResponse] = await Promise.all([
        eventsAPI.getById(eventId),
        participantsAPI.getByEvent(eventId),
      ]);

      setSelectedEvent(eventResponse.data.event);
      setParticipants(participantsResponse.data.participants);

      // Initialize attendance records
      const records = {};
      participantsResponse.data.participants.forEach((participant) => {
        records[participant.id] = {
          status: participant.attendance_status || "absent",
          notes: participant.notes || "",
        };
      });
      setAttendanceRecords(records);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(`Failed to load event details: ${errorMessage}`);
      console.error("Event details load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (participantId, field, value) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value,
      },
    }));
  };

  const handleBulkStatusChange = (status) => {
    const updatedRecords = { ...attendanceRecords };
    Object.keys(updatedRecords).forEach((participantId) => {
      updatedRecords[participantId] = {
        ...updatedRecords[participantId],
        status: status,
      };
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSaveAttendance = async () => {
    if (!selectedEvent) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const records = Object.entries(attendanceRecords).map(([participantId, record]) => ({
        participant_id: parseInt(participantId),
        status: record.status,
        notes: record.notes,
      }));

      await attendanceAPI.recordBulk({
        event_id: selectedEvent.id,
        attendance_records: records,
      });

      setSuccess(`Attendance recorded successfully for ${records.length} participants`);
      setShowConfirmModal(false);

      // Reload data to get updated status
      handleEventSelect(selectedEvent.id);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      late: 0,
      absent: 0,
      total: participants.length,
    };

    Object.values(attendanceRecords).forEach((record) => {
      if (record.status === "present") stats.present++;
      else if (record.status === "late") stats.late++;
      else if (record.status === "absent") stats.absent++;
    });

    return stats;
  };

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getAttendanceStats();

  if (loading && !selectedEvent) return <ModernLoadingSpinner />;

  return (
    <div className="modern-bulk-attendance">
      <Container fluid>
        {/* Header */}
        <Row className="page-header">
          <Col>
            <div className="header-content">
              <div>
                <h1>Bulk Attendance</h1>
                <p>Record attendance for multiple participants at once</p>
              </div>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="modern-alert">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="modern-alert">
            {success}
          </Alert>
        )}

        {/* Event Selection */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="modern-card">
              <Card.Body>
                <Form.Group>
                  <Form.Label className="modern-form-label">Select Event</Form.Label>
                  <Form.Select
                    value={selectedEvent?.id || ""}
                    onChange={(e) => handleEventSelect(e.target.value)}
                    className="modern-form-control"
                  >
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({formatDate(event.event_date)})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {selectedEvent && (
          <>
            {/* Event Info & Quick Actions */}
            <Row className="mb-4">
              <Col lg={8}>
                <Card className="modern-card">
                  <Card.Body>
                    <div className="event-info">
                      <div className="event-basic">
                        <h4>{selectedEvent.title}</h4>
                        <div className="event-meta">
                          <span>📅 {formatDate(selectedEvent.event_date)}</span>
                          <span>⏰ {formatTime(selectedEvent.event_time)}</span>
                          <span>📍 {selectedEvent.location || "Online"}</span>
                        </div>
                      </div>
                      <Badge className={`status-badge status-${selectedEvent.status}`}>{selectedEvent.status}</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="modern-card">
                  <Card.Body>
                    <h6>Quick Actions</h6>
                    <div className="quick-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-btn present"
                        onClick={() => handleBulkStatusChange("present")}
                      >
                        ✅ Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-btn late"
                        onClick={() => handleBulkStatusChange("late")}
                      >
                        ⏰ Mark All Late
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-btn absent"
                        onClick={() => handleBulkStatusChange("absent")}
                      >
                        ❌ Mark All Absent
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Statistics */}
            <Row className="mb-4">
              <Col lg={3} md={6} className="mb-3">
                <StatCard
                  count={stats.present}
                  total={stats.total}
                  label="Present"
                  color="var(--success-500)"
                  icon="✅"
                />
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <StatCard count={stats.late} total={stats.total} label="Late" color="var(--warning-500)" icon="⏰" />
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <StatCard count={stats.absent} total={stats.total} label="Absent" color="var(--error-500)" icon="❌" />
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <StatCard count={stats.total} label="Total Participants" color="var(--primary-500)" icon="👥" />
              </Col>
            </Row>

            {/* Search */}
            <Row className="mb-3">
              <Col lg={6}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-form-control"
                  />
                </Form.Group>
              </Col>
              <Col lg={6} className="text-end">
                <Button
                  className="btn-modern-primary"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={participants.length === 0 || saving}
                >
                  {saving ? (
                    <>
                      <ModernLoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    "💾 Save All Attendance"
                  )}
                </Button>
              </Col>
            </Row>

            {/* Attendance Table */}
            <Row>
              <Col>
                <Card className="modern-card">
                  <Card.Header className="modern-card-header">
                    <h5 className="mb-0">Participants Attendance ({filteredParticipants.length})</h5>
                  </Card.Header>
                  <Card.Body className="modern-card-body">
                    {filteredParticipants.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h6>No participants found</h6>
                        <p>No participants match your search criteria</p>
                      </div>
                    ) : (
                      <div className="attendance-table-container">
                        <table className="modern-table attendance-table">
                          <thead>
                            <tr>
                              <th>Participant</th>
                              <th>Contact</th>
                              <th>Status</th>
                              <th>Notes</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredParticipants.map((participant) => (
                              <AttendanceRow
                                key={participant.id}
                                participant={participant}
                                attendanceRecord={attendanceRecords[participant.id]}
                                onChange={handleAttendanceChange}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="modern-modal">
          <Modal.Header closeButton className="modern-modal-header">
            <Modal.Title>Confirm Bulk Attendance</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modern-modal-body">
            <div className="confirmation-content">
              <div className="confirmation-icon">📊</div>
              <h5>Save attendance records?</h5>
              <p>
                You are about to save attendance for <strong>{stats.total}</strong> participants:
              </p>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-dot present"></span>
                  <span>Present: {stats.present}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot late"></span>
                  <span>Late: {stats.late}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot absent"></span>
                  <span>Absent: {stats.absent}</span>
                </div>
              </div>
              <p className="text-muted">This action will update all attendance records for this event.</p>
            </div>
          </Modal.Body>
          <Modal.Footer className="modern-modal-footer">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="btn-modern-primary" onClick={handleSaveAttendance} disabled={saving}>
              {saving ? "Saving..." : "Confirm Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ count, total, label, color, icon }) => (
  <Card className="modern-card stat-card">
    <Card.Body>
      <div className="stat-content">
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
        <div className="stat-info">
          <h3>
            {count}
            {total && `/${total}`}
          </h3>
          <span className="stat-label">{label}</span>
        </div>
      </div>
    </Card.Body>
  </Card>
);

// Attendance Row Component
const AttendanceRow = ({ participant, attendanceRecord, onChange }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <tr>
      <td>
        <div className="participant-info">
          <div
            className="participant-avatar"
            style={{
              backgroundColor: stringToColor(participant.name),
              color: "white",
            }}
          >
            {getInitials(participant.name)}
          </div>
          <div>
            <div className="participant-name">{participant.name}</div>
            {participant.institution && <div className="participant-institution">{participant.institution}</div>}
          </div>
        </div>
      </td>
      <td>
        <div className="contact-info">
          {participant.email && <div className="email">{participant.email}</div>}
          {participant.phone && <div className="phone">{participant.phone}</div>}
        </div>
      </td>
      <td>
        <Form.Select
          value={attendanceRecord?.status || "absent"}
          onChange={(e) => onChange(participant.id, "status", e.target.value)}
          className="status-select"
          style={{
            borderColor: getAttendanceColor(attendanceRecord?.status),
            background: `var(--${attendanceRecord?.status}-50)`,
          }}
        >
          <option value="present">✅ Present</option>
          <option value="late">⏰ Late</option>
          <option value="absent">❌ Absent</option>
        </Form.Select>
      </td>
      <td>
        <Form.Control
          type="text"
          placeholder="Optional notes..."
          value={attendanceRecord?.notes || ""}
          onChange={(e) => onChange(participant.id, "notes", e.target.value)}
          className="notes-input"
        />
      </td>
      <td>
        <Button
          variant="outline"
          size="sm"
          className="toggle-btn"
          onClick={() => {
            const newStatus = attendanceRecord?.status === "present" ? "absent" : "present";
            onChange(participant.id, "status", newStatus);
          }}
        >
          Toggle
        </Button>
      </td>
    </tr>
  );
};

// Helper function to generate consistent color from string
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  return colors[Math.abs(hash) % colors.length];
};

export default ModernBulkAttendance;
