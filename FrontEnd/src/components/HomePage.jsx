import { useState } from "react";
import {
  Shield,
  Users,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleAdminLogin = () => {
    window.location.assign("/admin");
  };

  const handleStudentLogin = () => {
    window.location.assign("/student/dashboard");
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="home-header">
        <div className="header-glass">
          <div className="logo-section-home">
            <Shield className="logo-icon-home" size={40} />
            <div>
              <h1 className="brand-title">Alumni Verification Portal</h1>
              <p className="brand-subtitle">
                Blockchain-Based Credential Management
              </p>
            </div>
          </div>
          <div className="blockchain-badge-home">
            <div className="pulse-dot"></div>
            <span>Powered by Polygon</span>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="hero-section">
        <div className="hero-layout">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Secure • Transparent • Immutable</span>
            </div>
            <h2 className="hero-title">
              Verify Alumni Credentials with
              <span className="gradient-text"> Blockchain Technology</span>
            </h2>
            <p className="hero-description">
              A revolutionary system that ensures tamper-proof, instant
              verification of educational credentials using blockchain
              technology. Join thousands of verified alumni worldwide.
            </p>

            {/* Features Grid */}
            <div className="features-grid">
              <div className="feature-item">
                <CheckCircle size={20} className="feature-icon" />
                <span>Instant Verification</span>
              </div>
              <div className="feature-item">
                <Lock size={20} className="feature-icon" />
                <span>Tamper-Proof Records</span>
              </div>
              <div className="feature-item">
                <Shield size={20} className="feature-icon" />
                <span>Blockchain Secured</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orb hero-orb-one"></div>
            <div className="hero-orb hero-orb-two"></div>
            <div className="hero-orb hero-orb-three"></div>
            <div className="hero-stack">
              <div className="hero-mini-card hero-mini-card-top">
                <Shield size={18} />
                <span>On-chain trust</span>
              </div>
              <div className="hero-mini-card hero-mini-card-main">
                <div className="hero-bar-row">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <strong>Immutable records</strong>
                <p>Verified by blockchain signals and secure issuance.</p>
              </div>
              <div className="hero-mini-card hero-mini-card-bottom">
                <Users size={18} />
                <span>1,247 alumni protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Cards Section */}
      <section className="login-section">
        <div className="section-header-home">
          <h3 className="section-title-home">Choose Your Portal</h3>
          <p className="section-subtitle-home">
            Select your role to access the platform
          </p>
        </div>

        <div className="login-cards-grid">
          {/* Admin Card */}
          <div
            className={`login-card admin-card ${hoveredCard === "admin" ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredCard("admin")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-glow admin-glow"></div>
            <div className="card-content">
              <div className="card-icon-wrapper admin-icon">
                <Shield size={48} />
              </div>
              <h4 className="card-title">Admin Portal</h4>
              <p className="card-description">
                Add and manage alumni records. Upload verified credentials to
                the blockchain.
              </p>

              <div className="card-features">
                <div className="card-feature-item">
                  <CheckCircle size={16} />
                  <span>Add Alumni Records</span>
                </div>
                <div className="card-feature-item">
                  <CheckCircle size={16} />
                  <span>Issue Certificates</span>
                </div>
                <div className="card-feature-item">
                  <CheckCircle size={16} />
                  <span>Manage Credentials</span>
                </div>
              </div>

              <button
                className="login-btn admin-btn"
                onClick={() => handleAdminLogin()}
              >
                <Shield size={20} />
                <span>Open Admin Portal</span>
                <ArrowRight size={20} className="arrow-icon" />
              </button>
            </div>
          </div>

          {/* Student Card */}
          <div
            className={`login-card student-card ${hoveredCard === "student" ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredCard("student")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-glow student-glow"></div>
            <div className="card-content">
              <div className="card-icon-wrapper student-icon">
                <GraduationCap size={48} />
              </div>
              <h4 className="card-title">Student Portal</h4>
              <p className="card-description">
                View your verified credentials. Download certificates and share
                verification links.
              </p>

              <div className="card-features">
                <div className="card-feature-item">
                  <CheckCircle size={16} />
                  <span>View Your Records</span>
                </div>
                <div className="card-feature-item">
                  <CheckCircle size={16} />
                  <span>Download Certificates</span>
                </div>
                <div className="card-feature-item">
                  <CheckCircle size={16} />
                  <span>Share Verification</span>
                </div>
              </div>

              <button
                className="login-btn student-btn"
                onClick={() => handleStudentLogin()}
              >
                <GraduationCap size={20} />
                <span>Open Student Portal</span>
                <ArrowRight size={20} className="arrow-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item-home">
          <Users className="stat-icon-home" />
          <h4 className="stat-number">1,247+</h4>
          <p className="stat-label-home">Verified Alumni</p>
        </div>
        <div className="stat-item-home">
          <Shield className="stat-icon-home" />
          <h4 className="stat-number">100%</h4>
          <p className="stat-label-home">Secure Records</p>
        </div>
        <div className="stat-item-home">
          <CheckCircle className="stat-icon-home" />
          <h4 className="stat-number">98.5%</h4>
          <p className="stat-label-home">Success Rate</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>
          © 2025 Alumni Verification Portal. Powered by Blockchain Technology.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
