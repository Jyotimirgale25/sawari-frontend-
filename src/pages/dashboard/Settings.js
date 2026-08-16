import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "../../styles/dashboard.css";

export default function Settings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "user").toLowerCase();

  const saved = JSON.parse(localStorage.getItem("emergencyContacts") || "[]");

  const [contacts, setContacts] = useState(
    saved.length ? saved : [{ name: "", phone: "" }, { name: "", phone: "" }, { name: "", phone: "" }]
  );
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved

  function onContactChange(i, field, value) {
    setSaveState("idle");
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  function addContact() {
    setContacts(prev => [...prev, { name: "", phone: "" }]);
  }

  function removeContact(i) {
    setContacts(prev => prev.filter((_, idx) => idx !== i));
    setSaveState("idle");
  }

  async function saveAll(e) {
    e.preventDefault();
    setSaveState("saving");
    await new Promise(r => setTimeout(r, 600)); // small delay for UX
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }

  function clearContacts() {
    if (!window.confirm("Clear all emergency contacts?")) return;
    localStorage.removeItem("emergencyContacts");
    setContacts([{ name: "", phone: "" }, { name: "", phone: "" }, { name: "", phone: "" }]);
    setSaveState("idle");
  }

  const roleColors = { user: "#4f46e5", driver: "#16a34a", admin: "#d97706" };
  const roleColor  = roleColors[role] || "#4f46e5";

  return (
    <DashboardLayout title="Settings">
      <div className="st-grid">

        {/* ── PROFILE CARD ── */}
        <div className="st-card">
          <div className="st-card-head">
            <div className="st-card-icon" style={{ background: `${roleColor}15`, color: roleColor }}>
              <i className="ti ti-user-circle" />
            </div>
            <div>
              <h3 className="st-card-title">Profile</h3>
              <p className="st-card-sub">Your account information</p>
            </div>
          </div>

          {/* avatar */}
          <div className="st-avatar-wrap">
            <div className="st-avatar" style={{ background: `${roleColor}18`, color: roleColor }}>
              {(user.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <div className="st-avatar-name">{user.name || "—"}</div>
              <div className="st-avatar-email">{user.email || "—"}</div>
            </div>
          </div>

          {/* profile fields */}
          <div className="st-profile-fields">
            <div className="st-profile-row">
              <div className="st-profile-row-icon"><i className="ti ti-user" /></div>
              <div className="st-profile-row-content">
                <span className="st-profile-row-label">Full Name</span>
                <span className="st-profile-row-val">{user.name || "—"}</span>
              </div>
            </div>
            <div className="st-profile-row">
              <div className="st-profile-row-icon"><i className="ti ti-mail" /></div>
              <div className="st-profile-row-content">
                <span className="st-profile-row-label">Email</span>
                <span className="st-profile-row-val">{user.email || "—"}</span>
              </div>
            </div>
            <div className="st-profile-row">
              <div className="st-profile-row-icon"><i className="ti ti-shield" /></div>
              <div className="st-profile-row-content">
                <span className="st-profile-row-label">Role</span>
                <span className="st-role-chip" style={{ background: `${roleColor}12`, color: roleColor, border: `1px solid ${roleColor}30` }}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              </div>
            </div>
            <div className="st-profile-row">
              <div className="st-profile-row-icon"><i className="ti ti-fingerprint" /></div>
              <div className="st-profile-row-content">
                <span className="st-profile-row-label">User ID</span>
                <span className="st-profile-row-val">#{user.id || "—"}</span>
              </div>
            </div>
          </div>

          <div className="st-profile-note">
            <i className="ti ti-info-circle" />
            Profile details are synced from your account. Contact support to update them.
          </div>
        </div>

        {/* ── EMERGENCY CONTACTS CARD ── */}
        <div className="st-card">
          <div className="st-card-head">
            <div className="st-card-icon" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
              <i className="ti ti-phone-call" />
            </div>
            <div>
              <h3 className="st-card-title">Emergency Contacts</h3>
              <p className="st-card-sub">Notified instantly during SOS</p>
            </div>
          </div>

          <div className="st-sos-note">
            <i className="ti ti-alert-triangle" />
            These contacts will be alerted when you trigger an SOS. Keep them updated.
          </div>

          <form onSubmit={saveAll} className="st-contacts-form">
            {contacts.map((c, i) => (
              <div className="st-contact-card" key={i}>
                <div className="st-contact-num">
                  <span>{i + 1}</span>
                </div>
                <div className="st-contact-fields">
                  <div className="st-contact-field">
                    <i className="ti ti-user st-contact-icon" />
                    <input
                      value={c.name}
                      onChange={e => onContactChange(i, "name", e.target.value)}
                      placeholder="Contact name"
                      className="st-contact-input"
                    />
                  </div>
                  <div className="st-contact-field">
                    <i className="ti ti-phone st-contact-icon" />
                    <input
                      value={c.phone}
                      onChange={e => onContactChange(i, "phone", e.target.value)}
                      placeholder="Phone number"
                      className="st-contact-input"
                      maxLength={10}
                    />
                  </div>
                </div>
                {contacts.length > 1 && (
                  <button type="button" className="st-remove-btn" onClick={() => removeContact(i)} title="Remove">
                    <i className="ti ti-trash" />
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="st-add-btn" onClick={addContact}>
              <i className="ti ti-plus" /> Add Contact
            </button>

            <div className="st-form-actions">
              <button type="submit" className={`st-save-btn ${saveState}`} disabled={saveState === "saving"}>
                {saveState === "saving" ? (
                  <><span className="db-spinner light" />Saving...</>
                ) : saveState === "saved" ? (
                  <><i className="ti ti-circle-check" />Saved!</>
                ) : (
                  <><i className="ti ti-device-floppy" />Save Contacts</>
                )}
              </button>
              <button type="button" className="st-clear-btn" onClick={clearContacts}>
                <i className="ti ti-trash" /> Clear All
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}