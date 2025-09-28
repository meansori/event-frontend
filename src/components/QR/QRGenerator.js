// File: src/components/QR/QRGenerator.js (Simplified)
import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Card, Row, Col, Badge } from "react-bootstrap";
import { qrAPI } from "../../services/api";
import { QrCode, Download, RefreshCw } from "lucide-react";
import "./QRGenerator.css";

const QRGenerator = ({ event, show, onHide }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      loadExistingQRCode();
    }
  }, [show, event.id]);

  const loadExistingQRCode = async () => {
    setLoadingExisting(true);
    try {
      const response = await qrAPI.getEventQR(event.id);
      console.log("Existing QR Response:", response);

      if (response.data && response.data.qr_code) {
        setQrCode(response.data.qr_code);
      }
    } catch (error) {
      console.log("No existing QR code found:", error);
      // No need to set error, just means no QR exists yet
    } finally {
      setLoadingExisting(false);
    }
  };

  const generateQRCode = async () => {
    console.log("Generating QR code for event:", event.id);
    setLoading(true);
    setError("");

    try {
      const response = await qrAPI.generate(event.id);
      console.log("QR API Response:", response);

      if (response.data && response.data.qr_code) {
        setQrCode(response.data.qr_code);
      } else if (response.data && response.data.data && response.data.data.qr_code) {
        // Handle the response format you showed in the image
        const qrData = response.data.data;
        setQrCode({
          qr_data: {
            event_id: qrData.event_id,
            event_title: qrData.event_title,
            type: "event_attendance",
          },
          image_url: qrData.qr_code, // Base64 image data
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);

      if (error.response?.status === 404) {
        setError("Event not found. Please check if the event exists.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please check backend logs.");
      } else if (error.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError(error.response?.data?.message || error.message || "Failed to generate QR code");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCode?.image_url) {
      // Handle base64 image data
      if (qrCode.image_url.startsWith("data:image")) {
        const link = document.createElement("a");
        link.href = qrCode.image_url;
        link.download = `qr-code-event-${event.id}-${event.title}.png`;
        link.click();
      } else {
        // Handle URL image
        const link = document.createElement("a");
        link.href = qrCode.image_url;
        link.download = `qr-code-event-${event.id}-${event.title}.png`;
        link.click();
      }
    } else if (qrCode?.qr_data) {
      // Download QR data as JSON
      const dataStr = JSON.stringify(qrCode.qr_data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-data-event-${event.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setQrCode(null);
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="qr-generator-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <QrCode size={24} className="me-2" />
          QR Code - {event.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {loadingExisting ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading QR code...</span>
            </div>
            <p className="mt-2 text-muted">Loading QR code...</p>
          </div>
        ) : (
          <Row>
            <Col md={6}>
              <Card className="qr-info-card">
                <Card.Body>
                  <h6>QR Code Information</h6>
                  <div className="qr-info-list">
                    <div className="info-item">
                      <span className="label">Event ID:</span>
                      <span className="value">{event.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Event:</span>
                      <span className="value">{event.title}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className="value">
                        {qrCode ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Not Generated</Badge>}
                      </span>
                    </div>
                    {qrCode && (
                      <>
                        <div className="info-item">
                          <span className="label">Type:</span>
                          <span className="value">
                            <Badge bg="primary">{qrCode.qr_data?.type || "event_attendance"}</Badge>
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Generated:</span>
                          <span className="value">
                            {qrCode.created_at ? new Date(qrCode.created_at).toLocaleString() : "Just now"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2 mt-3">
                    {qrCode ? (
                      <>
                        <Button variant="outline-success" onClick={downloadQRCode} className="download-btn">
                          <Download size={16} className="me-2" />
                          Download QR Code
                        </Button>

                        <Button variant="outline-warning" onClick={generateQRCode} disabled={loading}>
                          {loading ? (
                            <>
                              <RefreshCw size={16} className="me-2 spinning" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={16} className="me-2" />
                              Regenerate QR Code
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" onClick={generateQRCode} disabled={loading} className="generate-btn">
                        {loading ? (
                          <>
                            <RefreshCw size={16} className="me-2 spinning" />
                            Generating QR Code...
                          </>
                        ) : (
                          <>
                            <QrCode size={16} className="me-2" />
                            Generate QR Code
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="qr-display-card">
                <Card.Body className="text-center">
                  {qrCode ? (
                    <>
                      <div className="qr-code-container">
                        {/* {qrCode.image_url ? (
                          <img
                            src={qrCode.image_url}
                            alt="QR Code"
                            className="qr-code-image"
                            onError={(e) => {
                              console.error("Failed to load QR image");
                              // Show fallback if image fails to load
                              e.target.style.display = "none";
                              const fallback = e.target.parentNode.querySelector(".qr-data-fallback");
                              if (fallback) fallback.style.display = "block";
                            }}
                          />
                        ) : null} */}

                        {/* Fallback for base64 images or when image_url is base64 */}
                        {qrCode.image_url && qrCode.image_url.startsWith("data:image") ? (
                          <img src={qrCode.image_url} alt="QR Code" className="qr-code-image" />
                        ) : !qrCode.image_url ? (
                          <div className="qr-data-fallback">
                            <QrCode size={80} className="text-primary mb-3" />
                            <p className="text-muted mb-2">QR Code Data</p>
                            <div className="qr-data-preview">
                              <small className="text-info">
                                <strong>Event ID:</strong> {qrCode.qr_data?.event_id}
                                <br />
                                <strong>Type:</strong> {qrCode.qr_data?.type}
                                <br />
                                {qrCode.qr_data?.secret && (
                                  <>
                                    <strong>Secret:</strong> {qrCode.qr_data.secret.substring(0, 10)}...
                                  </>
                                )}
                              </small>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <p className="qr-instructions mt-3">
                        Scan this QR code to mark attendance for <strong>{event.title}</strong>
                      </p>

                      {!qrCode.image_url || qrCode.image_url.startsWith("data:image") ? (
                        <Alert variant="info" className="mt-2">
                          <small>
                            <strong>Note:</strong> QR code is ready for scanning.
                            {qrCode.image_url && " (Base64 format)"}
                          </small>
                        </Alert>
                      ) : null}
                    </>
                  ) : (
                    <div className="qr-placeholder">
                      <QrCode size={64} className="text-muted mb-3" />
                      <h6>No QR Code Generated</h6>
                      <p className="text-muted">
                        Generate a QR code to enable quick attendance scanning for your event participants.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default QRGenerator;
