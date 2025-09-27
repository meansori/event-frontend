// File: src/components/Attendance/ModernAttendanceReport.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Modal, Table, Badge, Alert } from "react-bootstrap";
import { eventsAPI, attendanceAPI } from "../../services/api";
import { formatDate, formatTime, formatDateTime, getAttendanceColor } from "../../utils/helpers";
import ModernLoadingSpinner from "../Common/ModernLoadingSpinner";
import "./ModernAttendanceReport.css";

const ModernAttendanceReport = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  // const [chartData, setChartData] = useState({ present: [], late: [], absent: [] });
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const [chartPeriod, setChartPeriod] = useState("daily"); // 'daily', 'weekly', 'monthly'
  const [chartData, setChartData] = useState({
    daily: { present: [], late: [], absent: [] },
    weekly: { present: [], late: [], absent: [] },
    monthly: { present: [], late: [], absent: [] },
  });
  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedMonth, selectedYear]);

  useEffect(() => {
    if (filteredEvents.length > 0) {
      loadChartData();
    }
  }, [filteredEvents, selectedMonth, selectedYear]);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events);
      setLoading(false);
    } catch (error) {
      setError("Failed to load events");
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events.filter((event) => {
      const eventDate = new Date(event.event_date);
      return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
    });

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const loadChartData = async () => {
    try {
      // Get attendance data for all events in the selected month
      const attendancePromises = filteredEvents.map((event) =>
        attendanceAPI.getReport(event.id).catch(() => ({ data: { attendance: [] } }))
      );

      const attendanceResults = await Promise.all(attendancePromises);

      // Process data for different periods
      const dailyData = processDailyData(attendanceResults);
      const weeklyData = processWeeklyData(attendanceResults);
      const monthlyData = processMonthlyData(attendanceResults);

      setChartData({
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
      });
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  const processDailyData = (attendanceResults) => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const presentData = Array(daysInMonth).fill(0);
    const lateData = Array(daysInMonth).fill(0);
    const absentData = Array(daysInMonth).fill(0);

    attendanceResults.forEach((result, index) => {
      const event = filteredEvents[index];
      const eventDate = new Date(event.event_date);
      const dayOfMonth = eventDate.getDate() - 1;

      if (dayOfMonth >= 0 && dayOfMonth < daysInMonth) {
        result.data.attendance.forEach((record) => {
          const status = record.status;
          if (status === "present") presentData[dayOfMonth]++;
          else if (status === "late") lateData[dayOfMonth]++;
          else if (status === "absent") absentData[dayOfMonth]++;
        });
      }
    });

    return { present: presentData, late: lateData, absent: absentData };
  };

  const processWeeklyData = (attendanceResults) => {
    // Group by weeks in the month
    const weeksInMonth = getWeeksInMonth(selectedMonth, selectedYear);
    const presentData = Array(weeksInMonth.length).fill(0);
    const lateData = Array(weeksInMonth.length).fill(0);
    const absentData = Array(weeksInMonth.length).fill(0);

    attendanceResults.forEach((result, index) => {
      const event = filteredEvents[index];
      const eventDate = new Date(event.event_date);

      // Find which week this event belongs to
      const weekIndex = weeksInMonth.findIndex((week) => eventDate >= week.start && eventDate <= week.end);

      if (weekIndex !== -1) {
        result.data.attendance.forEach((record) => {
          const status = record.status;
          if (status === "present") presentData[weekIndex]++;
          else if (status === "late") lateData[weekIndex]++;
          else if (status === "absent") absentData[weekIndex]++;
        });
      }
    });

    return { present: presentData, late: lateData, absent: absentData };
  };

  const processMonthlyData = (attendanceResults) => {
    // For monthly view, we'll show data for the current and previous months
    const monthsData = 3; // Show 3 months including current
    const presentData = Array(monthsData).fill(0);
    const lateData = Array(monthsData).fill(0);
    const absentData = Array(monthsData).fill(0);

    // Process data for each month
    for (let i = 0; i < monthsData; i++) {
      const targetMonth = new Date(selectedYear, selectedMonth - i, 1);
      const monthKey = `${targetMonth.getFullYear()}-${targetMonth.getMonth()}`;

      attendanceResults.forEach((result, index) => {
        const event = filteredEvents[index];
        const eventDate = new Date(event.event_date);
        const eventMonthKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}`;

        if (eventMonthKey === monthKey) {
          result.data.attendance.forEach((record) => {
            const status = record.status;
            if (status === "present") presentData[monthsData - 1 - i]++;
            else if (status === "late") lateData[monthsData - 1 - i]++;
            else if (status === "absent") absentData[monthsData - 1 - i]++;
          });
        }
      });
    }

    return { present: presentData, late: lateData, absent: absentData };
  };

  const getWeeksInMonth = (month, year) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let currentWeekStart = new Date(firstDay);

    while (currentWeekStart <= lastDay) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      if (currentWeekEnd > lastDay) {
        currentWeekEnd.setDate(lastDay.getDate());
      }

      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(currentWeekEnd),
        label: `Week ${weeks.length + 1}`,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  };

  const loadEventDetails = async (eventId) => {
    setReportLoading(true);
    setError("");
    try {
      const event = events.find((e) => e.id == eventId);
      setSelectedEvent(event);

      const response = await attendanceAPI.getReport(eventId);
      setAttendanceData(response.data.attendance);
      setShowDetailModal(true);
    } catch (error) {
      setError("Failed to load event details");
    } finally {
      setReportLoading(false);
    }
  };

  const getEventStats = async (event) => {
    try {
      const response = await attendanceAPI.getReport(event.id);
      const attendance = response.data.attendance;

      const present = attendance.filter((a) => a.status === "present").length;
      const late = attendance.filter((a) => a.status === "late").length;
      const absent = attendance.filter((a) => a.status === "absent").length;
      const total = attendance.length;

      return { present, late, absent, total };
    } catch (error) {
      // Return zeros if no attendance data
      return { present: 0, late: 0, absent: 0, total: 0 };
    }
  };

  const handleExport = async (format, event = selectedEvent) => {
    if (!event) return;

    setExportLoading(true);
    setError("");
    try {
      // Load fresh data for export
      const response = await attendanceAPI.getReport(event.id);
      const exportAttendanceData = response.data.attendance;

      const exportData = {
        event: event,
        attendance: exportAttendanceData,
        period: `${months[selectedMonth]} ${selectedYear}`,
        generatedAt: new Date().toLocaleString(),
      };

      if (format === "pdf") {
        await exportToPDF(exportData);
      } else if (format === "excel") {
        await exportToExcel(exportData);
      }
    } catch (error) {
      setError("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async (data) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Attendance Report - ${data.event.title}</h1>
        <p><strong>Event Date:</strong> ${formatDate(data.event.event_date)}</p>
        <p><strong>Location:</strong> ${data.event.location || "Online"}</p>
        <p><strong>Period:</strong> ${data.period}</p>
        <p><strong>Generated:</strong> ${data.generatedAt}</p>
        <p><strong>Total Records:</strong> ${data.attendance.length}</p>
        <hr>
        
        <h3>Attendance Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Count</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Percentage</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Present</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              data.attendance.filter((a) => a.status === "present").length
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              data.attendance.length
                ? Math.round(
                    (data.attendance.filter((a) => a.status === "present").length / data.attendance.length) * 100
                  )
                : 0
            }%</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Late</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              data.attendance.filter((a) => a.status === "late").length
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              data.attendance.length
                ? Math.round((data.attendance.filter((a) => a.status === "late").length / data.attendance.length) * 100)
                : 0
            }%</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">Absent</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              data.attendance.filter((a) => a.status === "absent").length
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              data.attendance.length
                ? Math.round(
                    (data.attendance.filter((a) => a.status === "absent").length / data.attendance.length) * 100
                  )
                : 0
            }%</td>
          </tr>
        </table>
        
        <h3>Attendance Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd;">#</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Participant</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Time</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Notes</th>
          </tr>
          ${data.attendance
            .map(
              (record, index) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${record.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${record.status}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${formatDateTime(record.attendance_time)}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${record.notes || "-"}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>
    `;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

  const exportToExcel = async (data) => {
    const headers = ["Name", "Email", "Institution", "Status", "Attendance Time", "Notes"];
    const csvContent = [
      headers.join(","),
      ...data.attendance.map((record) =>
        [
          `"${record.name}"`,
          `"${record.email || ""}"`,
          `"${record.institution || ""}"`,
          `"${record.status}"`,
          `"${formatDateTime(record.attendance_time)}"`,
          `"${record.notes || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance-${data.event.title.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <ModernLoadingSpinner />;

  return (
    <div className="modern-reports-page">
      <Container fluid>
        {/* Header */}
        <Row className="page-header">
          <Col>
            <div className="header-content">
              <div>
                <h1>Attendance Analytics & Reports</h1>
                <p>Comprehensive attendance analysis with real data from database</p>
              </div>
            </div>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Month/Year Filter */}
        <Row className="mb-4">
          <Col>
            <Card className="modern-card">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="modern-form-label">Month</Form.Label>
                      <Form.Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="modern-form-control"
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="modern-form-label">Year</Form.Label>
                      <Form.Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="modern-form-control"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="modern-form-label">Search Events</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search events by title or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="modern-form-control"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Line Chart Section dengan Period Selector */}
        <Row className="mb-4">
          <Col>
            <Card className="modern-card">
              <Card.Header className="modern-card-header">
                <div className="chart-header">
                  <h5 className="mb-0">
                    Attendance Trend - {months[selectedMonth]} {selectedYear}
                  </h5>
                  <div className="period-selector">
                    <Button
                      variant={chartPeriod === "daily" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setChartPeriod("daily")}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={chartPeriod === "weekly" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setChartPeriod("weekly")}
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={chartPeriod === "monthly" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setChartPeriod("monthly")}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
                <Badge bg="primary">{filteredEvents.length} Events</Badge>
              </Card.Header>
              <Card.Body>
                <LineChart
                  data={chartData[chartPeriod]}
                  period={chartPeriod}
                  month={months[selectedMonth]}
                  year={selectedYear}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Events Grid */}
        <Row>
          <Col>
            <div className="section-header">
              <h4>
                Events in {months[selectedMonth]} {selectedYear}
              </h4>
              <span className="results-count">
                Showing {filteredEvents.length} of {events.length} events
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <Card className="modern-card">
                <Card.Body className="text-center py-5">
                  <div className="empty-icon">📊</div>
                  <h5>No events found</h5>
                  <p className="text-muted">
                    {events.length === 0
                      ? "No events have been created yet."
                      : "No events match your search criteria for the selected period."}
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {filteredEvents.map((event) => (
                  <Col key={event.id} lg={6} className="mb-4">
                    <EventCard
                      event={event}
                      onViewDetails={() => loadEventDetails(event.id)}
                      onExport={(format) => handleExport(format, event)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Detail Modal */}
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="xl"
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton className="modern-modal-header">
            <Modal.Title>{selectedEvent?.title} - Detailed Report</Modal.Title>
            <div className="modal-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
                disabled={exportLoading}
                className="me-2"
              >
                {exportLoading ? "Exporting..." : "📄 Export PDF"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("excel")} disabled={exportLoading}>
                {exportLoading ? "Exporting..." : "📈 Export Excel"}
              </Button>
            </div>
          </Modal.Header>
          <Modal.Body className="modern-modal-body">
            {reportLoading ? (
              <ModernLoadingSpinner text="Loading report details..." />
            ) : (
              <DetailReport event={selectedEvent} attendance={attendanceData} />
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

// Enhanced Line Chart Component dengan Multiple Periods
const LineChart = ({ data, period, month, year }) => {
  const maxValue = Math.max(...data.present, ...data.late, ...data.absent, 1);
  const dataPoints = data.present.length;

  const getLabels = () => {
    switch (period) {
      case "daily":
        return Array.from({ length: dataPoints }, (_, i) => i + 1);
      case "weekly":
        return Array.from({ length: dataPoints }, (_, i) => `Week ${i + 1}`);
      case "monthly":
        const months = [];
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date(year, month - i, 1);
          months.push(date.toLocaleDateString("en", { month: "short" }));
        }
        return months;
      default:
        return Array.from({ length: dataPoints }, (_, i) => i + 1);
    }
  };

  const labels = getLabels();

  const getChartTitle = () => {
    switch (period) {
      case "daily":
        return `Daily Attendance Distribution - ${month} ${year}`;
      case "weekly":
        return `Weekly Attendance Distribution - ${month} ${year}`;
      case "monthly":
        return `Monthly Attendance Trend - Last ${dataPoints} Months`;
      default:
        return `Attendance Distribution`;
    }
  };

  return (
    <div className="line-chart-container">
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color present"></span>
          <span>Present ({data.present.reduce((a, b) => a + b, 0)})</span>
        </div>
        <div className="legend-item">
          <span className="legend-color late"></span>
          <span>Late ({data.late.reduce((a, b) => a + b, 0)})</span>
        </div>
        <div className="legend-item">
          <span className="legend-color absent"></span>
          <span>Absent ({data.absent.reduce((a, b) => a + b, 0)})</span>
        </div>
      </div>

      <div className="chart-area">
        <div className="chart-grid">
          <div className="y-axis">
            {[0, Math.floor(maxValue / 2), maxValue].map((value, index) => (
              <div key={index} className="y-label">
                {value}
              </div>
            ))}
          </div>

          <div className="chart-content">
            <div className="chart-lines">
              {labels.map((label, index) => (
                <div
                  key={index}
                  className="data-points"
                  title={`${label}: Present: ${data.present[index]}, Late: ${data.late[index]}, Absent: ${data.absent[index]}`}
                >
                  <div
                    className="line-segment present"
                    style={{
                      height: data.present[index] > 0 ? `${(data.present[index] / maxValue) * 100}%` : "3px",
                      minHeight: "3px",
                    }}
                  ></div>
                  <div
                    className="line-segment late"
                    style={{
                      height: data.late[index] > 0 ? `${(data.late[index] / maxValue) * 100}%` : "3px",
                      minHeight: "3px",
                    }}
                  ></div>
                  <div
                    className="line-segment absent"
                    style={{
                      height: data.absent[index] > 0 ? `${(data.absent[index] / maxValue) * 100}%` : "3px",
                      minHeight: "3px",
                    }}
                  ></div>
                </div>
              ))}
            </div>

            <div className="x-axis">
              {labels.map((label, index) => (
                <div key={index} className="x-label">
                  {period === "daily" && index % 7 === 0 ? label : ""}
                  {period === "weekly" ? `W${index + 1}` : ""}
                  {period === "monthly" ? label : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Title */}
      <div className="chart-title">
        <h6>{getChartTitle()}</h6>
        <span className="chart-subtitle">
          {dataPoints} {period === "daily" ? "days" : period === "weekly" ? "weeks" : "months"} shown
        </span>
      </div>
    </div>
  );
};

// Event Card Component dengan data real
const EventCard = ({ event, onViewDetails, onExport }) => {
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventStats();
  }, [event]);

  const loadEventStats = async () => {
    try {
      const response = await attendanceAPI.getReport(event.id);
      const attendance = response.data.attendance;

      const present = attendance.filter((a) => a.status === "present").length;
      const late = attendance.filter((a) => a.status === "late").length;
      const absent = attendance.filter((a) => a.status === "absent").length;
      const total = attendance.length;

      setStats({ present, late, absent, total });
    } catch (error) {
      setStats({ present: 0, late: 0, absent: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  if (loading) {
    return (
      <Card className="modern-card event-report-card">
        <Card.Body className="text-center">
          <ModernLoadingSpinner size="sm" text="Loading stats..." />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="modern-card event-report-card">
      <Card.Body>
        <div className="event-card-header">
          <h6 className="event-title">{event.title}</h6>
          <Badge className={`status-badge status-${event.status}`}>{event.status}</Badge>
        </div>

        <p className="event-description">{event.description || "No description provided"}</p>

        <div className="event-meta">
          <span>📅 {formatDate(event.event_date)}</span>
          <span>⏰ {formatTime(event.event_time)}</span>
          <span>📍 {event.location || "Online"}</span>
        </div>

        <div className="attendance-stats">
          <div className="stat-row">
            <span className="stat-label">Present:</span>
            <span className="stat-value">{stats.present}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Late:</span>
            <span className="stat-value">{stats.late}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Absent:</span>
            <span className="stat-value">{stats.absent}</span>
          </div>
          <div className="stat-row total">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="attendance-rate">
          <div className="rate-bar">
            <div className="rate-fill" style={{ width: `${attendanceRate}%` }}></div>
          </div>
          <span className="rate-text">{attendanceRate}% Attendance Rate</span>
        </div>

        <div className="card-actions">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="action-btn">
            📊 View Details
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("pdf")} className="action-btn">
            📄 Export PDF
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Detail Report Component untuk Modal
const DetailReport = ({ event, attendance }) => {
  const stats = {
    present: attendance.filter((a) => a.status === "present").length,
    late: attendance.filter((a) => a.status === "late").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    total: attendance.length,
  };

  return (
    <div id="report-content">
      {/* Event Info */}
      <Row className="mb-4">
        <Col>
          <Card className="modern-card">
            <Card.Body>
              <h5>Event Information</h5>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Title:</strong> {event.title}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(event.event_date)}
                  </p>
                  <p>
                    <strong>Time:</strong> {formatTime(event.event_time)}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Location:</strong> {event.location || "Online"}
                  </p>
                  <p>
                    <strong>Description:</strong> {event.description || "No description"}
                  </p>
                  <p>
                    <strong>Status:</strong> <Badge className={`status-${event.status}`}>{event.status}</Badge>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <div className="stat-card mini">
            <div className="stat-value">{stats.present}</div>
            <div className="stat-label">Present</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card mini">
            <div className="stat-value">{stats.late}</div>
            <div className="stat-label">Late</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card mini">
            <div className="stat-value">{stats.absent}</div>
            <div className="stat-label">Absent</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card mini">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </Col>
      </Row>

      {/* Attendance Table */}
      {attendance.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h6>No attendance records</h6>
          <p>No attendance has been recorded for this event yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <Table responsive className="modern-table report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Participant</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Attendance Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={record.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="participant-info">
                      <strong>{record.name}</strong>
                      {record.institution && <div className="text-muted small">{record.institution}</div>}
                    </div>
                  </td>
                  <td>
                    {record.email && <div className="small">{record.email}</div>}
                    {record.phone && <div className="small">{record.phone}</div>}
                  </td>
                  <td>
                    <Badge bg={getAttendanceColor(record.status)}>{record.status}</Badge>
                  </td>
                  <td>{formatDateTime(record.attendance_time)}</td>
                  <td>{record.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ModernAttendanceReport;
