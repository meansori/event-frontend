// File: src/components/Layout/ModernNavbar.js
import React from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ModernNavbar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  return (
    <Navbar className="modern-navbar" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <div className="brand-logo">📊</div>
          <span className="brand-text"></span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {admin ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/" className="nav-link">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/events" className="nav-link">
                  Events
                </Nav.Link>
                <Nav.Link as={Link} to="/participants" className="nav-link">
                  Participants
                </Nav.Link>
                <Nav.Link as={Link} to="/bulk-attendance" className="nav-link">
                  Bulk Attendance
                </Nav.Link>
                <Nav.Link as={Link} to="/reports" className="nav-link">
                  Reports
                </Nav.Link>
              </Nav>

              <Nav className="align-items-center">
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline" className="user-dropdown">
                    <div className="user-avatar">
                      {admin.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className="user-name">{admin.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item as={Link} to="/" className="dropdown-item">
                      👤 Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/" className="dropdown-item">
                      ⚙️ Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="dropdown-item logout-item">
                      🚪 Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login" className="nav-link">
                Login
              </Nav.Link>
              <Button as={Link} to="/register" className="btn-modern-primary">
                Sign Up Free
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ModernNavbar;
