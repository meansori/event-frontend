// File: src/components/Layout/Sidebar.js (Updated)
import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: "🏠", label: "Dashboard" },
    { path: "/events", icon: "📅", label: "Events" },
    { path: "/participants", icon: "👥", label: "Participants" },
    { path: "/bulk-attendance", icon: "📝", label: "Bulk Attendance" },
    { path: "/reports", icon: "📊", label: "Reports" },
  ];

  return (
    <div className="bg-light border-end" style={{ width: "250px", minHeight: "calc(100vh - 76px)" }}>
      <Nav className="flex-column p-3">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`mb-2 rounded ${location.pathname === item.path ? "bg-primary text-white" : "text-dark"}`}
          >
            <span className="me-2">{item.icon}</span>
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
