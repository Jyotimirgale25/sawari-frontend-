import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import DashboardLayout from "../../layouts/DashboardLayout";
import "../../styles/dashboard.css";

const BASE = "http://localhost:8080";

export default function Verification() {
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const isDriver = user.role?.toUpperCase() === "DRIVER";

  const [status,     setStatus]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  const [form, setForm] = useState({
    fullName: "", aadharNo: "", collegeOrCompanyId: "",
    licenseNo: "", vehicleNo: "",
  });

  const [aadharPhoto,    setAadharPhoto]    = useState(null);
  const [licensePhoto,   setLicensePhoto]   = useState(null);
  const [vehicleRcPhoto, setVehicleRcPhoto] = useState(null);
  const [collegeIdPhoto, setCollegeIdPhoto] = useState(null);

  const webcamRef = useRef(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [showCamera,  setShowCamera]  = useState(false);

  useEffect(() => {
    const ep = isDriver
      ? `${BASE}/api/verification/driver/${user.id}`
      : `${BASE}/api/user-verification/user/${user.id}`;

    fetch(ep)
      .then(r => r.status === 404 ? null : r.json())
      .then(d => {
        if (d) {
          setStatus(d.status);
          setForm({
            fullName: d.fullName || "", aadharNo: d.aadharNo || "",
            collegeOrCompanyId: d.collegeOrCompanyId || "",
            licenseNo: d.licenseNo || "", vehicleNo: d.vehicleNo || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id, isDriver]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function captureSelfie() {
    setSelfieImage(webcamRef.current.getScreenshot());
    setShowCamera(false);
  }

  function base64ToFile(b64, name) {
    const arr = b64.split(","), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]); let n = bstr.length;
    const u = new Uint8Array(n);
    while (n--) u[n] = bstr.charCodeAt(n);
    return new File([u], name, { type: mime });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!aadharPhoto)                       return setError("Please upload Aadhar photo.");
    if (!selfieImage)                       return setError("Please capture a selfie.");
    if (isDriver && !licensePhoto)          return setError("Please upload License photo.");
    if (isDriver && !vehicleRcPhoto)        return setError("Please upload Vehicle RC photo.");
    if (!isDriver && !collegeIdPhoto)       return setError("Please upload College/Company ID photo.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      if (isDriver) {
        fd.append("driverId", user.id);
        fd.append("fullName",  form.fullName);
        fd.append("aadharNo",  form.aadharNo);
        fd.append("licenseNo", form.licenseNo);
        fd.append("vehicleNo", form.vehicleNo);
        fd.append("aadharPhoto",    aadharPhoto);
        fd.append("licensePhoto",   licensePhoto);
        fd.append("vehicleRcPhoto", vehicleRcPhoto);
        fd.append("selfie", base64ToFile(selfieImage, "selfie.jpg"));
      } else {
        fd.append("userId",  user.id);
        fd.append("fullName", form.fullName);
        fd.append("aadharNo", form.aadharNo);
        fd.append("collegeOrCompanyId", form.collegeOrCompanyId);
        fd.append("aadharPhoto",    aadharPhoto);
        fd.append("collegeIdPhoto", collegeIdPhoto);
        fd.append("selfie", base64ToFile(selfieImage, "selfie.jpg"));
      }

      const ep = isDriver ? `${BASE}/api/verification` : `${BASE}/api/user-verification`;
      const res = await fetch(ep, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setStatus("PENDING");
      setSuccess("Verification submitted! Waiting for admin approval.");
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <DashboardLayout title="Verification">
      <div className="vf-loading"><span className="db-spinner" />Checking status...</div>
    </DashboardLayout>
  );

  const statusConfig = {
    APPROVED: { cls: "ok",      icon: "ti-shield-check",  label: "Verified",        msg: "Your identity has been verified successfully. You can now use all features." },
    PENDING:  { cls: "pending", icon: "ti-clock",         label: "Under Review",    msg: "Your verification is under review. You'll be notified once approved." },
    REJECTED: { cls: "bad",     icon: "ti-shield-x",      label: "Rejected",        msg: "Your verification was rejected. Please resubmit with correct documents." },
  };

  const sc = statusConfig[status];

  return (
    <DashboardLayout title="Verification">

      {/* ── STATUS BANNER ── */}
      {status && (
        <div className={`vf-status-banner ${sc.cls}`}>
          <div className="vf-status-icon"><i className={`ti ${sc.icon}`}/></div>
          <div>
            <div className="vf-status-label">{sc.label}</div>
            <div className="vf-status-msg">{sc.msg}</div>
          </div>
        </div>
      )}

      {/* ── APPROVED — no form ── */}
      {status === "APPROVED" && (
        <div className="vf-approved-wrap">
          <div className="vf-approved-card">
            <i className="ti ti-shield-check vf-approved-icon" />
            <h3>Identity Verified</h3>
            <p>You are a verified {isDriver ? "driver" : "user"} on SAWARI. Thank you for keeping the platform safe.</p>
          </div>
        </div>
      )}

      {/* ── PENDING — no form ── */}
      {status === "PENDING" && (
        <div className="vf-approved-wrap">
          <div className="vf-approved-card pending">
            <i className="ti ti-clock vf-approved-icon pending" />
            <h3>Under Review</h3>
            <p>Your documents have been submitted and are being reviewed by our admin team. This usually takes 24 hours.</p>
          </div>
        </div>
      )}

      {/* ── FORM (null or REJECTED) ── */}
      {(status === null || status === "REJECTED") && (
        <div className="vf-layout">

          {/* left — info */}
          <div className="vf-info-panel">
            <div className="vf-info-head">
              <div className="vf-info-icon">
                <i className="ti ti-shield-check" />
              </div>
              <h3>Identity Verification</h3>
              <p>
                {isDriver
                  ? "Submit your driving license, vehicle RC, and Aadhar to start offering rides."
                  : "Submit your Aadhar and college/company ID to unlock ride booking."}
              </p>
            </div>

            <div className="vf-checklist">
              <div className="vf-check-label">Documents needed:</div>
              {[
                "Aadhar card photo",
                isDriver ? "Driving license photo" : "College / Company ID photo",
                isDriver ? "Vehicle RC photo" : null,
                "Live selfie via camera",
              ].filter(Boolean).map((d, i) => (
                <div className="vf-check-item" key={i}>
                  <div className="vf-check-dot"><i className="ti ti-check" /></div>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            {status === "REJECTED" && (
              <div className="vf-rejected-note">
                <i className="ti ti-alert-circle" />
                Your previous submission was rejected. Please upload clearer, valid documents.
              </div>
            )}
          </div>

          {/* right — form */}
          <div className="vf-form-panel">
            <form onSubmit={handleSubmit} className="vf-form">

              {/* section: personal */}
              <div className="vf-section-label">Personal Details</div>

              <div className="vf-field">
                <label className="vf-field-label">Full Name <span className="vf-req">*</span></label>
                <div className="vf-input-wrap">
                  <i className="ti ti-user vf-input-icon" />
                  <input name="fullName" value={form.fullName} onChange={handleChange}
                    placeholder="As on Aadhar card" className="vf-input" required />
                </div>
              </div>

              <div className="vf-field">
                <label className="vf-field-label">Aadhar Number <span className="vf-req">*</span></label>
                <div className="vf-input-wrap">
                  <i className="ti ti-id vf-input-icon" />
                  <input name="aadharNo" value={form.aadharNo} onChange={handleChange}
                    placeholder="12-digit Aadhar number" className="vf-input" maxLength={12} required />
                </div>
              </div>

              {/* driver fields */}
              {isDriver && (
                <>
                  <div className="vf-section-label">Vehicle Details</div>
                  <div className="vf-field">
                    <label className="vf-field-label">License Number <span className="vf-req">*</span></label>
                    <div className="vf-input-wrap">
                      <i className="ti ti-license vf-input-icon" />
                      <input name="licenseNo" value={form.licenseNo} onChange={handleChange}
                        placeholder="Driving license number" className="vf-input" required />
                    </div>
                  </div>
                  <div className="vf-field">
                    <label className="vf-field-label">Vehicle Number <span className="vf-req">*</span></label>
                    <div className="vf-input-wrap">
                      <i className="ti ti-car vf-input-icon" />
                      <input name="vehicleNo" value={form.vehicleNo} onChange={handleChange}
                        placeholder="e.g. MH12AB1234" className="vf-input" required />
                    </div>
                  </div>
                </>
              )}

              {/* user field */}
              {!isDriver && (
                <>
                  <div className="vf-section-label">Organisation Details</div>
                  <div className="vf-field">
                    <label className="vf-field-label">College / Company ID <span className="vf-req">*</span></label>
                    <div className="vf-input-wrap">
                      <i className="ti ti-building vf-input-icon" />
                      <input name="collegeOrCompanyId" value={form.collegeOrCompanyId} onChange={handleChange}
                        placeholder="Student or employee ID" className="vf-input" required />
                    </div>
                  </div>
                </>
              )}

              {/* section: documents */}
              <div className="vf-section-label">Upload Documents</div>

              {/* aadhar */}
              <div className="vf-field">
                <label className="vf-field-label">Aadhar Photo <span className="vf-req">*</span></label>
                <label className="vf-file-label">
                  <i className="ti ti-upload" />
                  <span>{aadharPhoto ? aadharPhoto.name : "Click to upload"}</span>
                  <input type="file" accept="image/*" onChange={e=>setAadharPhoto(e.target.files[0])} className="vf-file-input" required />
                </label>
              </div>

              {isDriver && (
                <>
                  <div className="vf-field">
                    <label className="vf-field-label">License Photo <span className="vf-req">*</span></label>
                    <label className="vf-file-label">
                      <i className="ti ti-upload" />
                      <span>{licensePhoto ? licensePhoto.name : "Click to upload"}</span>
                      <input type="file" accept="image/*" onChange={e=>setLicensePhoto(e.target.files[0])} className="vf-file-input" required />
                    </label>
                  </div>
                  <div className="vf-field">
                    <label className="vf-field-label">Vehicle RC Photo <span className="vf-req">*</span></label>
                    <label className="vf-file-label">
                      <i className="ti ti-upload" />
                      <span>{vehicleRcPhoto ? vehicleRcPhoto.name : "Click to upload"}</span>
                      <input type="file" accept="image/*" onChange={e=>setVehicleRcPhoto(e.target.files[0])} className="vf-file-input" required />
                    </label>
                  </div>
                </>
              )}

              {!isDriver && (
                <div className="vf-field">
                  <label className="vf-field-label">College / Company ID Photo <span className="vf-req">*</span></label>
                  <label className="vf-file-label">
                    <i className="ti ti-upload" />
                    <span>{collegeIdPhoto ? collegeIdPhoto.name : "Click to upload"}</span>
                    <input type="file" accept="image/*" onChange={e=>setCollegeIdPhoto(e.target.files[0])} className="vf-file-input" required />
                  </label>
                </div>
              )}

              {/* selfie */}
              <div className="vf-section-label">Live Selfie</div>
              <div className="vf-field">
                <label className="vf-field-label">Selfie via Camera <span className="vf-req">*</span></label>

                {!showCamera && !selfieImage && (
                  <button type="button" className="vf-camera-btn" onClick={()=>setShowCamera(true)}>
                    <i className="ti ti-camera" /> Open Camera
                  </button>
                )}

                {showCamera && (
                  <div className="vf-camera-wrap">
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={280} height={210} className="vf-webcam" />
                    <button type="button" className="vf-capture-btn" onClick={captureSelfie}>
                      <i className="ti ti-camera" /> Capture
                    </button>
                  </div>
                )}

                {selfieImage && (
                  <div className="vf-selfie-preview">
                    <img src={selfieImage} alt="selfie" className="vf-selfie-img" />
                    <button type="button" className="vf-retake-btn"
                      onClick={()=>{ setSelfieImage(null); setShowCamera(true); }}>
                      <i className="ti ti-refresh" /> Retake
                    </button>
                  </div>
                )}
              </div>

              {error   && <div className="vf-error"><i className="ti ti-alert-circle"/>{error}</div>}
              {success && <div className="vf-success"><i className="ti ti-circle-check"/>{success}</div>}

              <button type="submit" className="vf-submit-btn" disabled={submitting}>
                {submitting
                  ? <><span className="db-spinner light"/>Submitting...</>
                  : <><i className="ti ti-send"/>Submit Verification</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}