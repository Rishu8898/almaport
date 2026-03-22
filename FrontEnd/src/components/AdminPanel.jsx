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
  QrCode,
  Wallet,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ethers } from "ethers";
import "./AdminPanel.css";
import { clearSession, getAuthHeader, getUser } from "../auth/session";

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
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [stats, setStats] = useState({ totalRecords: null, network: null });

  const user = getUser();

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

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setWalletAddress("");
          setIsConnected(false);
        }
      });
    }
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
        const resp = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
          headers: {
            ...getAuthHeader(),
          },
        });
        setStats(resp.data);
      } catch (err) {
        // Stats are optional; keep UI functional even if it fails.
        console.error("Failed to load stats:", err);
      }
    };

    loadStats();
  }, []);

  const degrees = ["B.Tech", "M.Tech", "MBA", "MCA", "B.Sc", "M.Sc", "PhD"];
  const branches = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "Information Technology",
    "Chemical",
    "Biotechnology",
  ];

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
      // ✅ Step 1: Generate data hash on frontend (matching Solidity's generateDataHash)
      // Using ethers v6 API: ethers.solidityPackedKeccak256 (renamed from solidityKeccak256)
      const dataHash = ethers.solidityPackedKeccak256(
        ["string", "string", "string", "string", "string", "string"],
        [
          formData.name,
          formData.rollNumber,
          formData.degree,
          formData.branch,
          String(formData.graduationYear),
          formData.certId,
        ],
      );

      console.log("📝 Data Hash:", dataHash);

      // ✅ Step 2: Get contract address from environment
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error(
          "Contract address not configured. Set VITE_CONTRACT_ADDRESS in .env",
        );
      }

      // ✅ Step 3: Minimal ABI for addAlumniRecord function
      const contractABI = [
        {
          inputs: [
            { internalType: "string", name: "_certId", type: "string" },
            { internalType: "bytes32", name: "_dataHash", type: "bytes32" },
          ],
          name: "addAlumniRecord",
          outputs: [
            { internalType: "bool", name: "success", type: "bool" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
            { internalType: "uint256", name: "blockNumber", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      // ✅ Step 4: Get ethers provider from MetaMask and create signer
      // Using ethers v6 API: BrowserProvider (replaces Web3Provider in v6)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✅ Step 5: Create contract instance connected to signer
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );

      console.log("🔗 Contract Address:", contractAddress);
      console.log("👤 Signer Address:", walletAddress);

      // ✅ Step 6: Call smart contract function
      setApiError(""); // Clear any previous errors
      const tx = await contract.addAlumniRecord(formData.certId, dataHash);

      console.log("⏳ Transaction submitted:", tx.hash);
      setApiError(`⏳ Transaction submitted! Hash: ${tx.hash}`);

      // ✅ Step 7: Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log("✅ Transaction confirmed:", receipt);

      // ✅ Step 8: Build result data
      const finalResult = {
        transactionHash: receipt.transactionHash,
        certId: formData.certId,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        walletAddress: walletAddress,
      };

      setResult(finalResult);
      setSubmitted(true);
      setApiError(""); // Clear loading message

      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setResult(null);
        setFormData({
          name: "",
          rollNumber: "",
          degree: "",
          branch: "",
          graduationYear: "",
          certId: "",
        });
      }, 5000);
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

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const generateCertId = () => {
    const prefix = "CERT";
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData((prev) => ({
      ...prev,
      certId: `${prefix}-${year}-${random}`,
    }));
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
              {stats.network?.name ? `${stats.network.name}` : "Polygon Mumbai"}
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
                <div className="qr-section">
                  <div className="qr-header">
                    <QrCode size={20} />
                    <h3>Verification QR Code</h3>
                  </div>
                  <div className="qr-container">
                    <QRCodeSVG
                      value={`${window.location.origin}/verify/${result.certId}`}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="qr-description">
                    Scan to verify certificate instantly
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
