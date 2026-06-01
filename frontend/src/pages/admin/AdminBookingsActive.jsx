import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAPI } from "../../api/admin";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminBookingsActiveTable from "../../components/tables/AdminBookingsActiveTable";
import useToast from "../../hooks/useToast";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function AdminBookingsActive() {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { notify } = useToast();
  const navigate = useNavigate();

  const load = () => {
    AdminAPI.getBookings()
      .then((res) => setBookings(res.data.filter((b) => b.status === "active")))
      .catch((err) => {
        notify(err.response?.data?.message || "We could not load bookings. Please try again.", "error");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = bookings.filter((booking) => {
    const text = `${booking._id || ""} ${booking.event_type || ""} ${booking.customer_id?.full_name || ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const markDone = (id) =>
    AdminAPI.updateBooking(id, { status: "completed" })
      .then(() => {
        notify("Booking marked as completed.", "success");
        load();
      })
      .catch((err) => notify(err.response?.data?.message || "We could not update the booking. Please try again.", "error"));
  const cancel = (id) =>
    AdminAPI.updateBooking(id, { status: "cancelled" })
      .then(() => {
        notify("Booking cancelled.", "warning");
        load();
      })
      .catch((err) => notify(err.response?.data?.message || "We could not update the booking. Please try again.", "error"));

  return (
    <AdminLayout>
      <h1>Active Bookings</h1>
      <div className="admin-actions" style={{ marginBottom: "12px" }}>
        <div className="admin-search">
          <input placeholder="Search by client name, booking ID, or event type..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn" type="button" onClick={() => navigate("/admin/bookings/new")}>Add New Booking</button>
      </div>
      <div className="panel">
        <AdminBookingsActiveTable
          bookings={filtered}
          onView={setSelected}
          onMarkDone={(booking) => setCompleteTarget(booking)}
          onCancel={(booking) => setCancelTarget(booking)}
        />
      </div>

      {selected && (
        <Modal title="Booking Details" onClose={() => setSelected(null)}>
          <div className="admin-modal">
            <p><strong>Event:</strong> {selected.event_type}</p>
            <p><strong>Date:</strong> {selected.event_date ? new Date(selected.event_date).toLocaleDateString() : "-"}</p>
            <p><strong>Venue:</strong> {selected.venue_type || "-"}</p>
            <p><strong>Customer:</strong> {selected.customer_id?.full_name || "Customer"}</p>
            <p><strong>Guests:</strong> {selected.guest_count || "-"}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <div className="actions">
              <button className="btn-outline" type="button" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}
      {completeTarget && (
        <ConfirmDialog
          message={`Mark booking ${completeTarget._id?.slice(-6) || ""} as completed?`}
          onConfirm={() => {
            markDone(completeTarget._id);
            setCompleteTarget(null);
          }}
          onCancel={() => setCompleteTarget(null)}
        />
      )}
      {cancelTarget && (
        <ConfirmDialog
          message={`Cancel booking ${cancelTarget._id?.slice(-6) || ""}? This cannot be undone.`}
          onConfirm={() => {
            cancel(cancelTarget._id);
            setCancelTarget(null);
          }}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </AdminLayout>
  );
}