// File: src/components/Landing/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <Badge bg="primary" className="mb-3">
                ✨ NEW GENERATION ATTENDANCE
              </Badge>
              <h1 className="hero-title">
                Manage Your Community
                <span className="gradient-text"> Like a Pro</span>
              </h1>
              <p className="hero-subtitle">
                Platform modern untuk mengelola kegiatan dan kehadiran komunitas Anda. Dari event planning sampai
                laporan kehadiran - semua dalam satu aplikasi.
              </p>
              <div className="hero-buttons">
                <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                  Get Started Free
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Sign In
                </Button>
              </div>
              <div className="hero-stats mt-4">
                <div className="stat-item">
                  <strong>500+</strong>
                  <span>Communities</span>
                </div>
                <div className="stat-item">
                  <strong>10K+</strong>
                  <span>Events</span>
                </div>
                <div className="stat-item">
                  <strong>100K+</strong>
                  <span>Participants</span>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-visual">
                <div className="floating-card card-1">
                  <div className="card-content">
                    <div className="card-header">
                      <span className="event-dot"></span>
                      <span>Community Meeting</span>
                    </div>
                    <div className="card-stats">
                      <span>📅 Today, 19:00</span>
                      <span>👥 45 Participants</span>
                    </div>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-content">
                    <div className="attendance-badge present">Present: 38</div>
                    <div className="attendance-badge late">Late: 5</div>
                    <div className="attendance-badge absent">Absent: 2</div>
                  </div>
                </div>
                <div className="floating-card card-3">
                  <div className="card-content">
                    <div className="participant-item">
                      <span className="avatar">👤</span>
                      <span>John Doe</span>
                      <span className="status present">✓</span>
                    </div>
                    <div className="participant-item">
                      <span className="avatar">👤</span>
                      <span>Jane Smith</span>
                      <span className="status late">⌚</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <Badge bg="light" text="dark" className="mb-3">
                🔥 FEATURES
              </Badge>
              <h2>Everything You Need in One Platform</h2>
              <p className="text-muted">Designed for modern communities</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body>
                  <div className="feature-icon">📅</div>
                  <h5>Event Management</h5>
                  <p>Buat dan kelola jadwal kegiatan dengan mudah. Share langsung ke anggota komunitas.</p>
                  <ul className="feature-list">
                    <li>✅ Buat event dalam 30 detik</li>
                    <li>✅ Auto reminders</li>
                    <li>✅ Calendar integration</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body>
                  <div className="feature-icon">👥</div>
                  <h5>Smart Attendance</h5>
                  <p>Rekam kehadiran secara real-time dengan berbagai status (Hadir, Terlambat, Absen).</p>
                  <ul className="feature-list">
                    <li>✅ QR Code attendance</li>
                    <li>✅ Bulk attendance</li>
                    <li>✅ Real-time tracking</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body>
                  <div className="feature-icon">📊</div>
                  <h5>Analytics & Reports</h5>
                  <p>Dapatkan insight lengkap tentang partisipasi anggota untuk pengambilan keputusan.</p>
                  <ul className="feature-list">
                    <li>✅ Visual statistics</li>
                    <li>✅ Export to PDF/Excel</li>
                    <li>✅ Attendance trends</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <Badge bg="light" text="dark" className="mb-3">
                🚀 GET STARTED
              </Badge>
              <h2>Simple in 3 Steps</h2>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="text-center">
              <div className="step-number">1</div>
              <h5>Create Your Community</h5>
              <p>Daftar dalam 30 detik dan setup organisasi Anda</p>
            </Col>
            <Col md={4} className="text-center">
              <div className="step-number">2</div>
              <h5>Add Events & Members</h5>
              <p>Buat kegiatan pertama dan undang anggota</p>
            </Col>
            <Col md={4} className="text-center">
              <div className="step-number">3</div>
              <h5>Track & Analyze</h5>
              <p>Pantau kehadiran dan dapatkan insights</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2>Ready to Transform Your Community Management?</h2>
              <p className="lead">Join hundreds of communities already using our platform</p>
              <Button as={Link} to="/register" variant="primary" size="lg" className="cta-button">
                Start Free Today 🚀
              </Button>
              <p className="small text-muted mt-2">No credit card required • Free forever for small communities</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row>
            <Col md={4}>
              <h6>Community Attendance</h6>
              <p>Modern platform untuk manajemen komunitas yang lebih baik dan efisien.</p>
            </Col>
            <Col md={2}>
              <h6>Product</h6>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#api">API</a>
                </li>
              </ul>
            </Col>
            <Col md={2}>
              <h6>Company</h6>
              <ul>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
              </ul>
            </Col>
            <Col md={2}>
              <h6>Support</h6>
              <ul>
                <li>
                  <a href="#help">Help Center</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
                <li>
                  <a href="#status">Status</a>
                </li>
              </ul>
            </Col>
            <Col md={2}>
              <h6>Legal</h6>
              <ul>
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#terms">Terms</a>
                </li>
                <li>
                  <a href="#cookies">Cookies</a>
                </li>
              </ul>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col md={6}>
              <p>&copy; 2024 Community Attendance. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-end">
              <div className="social-links">
                <a href="#twitter">Twitter</a>
                <a href="#instagram">Instagram</a>
                <a href="#linkedin">LinkedIn</a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
