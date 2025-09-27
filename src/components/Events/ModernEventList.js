// File: src/components/Events/ModernEventList.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { eventsAPI } from "../../services/api";
import { formatDate, formatTime } from "../../utils/helpers";
import ModernEventForm from "./ModernEventForm";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernEvents.css";

const ModernEventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter]);

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

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
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

  const getEventsByStatus = (status) => {
    return events.filter((event) => event.status === status).length;
  };

  if (loading) return <ModernLoadingSpinner />;

  return (
    <div className="modern-events-page">
      <Container fluid>
        {/* Header */}
        <Row className="page-header">
          <Col>
            <div className="header-content">
              <div>
                <h1>Events Management</h1>
                <p>Create and manage your community events</p>
              </div>
              <Button className="btn-modern-primary" onClick={() => setShowModal(true)}>
                <span className="btn-icon">+</span>
                Create Event
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Overview */}
        <Row className="stats-overview">
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item total">
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item scheduled">
              <div className="stat-value">{getEventsByStatus("scheduled")}</div>
              <div className="stat-label">Scheduled</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item ongoing">
              <div className="stat-value">{getEventsByStatus("ongoing")}</div>
              <div className="stat-label">Ongoing</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item completed">
              <div className="stat-value">{getEventsByStatus("completed")}</div>
              <div className="stat-label">Completed</div>
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="filters-section">
          <Col lg={6}>
            <InputGroup className="search-box">
              <InputGroup.Text className="search-icon">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-form-control"
              />
            </InputGroup>
          </Col>
          <Col lg={3}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="modern-form-control"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Col>
          <Col lg={3}>
            <div className="results-count">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </Col>
        </Row>

        {/* Events Grid */}
        <Row>
          {filteredEvents.length === 0 ? (
            <Col>
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No events found</h3>
                <p>
                  {events.length === 0
                    ? "Get started by creating your first event"
                    : "Try adjusting your search or filters"}
                </p>
                {events.length === 0 && (
                  <Button className="btn-modern-primary" onClick={() => setShowModal(true)}>
                    Create Your First Event
                  </Button>
                )}
              </div>
            </Col>
          ) : (
            filteredEvents.map((event) => (
              <Col key={event.id} xl={4} lg={6} className="mb-4">
                <EventCard event={event} onEdit={handleEdit} onDelete={handleDelete} />
              </Col>
            ))
          )}
        </Row>

        {/* Create/Edit Modal */}
        <ModernEventForm show={showModal} onHide={handleModalClose} event={selectedEvent} onSuccess={handleSuccess} />
      </Container>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "var(--primary-500)";
      case "ongoing":
        return "var(--warning-500)";
      case "completed":
        return "var(--success-500)";
      case "cancelled":
        return "var(--error-500)";
      default:
        return "var(--gray-500)";
    }
  };

  return (
    <div className="modern-card event-card">
      <div className="event-status-bar" style={{ backgroundColor: getStatusColor(event.status) }}></div>

      <div className="event-card-content">
        <div className="event-header">
          <h5 className="event-title">{event.title}</h5>
          <div className="event-actions">
            <Button variant="outline" size="sm" className="action-btn" onClick={() => onEdit(event)}>
              ✏️
            </Button>
            <Button variant="outline" size="sm" className="action-btn" onClick={() => onDelete(event.id)}>
              🗑️
            </Button>
          </div>
        </div>

        <p className="event-description">{event.description || "No description provided"}</p>

        <div className="event-details">
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">⏰</span>
            <span>{formatTime(event.event_time)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span>{event.location || "Online"}</span>
          </div>
        </div>

        <div className="event-footer">
          <div className={`status-badge status-${event.status}`}>{event.status}</div>
          <Button as="a" href={`/events/${event.id}`} className="btn-modern-secondary view-details-btn">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernEventList;
