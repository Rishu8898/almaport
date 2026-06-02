import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import "./VerificationPage.css";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const VerificationPage = () => {
  const { certId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!certId) {
        setError("Certificate ID is missing in URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/verify/${certId}`);

        if (response.status === 404) {
          setError("No record found for this certificate ID.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body.error || body.details || "Failed to verify certificate.",
          );
        }

        const body = await response.json();
        setData(body);
      } catch (err) {
        setError(err.message || "Failed to verify certificate.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [certId]);

  const handleBack = () => {
    navigate("/");
  };

  const explorerUrl =
    data && data.blockNumber
      ? `https://amoy.polygonscan.com/block/${data.blockNumber}`
      : "";

  const isVerified = !error && data && data.exists && !data.isRevoked;
  const isRevoked = data && data.isRevoked;

  return (
    <div className="verify-page-container">
      <header className="verify-header">
        <button className="verify-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>
        <div className="verify-header-title">
          <Shield size={28} className="verify-header-icon" />
          <div>
            <h1>Certificate Verification</h1>
            <p>Check blockchain-backed alumni credentials</p>
          </div>
        </div>
      </header>

      <section className="verify-intro">
        <div className="verify-intro-copy">
          <span className="verify-eyebrow">Blockchain verification</span>
          <h2>Inspect the credential trail with a clean, audit-friendly view.</h2>
          <p>
            We fetch the on-chain record directly, then present the issuer,
            block, and timestamp in a concise layout that is easy to scan.
          </p>
        </div>

        <div className="verify-visual" aria-hidden="true">
          <div className="verify-visual-glow"></div>
          <div className="verify-visual-card">
            <Shield size={34} />
            <strong>Verified source</strong>
            <span>Polygon Amoy</span>
          </div>
          <div className="verify-visual-strip">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </section>

      <main className="verify-main">
        {loading && (
          <div className="verify-card verify-loading-card">
            <p>Verifying certificate on blockchain...</p>
          </div>
        )}

        {!loading && error && (
          <div className="verify-card verify-error-card">
            <div className="verify-status-icon error">
              <XCircle size={36} />
            </div>
            <h2>Verification Failed</h2>
            <p>{error}</p>
            {certId && (
              <p className="verify-cert-id">
                Certificate ID: <code>{certId}</code>
              </p>
            )}
          </div>
        )}

        {!loading && !error && data && (
          <div className={`verify-card verify-result-card ${isRevoked ? 'verify-revoked-card' : ''}`}>
            {isRevoked ? (
              <>
                <div className="verify-status-icon error">
                  <AlertCircle size={40} />
                </div>
                <h2 style={{ color: '#dc2626' }}>Certificate Revoked</h2>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                  <strong>🚨 WARNING:</strong> This certificate has been officially REVOKED by the issuing institution. It is no longer valid.
                </div>
                <p className="verify-cert-id">
                  Certificate ID: <code>{data.certId}</code>
                </p>
              </>
            ) : (
              <>
                <div
                  className={`verify-status-icon ${isVerified ? "success" : "error"}`}
                >
                  {isVerified ? <CheckCircle size={40} /> : <XCircle size={40} />}
                </div>
                <h2>
                  {isVerified ? "Certificate Verified" : "Certificate Not Found"}
                </h2>
    
                <p className="verify-cert-id">
                  Certificate ID: <code>{data.certId}</code>
                </p>
              </>
            )}

            {!isRevoked && (
              <div className="verify-details-grid">
              <div className="verify-detail-item">
                <label>Status</label>
                <p>
                  {isVerified
                    ? "Verified on-chain"
                    : "No matching on-chain record"}
                </p>
              </div>
              <div className="verify-detail-item">
                <label>Issuer</label>
                <p>{data.issuerName || "Unknown issuer"}</p>
              </div>
              <div className="verify-detail-item">
                <label>Issuer Address</label>
                <p className="verify-code-text">{data.issuer}</p>
              </div>
              <div className="verify-detail-item">
                <label>Block Number</label>
                <p>#{data.blockNumber}</p>
              </div>
              <div className="verify-detail-item">
                <label>Timestamp</label>
                <p>
                  {data.timestamp
                    ? new Date(data.timestamp * 1000).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              {data.ipfsCID && (
                <div className="verify-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Extra Document</label>
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${data.ipfsCID}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="verify-explorer-link"
                    style={{ marginTop: '8px', display: 'inline-flex' }}
                  >
                    View Attached PDF (IPFS)
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>
            )}

            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="verify-explorer-link"
              >
                View on PolygonScan
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerificationPage;
