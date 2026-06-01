import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/admin";
import AdminLayout from "../../components/layout/AdminLayout";
import BusinessInfoPanel from "../../components/admin/BusinessInfoPanel";

export default function AdminRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ratings");

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "");

  useEffect(() => {
    AdminAPI.getRatings()
      .then((res) => setRatings(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRatings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1>Ratings & Business Info</h1>
      <div className="tab-row" style={{ marginBottom: "12px" }}>
        <button className={tab === "ratings" ? "active" : ""} onClick={() => setTab("ratings")}>Customer Ratings</button>
        <button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>Business Info</button>
      </div>

      {tab === "ratings" && (
        <div className="panel">
          {loading && <p>Loading ratings...</p>}
          {!loading && ratings.length === 0 && <p>No ratings yet.</p>}
          {ratings.map((r) => (
            <div key={r._id} className="list-item">
              <div>
                <strong>{r.customer_id?.full_name || "Customer"}</strong>
                <div className="text-muted">
                  {r.booking_id?._id ? `EVT-${String(r.booking_id._id).slice(-6).toUpperCase()}` : ""}
                </div>
                <div>{r.review || "No written review."}</div>
              </div>
              <div className="text-muted">{formatDate(r.createdAt)} · {r.stars || 0} stars</div>
            </div>
          ))}
        </div>
      )}

      {tab === "info" && <BusinessInfoPanel />}
    </AdminLayout>
  );
}