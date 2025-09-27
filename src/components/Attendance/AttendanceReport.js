// File: src/components/Attendance/AttendanceReport.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Alert, Form } from "react-bootstrap";
import { eventsAPI, attendanceAPI } from "../../services/api";
import { formatDate, formatDateTime, getAttendanceColor } from "../../utils/helpers";
import LoadingSpinner from "../Common/LoadingSpinner";

const AttendanceReport = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events);
      setLoading(false);
    } catch (error) {
      setError("Failed to load events");
      setLoading(false);
    }
  };

  const loadAttendanceReport = async (eventId) => {
    if (!eventId) {
      setAttendance([]);
      setStats([]);
      return;
    }

    setReportLoading(true);
    try {
      const response = await attendanceAPI.getReport(eventId);
      setAttendance(response.data.attendance);
      setStats(response.data.stats);
    } catch (error) {
      setError("Failed to load attendance report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    loadAttendanceReport(eventId);
  };

  const getStatCount = (status) => {
    const stat = stats.find((s) => s.status === status);
    return stat ? stat.count : 0;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Attendance Reports</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Event</Form.Label>
            <Form.Select value={selectedEvent} onChange={(e) => handleEventChange(e.target.value)}>
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
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-success text-white text-center">
                <Card.Body>
                  <h3>{getStatCount("present")}</h3>
                  <small>Present</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-dark text-center">
                <Card.Body>
                  <h3>{getStatCount("late")}</h3>
                  <small>Late</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-danger text-white text-center">
                <Card.Body>
                  <h3>{getStatCount("absent")}</h3>
                  <small>Absent</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-primary text-white text-center">
                <Card.Body>
                  <h3>{attendance.length}</h3>
                  <small>Total Recorded</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Attendance Details</h5>
                </Card.Header>
                <Card.Body>
                  {reportLoading ? (
                    <LoadingSpinner />
                  ) : attendance.length === 0 ? (
                    <p className="text-muted text-center py-3">No attendance records found for this event</p>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Institution</th>
                          <th>Status</th>
                          <th>Attendance Time</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record) => (
                          <tr key={`${record.id}`}>
                            <td>{record.name}</td>
                            <td>{record.email || "-"}</td>
                            <td>{record.institution || "-"}</td>
                            <td>
                              <span className={`badge bg-${getAttendanceColor(record.status)}`}>{record.status}</span>
                            </td>
                            <td>{formatDateTime(record.attendance_time)}</td>
                            <td>{record.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AttendanceReport;
