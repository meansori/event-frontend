// File: src/components/Events/EventForm.js
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Alert } from "react-bootstrap";
import { eventsAPI } from "../../services/api";
import CustomModal from "../Common/Modal";
import LoadingSpinner from "../Common/LoadingSpinner";

const EventForm = ({ show, onHide, event, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    max_participants: "",
    status: "scheduled",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        event_date: event.event_date || "",
        event_time: event.event_time || "",
        location: event.location || "",
        max_participants: event.max_participants || "",
        status: event.status || "scheduled",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        max_participants: "",
        status: "scheduled",
      });
    }
    setError("");
  }, [event, show]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date || !formData.event_time) {
      setError("Please fill in required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (event) {
        await eventsAPI.update(event.id, formData);
      } else {
        await eventsAPI.create(formData);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      title={event ? "Edit Event" : "Create New Event"}
      onConfirm={handleSubmit}
      loading={loading}
      size="lg"
    >
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Event Date *</Form.Label>
              <Form.Control
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Event Time *</Form.Label>
              <Form.Control
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Max Participants</Form.Label>
              <Form.Control
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                placeholder="Unlimited"
                min="1"
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {loading && <LoadingSpinner />}
    </CustomModal>
  );
};

export default EventForm;
