import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/admin";
import useToast from "../../hooks/useToast";

export default function BusinessInfoPanel() {
  const [form, setForm] = useState({
    business_name: "",
    contact_number: "",
    email: "",
    address: "",
    hours: "",
    facebook: "",
    instagram: "",
    terms_url: "",
    privacy_url: ""
  });
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    AdminAPI.getBusinessInfo()
      .then((res) => {
        setForm((prev) => ({ ...prev, ...(res.data || {}) }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const save = async () => {
    try {
      await AdminAPI.updateBusinessInfo(form);
      notify("Business info updated.", "success");
    } catch (err) {
      notify(err.response?.data?.message || "We could not save the business info. Please try again.", "error");
    }
  };

  if (loading) return <p>Loading business info...</p>;

  return (
    <div className="panel">
      <div className="form-section">
        <h4>Edit Business Information</h4>
        <div className="form-grid-2">
          <input placeholder="Business name" value={form.business_name} onChange={updateField("business_name")} />
          <input placeholder="Contact number" value={form.contact_number} onChange={updateField("contact_number")} />
        </div>
        <div className="form-grid-2">
          <input placeholder="Email address" value={form.email} onChange={updateField("email")} />
          <input placeholder="Business hours" value={form.hours} onChange={updateField("hours")} />
        </div>
        <input placeholder="Business address" value={form.address} onChange={updateField("address")} />
      </div>

      <div className="form-section">
        <h4>Social Links</h4>
        <div className="form-grid-2">
          <input placeholder="Facebook link" value={form.facebook} onChange={updateField("facebook")} />
          <input placeholder="Instagram link" value={form.instagram} onChange={updateField("instagram")} />
        </div>
      </div>

      <div className="form-section">
        <h4>Policies</h4>
        <div className="form-grid-2">
          <input placeholder="Terms and Conditions URL" value={form.terms_url} onChange={updateField("terms_url")} />
          <input placeholder="Privacy Policy URL" value={form.privacy_url} onChange={updateField("privacy_url")} />
        </div>
      </div>

      <button className="btn" type="button" onClick={save}>Save Changes</button>
    </div>
  );
}
