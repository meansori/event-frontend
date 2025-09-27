// File: src/components/Layout/ModernSidebar.js
import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const ModernSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: "🏠", label: "Dashboard" },
    { path: "/events", icon: "📅", label: "Events" },
    { path: "/participants", icon: "👥", label: "Participants" },
    { path: "/bulk-attendance", icon: "📝", label: "Bulk Attendance" },
    { path: "/reports", icon: "📊", label: "Reports" },
  ];

  return (
    <aside className="modern-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Nav.Link>
        ))}
      </nav>

      {/* Quick Stats Section */}
      {/* <div className="sidebar-footer">
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-value">24</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">156</span>
            <span className="stat-label">Participants</span>
          </div>
        </div>
      </div> */}
    </aside>
  );
};

export default ModernSidebar;
