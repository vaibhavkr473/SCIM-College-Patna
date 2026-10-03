import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';

export default function LandingPage() {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);

  const heroBgUrl = 'https://images.pexels.com/photos/20200756/pexels-photo-20200756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

  useEffect(() => {
    api
      .getNotices(true)
      .then((data) => {
        if (data) setNotices(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.submitFeedback({
        name: feedback.name,
        email: feedback.email,
        message: feedback.message,
      });

      setSubmitted(true);
      setFeedback({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero-section">
        <img className="hero-bg-image" src={heroBgUrl} alt="College campus" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="container">
            <div className="col-lg-9">
              <span className="hero-badge">
                <i className="bi bi-mortarboard-fill"></i> BBA &amp; BCA Programs
              </span>
              <h1 className="hero-title">SCIM College, Patna</h1>
              <p className="hero-subtitle">
                The official academic portal for BBA and BCA students. Access study materials,
                take proctored online tests, resolve doubts with AI and professors, and stay updated
                with college notices — all in one place.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/login" className="btn btn-gold btn-lg">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Student / Admin Login
                </Link>
                <a
                  href="https://www.scimpatna.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-lg"
                >
                  <i className="bi bi-globe me-1"></i> Visit Main Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title title-underline">About SCIM College</h2>
            <p className="section-subtitle">Excellence in BBA &amp; BCA education in Patna, Bihar</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="scim-card h-100">
                <div className="card-body p-4">
                  <div className="stat-icon bg-blue mb-3">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <h5 className="fw-bold mb-2">BBA Program</h5>
                  <p className="text-secondary-custom" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Bachelor of Business Administration — a comprehensive management program
                    preparing students for leadership roles in business and entrepreneurship.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="scim-card h-100">
                <div className="card-body p-4">
                  <div className="stat-icon bg-gold mb-3">
                    <i className="bi bi-laptop"></i>
                  </div>
                  <h5 className="fw-bold mb-2">BCA Program</h5>
                  <p className="text-secondary-custom" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Bachelor of Computer Applications — a rigorous computing program equipping
                    students with software development, programming, and IT skills.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="scim-card h-100">
                <div className="card-body p-4">
                  <div className="stat-icon bg-green mb-3">
                    <i className="bi bi-people"></i>
                  </div>
                  <h5 className="fw-bold mb-2">Student Portal</h5>
                  <p className="text-secondary-custom" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    A unified digital platform for study materials, online tests, doubt resolution,
                    academic calendar, and real-time college notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Links */}
      <section className="section-padding bg-tertiary-custom">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title title-underline">Official Links</h2>
            <p className="section-subtitle">Connect with SCIM College across our platforms</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4 col-sm-6">
              <a href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer" className="official-link-card">
                <div className="official-link-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
                  <i className="bi bi-globe"></i>
                </div>
                <h6>Main Website</h6>
                <p className="text-muted-custom" style={{ fontSize: '0.82rem' }}>scimpatna.org</p>
              </a>
            </div>
            <div className="col-md-4 col-sm-6">
              <a href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer" className="official-link-card">
                <div className="official-link-icon" style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }}>
                  <i className="bi bi-youtube"></i>
                </div>
                <h6>YouTube Channel</h6>
                <p className="text-muted-custom" style={{ fontSize: '0.82rem' }}>@SCIMPATNA_25</p>
              </a>
            </div>
            <div className="col-md-4 col-sm-6">
              <a href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer" className="official-link-card">
                <div className="official-link-icon" style={{ background: 'rgba(214, 41, 118, 0.12)', color: '#d62976' }}>
                  <i className="bi bi-instagram"></i>
                </div>
                <h6>Instagram</h6>
                <p className="text-muted-custom" style={{ fontSize: '0.82rem' }}>@scimpatna</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Notices Preview */}
      {notices.length > 0 && (
        <section className="section-padding-sm">
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title title-underline">Latest Notices</h2>
            </div>
            <div className="row g-3">
              {notices.map((n) => (
                <div className="col-md-6 col-lg-4" key={n.id}>
                  <div className="scim-card h-100">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-navy text-white" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-megaphone"></i>
                        </span>
                        <small className="text-muted-custom">{new Date(n.created_at).toLocaleDateString()}</small>
                      </div>
                      <h6 className="mb-1">{n.title}</h6>
                      {n.content && <p className="text-secondary-custom mb-0" style={{ fontSize: '0.82rem' }}>{n.content}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feedback Form */}
      <section className="section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="text-center mb-4">
                <h2 className="section-title title-underline">Contact &amp; Feedback</h2>
                <p className="section-subtitle">
                  Have a question or want to connect? Send us a message and we'll get back to you.
                </p>
              </div>
              <div className="scim-card">
                <div className="card-body p-4">
                  {submitted ? (
                    <div className="text-center py-4 fade-in">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                      <h5 className="mt-3">Message Sent!</h5>
                      <p className="text-muted-custom">
                        Thank you for reaching out. We'll respond to your email shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="scim-form-label">Your Name</label>
                          <input
                            type="text"
                            className="scim-form-control"
                            required
                            value={feedback.name}
                            onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="scim-form-label">Email Address</label>
                          <input
                            type="email"
                            className="scim-form-control"
                            required
                            value={feedback.email}
                            onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="col-12">
                          <label className="scim-form-label">Message</label>
                          <textarea
                            className="scim-form-control"
                            required
                            rows={5}
                            value={feedback.message}
                            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                            placeholder="Write your message, question, or feedback here..."
                          />
                        </div>
                        {error && (
                          <div className="col-12">
                            <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
                              <i className="bi bi-exclamation-triangle me-1"></i> {error}
                            </div>
                          </div>
                        )}
                        <div className="col-12">
                          <button type="submit" className="btn btn-gold" disabled={submitting}>
                            {submitting ? (
                              <><span className="spinner-border spinner-border-sm me-1"></span> Sending...</>
                            ) : (
                              <><i className="bi bi-send me-1"></i> Send Message</>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
