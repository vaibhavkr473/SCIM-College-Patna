import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import PublicAssistants from '@/components/shared/PublicAssistants.jsx';
import './LandingPage.css';

const collegeAddress = 'Sampurna College of IT and Management, Sahdev Market, near Bishop Scott Girls School Road, Jaganpura, Patna, Bihar 800016';
const collegeMapQuery = encodeURIComponent(collegeAddress);
const collegeMapUrl = `https://www.google.com/maps/search/?api=1&query=${collegeMapQuery}`;
const collegeMapEmbedUrl = `https://maps.google.com/maps?q=${collegeMapQuery}&output=embed`;
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xrpbnwvb';

const portalFeatures = [
  {
    icon: 'bi bi-journal-richtext',
    title: 'Study Materials',
    description: 'Organized notes and resources by course and semester.',
  },
  {
    icon: 'bi bi-check2-square',
    title: 'Online Tests',
    description: 'MCQ and short-answer assessment workflows.',
  },
  {
    icon: 'bi bi-chat-square-text',
    title: 'Academic Support',
    description: 'Get help with questions from AI and professors.',
  },
  {
    icon: 'bi bi-calendar3',
    title: 'Academic Calendar',
    description: 'Keep track of classes, exams, and college holidays.',
  },
];

const platformHighlights = [
  {
    icon: 'bi bi-shield-lock',
    title: 'Role-based access',
    description: 'Dedicated student, administrator, and co-member experiences.',
  },
  {
    icon: 'bi bi-bell',
    title: 'Updates in one place',
    description: 'Stay on top of important notices and academic updates.',
  },
];

const collegeBenefits = [
  {
    icon: 'bi bi-laptop',
    title: 'A laptop for new admissions',
    description: 'The admissions flyer offers a free laptop when you book your seat. Contact the college to confirm eligibility and terms.',
  },
  {
    icon: 'bi bi-award',
    title: 'Scholarships up to ₹10,000',
    description: 'Scholarship support is advertised in the flyer; availability and eligibility are subject to college terms.',
  },
  {
    icon: 'bi bi-briefcase',
    title: 'Career and placement support',
    description: 'The flyer advertises a 100% written placement guarantee and internship opportunities with MNCs. Ask the college for applicable terms.',
  },
  {
    icon: 'bi bi-chat-square-heart',
    title: 'Build communication skills',
    description: 'Personality development, spoken English, and competition classes support students beyond the classroom.',
  },
  {
    icon: 'bi bi-cpu',
    title: 'Learn emerging technologies',
    description: 'Take part in IoT, AI, and machine-learning seminars, industry expert interactions, and robotics lab certification courses.',
  },
  {
    icon: 'bi bi-wifi',
    title: 'Digital-first campus',
    description: 'The flyer lists 24/7 digital library access, free campus Wi-Fi, digital classrooms, and CCTV surveillance.',
  },
];

const collegeFacilities = [
  'Qualified, experienced faculty and spacious lecture theatres',
  'Library with online and offline books, journals, and magazines',
  'Advanced computer labs and an English language lab',
  'Separate boys’ and girls’ hostels available near the college campus',
  'BBA study areas include business, finance, marketing, and human resources',
  'BCA study areas prepare students for software, web development, data analysis, and other IT roles',
];

