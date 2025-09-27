// File: src/components/Auth/ModernLogin.js
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernAuth.css";

const ModernLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
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

    try {
      const response = await authAPI.login(formData);
      const { token, admin } = response.data;

      login(token, admin);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed. Please check your credentials.");
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
                <p>Modern community management platform</p>
              </div>
              <div className="testimonial-card">
                <div className="quote">"</div>
                <p>This platform revolutionized how we manage our community. Incredibly intuitive and powerful.</p>
                <div className="author">- Sarah Chen, Community Manager</div>
              </div>
            </div>
          </Col>
          <Col lg={6} className="auth-form-side">
            <div className="auth-form-container">
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Sign in to your account</p>
              </div>

              {error && (
                <Alert variant="danger" className="modern-alert">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="modern-form-group">
                  <Form.Label className="modern-form-label">Email Address</Form.Label>
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
                  <Form.Label className="modern-form-label">
                    Password
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot password?
                    </Link>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="modern-form-control"
                  />
                </Form.Group>

                <Button type="submit" className="btn-modern-primary w-100 auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
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
                  Don't have an account?{" "}
                  <Link to="/register" className="auth-link">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ModernLogin;
