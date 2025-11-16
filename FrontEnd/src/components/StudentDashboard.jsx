import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Download, Share2, Shield, FileText, QrCode, ArrowLeft, CheckCircle, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Mock student data (will be fetched from blockchain later)
  const [studentData] = useState({
    name: 'Rishu Kumar',
    rollNumber: '22124081',
    degree: 'B.Tech',
    branch: 'Information Technology',
    graduationYear: '2026',
    certId: 'CERT-2025-IVL8XHG4T',
    email: 'rishu.kumar@example.com',
    issueDate: '2025-11-16',
    transactionHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
    blockNumber: '847256',
    status: 'Verified',
    issuer: 'XYZ University'
  });

  const [showQR, setShowQR] = useState(false);

  const handleDownload = () => {
    // TODO: Generate and download PDF certificate
    alert('Certificate download will be implemented with backend integration');
  };

  const handleShare = () => {
    const verificationUrl = `${window.location.origin}/verify/${studentData.certId}`;
    if (navigator.share) {
      navigator.share({
        title: 'My Alumni Certificate',
        text: 'Verify my educational credentials',
        url: verificationUrl
      });
    } else {
      navigator.clipboard.writeText(verificationUrl);
      alert('Verification link copied to clipboard!');
    }
  };

  const handleLogout = () => {
    navigate('/');
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
              <p className="dashboard-subtitle">View Your Verified Credentials</p>
            </div>
          </div>
          <div className="user-info-badge">
            <User size={18} />
            <span>{studentData.name}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Welcome Section */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">Welcome back, {studentData.name.split(' ')[0]}! 👋</h2>
            <p className="welcome-subtitle">Your credentials are securely stored on the blockchain</p>
          </div>
          <div className="verification-badge-large">
            <CheckCircle size={24} />
            <span>Verified</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Certificate Details Card */}
          <div className="dashboard-card certificate-card">
            <div className="card-header">
              <div className="card-header-title">
                <FileText size={24} />
                <h3>Certificate Details</h3>
              </div>
              <span className="status-badge verified">{studentData.status}</span>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name</label>
                <p>{studentData.name}</p>
              </div>
              <div className="detail-item">
                <label>Roll Number</label>
                <p>{studentData.rollNumber}</p>
              </div>
              <div className="detail-item">
                <label>Degree</label>
                <p>{studentData.degree}</p>
              </div>
              <div className="detail-item">
                <label>Branch</label>
                <p>{studentData.branch}</p>
              </div>
              <div className="detail-item">
                <label>Graduation Year</label>
                <p>{studentData.graduationYear}</p>
              </div>
              <div className="detail-item">
                <label>Certificate ID</label>
                <p className="cert-id-text">{studentData.certId}</p>
              </div>
              <div className="detail-item">
                <label>Issue Date</label>
                <p>{new Date(studentData.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="detail-item">
                <label>Issuer</label>
                <p>{studentData.issuer}</p>
              </div>
            </div>

            <div className="card-actions">
              <button className="action-btn primary-action" onClick={handleDownload}>
                <Download size={20} />
                <span>Download Certificate</span>
              </button>
              <button className="action-btn secondary-action" onClick={handleShare}>
                <Share2 size={20} />
                <span>Share</span>
              </button>
              <button className="action-btn secondary-action" onClick={() => setShowQR(!showQR)}>
                <QrCode size={20} />
                <span>Show QR</span>
              </button>
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
                <label>Transaction Hash</label>
                <code className="blockchain-value hash-text">{studentData.transactionHash}</code>
              </div>
              <div className="blockchain-item">
                <label>Block Number</label>
                <code className="blockchain-value">#{studentData.blockNumber}</code>
              </div>
              <div className="blockchain-item">
                <label>Network</label>
                <div className="network-badge">
                  <div className="pulse-indicator"></div>
                  <span>Polygon Mumbai</span>
                </div>
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

          {/* QR Code Card */}
          {showQR && (
            <div className="dashboard-card qr-card">
              <div className="card-header">
                <div className="card-header-title">
                  <QrCode size={24} />
                  <h3>Verification QR Code</h3>
                </div>
                <button className="close-qr-btn" onClick={() => setShowQR(false)}>×</button>
              </div>

              <div className="qr-display">
                <div className="qr-code-wrapper">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${studentData.certId}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="qr-instruction">Scan this QR code to instantly verify your credentials</p>
                <div className="verification-url">
                  <code>{`${window.location.origin}/verify/${studentData.certId}`}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
