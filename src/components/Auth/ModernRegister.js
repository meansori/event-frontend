// File: src/components/Auth/ModernRegister.js
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernAuth.css";

const ModernRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization_name: formData.organization_name,
      });

      navigate("/login?message=Registration successful. Please login.");
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-page">
      <Container fluid>
        <Row className="min-vh-100">
          <Col lg={6} className="auth-visual-side">
            <div className="auth-background">
              <div className="floating-elements">
                <div className="element element-1"></div>
                <div className="element element-2"></div>
                <div className="element element-3"></div>
              </div>
            </div>
            <div className="auth-content">
              <div className="brand-section">
                <div className="brand-logo">📊</div>
                <h1>IMANPRO</h1>
                <p>Join thousands of communities managing their events</p>
              </div>
              <div className="testimonial-card">
                <div className="quote">"</div>
                <p>Setting up our community management has never been easier. The platform just works!</p>
                <div className="author">- Marcus Rodriguez, Community Lead</div>
              </div>
            </div>
          </Col>
          <Col lg={6} className="auth-form-side">
            <div className="auth-form-container">
              <div className="auth-header">
                <h2>Create Account</h2>
                <p>Start your community management journey</p>
              </div>

              {error && (
                <Alert variant="danger" className="modern-alert">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="modern-form-group">
                  <Form.Label className="modern-form-label">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="modern-form-control"
                  />
                </Form.Group>

                <Form.Group className="modern-form-group">
                  <Form.Label className="modern-form-label">Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="modern-form-control"
                  />
                </Form.Group>

                <Form.Group className="modern-form-group">
                  <Form.Label className="modern-form-label">Organization</Form.Label>
                  <Form.Control
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="Your organization name (optional)"
                    className="modern-form-control"
                  />
                </Form.Group>

                <Form.Group className="modern-form-group">
                  <Form.Label className="modern-form-label">Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
                    className="modern-form-control"
                  />
                  <Form.Text className="text-muted">Must be at least 6 characters long</Form.Text>
                </Form.Group>

                <Form.Group className="modern-form-group">
                  <Form.Label className="modern-form-label">Confirm Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className="modern-form-control"
                  />
                </Form.Group>

                <Button type="submit" className="btn-modern-primary w-100 auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <ModernLoadingSpinner size="sm" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Form>

              {/* <div className="auth-divider">
                <span>Or continue with</span>
              </div>

              <div className="social-auth">
                <Button variant="outline" className="social-btn google-btn">
                  <span className="social-icon">🔍</span>
                  Google
                </Button>
                <Button variant="outline" className="social-btn github-btn">
                  <span className="social-icon">💻</span>
                  GitHub
                </Button>
              </div> */}

              <div className="auth-footer">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="auth-link">
                    Sign in here
                  </Link>
                </p>
                <p className="terms-text">
                  By creating an account, you agree to our <a href="#terms">Terms of Service</a> and{" "}
                  <a href="#privacy">Privacy Policy</a>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ModernRegister;
