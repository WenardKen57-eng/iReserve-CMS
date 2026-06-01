import AdminLayout from "../../components/layout/AdminLayout";
import BusinessInfoPanel from "../../components/admin/BusinessInfoPanel";

export default function AdminBusinessInfo() {
  return (
    <AdminLayout>
      <h1>Business Info</h1>
      <BusinessInfoPanel />
    </AdminLayout>
  );
}