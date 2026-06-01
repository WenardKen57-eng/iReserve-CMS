export default function AdminManagersTable({ list, tab, onEdit, onToggleStatus, onView }) {
  const formatId = (value, index) => {
    const suffix = String(index + 1).padStart(3, "0");
    if (tab === "customers") return `CUS-${suffix}`;
    if (tab === "staff") return `STF-${suffix}`;
    return `MGR-${suffix}`;
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.map((m, index) => (
          <tr key={m._id}>
            <td>{formatId(m._id, index)}</td>
            <td>{m.full_name}</td>
            <td>{tab === "customers" ? "customer" : m.role}</td>
            <td>
              <span className={`badge-status ${m.is_active ? "active" : "inactive"}`}>
                {m.is_active ? "Active" : "Inactive"}
              </span>
            </td>
            <td>
              {tab !== "customers" && (
                <button className="btn-outline" onClick={() => onEdit(m)}>Edit</button>
              )}
              {tab !== "customers" && (
                <button className="btn-outline" onClick={() => onView?.(m)}>View</button>
              )}
              <button className={m.is_active ? "btn-danger" : "btn"} onClick={() => onToggleStatus(m)}>
                {tab === "customers"
                  ? (m.is_active ? "Block" : "Unblock")
                  : (m.is_active ? "Disable" : "Enable")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
