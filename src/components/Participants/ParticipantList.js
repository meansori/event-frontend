// File: src/components/Participants/ParticipantList.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Alert, Form, InputGroup } from "react-bootstrap";
import { participantsAPI } from "../../services/api";
import ParticipantForm from "./ParticipantForm";
import LoadingSpinner from "../Common/LoadingSpinner";

const ParticipantList = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async (search = "") => {
    try {
      let response;
      if (search) {
        response = await participantsAPI.search(search);
      } else {
        response = await participantsAPI.getAll();
      }
      setParticipants(response.data.participants);
    } catch (error) {
      setError("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length === 0 || term.length > 2) {
      loadParticipants(term);
    }
  };

  const handleSuccess = () => {
    loadParticipants(searchTerm);
    setShowModal(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Participants Management</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Participant
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search participants by name or email..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm("");
                loadParticipants();
              }}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">All Participants ({participants.length})</h5>
            </Card.Header>
            <Card.Body>
              {participants.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No participants found</h5>
                  <p className="text-muted">
                    {searchTerm ? "Try adjusting your search terms" : "Add your first participant to get started"}
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                      Add Participant
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Institution</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td>{participant.name}</td>
                        <td>{participant.email || "-"}</td>
                        <td>{participant.phone || "-"}</td>
                        <td>{participant.institution || "-"}</td>
                        <td>{new Date(participant.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ParticipantForm show={showModal} onHide={() => setShowModal(false)} onSuccess={handleSuccess} />
    </Container>
  );
};

export default ParticipantList;