export default function LandingPage() {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [submissionWarning, setSubmissionWarning] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api
      .getNotices(true)
      .then((data) => {
        if (data) setNotices(data.slice(0, 5));
      })
      .catch(() => { });
  }, []);

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmissionWarning(null);
    setSubmitting(true);

    try {
      const [emailResult, archiveResult] = await Promise.allSettled([
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...feedback,
            _subject: `SCIM College website message from ${feedback.name}`,
          }),
        }).then(async (response) => {
          const result = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(
              result?.errors?.[0]?.message
              || result?.error
              || 'Formspree could not send your message.'
            );
          }
        }),
        api.submitFeedback(feedback),
      ]);

      if (emailResult.status === 'rejected') {
        throw new Error(
          `We could not email your message: ${emailResult.reason?.message || 'Please try again or email us directly.'}`
        );
      }

      setSubmitted(true);
      setFeedback({ name: '', email: '', message: '' });
      if (archiveResult.status === 'rejected') {
        setSubmissionWarning('Your email was sent, but we could not save a copy in the portal inbox.');
      }
      setTimeout(() => setSubmitted(false), 5000);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="landing-page fade-in">
        <section className="landing-hero">
          <div className="landing-hero-orbit landing-hero-orbit-one" aria-hidden="true" />
          <div className="landing-hero-orbit landing-hero-orbit-two" aria-hidden="true" />
          <div className="container landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">
                <span className="landing-eyebrow-dot" />
                Official academic portal
              </span>
              <div className="landing-credentials" aria-label="College affiliations and approval">
                <span><i className="bi bi-mortarboard-fill" aria-hidden="true" /> Affiliated with Patliputra University, Patna</span>
                <span><i className="bi bi-patch-check-fill" aria-hidden="true" /> Approved by AICTE</span>
              </div>
              <h1>
                Study BBA &amp; BCA at
                <span>SCIM College, Patna.</span>
              </h1>
              <p className="landing-hero-description">
                Explore BBA and BCA programs at SCIM College, Patna, and access a secure academic portal
                for study materials, online tests, academic support, and college updates.
              </p>
              <div className="landing-admissions-callout">
                <span className="landing-admissions-icon"><i className="bi bi-megaphone-fill" aria-hidden="true" /></span>
                <span>
                  <strong>Welcome to SCIM College, Patna</strong>
                  <small>Admissions open for 2026 · BBA and BCA</small>
                </span>
                <a href="#admissions">Explore opportunities <i className="bi bi-arrow-down" aria-hidden="true" /></a>
              </div>
              <div className="landing-hero-actions">
                <Link to="/login" className="btn btn-gold landing-primary-action">
                  Enter Student Portal <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
                <a href="#academics" className="btn landing-secondary-action">
                  Explore academics
                </a>
              </div>
              <div className="landing-hero-note">
                <i className="bi bi-mortarboard-fill" aria-hidden="true" />
                <span>Built for BBA &amp; BCA students</span>
              </div>
            </div>

            <aside className="landing-hero-panel" aria-label="Portal overview">
              <div className="landing-panel-topline">
                <span className="landing-program-pill">BBA <span>•</span> BCA</span>
                <i className="bi bi-stars" aria-hidden="true" />
              </div>
              <p className="landing-panel-kicker">Your academic journey, together</p>
              <h2>One portal for everything that moves you forward.</h2>
              <ul className="landing-panel-list">
                <li>
                  <span className="landing-list-icon"><i className="bi bi-journals" /></span>
                  <span><strong>Study Hub</strong><small>Resources, organized by course</small></span>
                </li>
                <li>
                  <span className="landing-list-icon"><i className="bi bi-stopwatch" /></span>
                  <span><strong>Online Assessment</strong><small>Tests built around your learning</small></span>
                </li>
                <li>
                  <span className="landing-list-icon"><i className="bi bi-chat-dots" /></span>
                  <span><strong>Academic Support</strong><small>Help when you need it</small></span>
                </li>
              </ul>
              <div className="landing-panel-footer">
                <span className="landing-live-dot" />
                Made for your next step
              </div>
            </aside>
          </div>
          <div className="landing-hero-bottom-line" aria-hidden="true" />
        </section>

        <section className="landing-platform-section">
          <div className="container">
            <div className="landing-platform-layout">
              <div className="landing-section-intro">
                <span className="landing-section-label">Institutional platform</span>
                <h2>Designed around how students learn.</h2>
                <p>
                  Institutional communication, structured resources, assessment workflows, and
                  academic support are brought together while access remains role-controlled.
                </p>
              </div>
              <div className="landing-highlight-grid">
                {platformHighlights.map((highlight) => (
                  <article className="landing-highlight-card" key={highlight.title}>
                    <span className="landing-icon-tile"><i className={highlight.icon} aria-hidden="true" /></span>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-academics-section" id="academics">
          <div className="container">
            <div className="landing-section-heading">
              <div>
                <span className="landing-section-label">Academic experience</span>
                <h2>Everything students need in one place.</h2>
              </div>
              <p>Simple tools to support every part of your academic day.</p>
            </div>
            <div className="landing-feature-grid">
              {portalFeatures.map((feature, index) => (
                <article className="landing-feature-card" key={feature.title}>
                  <span className="landing-icon-tile"><i className={feature.icon} aria-hidden="true" /></span>
                  <span className="landing-feature-number">0{index + 1}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="landing-card-arrow" aria-hidden="true">
                    <i className="bi bi-arrow-up-right" />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-admissions-section" id="admissions">
          <div className="container">
            <div className="landing-section-heading">
              <div>
                <span className="landing-section-label">Admissions open · 2026</span>
                <h2>Start building your future at SCIM.</h2>
              </div>
              <p>Career-focused BBA and BCA learning, student development, and campus facilities.</p>
            </div>

            <div className="landing-benefit-grid">
              {collegeBenefits.map((benefit) => (
                <article className="landing-benefit-card" key={benefit.title}>
                  <span className="landing-icon-tile"><i className={`bi ${benefit.icon}`} aria-hidden="true" /></span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>

            <div className="landing-facilities-card">
              <div className="landing-facilities-heading">
                <span className="landing-icon-tile"><i className="bi bi-buildings" aria-hidden="true" /></span>
                <div>
                  <span className="landing-section-label">Learning environment</span>
                  <h3>Facilities and opportunities</h3>
                </div>
              </div>
              <ul className="landing-facilities-list">
                {collegeFacilities.map((facility) => (
                  <li key={facility}>
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
              <p className="landing-admissions-note">
                Laptop, scholarship, and placement offers are as stated in the supplied admissions flyer.
                Please confirm eligibility and written terms directly with the college.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-programs-section">
          <div className="container">
            <div className="landing-programs-heading">
              <span className="landing-section-label">Your next chapter</span>
              <h2>Find your path at SCIM.</h2>
              <p>Focused programs, practical learning, and a community that helps you grow.</p>
            </div>
            <div className="landing-program-grid">
              <article className="landing-program-card">
                <span className="landing-program-index">01 / MANAGEMENT</span>
                <span className="landing-program-icon"><i className="bi bi-briefcase" aria-hidden="true" /></span>
                <h3>Business Administration</h3>
                <p>
                  Build a strong foundation in management, leadership, and entrepreneurship with
                  the Bachelor of Business Administration.
                </p>
                <span className="landing-program-abbr">BBA</span>
              </article>
              <article className="landing-program-card landing-program-card-accent">
                <span className="landing-program-index">02 / TECHNOLOGY</span>
                <span className="landing-program-icon"><i className="bi bi-laptop" aria-hidden="true" /></span>
                <h3>Computer Applications</h3>
                <p>
                  Develop practical computing and software skills through the Bachelor of Computer
                  Applications.
                </p>
                <span className="landing-program-abbr">BCA</span>
              </article>
            </div>
          </div>
        </section>

        {notices.length > 0 && (
          <section className="landing-notices-section">
            <div className="container">
              <div className="landing-section-heading">
                <div>
                  <span className="landing-section-label">Stay in the know</span>
                  <h2>Latest notices.</h2>
                </div>
                <span className="landing-notices-mark"><i className="bi bi-megaphone" aria-hidden="true" /> From SCIM College</span>
              </div>
              <div className="landing-notice-grid">
                {notices.map((notice) => (
                  <article className="landing-notice-card" key={notice.id}>
                    <div className="landing-notice-meta">
                      <i className="bi bi-megaphone-fill" aria-hidden="true" />
                      <time dateTime={notice.created_at}>
                        {new Date(notice.created_at).toLocaleDateString()}
                      </time>
                    </div>
                    <h3>{notice.title}</h3>
                    {notice.content && <p>{notice.content}</p>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="landing-location-section" id="location">
          <div className="container">
            <div className="landing-location-heading">
              <div>
                <span className="landing-section-label">Find us</span>
                <h2>Visit SCIM College.</h2>
                <p>Plan your route to Sampurna College of IT and Management in Jaganpura, Patna.</p>
              </div>
              <a
                className="landing-location-directions"
                href={collegeMapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-sign-turn-right" aria-hidden="true" />
                Get directions
                <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </a>
            </div>
            <div className="landing-location-card">
              <div className="landing-location-details">
                <span className="landing-location-icon"><i className="bi bi-geo-alt-fill" aria-hidden="true" /></span>
                <span className="landing-location-label">College address</span>
                <h3>Sampurna College of IT and Management</h3>
                <p>{collegeAddress.replace('Sampurna College of IT and Management, ', '')}</p>
                <a href={collegeMapUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </a>
              </div>
              <div className="landing-location-map">
                <iframe
                  src={collegeMapEmbedUrl}
                  title="Map showing Sampurna College of IT and Management in Jaganpura, Patna"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-connect-section">
          <div className="container">
            <div className="landing-connect-layout">
              <div className="landing-connect-copy">
                <span className="landing-section-label">Let’s connect</span>
                <h2>We’re here to help you move forward.</h2>
                <p>
                  Have a question or feedback? Send us a message and the SCIM team will get back
                  to you.
                </p>
                <a className="landing-email-link" href="mailto:vaibhavkr387@gmail.com">
                  <i className="bi bi-envelope" aria-hidden="true" />
                  vaibhavkr387@gmail.com
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </a>
                <div className="landing-official-links">
                  <span>Find us online</span>
                  <a href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer" aria-label="SCIM College website">
                    <i className="bi bi-globe2" />
                  </a>
                  <a href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer" aria-label="SCIM College YouTube">
                    <i className="bi bi-youtube" />
                  </a>
                  <a href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer" aria-label="SCIM College Instagram">
                    <i className="bi bi-instagram" />
                  </a>
                </div>
              </div>
              <div className="landing-feedback-card">
                {submitted ? (
                  <div className="landing-feedback-success" role="status">
                    <span className="landing-success-icon"><i className="bi bi-check2" /></span>
                    <h3>Message received.</h3>
                    <p>Your message was emailed to the SCIM team. Thank you for reaching out.</p>
                    {submissionWarning && (
                      <p className="landing-feedback-warning" role="status">{submissionWarning}</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="landing-form-heading">
                      <h3>Send us a message</h3>
                      <p>We’d love to hear from you.</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="scim-form-label" htmlFor="landing-name">Your name</label>
                        <input
                          id="landing-name"
                          type="text"
                          className="scim-form-control"
                          required
                          value={feedback.name}
                          onChange={(event) => setFeedback({ ...feedback, name: event.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="scim-form-label" htmlFor="landing-email">Email address</label>
                        <input
                          id="landing-email"
                          type="email"
                          className="scim-form-control"
                          required
                          value={feedback.email}
                          onChange={(event) => setFeedback({ ...feedback, email: event.target.value })}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="col-12">
                        <label className="scim-form-label" htmlFor="landing-message">Message</label>
                        <textarea
                          id="landing-message"
                          className="scim-form-control"
                          required
                          rows={4}
                          value={feedback.message}
                          onChange={(event) => setFeedback({ ...feedback, message: event.target.value })}
                          placeholder="How can we help?"
                        />
                      </div>
                      {error && (
                        <div className="col-12">
                          <div className="alert alert-danger mb-0" role="alert" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-exclamation-triangle me-1" /> {error}
                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <button type="submit" className="btn btn-gold landing-submit-button" disabled={submitting}>
                          {submitting ? (
                            <><span className="spinner-border spinner-border-sm me-2" /> Sending...</>
                          ) : (
                            <>Send message <i className="bi bi-arrow-up-right ms-1" aria-hidden="true" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
            <div className="landing-links-strip">
              <span>Official links</span>
              <a href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer">
                Website <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer">
                YouTube <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer">
                Instagram <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
      <PublicAssistants />
    </>
  );
}
