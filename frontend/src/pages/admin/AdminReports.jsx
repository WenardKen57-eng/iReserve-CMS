import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/admin";
import AdminLayout from "../../components/layout/AdminLayout";

export default function AdminReports() {
  const [metrics, setMetrics] = useState({
    summary: {},
    monthlyRevenue: [],
    bookingStatus: [],
    eventTypes: [],
    topPackages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.getMetrics()
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics({ summary: {}, monthlyRevenue: [], bookingStatus: [], eventTypes: [], topPackages: [] }))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value) => `PHP ${Number(value || 0).toLocaleString()}`;

  const statusColors = {
    active: "#1d4ed8",
    completed: "#16a34a",
    cancelled: "#dc2626",
    pending: "#f59e0b"
  };

  const buildPie = () => {
    const total = metrics.bookingStatus.reduce((sum, item) => sum + (item.count || 0), 0) || 1;
    let acc = 0;
    const segments = metrics.bookingStatus.map((item) => {
      const value = item.count || 0;
      const start = acc;
      acc += (value / total) * 100;
      const end = acc;
      const color = statusColors[item.status] || "#94a3b8";
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Completed Bookings", metrics.summary.completedBookings || 0],
      ["Active Bookings", metrics.summary.activeBookings || 0],
      ["Pending Inquiries", metrics.summary.pendingInquiries || 0],
      ["Total Revenue", metrics.summary.totalRevenue || 0],
      ["", ""],
      ["Monthly Revenue", ""],
      ...metrics.monthlyRevenue.map((item) => [item.month, item.total || 0]),
      ["", ""],
      ["Booking Status", ""],
      ...metrics.bookingStatus.map((item) => [item.status, item.count || 0]),
      ["", ""],
      ["Event Types", ""],
      ...metrics.eventTypes.map((item) => [item.event_type, item.count || 0]),
      ["", ""],
      ["Top Packages", ""],
      ...metrics.topPackages.map((item) => [item.name, `${item.bookings || 0} bookings`, item.revenue || 0])
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div className="admin-title">
          <h1>Reports & Analytics</h1>
          <p>View detailed analytics and performance reports</p>
        </div>
        <div className="admin-actions">
          <button className="btn" type="button" onClick={exportCsv}>Export to Excel</button>
        </div>
      </div>
      {loading && <p>Loading reports...</p>}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h4>Completed Bookings</h4>
          <p className="kpi-value">{metrics.summary.completedBookings || 0}</p>
        </div>
        <div className="kpi-card">
          <h4>Active Bookings</h4>
          <p className="kpi-value">{metrics.summary.activeBookings || 0}</p>
        </div>
        <div className="kpi-card">
          <h4>Pending Inquiries</h4>
          <p className="kpi-value">{metrics.summary.pendingInquiries || 0}</p>
        </div>
        <div className="kpi-card">
          <h4>Total Revenue</h4>
          <p className="kpi-value">{formatCurrency(metrics.summary.totalRevenue)}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h3>Monthly Revenue</h3>
          {metrics.monthlyRevenue.length === 0 && <p>No revenue data yet.</p>}
          {metrics.monthlyRevenue.length > 0 && (
            <div className="chart-bar">
              {metrics.monthlyRevenue.map((item) => (
                <div className="chart-bar-item" key={item.month}>
                  <div className="chart-bar-label">{item.month}</div>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{ width: `${Math.min(100, (item.total || 0) / (metrics.monthlyRevenue[metrics.monthlyRevenue.length - 1]?.total || 1) * 100)}%` }}
                    />
                  </div>
                  <div className="chart-bar-value">{formatCurrency(item.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h3>Booking Status Breakdown</h3>
          {metrics.bookingStatus.length === 0 && <p>No status data yet.</p>}
          {metrics.bookingStatus.length > 0 && (
            <div className="chart-pie-wrap">
              <div className="chart-pie" style={{ background: buildPie() }} />
              <div className="chart-legend">
                {metrics.bookingStatus.map((item) => (
                  <div key={item.status} className="chart-legend-item">
                    <span className="legend-dot" style={{ background: statusColors[item.status] || "#94a3b8" }} />
                    <span>{item.status} · {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h3>Event Types</h3>
          {metrics.eventTypes.length === 0 && <p>No event data yet.</p>}
          {metrics.eventTypes.map((item) => (
            <div className="list-item" key={item.event_type}>
              <strong>{item.event_type}</strong> · {item.count}
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Top Packages</h3>
          {metrics.topPackages.length === 0 && <p>No package data yet.</p>}
          {metrics.topPackages.map((item) => (
            <div className="list-item" key={item.package_id}>
              <strong>{item.name}</strong> · {item.bookings} bookings · {formatCurrency(item.revenue)}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}