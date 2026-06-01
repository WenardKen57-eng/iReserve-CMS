import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/admin";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminSystemLogsTable from "../../components/tables/AdminSystemLogsTable";

export default function AdminSystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.getLogs()
      .then((res) => setLogs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1>System Logs</h1>
      <div className="panel">
        {loading && <p>Loading logs...</p>}
        {!loading && logs.length === 0 && <p>No logs yet.</p>}
        {logs.length > 0 && <AdminSystemLogsTable logs={logs} />}
      </div>
    </AdminLayout>
  );
}   