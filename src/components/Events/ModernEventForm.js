// File: src/components/Events/ModernEventForm.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Alert } from "react-bootstrap";
import { eventsAPI } from "../../services/api";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernEventForm.css";

const ModernEventForm = ({ show, onHide, event, onSuccess }) => {
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
      setError("Please fill in all required fields");
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
    <Modal show={show} onHide={onHide} size="lg" centered className="modern-modal">
      <Modal.Header closeButton className="modern-modal-header">
        <Modal.Title>{event ? "Edit Event" : "Create New Event"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="modern-modal-body">
        {error && (
          <Alert variant="danger" className="modern-alert">
            {error}
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={8}>
              <Form.Group className="modern-form-group">
                <Form.Label className="modern-form-label">
                  Event Title <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  className="modern-form-control"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modern-form-group">
                <Form.Label className="modern-form-label">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="modern-form-control"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="modern-form-group">
            <Form.Label className="modern-form-label">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              className="modern-form-control"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="modern-form-group">
                <Form.Label className="modern-form-label">
                  Event Date <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="modern-form-control"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="modern-form-group">
                <Form.Label className="modern-form-label">
                  Event Time <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                  className="modern-form-control"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="modern-form-group">
                <Form.Label className="modern-form-label">Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  className="modern-form-control"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modern-form-group">
                <Form.Label className="modern-form-label">Max Participants</Form.Label>
                <Form.Control
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  min="1"
                  className="modern-form-control"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>

        {loading && <ModernLoadingSpinner />}
      </Modal.Body>

      <Modal.Footer className="modern-modal-footer">
        <button type="button" className="btn-modern-secondary" onClick={onHide} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="btn-modern-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModernEventForm;
