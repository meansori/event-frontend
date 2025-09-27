// File: src/components/Attendance/BulkAttendance.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge, Modal } from "react-bootstrap";
import { eventsAPI, participantsAPI, attendanceAPI } from "../../services/api";
import { formatDate, formatTime, getAttendanceColor } from "../../utils/helpers";
import LoadingSpinner from "../Common/LoadingSpinner";

const BulkAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadEvents();

    // Check if coming from event detail page
    const selectedEventId = localStorage.getItem("selectedEvent");
    if (selectedEventId) {
      handleEventSelect(selectedEventId);
      localStorage.removeItem("selectedEvent");
    }
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events);
    } catch (error) {
      setError("Failed to load events");
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
      setError("Failed to load event details");
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

  const stats = getAttendanceStats();

  if (loading && !selectedEvent) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Bulk Attendance Recording</h2>
              <p className="text-muted">Record attendance for all participants at once</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Event</Form.Label>
            <Form.Select value={selectedEvent?.id || ""} onChange={(e) => handleEventSelect(e.target.value)}>
              <option value="">Choose an event...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({formatDate(event.event_date)})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {selectedEvent && (
        <>
          {/* Event Info Card */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <h4>{selectedEvent.title}</h4>
                      <p className="text-muted mb-2">{selectedEvent.description}</p>
                      <div className="d-flex gap-4">
                        <span>📅 {formatDate(selectedEvent.event_date)}</span>
                        <span>⏰ {formatTime(selectedEvent.event_time)}</span>
                        <span>📍 {selectedEvent.location || "TBA"}</span>
                      </div>
                    </Col>
                    <Col md={4} className="text-end">
                      <Badge
                        bg={
                          selectedEvent.status === "scheduled"
                            ? "primary"
                            : selectedEvent.status === "ongoing"
                            ? "warning"
                            : selectedEvent.status === "completed"
                            ? "success"
                            : "danger"
                        }
                      >
                        {selectedEvent.status}
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <h5>Quick Actions</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button variant="outline-success" size="sm" onClick={() => handleBulkStatusChange("present")}>
                      Mark All as Present
                    </Button>
                    <Button variant="outline-warning" size="sm" onClick={() => handleBulkStatusChange("late")}>
                      Mark All as Late
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleBulkStatusChange("absent")}>
                      Mark All as Absent
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowConfirmModal(true)}
                      disabled={participants.length === 0}
                    >
                      💾 Save All Attendance
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistics */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-success text-white text-center">
                <Card.Body>
                  <h3>{stats.present}</h3>
                  <small>Present</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-dark text-center">
                <Card.Body>
                  <h3>{stats.late}</h3>
                  <small>Late</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-danger text-white text-center">
                <Card.Body>
                  <h3>{stats.absent}</h3>
                  <small>Absent</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-primary text-white text-center">
                <Card.Body>
                  <h3>{stats.total}</h3>
                  <small>Total Participants</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Attendance Table */}
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    Participants Attendance ({participants.length})
                    <Badge bg="light" text="dark" className="ms-2">
                      Click on status to change
                    </Badge>
                  </h5>
                </Card.Header>
                <Card.Body>
                  {participants.length === 0 ? (
                    <div className="text-center py-5">
                      <h5>No participants in this event</h5>
                      <p className="text-muted">Add participants to the event first to record attendance</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                      <Table responsive striped>
                        <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
                          <tr>
                            <th>#</th>
                            <th>Participant Name</th>
                            <th>Email</th>
                            <th>Institution</th>
                            <th>Attendance Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant, index) => (
                            <tr key={participant.id}>
                              <td>{index + 1}</td>
                              <td>
                                <strong>{participant.name}</strong>
                                {participant.attendance_status && (
                                  <Badge bg={getAttendanceColor(participant.attendance_status)} className="ms-2">
                                    Previous: {participant.attendance_status}
                                  </Badge>
                                )}
                              </td>
                              <td>{participant.email || "-"}</td>
                              <td>{participant.institution || "-"}</td>
                              <td>
                                <Form.Select
                                  size="sm"
                                  value={attendanceRecords[participant.id]?.status || "absent"}
                                  onChange={(e) => handleAttendanceChange(participant.id, "status", e.target.value)}
                                  style={{ minWidth: "120px" }}
                                >
                                  <option value="present">✅ Present</option>
                                  <option value="late">⌚ Late</option>
                                  <option value="absent">❌ Absent</option>
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  placeholder="Optional notes..."
                                  value={attendanceRecords[participant.id]?.notes || ""}
                                  onChange={(e) => handleAttendanceChange(participant.id, "notes", e.target.value)}
                                />
                              </td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    const newStatus =
                                      attendanceRecords[participant.id]?.status === "present" ? "absent" : "present";
                                    handleAttendanceChange(participant.id, "status", newStatus);
                                  }}
                                >
                                  Toggle
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Bulk Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to save attendance for <strong>{stats.total}</strong> participants:
          </p>
          <ul>
            <li>✅ Present: {stats.present}</li>
            <li>⌚ Late: {stats.late}</li>
            <li>❌ Absent: {stats.absent}</li>
          </ul>
          <p>This action will update all attendance records for this event.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAttendance} disabled={saving}>
            {saving ? "Saving..." : "Confirm Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BulkAttendance;
