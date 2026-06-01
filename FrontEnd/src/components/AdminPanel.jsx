import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  Copy,
  Check,
} from "lucide-react";
import "./AdminPanel.css";
import { clearSession, getUser } from "../auth/session";
import { degrees, branches } from "../utils/options";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    degree: "",
    branch: "",
    graduationYear: "",
    certId: "",
    studentEmail: "",
  });

  // MetaMask State
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [showCopied, setShowCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [recentIssued, setRecentIssued] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [stats, setStats] = useState({ totalRecords: null, network: null });

  const user = getUser();

  const resetWalletState = () => {
    setWalletAddress("");
    setIsConnected(false);
    setIsConnecting(false);
    setWalletError("");
    setShowCopied(false);
  };

  // ✅ Check if MetaMask is already connected on mount
  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error("Error checking MetaMask connection:", err);
      }
    };

    checkMetaMaskConnection();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        resetWalletState();
      }
    };

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum?.removeListener === "function") {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      }
    };
  }, []);

  // ✅ Connect MetaMask Wallet
  const connectMetaMask = async () => {
    if (typeof window.ethereum === "undefined") {
      setWalletError("MetaMask is not installed. Please install it first.");
      return;
    }

    setIsConnecting(true);
    setWalletError("");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setWalletError("");
      }
    } catch (error) {
      if (error.code === 4001) {
        setWalletError("Connection rejected. Please try again.");
      } else {
        setWalletError("Failed to connect MetaMask wallet.");
      }
      console.error("MetaMask connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // ✅ Copy wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // ✅ Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/api/admin/stats`);
        setStats(resp.data);
      } catch (err) {
        // Stats are optional; keep UI functional even if it fails.
        console.error("Failed to load stats:", err);
      }
    };

    loadStats();
    loadRecentIssued();
  }, []);

  function loadRecentIssued() {
    try {
      const raw = localStorage.getItem('almaPort.issued') || '[]';
      const arr = JSON.parse(raw);
      setRecentIssued(Array.isArray(arr) ? arr : []);
    } catch {
      setRecentIssued([]);
    }
  }

  function persistIssued(record) {
    try {
      const raw = localStorage.getItem('almaPort.issued') || '[]';
      const arr = JSON.parse(raw) || [];
      // prepend newest
      arr.unshift(record);
      // keep only last 50
      const trimmed = arr.slice(0, 50);
      localStorage.setItem('almaPort.issued', JSON.stringify(trimmed));
      setRecentIssued(trimmed);
    } catch (e) {
      console.error('Failed to persist issued record locally', e);
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  // degrees and branches imported from shared options

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.rollNumber.trim())
      newErrors.rollNumber = "Roll number is required";
    if (!formData.degree) newErrors.degree = "Please select a degree";
    if (!formData.branch) newErrors.branch = "Please select a branch";
    if (!formData.graduationYear)
      newErrors.graduationYear = "Graduation year is required";
    if (!formData.certId.trim())
      newErrors.certId = "Certificate ID is required";
    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = "Student email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.studentEmail)) {
      newErrors.studentEmail = "Please enter a valid email address";
    }

    const currentYear = new Date().getFullYear();
    if (
      formData.graduationYear &&
      (formData.graduationYear < 1950 ||
        formData.graduationYear > currentYear + 5)
    ) {
      newErrors.graduationYear = "Please enter a valid year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected || !walletAddress) {
      setWalletError("Please connect your MetaMask wallet first");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      // Submit via backend so server computes the hash and sends transaction
      setApiError("");
      const resp = await axios.post(
        `${API_BASE_URL}/api/admin/add`,
        {
          name: formData.name,
          rollNumber: formData.rollNumber,
          degree: formData.degree,
          branch: formData.branch,
          graduationYear: Number(formData.graduationYear),
          certId: formData.certId,
          studentEmail: formData.studentEmail,
        },
        {},
      );

      const finalResult = {
        transactionHash: resp.data.transactionHash,
        certId: resp.data.certId || formData.certId,
        blockNumber: resp.data.blockNumber,
        timestamp: resp.data.timestamp,
        walletAddress: walletAddress,
      };

      setResult(finalResult);
      setSubmitted(true);
      setApiError("");

      // Persist issued cert locally for admin convenience
      const issuedRecord = {
        certId: finalResult.certId,
        transactionHash: finalResult.transactionHash,
        blockNumber: finalResult.blockNumber,
        timestamp: Math.floor(Date.now() / 1000),
      };
      persistIssued(issuedRecord);

      // clear form fields immediately but keep result visible until admin closes
      setFormData({
        name: "",
        rollNumber: "",
        degree: "",
        branch: "",
        graduationYear: "",
        certId: "",
        studentEmail: "",
      });

      // Open modal with quick actions
      setModalOpen(true);
    } catch (error) {
      console.error("❌ Error:", error);

      if (error.code === 4001) {
        setApiError("Transaction rejected by user");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        setApiError("Insufficient balance to pay gas fees");
      } else if (error.reason) {
        setApiError(`Error: ${error.reason}`);
      } else if (error.message.includes("not an authorized issuer")) {
        setApiError("Your wallet is not authorized as an issuer");
      } else {
        setApiError(error.message || "Failed to submit to blockchain");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window.ethereum?.request === "function") {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      }
    } catch (error) {
      console.info("MetaMask permission revoke skipped:", error);
    } finally {
      clearSession();
      resetWalletState();
      setSubmitted(false);
      setResult(null);
      setModalOpen(false);
      setApiError("");
      setErrors({});
      setFormData({
        name: "",
        rollNumber: "",
        degree: "",
        branch: "",
        graduationYear: "",
        certId: "",
        studentEmail: "",
      });
    }

    navigate("/admin");
  };

  const generateCertId = async () => {
    const prefix = "CERT";
    const year = new Date().getFullYear();
    // Prefer crypto.randomUUID for uniqueness; fallback to crypto.getRandomValues or Math.random
    let idPart = "";
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        idPart = crypto.randomUUID().split("-")[0].toUpperCase();
      } else if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const arr = new Uint8Array(6);
        crypto.getRandomValues(arr);
        idPart = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase().slice(0, 9);
      } else {
        idPart = Math.random().toString(36).slice(2, 11).toUpperCase();
      }
    } catch {
      idPart = Math.random().toString(36).slice(2, 11).toUpperCase();
    }

    let candidate = `${prefix}-${year}-${idPart}`;

    // Check uniqueness against backend; retry up to 5 times
    const maxTries = 5;
    let tries = 0;
    try {
      while (tries < maxTries) {
        // Query backend to see if record exists
        const resp = await axios.get(
          `${API_BASE_URL}/api/verify/${encodeURIComponent(candidate)}`,
        ).catch(() => null);

        const exists = resp && resp.data && resp.data.exists;
        if (!exists) break; // unique

        // otherwise regenerate
        tries += 1;
        const extra = Math.random().toString(36).slice(2, 8).toUpperCase();
        candidate = `${prefix}-${year}-${extra}`;
      }
    } catch {
      // ignore errors checking uniqueness; fallback to candidate
    }

    setFormData((prev) => ({ ...prev, certId: candidate }));
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="logo-section">
            <Shield className="logo-icon" size={36} />
            <div>
              <h1 className="header-title">Alumni Verification Portal</h1>
              <p className="header-subtitle">
                Blockchain-Based Credential Management
              </p>
            </div>
          </div>
          <div className="blockchain-badge">
            <div className="pulse-dot"></div>
            <span>
              {stats.network?.name ? `${stats.network.name}` : "Polygon Amoy"}
            </span>
          </div>
          <div className="admin-user-actions">
            {!isConnected ? (
              <button
                className="metamask-connect-btn"
                onClick={connectMetaMask}
                disabled={isConnecting}
              >
                <Wallet size={18} />
                <span>
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </span>
              </button>
            ) : (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <div className="wallet-status">
                    <div className="wallet-dot"></div>
                    <span className="wallet-label">Connected</span>
                  </div>
                  <button
                    className="wallet-address-btn"
                    onClick={copyToClipboard}
                    title={walletAddress}
                  >
                    <Wallet size={16} />
                    {formatAddress(walletAddress)}
                    {showCopied ? (
                      <Check size={14} className="copy-icon" />
                    ) : (
                      <Copy size={14} className="copy-icon" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <span className="admin-user-email">{user?.email || "Admin"}</span>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <section className="admin-hero">
          <div className="admin-hero-copy">
            <span className="hero-kicker">Issuer console</span>
            <h2>Publish alumni records with a calm, focused workflow.</h2>
            <p>
              Keep every issuance wallet-gated, auditable, and easy to review
              at a glance.
            </p>
            <div className="hero-chips">
              <span>
                <CheckCircle size={14} /> Wallet gated
              </span>
              <span>
                <CheckCircle size={14} /> Immutable records
              </span>
              <span>
                <CheckCircle size={14} /> Fast lookup
              </span>
            </div>
          </div>
          <div className="admin-hero-visual" aria-hidden="true">
            <div className="admin-hero-surface"></div>
            <div className="admin-hero-card admin-hero-card-top">
              <Shield size={18} />
              <span>Secure issuance</span>
            </div>
            <div className="admin-hero-card admin-hero-card-main">
              <strong>Blockchain ready</strong>
              <p>Transactions, hashes, and issuance history stay visible.</p>
            </div>
            <div className="admin-hero-card admin-hero-card-bottom">
              <Upload size={18} />
              <span>Submit to chain</span>
            </div>
          </div>
        </section>

        {/* Modal for quick actions */}
        {modalOpen && result && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Certificate Issued</h3>
              <p>Certificate ID: <strong>{result.certId}</strong></p>
              <p className="modal-note">
                Share the verification link or copy the certificate ID for
                fast manual lookup.
              </p>
              <div className="modal-actions">
                <button
                  className="small-btn"
                  onClick={async () => {
                    await copyText(result.certId);
                    alert('Certificate ID copied to clipboard');
                  }}
                >
                  Copy Cert ID
                </button>
                <a
                  className="small-btn"
                  href={`/verify/${encodeURIComponent(result.certId)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Verify Page
                </a>
                <button
                  className="small-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon-wrapper stat-icon-primary">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">
                {typeof stats.totalRecords === "number"
                  ? stats.totalRecords
                  : "—"}
              </h3>
              <p className="stat-label">Alumni Verified</p>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon-wrapper stat-icon-success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">98.5%</h3>
              <p className="stat-label">Success Rate</p>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon-wrapper stat-icon-info">
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">100%</h3>
              <p className="stat-label">Tamper Proof</p>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <Upload className="section-icon" size={24} />
              <h2 className="section-title">Add Alumni Record</h2>
            </div>
            <p className="section-description">
              Enter verified alumni details to create immutable blockchain
              records
            </p>
          </div>

          {apiError && (
            <div className="api-error-banner">
              <AlertCircle size={18} className="api-error-icon" />
              <span>{apiError}</span>
            </div>
          )}

          {walletError && (
            <div className="wallet-error-banner">
              <AlertCircle size={18} className="wallet-error-icon" />
              <span>{walletError}</span>
            </div>
          )}

          {!isConnected && (
            <div className="wallet-warning-banner">
              <Wallet size={18} className="wallet-warning-icon" />
              <span>Please connect your MetaMask wallet to submit records</span>
            </div>
          )}

          {/* Recent issued list (localStorage) */}
          {recentIssued.length > 0 && (
            <div className="recent-issued">
              <h4>Recently Issued</h4>
              <ul>
                {recentIssued.slice(0, 10).map((r) => (
                  <li key={r.certId} className="recent-item">
                    <span className="recent-cert">{r.certId}</span>
                    <div className="recent-actions">
                      <button
                        className="small-btn"
                        onClick={async () => {
                          await copyText(r.certId);
                          alert('Certificate ID copied to clipboard');
                        }}
                      >
                        Copy
                      </button>
                      <a
                        className="small-btn"
                        href={`/verify/${encodeURIComponent(r.certId)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="alumni-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? "input-error" : ""}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <span className="error-text">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Student Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className={`form-input ${errors.studentEmail ? "input-error" : ""}`}
                    placeholder="student@example.com"
                  />
                  {errors.studentEmail && (
                    <span className="error-text">{errors.studentEmail}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Roll Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.rollNumber ? "input-error" : ""
                    }`}
                    placeholder="e.g., 2020CS001"
                  />
                  {errors.rollNumber && (
                    <span className="error-text">{errors.rollNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Degree <span className="required">*</span>
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className={`form-select ${
                      errors.degree ? "input-error" : ""
                    }`}
                  >
                    <option value="">Select Degree</option>
                    {degrees.map((degree) => (
                      <option key={degree} value={degree}>
                        {degree}
                      </option>
                    ))}
                  </select>
                  {errors.degree && (
                    <span className="error-text">{errors.degree}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Branch/Specialization <span className="required">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`form-select ${
                      errors.branch ? "input-error" : ""
                    }`}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {errors.branch && (
                    <span className="error-text">{errors.branch}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Graduation Year <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.graduationYear ? "input-error" : ""
                    }`}
                    placeholder="e.g., 2024"
                    min="1950"
                    max={new Date().getFullYear() + 5}
                  />
                  {errors.graduationYear && (
                    <span className="error-text">{errors.graduationYear}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Certificate ID <span className="required">*</span>
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      name="certId"
                      value={formData.certId}
                      onChange={handleChange}
                      className={`form-input ${
                        errors.certId ? "input-error" : ""
                      }`}
                      placeholder="CERT-2024-XXXXX"
                    />
                    <button
                      type="button"
                      onClick={generateCertId}
                      className="generate-btn"
                      title="Generate Certificate ID"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.certId && (
                    <span className="error-text">{errors.certId}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="submit-btn"
                  title={
                    !isConnected ? "Please connect MetaMask wallet first" : ""
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="spinner" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Submit to Blockchain
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="success-container">
              <div className="success-animation">
                <CheckCircle className="success-icon" size={64} />
              </div>
              <h2 className="success-title">Record Successfully Added!</h2>
              <p className="success-subtitle">
                Alumni data has been securely stored on the blockchain
              </p>

              <div className="result-grid">
                <div className="result-card">
                  <h3 className="result-label">Submitted By (Wallet)</h3>
                  <code className="result-value">
                    {result?.walletAddress || walletAddress}
                  </code>
                </div>

                <div className="result-card">
                  <h3 className="result-label">Transaction Hash</h3>
                  <code className="result-value hash-value">
                    {result?.transactionHash}
                  </code>
                </div>

                <div className="result-card">
                  <h3 className="result-label">Certificate ID</h3>
                  <code className="result-value">{result?.certId}</code>
                </div>

                <div className="result-card">
                  <h3 className="result-label">Block Number</h3>
                  <code className="result-value">#{result?.blockNumber}</code>
                </div>

                <div className="result-card">
                  <h3 className="result-label">Timestamp</h3>
                  <code className="result-value">
                    {new Date(result?.timestamp).toLocaleString()}
                  </code>
                </div>
              </div>

              {result && (
                <div className="verification-link-card">
                  <div>
                    <h3>Verification Link</h3>
                    <p>
                      Open the credential record directly without scanning a
                      code.
                    </p>
                  </div>
                  <code>{`${window.location.origin}/verify/${result.certId}`}</code>
                </div>
              )}
              <div className="success-actions">
                <button
                  className="small-btn"
                  onClick={async () => {
                    if (result?.certId) {
                      await copyText(result.certId);
                      alert('Certificate ID copied to clipboard');
                    }
                  }}
                >
                  Copy Cert ID
                </button>
                <button
                  className="small-btn"
                  onClick={() => setModalOpen(true)}
                >
                  Quick Actions
                </button>
                <button
                  className="small-btn"
                  onClick={() => {
                    setSubmitted(false);
                    setResult(null);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
