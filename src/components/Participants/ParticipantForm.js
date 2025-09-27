// File: src/components/Participants/ParticipantForm.js
import React, { useState } from "react";
import { Form, Alert } from "react-bootstrap";
import { participantsAPI } from "../../services/api";
import CustomModal from "../Common/Modal";
import LoadingSpinner from "../Common/LoadingSpinner";
import { validateEmail } from "../../utils/helpers";

const ParticipantForm = ({ show, onHide, onSuccess }) => {
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
    <CustomModal
      show={show}
      onHide={handleModalClose}
      title="Add New Participant"
      onConfirm={handleSubmit}
      loading={loading}
    >
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Full Name *</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter participant's full name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address (optional)"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number (optional)"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Institution</Form.Label>
          <Form.Control
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            placeholder="Enter institution/organization (optional)"
          />
        </Form.Group>
      </Form>

      {loading && <LoadingSpinner />}
    </CustomModal>
  );
};

export default ParticipantForm;
