// File: src/components/Events/EventList.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Alert } from "react-bootstrap";
import { eventsAPI } from "../../services/api";
import { formatDate, formatTime } from "../../utils/helpers";
import EventForm from "./EventForm";
import LoadingSpinner from "../Common/LoadingSpinner";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
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

  const getStatusVariant = (status) => {
    switch (status) {
      case "scheduled":
        return "primary";
      case "ongoing":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventsAPI.delete(eventId);
        loadEvents();
      } catch (error) {
        setError("Failed to delete event");
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleSuccess = () => {
    loadEvents();
    handleModalClose();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Events Management</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Create Event
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {events.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <h5>No events found</h5>
                <p className="text-muted">Create your first event to get started</p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Create Event
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          events.map((event) => (
            <Col key={event.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{event.title}</h5>
                    <Badge bg={getStatusVariant(event.status)}>{event.status}</Badge>
                  </div>

                  <p className="text-muted small">{event.description}</p>

                  <div className="mb-2">
                    <strong>Date:</strong> {formatDate(event.event_date)}
                  </div>
                  <div className="mb-2">
                    <strong>Time:</strong> {formatTime(event.event_time)}
                  </div>
                  <div className="mb-3">
                    <strong>Location:</strong> {event.location || "-"}
                  </div>

                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEdit(event)}>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(event.id)}>
                      Delete
                    </Button>
                    <Button variant="primary" size="sm" href={`/events/${event.id}`}>
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <EventForm show={showModal} onHide={handleModalClose} event={selectedEvent} onSuccess={handleSuccess} />
    </Container>
  );
};

export default EventList;
