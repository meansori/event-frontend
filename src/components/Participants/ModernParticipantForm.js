// File: src/components/Participants/ModernParticipantForm.js
import React, { useState } from "react";
import { Modal, Form, Alert } from "react-bootstrap";
import { participantsAPI } from "../../services/api";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import { validateEmail } from "../../utils/helpers";

const ModernParticipantForm = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await participantsAPI.create(formData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add participant");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      institution: "",
    });
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered className="modern-modal">
      <Modal.Header closeButton className="modern-modal-header">
        <Modal.Title>Add New Participant</Modal.Title>
      </Modal.Header>

      <Modal.Body className="modern-modal-body">
        {error && (
          <Alert variant="danger" className="modern-alert">
            {error}
          </Alert>
        )}

        <Form>
          <Form.Group className="modern-form-group">
            <Form.Label className="modern-form-label">
              Full Name <span className="required">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter participant's full name"
              className="modern-form-control"
            />
          </Form.Group>

          <Form.Group className="modern-form-group">
            <Form.Label className="modern-form-label">Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address (optional)"
              className="modern-form-control"
            />
          </Form.Group>

          <Form.Group className="modern-form-group">
            <Form.Label className="modern-form-label">Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number (optional)"
              className="modern-form-control"
            />
          </Form.Group>

          <Form.Group className="modern-form-group">
            <Form.Label className="modern-form-label">Institution</Form.Label>
            <Form.Control
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Enter institution/organization (optional)"
              className="modern-form-control"
            />
          </Form.Group>
        </Form>

        {loading && <ModernLoadingSpinner />}
      </Modal.Body>

      <Modal.Footer className="modern-modal-footer">
        <button type="button" className="btn-modern-secondary" onClick={handleModalClose} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="btn-modern-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Adding..." : "Add Participant"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModernParticipantForm;
