// File: src/components/QR/QRScanner.js (Fixed with useRef and proper DOM handling)
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Modal, Button, Alert, Card, Form, Row, Col } from "react-bootstrap";
import { Html5QrcodeScanner } from "html5-qrcode";
import { qrAPI, participantsAPI } from "../../services/api";
import { Camera, Scan, User, Mail, Phone, QrCode, Search, Check } from "lucide-react";
import "./QRScanner.css";

const QRScanner = ({ event, show, onHide, onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [manualEntry, setManualEntry] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Gunakan useRef untuk formData agar selalu up-to-date
  const formDataRef = useRef({
    email: "",
    name: "",
    phone: "",
  });

  // State untuk UI updates
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });

  // Ref untuk elemen DOM scanner
  const scannerRef = useRef(null);
  const qrReaderRef = useRef(null);

  // Sync formDataRef dengan formData
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Efek untuk inisialisasi scanner
  useEffect(() => {
    if (show && !isInitialized) {
      // Tunggu sedikit untuk memastikan DOM sudah siap
      const timer = setTimeout(() => {
        initializeScanner();
      }, 300);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => {
          console.error("Failed to clear scanner:", error);
        });
      }
    };
  }, [show, isInitialized]);

  const initializeScanner = useCallback(() => {
    // Periksa apakah elemen qr-reader sudah ada di DOM
    if (!qrReaderRef.current) {
      console.error("QR reader element not found in DOM");
      setError("Failed to initialize QR scanner: Element not found");
      return;
    }

    // Jika scanner sudah ada, hapus dulu
    if (scanner) {
      scanner.clear().catch((error) => {
        console.error("Failed to clear existing scanner:", error);
      });
      setScanner(null);
    }

    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [],
        },
        false
      );

      html5QrcodeScanner.render(onQRCodeSuccess, onQRCodeError);

      setScanner(html5QrcodeScanner);
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize QR scanner:", err);
      setError("Failed to initialize QR scanner: " + err.message);
    }
  }, [scanner]);

  const searchParticipant = async (email) => {
    if (!email) return;

    setSearching(true);
    try {
      const response = await participantsAPI.search(email);
      console.log("Search results:", response.data);
      setSearchResults(response.data.participants || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (field, value) => {
    const newFormData = {
      ...formDataRef.current,
      [field]: value,
    };

    setFormData(newFormData);

    // Auto search when email changes
    if (field === "email" && value.length > 2) {
      searchParticipant(value);
    } else if (field === "email" && value.length <= 2) {
      setSearchResults([]);
    }
  };

  const selectParticipant = (participant) => {
    console.log("Selected participant:", participant);

    const newFormData = {
      email: participant.email || "",
      name: participant.name || "",
      phone: participant.phone || "",
    };

    setFormData(newFormData);
    setSearchResults([]);
  };

  const onQRCodeSuccess = async (decodedText) => {
    await handleScan(decodedText);
  };

  const onQRCodeError = (error) => {
    if (!error.includes("No MultiFormat Readers") && !error.includes("NotFoundException")) {
      console.log("QR Scanner error:", error);
    }
  };

  const handleScan = async (qrData) => {
    setScanning(true);
    setError("");

    try {
      console.log("QR Data to scan:", qrData);

      // Gunakan formDataRef.current untuk mendapatkan nilai terbaru
      const currentFormData = formDataRef.current;
      console.log("Current Form Data (from ref):", currentFormData);

      // Parse QR data to ensure it's valid JSON
      let parsedQRData;
      try {
        parsedQRData = JSON.parse(qrData);
        console.log("Parsed QR data:", parsedQRData);
      } catch (parseError) {
        throw new Error("Invalid QR code format");
      }

      // Validasi email menggunakan currentFormData
      if (!currentFormData.email || !currentFormData.email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Prepare participant data menggunakan currentFormData
      const participantData = {
        email: currentFormData.email.trim(),
      };

      console.log("Sending scan request with:", {
        qr_data: qrData,
        participant_data: participantData,
      });

      const response = await qrAPI.scan(qrData, participantData);
      console.log("Scan response:", response.data);

      setResult(response.data);
      onScanSuccess(response.data);

      // Reset form setelah success
      const resetFormData = {
        email: "",
        name: "",
        phone: "",
      };
      setFormData(resetFormData);
      setSearchResults([]);
      setManualEntry(false);

      // Stop scanner setelah successful scan
      if (scanner) {
        scanner.clear();
        setScanner(null);
        setIsInitialized(false);
      }
    } catch (error) {
      console.error("Scan error details:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid request data";
        let detailedError = `Bad Request: ${errorMessage}`;

        if (error.response.data?.details) {
          detailedError += ` - ${error.response.data.details}`;
        }
        setError(detailedError);
      } else if (error.response?.status === 404) {
        setError("Participant not found. Please check the email address or register the participant first.");
      } else if (error.response?.status === 409) {
        setError("Attendance already recorded for this participant.");
      } else if (error.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError(error.response?.data?.message || error.message || "Failed to process QR code");
      }
    } finally {
      setScanning(false);
    }
  };

  const handleManualScan = async () => {
    const currentFormData = formDataRef.current;

    if (!currentFormData.email) {
      setError("Please enter participant email");
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentFormData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Untuk manual scan, buat QR data structure yang valid
    const qrData = JSON.stringify({
      event_id: event.id,
      secret: `manual_${event.id}_${Date.now()}`,
      type: "event_attendance",
      timestamp: new Date().toISOString(),
    });

    await handleScan(qrData);
  };

  const handleClose = () => {
    if (scanner) {
      scanner.clear().catch((error) => {
        console.error("Failed to clear scanner:", error);
      });
    }
    setResult(null);
    setError("");
    setManualEntry(false);
    const resetFormData = {
      email: "",
      name: "",
      phone: "",
    };
    setFormData(resetFormData);
    setSearchResults([]);
    setScanner(null);
    setIsInitialized(false);
    onHide();
  };

  const resetForm = () => {
    const resetFormData = {
      email: "",
      name: "",
      phone: "",
    };
    setFormData(resetFormData);
    setSearchResults([]);
    setResult(null);
    setError("");
    setIsInitialized(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      className="qr-scanner-modal"
      onEntered={() => {
        // Reset initialization state when modal is opened
        if (!isInitialized) {
          initializeScanner();
        }
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <Scan size={24} className="me-2" />
          Scan QR Code - {event.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {result && (
          <div className="scan-success">
            <div className="success-icon">
              <Check size={32} />
            </div>
            <h6>Attendance Recorded Successfully!</h6>
            <div className="success-details">
              <p>
                <strong>Participant:</strong> {result.participant_name}
              </p>
              <p>
                <strong>Status:</strong> <span className="status-badge">{result.attendance_status}</span>
              </p>
              <p>
                <strong>Time:</strong> {new Date(result.attendance_time).toLocaleString()}
              </p>
            </div>
            <Button variant="outline-success" size="sm" onClick={resetForm} className="mt-2">
              Scan Another Participant
            </Button>
          </div>
        )}

        {!result && (
          <Row>
            <Col md={6}>
              <Card className="scanner-card">
                <Card.Body className="text-center p-0">
                  <div className="scanner-container">
                    <div ref={qrReaderRef} id="qr-reader" style={{ width: "100%", height: "100%" }}></div>
                    {!scanner && (
                      <div className="scanner-loading">
                        <div className="spinner-border text-light" role="status">
                          <span className="visually-hidden">Loading scanner...</span>
                        </div>
                        <p>Initializing camera...</p>
                      </div>
                    )}
                  </div>
                  <div className="scanner-instructions mt-3 p-3">
                    <QrCode size={16} className="me-2" />
                    Point camera at participant's QR code to scan automatically
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="manual-entry-card">
                <Card.Body>
                  <h6>
                    <User size={16} className="me-2" />
                    Participant Information
                  </h6>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Mail size={14} className="me-1" />
                      Participant Email *
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="participant@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={scanning}
                      className="email-input"
                    />

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="search-results mt-2">
                        <small className="text-muted mb-2 d-block">Found {searchResults.length} participant(s):</small>
                        {searchResults.map((participant) => (
                          <div
                            key={participant.id || participant.email}
                            className="search-result-item"
                            onClick={() => selectParticipant(participant)}
                          >
                            <div className="participant-info">
                              <div className="participant-name">{participant.name}</div>
                              <div className="participant-email">{participant.email}</div>
                              {participant.phone && <div className="participant-phone">📱 {participant.phone}</div>}
                            </div>
                            <div className="select-indicator">
                              <small>Click to select</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searching && (
                      <div className="text-center mt-2">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Searching...</span>
                        </div>
                        <small className="text-muted ms-2">Searching participants...</small>
                      </div>
                    )}
                  </Form.Group>

                  <div className="scanner-actions">
                    <Button
                      variant="primary"
                      onClick={handleManualScan}
                      disabled={scanning || !formData.email}
                      className="w-100 scan-btn"
                    >
                      {scanning ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Processing Attendance...
                        </>
                      ) : (
                        <>
                          <Scan size={16} className="me-2" />
                          Record Attendance
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => setManualEntry(!manualEntry)}
                      disabled={scanning}
                      className="w-100 mt-2"
                    >
                      {manualEntry ? "Hide Additional Info" : "Show Additional Info"}
                    </Button>
                  </div>

                  {manualEntry && (
                    <div className="manual-form mt-3">
                      <Form.Group className="mb-2">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={scanning}
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>
                          <Phone size={14} className="me-1" />
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="08123456789"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={scanning}
                        />
                      </Form.Group>
                      <small className="text-muted">
                        Additional information will be used if participant is not found in system.
                      </small>
                    </div>
                  )}

                  {/* Current Selection Info */}
                  {formData.email && (
                    <div className="current-selection mt-3 p-2 bg-light rounded">
                      <small className="text-success">
                        <strong>Current Selection:</strong>
                        <br />
                        Email: {formData.email}
                        <br />
                        {formData.name && `Name: ${formData.name}`}
                        {formData.name && formData.phone && <br />}
                        {formData.phone && `Phone: ${formData.phone}`}
                      </small>
                    </div>
                  )}

                  {/* Debug Info */}
                  <div className="debug-info mt-3 p-2 bg-light rounded">
                    <small className="text-muted">
                      <strong>Debug Info:</strong>
                      <br />
                      FormData State: {formData.email || "(empty)"}
                      <br />
                      FormData Ref: {formDataRef.current.email || "(empty)"}
                      <br />
                      Scanner Initialized: {isInitialized ? "Yes" : "No"}
                      <br />
                      QR Reader Element: {qrReaderRef.current ? "Exists" : "Not Found"}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default QRScanner;
