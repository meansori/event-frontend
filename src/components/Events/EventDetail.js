// File: src/components/Events/EventDetail.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Table, Alert } from "react-bootstrap";
import { eventsAPI, participantsAPI, attendanceAPI } from "../../services/api";
import { formatDate, formatTime, formatDateTime, getAttendanceColor } from "../../utils/helpers";
import LoadingSpinner from "../Common/LoadingSpinner";
import AttendanceForm from "../Attendance/AttendanceForm";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

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

      // Load attendance stats
      const statsResponse = await attendanceAPI.getReport(id);
      setStats(statsResponse.data.stats);
    } catch (error) {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const getStatCount = (status) => {
    const stat = stats.find((s) => s.status === status);
    return stat ? stat.count : 0;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!event) return <Alert variant="warning">Event not found</Alert>;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>{event.title}</h2>
              <p className="text-muted mb-0">
                {formatDate(event.event_date)} at {formatTime(event.event_time)}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                href={`/bulk-attendance`}
                onClick={(e) => {
                  e.preventDefault();
                  // Store selected event for bulk attendance
                  localStorage.setItem("selectedEvent", event.id);
                  window.location.href = "/bulk-attendance";
                }}
              >
                📝 Bulk Attendance
              </Button>
              <Button variant="primary" onClick={() => setShowAttendanceModal(true)}>
                Take Attendance
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5>Event Information</h5>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Description:</strong>
                    <br />
                    {event.description || "-"}
                  </p>
                  <p>
                    <strong>Location:</strong>
                    <br />
                    {event.location || "-"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Date:</strong>
                    <br />
                    {formatDate(event.event_date)}
                  </p>
                  <p>
                    <strong>Time:</strong>
                    <br />
                    {formatTime(event.event_time)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={
                        event.status === "scheduled"
                          ? "primary"
                          : event.status === "ongoing"
                          ? "warning"
                          : event.status === "completed"
                          ? "success"
                          : "danger"
                      }
                    >
                      {event.status}
                    </Badge>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="bg-primary text-white">
            <Card.Body className="text-center">
              <h4>Attendance Summary</h4>
              <div className="d-flex justify-content-around mt-3">
                <div>
                  <h3>{getStatCount("present")}</h3>
                  <small>Present</small>
                </div>
                <div>
                  <h3>{getStatCount("late")}</h3>
                  <small>Late</small>
                </div>
                <div>
                  <h3>{getStatCount("absent")}</h3>
                  <small>Absent</small>
                </div>
              </div>
              <div className="mt-3">
                <h5>Total: {participants.length}</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Participants ({participants.length})</h5>
            </Card.Header>
            <Card.Body>
              {participants.length === 0 ? (
                <p className="text-muted text-center py-3">No participants registered for this event</p>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Institution</th>
                      <th>Attendance</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td>{participant.name}</td>
                        <td>{participant.email || "-"}</td>
                        <td>{participant.phone || "-"}</td>
                        <td>{participant.institution || "-"}</td>
                        <td>
                          <Badge bg={getAttendanceColor(participant.attendance_status)}>
                            {participant.attendance_status || "Not recorded"}
                          </Badge>
                        </td>
                        <td>{participant.attendance_time ? formatDateTime(participant.attendance_time) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AttendanceForm
        show={showAttendanceModal}
        onHide={() => setShowAttendanceModal(false)}
        event={event}
        participants={participants}
        onSuccess={loadEventDetails}
      />
    </Container>
  );
};

export default EventDetail;
