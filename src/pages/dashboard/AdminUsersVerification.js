import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const BASE_URL = "http://localhost:8080";

export default function AdminUsersVerification() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "user").toLowerCase();

  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/user-verification/admin/all`)
      .then((res) => res.json())
      .then((data) => { setVerifications(data); setLoading(false); })
      .catch(() => { setError("Failed to load verifications."); setLoading(false); });
  }, []);

  async function handleApprove(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/user-verification/${id}/approve`, { method: "PUT" });
      if (!res.ok) throw new Error();
      setVerifications((prev) => prev.map((v) => v.id === id ? { ...v, status: "APPROVED" } : v));
    } catch { alert("Failed to approve."); }
  }

  async function handleReject(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/user-verification/${id}/reject`, { method: "PUT" });
      if (!res.ok) throw new Error();
      setVerifications((prev) => prev.map((v) => v.id === id ? { ...v, status: "REJECTED" } : v));
    } catch { alert("Failed to reject."); }
  }

  if (role !== "admin") {
    return (
      <DashboardLayout title="Admin Verify Users">
        <div className="warn-card">
          <h3>Admin only</h3>
          <p className="muted">Switch role to admin to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Verify Users">
      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">User Verifications</h3>
            <div className="section-sub">Approve or reject user submissions.</div>
          </div>
          <span className="badge-pro">{verifications.length} total</span>
        </div>

        {loading && <div className="p-muted">Loading...</div>}
        {error && <div className="p-muted" style={{ color: "red" }}>{error}</div>}
        {!loading && verifications.length === 0 && (
          <div className="p-muted">No user submissions yet.</div>
        )}

        <div className="list">
          {verifications.map((v) => (
            <div key={v.id} className="row-card">
              <div className="row-main">
                <div className="row-title">
                  {v.fullName}
                  <span className={`badge-pro ${
                    v.status === "APPROVED" ? "badge-ok" :
                    v.status === "REJECTED" ? "badge-bad" : "badge-pending"
                  }`} style={{ marginLeft: 8 }}>
                    {v.status}
                  </span>
                </div>
                <div className="row-sub">
                  <span>Aadhar: {v.aadharNo}</span>
                  <span>•</span>
                  <span>ID: {v.collegeOrCompanyId || "Not provided"}</span>
                </div>
              </div>

              <div className="row-actions">
                <button
                  className="btn-outline"
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                >
                  {expanded === v.id ? "Hide Docs" : "View Docs"}
                </button>

                {v.status === "PENDING" && (
                  <>
                    <button className="btn-primary-pro" onClick={() => handleApprove(v.id)}>
                      Approve
                    </button>
                    <button className="btn-danger-pro" onClick={() => handleReject(v.id)}>
                      Reject
                    </button>
                  </>
                )}
              </div>

              {expanded === v.id && (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
                  {[
                    { label: "Aadhar", path: v.aadharPhotoPath },
                    { label: "College / Company ID", path: v.collegeIdPhotoPath },
                    { label: "Selfie", path: v.selfiePath },
                  ].map(({ label, path }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div className="section-sub" style={{ marginBottom: 4 }}>{label}</div>
                      {path ? (
                        <img
                          src={`${BASE_URL}/${path}`}
                          alt={label}
                          onClick={() => setLightbox(`${BASE_URL}/${path}`)}
                          style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
                        />
                      ) : (
                        <div className="p-muted">Not uploaded</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, cursor: "zoom-out"
          }}
        >
          <img
            src={lightbox}
            alt="preview"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}

    </DashboardLayout>
  );
}