import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { Shield, Users, GraduationCap, Mail, ArrowRight, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { isAuthenticated, setSession } from '../auth/session';
import './HomePage.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const HomePage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [oauthOpen, setOauthOpen] = useState(false);
  const [oauthUserType, setOauthUserType] = useState(null); // 'admin' | 'student'
  const [oauthError, setOauthError] = useState('');

  const handleAdminLogin = () => {
    // Auth is required (route is protected)
    if (!isAuthenticated()) {
      handleGmailLogin('admin');
      return;
    }
    navigate('/admin');
  };

  const handleStudentLogin = () => {
    // Auth is required (route is protected)
    if (!isAuthenticated()) {
      handleGmailLogin('student');
      return;
    }
    navigate('/student/dashboard');
  };

  const handleGmailLogin = (userType) => {
    setOauthError('');
    setOauthUserType(userType);
    setOauthOpen(true);
  };

  const handleOAuthSuccess = async (credentialResponse) => {
    try {
      setOauthError('');

      const credential = credentialResponse?.credential;
      if (!credential) {
        setOauthError('Google login failed: missing credential.');
        return;
      }

      const resp = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        credential,
        userType: oauthUserType,
      });

      setSession({ token: resp.data.token, user: resp.data.user });
      setOauthOpen(false);

      if (resp.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setOauthError(
        err.response?.data?.error ||
          err.response?.data?.details ||
          'Google login failed. Please try again.'
      );
    }
  };

  return (
    <div className="home-container">
      {oauthOpen && (
        <div className="oauth-modal-overlay" role="dialog" aria-modal="true">
          <div className="oauth-modal">
            <div className="oauth-modal-header">
              <h3 className="oauth-modal-title">Continue with Google</h3>
              <button
                className="oauth-modal-close"
                onClick={() => setOauthOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="oauth-modal-subtitle">
              Signing in as <strong>{oauthUserType}</strong>
            </p>

            {oauthError && <div className="oauth-error">{oauthError}</div>}

            <div className="oauth-google-btn">
              <GoogleLogin onSuccess={handleOAuthSuccess} onError={() => setOauthError('Google login failed.')} />
            </div>

            <p className="oauth-hint">
              If you don’t see the button, set <code>VITE_GOOGLE_CLIENT_ID</code> in your frontend env.
            </p>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <header className="home-header">
        <div className="header-glass">
          <div className="logo-section-home">
            <Shield className="logo-icon-home" size={40} />
            <div>
              <h1 className="brand-title">Alumni Verification Portal</h1>
              <p className="brand-subtitle">Blockchain-Based Credential Management</p>
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
            A revolutionary system that ensures tamper-proof, instant verification of educational credentials
            using blockchain technology. Join thousands of verified alumni worldwide.
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
      </section>

      {/* Login Cards Section */}
      <section className="login-section">
        <div className="section-header-home">
          <h3 className="section-title-home">Choose Your Portal</h3>
          <p className="section-subtitle-home">Select your role to access the platform</p>
        </div>

        <div className="login-cards-grid">
          {/* Admin Card */}
          <div 
            className={`login-card admin-card ${hoveredCard === 'admin' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard('admin')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-glow admin-glow"></div>
            <div className="card-content">
              <div className="card-icon-wrapper admin-icon">
                <Shield size={48} />
              </div>
              <h4 className="card-title">Admin Portal</h4>
              <p className="card-description">
                Add and manage alumni records. Upload verified credentials to the blockchain.
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
                onClick={() => handleGmailLogin('admin')}
              >
                <Mail size={20} />
                <span>Login with Gmail</span>
                <ArrowRight size={20} className="arrow-icon" />
              </button>

              <button 
                className="direct-login-btn"
                onClick={() => handleGmailLogin('admin')}
              >
                Login to continue
              </button>
            </div>
          </div>

          {/* Student Card */}
          <div 
            className={`login-card student-card ${hoveredCard === 'student' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard('student')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-glow student-glow"></div>
            <div className="card-content">
              <div className="card-icon-wrapper student-icon">
                <GraduationCap size={48} />
              </div>
              <h4 className="card-title">Student Portal</h4>
              <p className="card-description">
                View your verified credentials. Download certificates and share verification links.
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
                onClick={() => handleGmailLogin('student')}
              >
                <Mail size={20} />
                <span>Login with Gmail</span>
                <ArrowRight size={20} className="arrow-icon" />
              </button>

              <button 
                className="direct-login-btn"
                onClick={() => handleGmailLogin('student')}
              >
                Login to continue
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
        <p>© 2025 Alumni Verification Portal. Powered by Blockchain Technology.</p>
      </footer>
    </div>
  );
};

export default HomePage;
