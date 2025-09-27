// File: src/components/Attendance/AttendanceForm.js
import React, { useState, useEffect } from "react";
import { Form, Table, Button, Alert, Badge } from "react-bootstrap";
import { attendanceAPI, participantsAPI } from "../../services/api";
import CustomModal from "../Common/Modal";
import LoadingSpinner from "../Common/LoadingSpinner";
import { getAttendanceColor } from "../../utils/helpers";

const AttendanceForm = ({ show, onHide, event, participants, onSuccess }) => {
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (show) {
      initializeAttendanceRecords();
      loadAvailableParticipants();
    }
  }, [show, participants]);

  const initializeAttendanceRecords = () => {
    const records = {};
    participants.forEach((participant) => {
      records[participant.id] = {
        status: participant.attendance_status || "absent",
        notes: participant.notes || "",
      };
    });
    setAttendanceRecords(records);
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

      // Reload participants and available participants
      onSuccess();
      loadAvailableParticipants(searchTerm);
    } catch (error) {
      setError("Failed to add participant to event");
    }
  };

  const handleSubmit = async () => {
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

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      title={`Attendance - ${event?.title}`}
      onConfirm={handleSubmit}
      loading={loading}
      size="xl"
    >
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-4">
        <h6>Add Participants to Event</h6>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search participants to add to this event..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Form.Group>

        {searchLoading && <LoadingSpinner size="sm" text="Searching..." />}

        {availableParticipants.length > 0 && (
          <div className="mt-2">
            {availableParticipants.map((participant) => (
              <div
                key={participant.id}
                className="d-flex justify-content-between align-items-center p-2 border rounded mb-1"
              >
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

      <h6>Record Attendance ({participants.length} participants)</h6>

      {participants.length === 0 ? (
        <p className="text-muted text-center py-3">No participants in this event yet</p>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <Table responsive size="sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td>{participant.name}</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={attendanceRecords[participant.id]?.status || "absent"}
                      onChange={(e) => handleAttendanceChange(participant.id, "status", e.target.value)}
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
          </Table>
        </div>
      )}

      {loading && <LoadingSpinner />}
    </CustomModal>
  );
};

export default AttendanceForm;
