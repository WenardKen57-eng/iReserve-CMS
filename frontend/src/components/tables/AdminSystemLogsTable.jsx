export default function AdminSystemLogsTable({ logs }) {
  const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User</th>
          <th>Action</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((l) => (
          <tr key={l._id}>
            <td>{formatDateTime(l.createdAt)}</td>
            <td>{l.user_id?.full_name || l.user_id?.email || "System"}</td>
            <td>{l.action}</td>
            <td>{l.details}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
