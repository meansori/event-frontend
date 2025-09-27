// File: src/components/Layout/Navbar.js (Updated)
import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link
import { useAuth } from "../../context/AuthContext";

const AppNavbar = () => {
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/landing"; // Redirect ke landing page setelah logout
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          📊 Community Attendance
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {admin ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/events">
                  Events
                </Nav.Link>
                <Nav.Link as={Link} to="/participants">
                  Participants
                </Nav.Link>
                <Nav.Link as={Link} to="/reports">
                  Reports
                </Nav.Link>
              </Nav>

              <Nav>
                <Navbar.Text className="me-3">Welcome, {admin.name}</Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
              <Button as={Link} to="/register" variant="light" size="sm">
                Sign Up Free
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
