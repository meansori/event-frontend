// File: src/components/Dashboard/ModernDashboard.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { eventsAPI, participantsAPI, attendanceAPI } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernDashboard.css";

const ModernDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    upcomingEvents: 0,
    attendanceRate: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [eventsResponse, participantsResponse] = await Promise.all([eventsAPI.getAll(), participantsAPI.getAll()]);

      const events = eventsResponse.data.events;
      const participants = participantsResponse.data.participants;

      // Calculate stats
      const upcomingEvents = events.filter((event) => new Date(event.event_date) >= new Date()).length;

      // Mock attendance rate calculation
      const attendanceRate = 85; // This would come from actual data

      setStats({
        totalEvents: events.length,
        totalParticipants: participants.length,
        upcomingEvents,
        attendanceRate,
      });

      setRecentEvents(events.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modern-dashboard">
        <Container fluid>
          <ModernLoadingSpinner />
        </Container>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      <Container fluid>
        {/* Header */}
        <Row className="dashboard-header">
          <Col>
            <div className="header-content">
              <h1>Dashboard</h1>
              <p>Welcome back! Here's what's happening with your community.</p>
            </div>
          </Col>
        </Row>

        {/* Stats Grid */}
        <Row className="stats-grid">
          <Col xl={12} lg={12} className="mb-4">
            <StatCard
              icon="📅"
              title="Total Events"
              value={stats.totalEvents}
              change="+12%"
              changeType="positive"
              color="#0ea5e9"
            />
          </Col>
          <Col xl={12} lg={12} className="mb-4">
            <StatCard
              icon="👥"
              title="Total Participants"
              value={stats.totalParticipants}
              change="+8%"
              changeType="positive"
              color="#22c55e"
            />
          </Col>
          <Col xl={12} lg={12} className="mb-4">
            <StatCard
              icon="⏰"
              title="Upcoming Events"
              value={stats.upcomingEvents}
              change="+2"
              changeType="positive"
              color="#f59e0b"
            />
          </Col>
          <Col xl={12} lg={12} className="mb-4">
            <StatCard
              icon="📊"
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              change="+5%"
              changeType="positive"
              color="#8b5cf6"
            />
          </Col>
        </Row>

        {/* Main Content */}
        <Row>
          {/* Recent Events */}
          <Col lg={8} className="mb-4">
            <Card className="modern-card">
              <Card.Header className="modern-card-header">
                <div className="card-header-content">
                  <h5>Recent Events</h5>
                  <Button as={Link} to="/events" variant="outline" className="btn-modern-secondary">
                    View All
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="modern-card-body">
                {recentEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h6>No events yet</h6>
                    <p>Create your first event to get started</p>
                    <Button as={Link} to="/events" className="btn-modern-primary">
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="events-list">
                    {recentEvents.map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col lg={4} className="mb-4">
            <Card className="modern-card">
              <Card.Header className="modern-card-header">
                <h5>Quick Actions</h5>
              </Card.Header>
              <Card.Body className="modern-card-body">
                <div className="quick-actions">
                  <QuickAction
                    icon="➕"
                    title="Create Event"
                    description="Schedule a new community event"
                    link="/events"
                    color="#0ea5e9"
                  />
                  <QuickAction
                    icon="👥"
                    title="Add Participants"
                    description="Import or add new members"
                    link="/participants"
                    color="#22c55e"
                  />
                  <QuickAction
                    icon="📝"
                    title="Bulk Attendance"
                    description="Record attendance for multiple events"
                    link="/bulk-attendance"
                    color="#f59e0b"
                  />
                  <QuickAction
                    icon="📊"
                    title="View Reports"
                    description="Analyze attendance trends"
                    link="/reports"
                    color="#8b5cf6"
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Recent Activity */}
            <Card className="modern-card mt-4">
              <Card.Header className="modern-card-header">
                <h5>Recent Activity</h5>
              </Card.Header>
              <Card.Body className="modern-card-body">
                <div className="activity-list">
                  <ActivityItem icon="🎯" action="New event created" target="Community Meeting" time="2 hours ago" />
                  <ActivityItem icon="✅" action="Attendance recorded" target="Workshop Session" time="5 hours ago" />
                  <ActivityItem icon="👤" action="New participant added" target="John Doe" time="1 day ago" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, changeType, color }) => (
  <Card className="modern-card stat-card">
    <Card.Body>
      <div className="stat-content">
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
        <div className="stat-info">
          <h3>{value}</h3>
          <span className="stat-title">{title}</span>
        </div>
        <div className={`stat-change ${changeType}`}>{change}</div>
      </div>
    </Card.Body>
  </Card>
);

// Event Item Component
const EventItem = ({ event }) => (
  <div className="event-item">
    <div className="event-icon">📅</div>
    <div className="event-details">
      <h6>{event.title}</h6>
      <p>
        {formatDate(event.event_date)} • {event.location || "Online"}
      </p>
    </div>
    <div className={`event-status ${event.status}`}>{event.status}</div>
  </div>
);

// Quick Action Component
const QuickAction = ({ icon, title, description, link, color }) => (
  <Button as={Link} to={link} className="quick-action-btn">
    <div className="action-icon" style={{ backgroundColor: `${color}20`, color }}>
      {icon}
    </div>
    <div className="action-content">
      <h6>{title}</h6>
      <p>{description}</p>
    </div>
    <div className="action-arrow">→</div>
  </Button>
);

// Activity Item Component
const ActivityItem = ({ icon, action, target, time }) => (
  <div className="activity-item">
    <div className="activity-icon">{icon}</div>
    <div className="activity-content">
      <p>
        <strong>{action}</strong> for <span>{target}</span>
      </p>
      <span className="activity-time">{time}</span>
    </div>
  </div>
);

export default ModernDashboard;
