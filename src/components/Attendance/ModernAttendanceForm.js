// File: src/components/Attendance/ModernAttendanceForm.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";
import { participantsAPI, attendanceAPI } from "../../services/api";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernAttendanceForm.css";
import { getAttendanceColor } from "../../utils/helpers";

const ModernAttendanceForm = ({ show, onHide, event, onSuccess }) => {
  const [participants, setParticipants] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (show && event) {
      initializeAttendance();
      loadAvailableParticipants();
    }
  }, [show, event]);

  const initializeAttendance = async () => {
    try {
      const response = await participantsAPI.getByEvent(event.id);
      setParticipants(response.data.participants);

      // Initialize records
      const records = {};
      response.data.participants.forEach((participant) => {
        records[participant.id] = {
          status: participant.attendance_status || "absent",
          notes: participant.notes || "",
        };
      });
      setAttendanceRecords(records);
    } catch (error) {
      setError("Failed to load participants");
    }
  };

  const loadAvailableParticipants = async (search = "") => {
    setSearchLoading(true);
    try {
      let response;
      if (search) {
        response = await participantsAPI.search(search);
      } else {
        response = await participantsAPI.getAll();
      }

      // Filter out participants already in the event
      const eventParticipantIds = new Set(participants.map((p) => p.id));
      const available = response.data.participants.filter((p) => !eventParticipantIds.has(p.id));
      setAvailableParticipants(available);
    } catch (error) {
      console.error("Failed to load participants:", error);
    } finally {
      setSearchLoading(false);
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

  const handleAddParticipant = async (participantId) => {
    try {
      await participantsAPI.addToEvent({
        event_id: event.id,
        participant_id: participantId,
      });

      // Reload participants
      await initializeAttendance();
      await loadAvailableParticipants(searchTerm);
    } catch (error) {
      setError("Failed to add participant to event");
    }
  };

  const handleSubmit = async () => {
    if (!event) return;

    setLoading(true);
    setError("");

    try {
      const records = Object.entries(attendanceRecords).map(([participantId, record]) => ({
        participant_id: parseInt(participantId),
        status: record.status,
        notes: record.notes,
      }));

      await attendanceAPI.recordBulk({
        event_id: event.id,
        attendance_records: records,
      });

      onSuccess();
      onHide();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    loadAvailableParticipants(term);
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

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="modern-modal">
      <Modal.Header closeButton className="modern-modal-header">
        <Modal.Title>Attendance - {event?.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="modern-modal-body">
        {error && (
          <Alert variant="danger" className="modern-alert">
            {error}
          </Alert>
        )}

        {/* Add Participants Section */}
        <div className="mb-4">
          <h6>Add Participants to Event</h6>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search participants to add to this event..."
              value={searchTerm}
              onChange={handleSearch}
              className="modern-form-control"
            />
          </Form.Group>

          {searchLoading && (
            <div className="text-center py-2">
              <ModernLoadingSpinner size="sm" text="Searching..." />
            </div>
          )}

          {availableParticipants.length > 0 && (
            <div className="available-participants mt-2">
              {availableParticipants.map((participant) => (
                <div key={participant.id} className="participant-item">
                  <span>
                    {participant.name} ({participant.email})
                  </span>
                  <Button size="sm" variant="outline-primary" onClick={() => handleAddParticipant(participant.id)}>
                    Add to Event
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <div className="stat-card mini">
              <div className="stat-value">{stats.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card mini">
              <div className="stat-value">{stats.late}</div>
              <div className="stat-label">Late</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card mini">
              <div className="stat-value">{stats.absent}</div>
              <div className="stat-label">Absent</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card mini">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </Col>
        </Row>

        {/* Attendance Table */}
        <h6>Record Attendance ({participants.length} participants)</h6>

        {participants.length === 0 ? (
          <div className="empty-state mini">
            <div className="empty-icon">👥</div>
            <p>No participants in this event yet</p>
          </div>
        ) : (
          <div className="attendance-table-container">
            <div className="table-responsive">
              <table className="modern-table attendance-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td>
                        <div className="participant-info">
                          <strong>{participant.name}</strong>
                          {participant.email && <div className="text-muted small">{participant.email}</div>}
                        </div>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={attendanceRecords[participant.id]?.status || "absent"}
                          onChange={(e) => handleAttendanceChange(participant.id, "status", e.target.value)}
                          className="status-select"
                        >
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          placeholder="Notes (optional)"
                          value={attendanceRecords[participant.id]?.notes || ""}
                          onChange={(e) => handleAttendanceChange(participant.id, "notes", e.target.value)}
                          className="notes-input"
                        />
                      </td>
                      <td>
                        <Badge bg={getAttendanceColor(participant.attendance_status)}>
                          {participant.attendance_status || "Not recorded"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && <ModernLoadingSpinner />}
      </Modal.Body>

      <Modal.Footer className="modern-modal-footer">
        <Button variant="outline" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button className="btn-modern-primary" onClick={handleSubmit} disabled={loading || participants.length === 0}>
          {loading ? "Saving..." : `Save Attendance (${participants.length})`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModernAttendanceForm;
