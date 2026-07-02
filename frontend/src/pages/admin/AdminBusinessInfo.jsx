import AdminLayout from "../../components/layout/AdminLayout";
import BusinessInfoPanel from "../../components/admin/BusinessInfoPanel";

export default function AdminBusinessInfo() {
  return (
    <AdminLayout>
      <div className="page-title">
        <h1>Business Info</h1>
        <p>Update the contact details, hours, and links that appear in the public landing page footer.</p>
      </div>
      <BusinessInfoPanel />
    </AdminLayout>
  );
}