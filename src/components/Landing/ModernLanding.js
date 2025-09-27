// File: src/components/Landing/ModernLanding.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./ModernLanding.css";

const ModernLanding = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="modern-landing">
      {/* Navigation */}
      <nav className={`landing-nav ${scrollY > 50 ? "scrolled" : ""}`}>
        <Container>
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-logo">📊</div>
              <span className="brand-text">IMANPRO</span>
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#testimonials">Testimonials</a>
              <Link to="/login" className="login-btn">
                Sign In
              </Link>
              <Button as={Link} to="/register" variant="primary" className="cta-nav">
                Get Started Free
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-content">
              <Badge bg="light" text="dark" className="hero-badge">
                🚀 NEXT GENERATION PLATFORM
              </Badge>
              <h1 className="hero-title">
                Revolutionize Your
                <span className="gradient-text"> Community Management</span>
              </h1>
              <p className="hero-subtitle">
                The ultimate all-in-one platform for modern communities. Streamline events, track attendance, and gain
                powerful insights with our intuitive dashboard.
              </p>
              <div className="hero-buttons">
                <Button as={Link} to="/register" variant="primary" size="lg" className="hero-btn-primary">
                  Start Free Trial
                  <span className="btn-arrow">→</span>
                </Button>
                <Button variant="outline-dark" size="lg" className="hero-btn-secondary">
                  <span className="play-icon">▶</span>
                  Watch Demo
                </Button>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">4.9/5</div>
                  <div className="stat-label">Rating</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">2K+</div>
                  <div className="stat-label">Active Communities</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">Uptime</div>
                </div>
              </div>
            </Col>
            <Col lg={6} className="hero-visual">
              <div className="dashboard-preview">
                <div className="browser-window">
                  <div className="browser-header">
                    <div className="browser-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="browser-content">
                    <div className="dashboard-grid">
                      <div className="metric-card card-1">
                        <div className="metric-icon">📅</div>
                        <div className="metric-content">
                          <div className="metric-value">156</div>
                          <div className="metric-label">Events This Month</div>
                        </div>
                      </div>
                      <div className="metric-card card-2">
                        <div className="metric-icon">👥</div>
                        <div className="metric-content">
                          <div className="metric-value">89%</div>
                          <div className="metric-label">Average Attendance</div>
                        </div>
                      </div>
                      <div className="chart-card">
                        <div className="chart-header">
                          <span>Attendance Trends</span>
                          <Badge bg="success">+12%</Badge>
                        </div>
                        <div className="chart-visual">
                          <div className="chart-bar" style={{ height: "60%" }}></div>
                          <div className="chart-bar" style={{ height: "80%" }}></div>
                          <div className="chart-bar" style={{ height: "45%" }}></div>
                          <div className="chart-bar" style={{ height: "90%" }}></div>
                          <div className="chart-bar" style={{ height: "75%" }}></div>
                        </div>
                      </div>
                      <div className="recent-activity">
                        <div className="activity-item">
                          <div className="activity-avatar">A</div>
                          <div className="activity-content">
                            <div className="activity-text">New event created</div>
                            <div className="activity-time">2 min ago</div>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-avatar">B</div>
                          <div className="activity-content">
                            <div className="activity-text">Attendance recorded</div>
                            <div className="activity-time">5 min ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Logo Cloud */}
      <section className="logo-cloud">
        <Container>
          <div className="section-header">
            <p>Trusted by innovative communities worldwide</p>
          </div>
          <div className="logos-grid">
            {["TechStart", "EduGroup", "CreativeHub", "GreenCommunity", "YouthNetwork", "InnovateSpace"].map(
              (logo, index) => (
                <div key={index} className="logo-item">
                  {logo}
                </div>
              )
            )}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <Container>
          <Row className="section-header">
            <Col lg={8} className="mx-auto text-center">
              <Badge bg="primary" className="section-badge">
                FEATURES
              </Badge>
              <h2>Everything You Need to Grow Your Community</h2>
              <p className="section-subtitle">
                Powerful features designed to save you time and provide valuable insights
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={4} className="mb-5">
              <FeatureCard
                icon="🎯"
                title="Smart Event Management"
                description="Create and manage events with our intuitive calendar system. Send automated reminders and track RSVPs in real-time."
                features={["Drag & Drop Calendar", "Automated Reminders", "RSVP Tracking", "Recurring Events"]}
                color="#6366F1"
              />
            </Col>
            <Col lg={4} className="mb-5">
              <FeatureCard
                icon="📊"
                title="Advanced Analytics"
                description="Gain deep insights into member participation with beautiful dashboards and detailed reports."
                features={["Real-time Dashboard", "Export to PDF/Excel", "Trend Analysis", "Custom Reports"]}
                color="#10B981"
              />
            </Col>
            <Col lg={4} className="mb-5">
              <FeatureCard
                icon="🔔"
                title="Smart Notifications"
                description="Keep everyone informed with automated notifications via email, SMS, and in-app messaging."
                features={["Multi-channel Alerts", "Custom Templates", "Scheduled Messages", "Delivery Reports"]}
                color="#F59E0B"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <Container>
          <Row className="section-header">
            <Col lg={8} className="mx-auto text-center">
              <Badge bg="primary" className="section-badge">
                HOW IT WORKS
              </Badge>
              <h2>Get Started in Minutes</h2>
            </Col>
          </Row>
          <Row>
            <Col lg={4} className="text-center mb-4">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon">🚀</div>
                <h5>Create Your Space</h5>
                <p>Sign up and set up your community in under 2 minutes</p>
              </div>
            </Col>
            <Col lg={4} className="text-center mb-4">
              <div className="step-card">
                <div className="step-number">02</div>
                <div className="step-icon">📅</div>
                <h5>Add Events & Members</h5>
                <p>Import members and schedule your first event effortlessly</p>
              </div>
            </Col>
            <Col lg={4} className="text-center mb-4">
              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon">📈</div>
                <h5>Track & Analyze</h5>
                <p>Monitor participation and get actionable insights</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <Container>
          <Row className="section-header">
            <Col lg={8} className="mx-auto text-center">
              <Badge bg="primary" className="section-badge">
                TESTIMONIALS
              </Badge>
              <h2>Loved by Community Leaders</h2>
            </Col>
          </Row>
          <Row>
            <Col lg={4} className="mb-4">
              <TestimonialCard
                quote="This platform transformed how we manage our 500+ member community. Attendance tracking used to take hours, now it's minutes!"
                author="Sarah Chen"
                role="Community Manager, TechStart"
                avatar="SC"
              />
            </Col>
            <Col lg={4} className="mb-4">
              <TestimonialCard
                quote="The analytics alone are worth it. We've increased member engagement by 40% using the insights from this platform."
                author="Marcus Rodriguez"
                role="Director, EduGroup"
                avatar="MR"
              />
            </Col>
            <Col lg={4} className="mb-4">
              <TestimonialCard
                quote="Finally, a tool that understands what community managers actually need. The bulk attendance feature is a game-changer!"
                author="Jessica Wang"
                role="Founder, CreativeHub"
                avatar="JW"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2>Ready to Transform Your Community?</h2>
              <p className="cta-subtitle">
                Join thousands of community leaders who are already saving time and driving engagement
              </p>
              <div className="cta-buttons">
                <Button as={Link} to="/register" variant="primary" size="lg" className="cta-btn-primary">
                  Start Free Trial
                  <span className="btn-arrow">→</span>
                </Button>
                <Button variant="outline-light" size="lg" className="cta-btn-secondary">
                  Schedule a Demo
                </Button>
              </div>
              <div className="cta-features">
                <span>✓ No credit card required</span>
                <span>✓ Free 14-day trial</span>
                <span>✓ Setup in minutes</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <div className="footer-brand">
                <div className="brand-logo">📊</div>
                <span className="brand-text">IMANPRO</span>
              </div>
              <p className="footer-description">
                The modern platform for community management and attendance tracking.
              </p>
              <div className="social-links">
                {["Twitter", "LinkedIn", "Instagram", "GitHub"].map((social) => (
                  <a key={social} href={`#${social.toLowerCase()}`} className="social-link">
                    {social}
                  </a>
                ))}
              </div>
            </Col>
            <Col lg={2} className="mb-4">
              <h6>Product</h6>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#integrations">Integrations</a>
                </li>
                <li>
                  <a href="#updates">Updates</a>
                </li>
              </ul>
            </Col>
            <Col lg={2} className="mb-4">
              <h6>Resources</h6>
              <ul>
                <li>
                  <a href="#documentation">Documentation</a>
                </li>
                <li>
                  <a href="#guides">Guides</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#support">Support</a>
                </li>
              </ul>
            </Col>
            <Col lg={2} className="mb-4">
              <h6>Company</h6>
              <ul>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
                <li>
                  <a href="#partners">Partners</a>
                </li>
              </ul>
            </Col>
            <Col lg={2} className="mb-4">
              <h6>Legal</h6>
              <ul>
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#terms">Terms</a>
                </li>
                <li>
                  <a href="#security">Security</a>
                </li>
              </ul>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col md={6}>
              <p className="copyright">&copy; 2024 IMANPRO. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="footer-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#cookies">Cookie Policy</a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, features, color }) => (
  <Card className="feature-card">
    <Card.Body>
      <div className="feature-header">
        <div className="feature-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
        <h5>{title}</h5>
      </div>
      <p>{description}</p>
      <ul className="feature-list">
        {features.map((feature, index) => (
          <li key={index}>
            <span className="check-icon" style={{ color: color }}>
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </Card.Body>
  </Card>
);

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role, avatar }) => (
  <Card className="testimonial-card">
    <Card.Body>
      <div className="testimonial-content">
        <div className="quote-icon">"</div>
        <p>{quote}</p>
        <div className="testimonial-author">
          <div className="author-avatar">{avatar}</div>
          <div className="author-info">
            <div className="author-name">{author}</div>
            <div className="author-role">{role}</div>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default ModernLanding;
