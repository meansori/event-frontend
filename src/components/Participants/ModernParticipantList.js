// File: src/components/Participants/ModernParticipantList.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, InputGroup, Badge } from "react-bootstrap";
import { participantsAPI } from "../../services/api";
import ModernParticipantForm from "./ModernParticipantForm";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernParticipants.css";

const ModernParticipantList = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm]);

  const loadParticipants = async () => {
    try {
      const response = await participantsAPI.getAll();
      setParticipants(response.data.participants);
    } catch (error) {
      setError("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  const filterParticipants = () => {
    let filtered = participants;

    if (searchTerm) {
      filtered = filtered.filter(
        (participant) =>
          participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant.institution?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleSuccess = () => {
    loadParticipants();
    setShowModal(false);
  };

  if (loading) return <ModernLoadingSpinner />;

  return (
    <div className="modern-participants-page">
      <Container fluid>
        {/* Header */}
        <Row className="page-header">
          <Col>
            <div className="header-content">
              <div>
                <h1>Participants</h1>
                <p>Manage your community members</p>
              </div>
              <Button className="btn-modern-primary" onClick={() => setShowModal(true)}>
                <span className="btn-icon">+</span>
                Add Participant
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats */}
        <Row className="stats-overview">
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item total">
              <div className="stat-value">{participants.length}</div>
              <div className="stat-label">Total Participants</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item with-email">
              <div className="stat-value">{participants.filter((p) => p.email).length}</div>
              <div className="stat-label">With Email</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item with-phone">
              <div className="stat-value">{participants.filter((p) => p.phone).length}</div>
              <div className="stat-label">With Phone</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stat-item recent">
              <div className="stat-value">
                {
                  participants.filter((p) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(p.created_at) > weekAgo;
                  }).length
                }
              </div>
              <div className="stat-label">Added This Week</div>
            </div>
          </Col>
        </Row>

        {/* Search */}
        <Row className="filters-section">
          <Col lg={6}>
            <InputGroup className="search-box">
              <InputGroup.Text className="search-icon">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search participants by name, email, or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-form-control"
              />
            </InputGroup>
          </Col>
          <Col lg={6}>
            <div className="results-count">
              Showing {filteredParticipants.length} of {participants.length} participants
            </div>
          </Col>
        </Row>

        {/* Participants Grid */}
        <Row>
          {filteredParticipants.length === 0 ? (
            <Col>
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No participants found</h3>
                <p>
                  {participants.length === 0
                    ? "Get started by adding your first participant"
                    : "Try adjusting your search terms"}
                </p>
                {participants.length === 0 && (
                  <Button className="btn-modern-primary" onClick={() => setShowModal(true)}>
                    Add Your First Participant
                  </Button>
                )}
              </div>
            </Col>
          ) : (
            filteredParticipants.map((participant) => (
              <Col key={participant.id} xl={4} lg={6} className="mb-4">
                <ParticipantCard participant={participant} />
              </Col>
            ))
          )}
        </Row>

        {/* Add Participant Modal */}
        <ModernParticipantForm show={showModal} onHide={() => setShowModal(false)} onSuccess={handleSuccess} />
      </Container>
    </div>
  );
};

// Participant Card Component
const ParticipantCard = ({ participant }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="modern-card participant-card">
      <div className="participant-header">
        <div
          className="participant-avatar"
          style={{
            backgroundColor: stringToColor(participant.name),
            color: "white",
          }}
        >
          {getInitials(participant.name)}
        </div>
        <div className="participant-info">
          <h6 className="participant-name">{participant.name}</h6>
          <Badge bg="light" text="dark" className="participant-badge">
            Member
          </Badge>
        </div>
      </div>

      <div className="participant-details">
        {participant.email && (
          <div className="detail-item">
            <span className="detail-icon">📧</span>
            <span className="detail-text">{participant.email}</span>
          </div>
        )}

        {participant.phone && (
          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <span className="detail-text">{participant.phone}</span>
          </div>
        )}

        {participant.institution && (
          <div className="detail-item">
            <span className="detail-icon">🏢</span>
            <span className="detail-text">{participant.institution}</span>
          </div>
        )}
      </div>

      <div className="participant-footer">
        <div className="joined-date">Joined {new Date(participant.created_at).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

// Helper function to generate consistent color from string
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  return colors[Math.abs(hash) % colors.length];
};

export default ModernParticipantList;
