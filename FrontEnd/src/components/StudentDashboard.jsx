import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  GraduationCap,
  Share2,
  Shield,
  FileText,
  ArrowLeft,
  CheckCircle,
  User,
  Search,
  XCircle,
  ExternalLink,
  Hexagon,
  Network,
  Cpu,
  Layers,
  Link2,
  Lock,
  Key,
  Download,
} from "lucide-react";
import "./StudentDashboard.css";
import { clearSession } from "../auth/session";
import toast from "react-hot-toast";
import { degrees, branches } from "../utils/options";
import { toPng } from "html-to-image";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [certIdInput, setCertIdInput] = useState(
    searchParams.get("certId") || "",
  );
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verification form state
  const [verifyMode, setVerifyMode] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    name: "",
    rollNumber: "",
    degree: "",
    branch: "",
    graduationYear: "",
    certId: "",
  });
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const certIdFromUrl = searchParams.get("certId");

  const fetchCertificate = useCallback(async (certId) => {
    if (!certId || !certId.trim()) {
      setError("Please enter a Certificate ID.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setStudentData(null);
      setVerifyResult(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/verify/${certId.trim()}`,
      );
      const data = response.data;

      const issueDate = new Date((data.timestamp || 0) * 1000)
        .toISOString()
        .slice(0, 10);

      setStudentData({
        certId: data.certId,
        dataHash: data.dataHash,
        issueDate,
        blockNumber: data.blockNumber,
        status: data.isRevoked ? "Revoked" : (data.exists ? "Verified" : "Not Found"),
        issuer: data.issuerName || "Unknown Issuer",
        issuerAddress: data.issuer,
        timestamp: data.timestamp,
        ipfsCID: data.ipfsCID,
      });

      // Pre-fill certId in verify form
      setVerifyForm((prev) => ({ ...prev, certId: data.certId }));
      toast.success("Record found!");
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "No record found for this Certificate ID. Please check and try again.",
        );
        toast.error("No record found for this ID.");
      } else {
        const errMsg = err.response?.data?.error ||
            err.response?.data?.details ||
            "Failed to load certificate data.";
        setError(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search if certId is in URL
  useEffect(() => {
    if (certIdFromUrl) {
      setCertIdInput(certIdFromUrl);
      fetchCertificate(certIdFromUrl);
    }
  }, [certIdFromUrl, fetchCertificate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCertificate(certIdInput);
  };

  const handleVerifyData = async (e) => {
    e.preventDefault();
    const { name, rollNumber, degree, branch, graduationYear, certId } =
      verifyForm;
    if (
      !name ||
      !rollNumber ||
      !degree ||
      !branch ||
      !graduationYear ||
      !certId
    ) {
      setVerifyResult({ valid: false, message: "Please fill in all fields." });
      return;
    }

    setVerifyLoading(true);
    setVerifyResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/verify/check`, {
        certId,
        name,
        rollNumber,
        degree,
        branch,
        graduationYear: Number(graduationYear),
      });

      if (response.data.valid) {
        toast.success("Cryptographic hash matched! Data verified.");
        setVerifyResult({
          valid: true,
          message:
            "Data verified successfully! The provided details match the blockchain record.",
        });
      } else {
        toast.error("Verification failed. Data does not match.");
        setVerifyResult({
          valid: false,
          message:
            "Verification failed. The details you entered do not match the on-chain record.",
          computedHash: response.data.computedHash,
          storedHash: response.data.storedHash,
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Verification request failed.";
      toast.error(errMsg);
      setVerifyResult({
        valid: false,
        message: errMsg,
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  // degree and branch options imported to match Admin form

  const handleShare = () => {
    const verificationUrl = `${window.location.origin}/verify/${studentData?.certId || ""}`;
    if (navigator.share) {
      navigator.share({
        title: "My Alumni Certificate",
        text: "Verify my educational credentials",
        url: verificationUrl,
      }).then(() => toast.success("Shared successfully!"))
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(verificationUrl);
      toast.success("Verification link copied to clipboard!");
    }
  };

  const handleDownloadCredential = async () => {
    const element = document.getElementById("credential-card");
    if (!element) return;
    
    const toastId = toast.loading("Generating credential image...");
    try {
      // Generate image using html-to-image (much better SVG and modern CSS support)
      const dataUrl = await toPng(element, {
        backgroundColor: "#0a0a0f", // Match the dashboard card background
        pixelRatio: 2,
        style: {
          height: 'auto',
          paddingBottom: '24px' // Compensate for the removed actions button space
        },
        filter: (node) => {
          // Ignore action buttons container
          return node.dataset?.html2canvasIgnore !== "true";
        }
      });
      
      // Create hidden link and trigger download
      const link = document.createElement("a");
      link.download = `Verified_Credential_${studentData.certId}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Credential downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Failed: ${err.message || err.toString()}`, { id: toastId });
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content-dashboard">
          <button className="back-btn" onClick={handleLogout}>
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <div className="header-title-section">
            <GraduationCap className="header-icon" size={32} />
            <div>
              <h1 className="dashboard-title">Student Dashboard</h1>
              <p className="dashboard-subtitle">
                Look Up &amp; Verify Your Credentials
              </p>
            </div>
          </div>
          <div className="user-info-badge">
            <User size={18} />
            <span>Student</span>
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <GraduationCap className="hero-copy-bg-icon" size={160} />
            <span className="hero-kicker">Student workspace</span>
            <h2>Search, inspect, and share your credential record easily.</h2>
            <p>
              Review the on-chain details, verify the stored data, and keep a
              clean shareable link for employers or institutions.
            </p>
            <div className="hero-chips">
              <span>
                <CheckCircle size={14} /> Search by certificate ID
              </span>
              <span>
                <CheckCircle size={14} /> Compare on-chain details
              </span>
              <span>
                <CheckCircle size={14} /> Share secure link
              </span>
            </div>
          </div>
          <div className="dashboard-hero-visual" aria-hidden="true">
            
            <div className="dashboard-hero-card dashboard-hero-card-main">
              <Search size={18} />
              <strong>Quick lookup</strong>
              <p>Everything you need sits in one verification timeline.</p>
            </div>
            <div className="dashboard-hero-card dashboard-hero-card-top">
              <Shield size={18} />
              <span>Polygon Amoy</span>
            </div>
            <div className="dashboard-hero-card dashboard-hero-card-bottom">
              <GraduationCap size={18} />
              <span>Student verified</span>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">Certificate Lookup</h2>
            <p className="welcome-subtitle">
              Enter your Certificate ID to view blockchain-verified credentials
            </p>
          </div>
          <form className="cert-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="e.g. CERT-2025-XXXXXXXX"
              value={certIdInput}
              onChange={(e) => setCertIdInput(e.target.value)}
              className="cert-search-input"
            />
            <button
              type="submit"
              className="action-btn primary-action"
              disabled={loading}
            >
              <Search size={20} />
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
          </form>
        </div>

        {/* Cyberpunk Animated Divider */}
        <div className="cyber-divider-wrapper">
          <div className="cyber-divider">
            <div className="cyber-line left-line"></div>
            <div className="cyber-core">
              <Shield size={20} className="cyber-core-icon" />
              <div className="cyber-pulse"></div>
            </div>
            <div className="cyber-line right-line"></div>
          </div>
        </div>

        {loading && (
          <div className="dashboard-loading">
            <p>Loading certificate data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="dashboard-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && studentData && (
          <>
            {/* Status Badge */}
            <div className="welcome-card" style={{ marginTop: "0" }}>
              <div className={`welcome-content ${studentData.status === "Revoked" ? "error-text" : ""}`}>
                <h2 className="welcome-title" style={studentData.status === "Revoked" ? { color: "#dc2626" } : {}}>
                  {studentData.status === "Revoked" ? "Certificate Revoked" : "Certificate Found"}
                </h2>
                <p className="welcome-subtitle" style={studentData.status === "Revoked" ? { color: "#991b1b" } : {}}>
                  {studentData.status === "Revoked" 
                    ? "🚨 WARNING: This certificate has been officially REVOKED by the issuing institution. It is no longer valid."
                    : "This credential is stored on the Polygon Amoy blockchain"}
                </p>
              </div>
              <div className="verification-badge-large" style={studentData.status === "Revoked" ? { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" } : {}}>
                {studentData.status === "Revoked" ? <XCircle size={24} color="#ef4444" /> : <CheckCircle size={24} />}
                <span>{studentData.status}</span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
              {/* Certificate Details Card */}
              <div className="dashboard-card certificate-card" id="credential-card">
                <div className="card-header">
                  <div className="card-header-title">
                    <FileText size={24} />
                    <h3>On-Chain Record</h3>
                  </div>
                  <span
                    className={`status-badge ${studentData.status === "Verified" ? "verified" : "unverified"}`}
                    style={studentData.status === "Revoked" ? { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" } : {}}
                  >
                    {studentData.status}
                  </span>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <label>Certificate ID</label>
                    <p className="cert-id-text">{studentData.certId}</p>
                  </div>
                  <div className="detail-item">
                    <label>Issued By</label>
                    <p>{studentData.issuer}</p>
                  </div>
                  <div className="detail-item">
                    <label>Issuer Address</label>
                    <p className="hash-text" style={{ fontSize: "0.75rem" }}>
                      {studentData.issuerAddress}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Issue Date</label>
                    <p>
                      {new Date(studentData.issueDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Data Hash</label>
                    <p
                      className="hash-text"
                      style={{ fontSize: "0.75rem", wordBreak: "break-all" }}
                    >
                      {studentData.dataHash}
                    </p>
                  </div>
                  {studentData.ipfsCID && studentData.status !== "Revoked" && (
                    <div className="detail-item" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
                      <label>Extra Document</label>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${studentData.ipfsCID}`}
                        target="_blank"
                        rel="noreferrer"
                        className="action-btn primary-action"
                        style={{ textDecoration: "none", display: "inline-flex", width: "fit-content", marginTop: "8px" }}
                      >
                        <ExternalLink size={18} />
                        <span>View Attached PDF</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="card-actions" data-html2canvas-ignore="true">
                  <button
                    className="action-btn secondary-action"
                    onClick={handleDownloadCredential}
                  >
                    <Download size={20} />
                    <span>Download</span>
                  </button>
                  <button
                    className="action-btn secondary-action"
                    onClick={handleShare}
                  >
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                  {studentData.status !== "Revoked" && (
                    <button
                      className="action-btn secondary-action"
                      onClick={() => setVerifyMode(!verifyMode)}
                    >
                      <Shield size={20} />
                      <span>{verifyMode ? "Hide Verify" : "Verify My Data"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Blockchain Details Card */}
              <div className="dashboard-card blockchain-card">
                <div className="card-header">
                  <div className="card-header-title">
                    <Shield size={24} />
                    <h3>Blockchain Details</h3>
                  </div>
                  <div className="blockchain-live-badge">
                    <div className="pulse-indicator"></div>
                    <span>On-Chain</span>
                  </div>
                </div>

                <div className="blockchain-info">
                  <div className="blockchain-item">
                    <label>Block Number</label>
                    <code className="blockchain-value">
                      #{studentData.blockNumber}
                    </code>
                  </div>
                  <div className="blockchain-item">
                    <label>Timestamp</label>
                    <code className="blockchain-value">
                      {new Date(studentData.timestamp * 1000).toLocaleString()}
                    </code>
                  </div>
                  <div className="blockchain-item">
                    <label>Network</label>
                    <div className="network-badge">
                      <div className="pulse-indicator"></div>
                      <span>Polygon Amoy</span>
                    </div>
                  </div>
                  <div className="blockchain-item">
                    <label>Explorer</label>
                    <a
                      href={`https://amoy.polygonscan.com/block/${studentData.blockNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="blockchain-value"
                      style={{ color: "#6366f1", textDecoration: "underline" }}
                    >
                      View on PolygonScan
                    </a>
                  </div>
                </div>

                <div className="security-features">
                  <h4 className="security-title">Security Features</h4>
                  <div className="security-list">
                    <div className="security-item">
                      <CheckCircle size={18} />
                      <span>Tamper-Proof Record</span>
                    </div>
                    <div className="security-item">
                      <CheckCircle size={18} />
                      <span>Immutable Data</span>
                    </div>
                    <div className="security-item">
                      <CheckCircle size={18} />
                      <span>Publicly Verifiable</span>
                    </div>
                    <div className="security-item">
                      <CheckCircle size={18} />
                      <span>Decentralized Storage</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verify Data Card */}
              {verifyMode && studentData.status !== "Revoked" && (
                <>
                  <div className="dashboard-card certificate-card">
                    <div className="card-header">
                    <div className="card-header-title">
                      <Shield size={24} />
                      <h3>Verify Your Details</h3>
                    </div>
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      marginBottom: "1rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Enter your personal details to verify they match the
                    on-chain hash. No personal data is stored on the blockchain
                    — only a hash.
                  </p>
                  <form onSubmit={handleVerifyData} className="details-grid">
                    <div className="detail-item">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={verifyForm.name}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, name: e.target.value }))
                        }
                        className="cert-search-input"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="detail-item">
                      <label>Roll Number</label>
                      <input
                        type="text"
                        value={verifyForm.rollNumber}
                        onChange={(e) =>
                          setVerifyForm((f) => ({
                            ...f,
                            rollNumber: e.target.value,
                          }))
                        }
                        className="cert-search-input"
                        placeholder="e.g. 2021CS001"
                      />
                    </div>
                    <div className="detail-item">
                      <label>Degree</label>
                      <select
                        value={verifyForm.degree}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, degree: e.target.value }))
                        }
                        className="cert-search-input"
                      >
                        <option value="">Select Degree</option>
                        {degrees.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="detail-item">
                      <label>Branch</label>
                      <select
                        value={verifyForm.branch}
                        onChange={(e) =>
                          setVerifyForm((f) => ({ ...f, branch: e.target.value }))
                        }
                        className="cert-search-input"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="detail-item">
                      <label>Graduation Year</label>
                      <input
                        type="number"
                        value={verifyForm.graduationYear}
                        onChange={(e) =>
                          setVerifyForm((f) => ({
                            ...f,
                            graduationYear: e.target.value,
                          }))
                        }
                        className="cert-search-input"
                        placeholder="e.g. 2025"
                      />
                    </div>
                    <div
                      className="detail-item"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <button
                        type="submit"
                        className="action-btn primary-action"
                        disabled={verifyLoading}
                        style={{ width: "100%" }}
                      >
                        <Shield size={20} />
                        <span>
                          {verifyLoading ? "Verifying..." : "Verify Data"}
                        </span>
                      </button>
                    </div>
                  </form>
                  {verifyResult && (
                    <>
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          background: verifyResult.valid
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                          border: `1px solid ${verifyResult.valid ? "#22c55e" : "#ef4444"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {verifyResult.valid ? (
                          <CheckCircle size={20} color="#22c55e" />
                        ) : (
                          <XCircle size={20} color="#ef4444" />
                        )}
                        <span
                          style={{
                            color: verifyResult.valid ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {verifyResult.message}
                        </span>
                      </div>
                      {!verifyResult.valid && verifyResult.computedHash && (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            fontSize: "0.78rem",
                            color: "#94a3b8",
                            lineHeight: 1.5,
                          }}
                        >
                          <p style={{ marginBottom: "0.25rem" }}>
                            <strong style={{ color: "#cbd5e1" }}>
                              Stored hash:
                            </strong>{" "}
                            <code style={{ wordBreak: "break-all" }}>
                              {verifyResult.storedHash}
                            </code>
                          </p>
                          <p style={{ marginBottom: "0.5rem" }}>
                            <strong style={{ color: "#cbd5e1" }}>
                              Your hash:
                            </strong>{" "}
                            <code style={{ wordBreak: "break-all" }}>
                              {verifyResult.computedHash}
                            </code>
                          </p>
                          <p style={{ color: "#f59e0b" }}>
                            ⚠ Verification is <strong>case-sensitive</strong>.
                            Every field must match exactly as it was entered
                            when the certificate was issued (including spaces
                            and capitalisation).
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Empty Right-Side Illustration Card */}
                <div className="dashboard-card crypto-illustration-card">
                  <div className="crypto-visual">
                    <div className="crypto-glow"></div>
                    <Shield size={64} className="crypto-icon-main" />
                    <div className="crypto-orbit orbit-1"><Lock size={20} /></div>
                    <div className="crypto-orbit orbit-2"><Key size={20} /></div>
                    <div className="crypto-orbit orbit-3"><CheckCircle size={20} /></div>
                  </div>
                  <div className="crypto-text">
                    <h3>Zero-Knowledge Local Verification</h3>
                    <p>Your details are processed purely within your browser to compute a cryptographic hash. This hash is compared against the immutable blockchain record. No personal data ever leaves your device.</p>
                  </div>
                </div>
              </>
              )}

              <div className="dashboard-card verification-link-card">
                <div className="card-header">
                  <div className="card-header-title">
                    <Shield size={24} />
                    <h3>Verification Link</h3>
                  </div>
                  <span className="status-badge verified">Ready to share</span>
                </div>

                <div className="verification-link-content">
                  <p>
                    Share this secure URL with employers or keep it for quick
                    access to the credential record.
                  </p>
                  <div className="verification-url">
                    <code>{`${window.location.origin}/verify/${studentData.certId}`}</code>
                  </div>
                  <button
                    className="action-btn secondary-action copy-link-btn"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `${window.location.origin}/verify/${studentData.certId}`,
                      );
                    }}
                  >
                    <Share2 size={20} />
                    <span>Copy verification link</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
