import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ materials: 0, tests: 0, doubts: 0, bookmarks: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [materials, tests, doubts, bookmarks, events] = await Promise.all([
          api.getMaterials(profile?.course, profile?.semester),
          api.getTests(profile?.course, profile?.semester, true),
          api.getDoubts(),
          api.getBookmarks(),
          api.getEvents(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = (events || [])
          .filter((ev) => ev.event_date >= today)
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 5);

        setStats({
          materials: (materials || []).length,
          tests: (tests || []).length,
          doubts: (doubts || []).length,
          bookmarks: (bookmarks?.bookmarks || []).length,
        });
        setUpcoming(upcomingEvents);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (profile) fetchAll();
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <p className="text-muted-custom mb-4">
        Welcome, <strong className="text-primary-custom">{profile?.full_name}</strong>! Here's your academic overview.
      </p>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-blue"><i className="bi bi-folder2-open"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.materials}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>Materials</div></div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-gold"><i className="bi bi-clipboard-check"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.tests}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>Tests</div></div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-red"><i className="bi bi-question-circle"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.doubts}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>My Doubts</div></div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-green"><i className="bi bi-bookmark"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.bookmarks}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>Saved</div></div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="scim-card">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-lightning me-2"></i>Quick Access</h5>
              <div className="d-grid gap-2">
                <Link to="/student/materials" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-folder2-open me-2"></i> Browse Study Materials
                </Link>
                <Link to="/student/tests" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-clipboard-check me-2"></i> Take a Test
                </Link>
                <Link to="/student/doubts" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-question-circle me-2"></i> Ask a Doubt
                </Link>
                <Link to="/student/calendar" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-calendar3 me-2"></i> View Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="scim-card">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-calendar-event me-2"></i>Upcoming Events</h5>
              {upcoming.length === 0 ? (
                <p className="text-muted-custom">No upcoming events.</p>
              ) : (
                upcoming.map((ev) => (
                  <div key={ev.id} className="d-flex align-items-center justify-content-between py-2 border-bottom border-custom">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.event_type}</div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
