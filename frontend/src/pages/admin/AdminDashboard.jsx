import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ students: 0, tests: 0, materials: 0, doubts: 0, feedback: 0 });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getStats();
        setStats({
          students: data.students || 0,
          tests: data.tests || 0,
          materials: data.materials || 0,
          doubts: data.doubts || 0,
          feedback: data.feedback || 0,
        });
        if (data.recentFeedback) setRecentFeedback(data.recentFeedback);
      } catch (err) {
        // keep defaults on error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <p className="text-muted-custom mb-4">
        Welcome back, <strong className="text-primary-custom">{profile?.full_name}</strong>. Here's an overview of the portal.
      </p>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-blue"><i className="bi bi-people"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.students}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>Students</div></div>
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
            <div className="stat-icon bg-green"><i className="bi bi-folder2-open"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.materials}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>Materials</div></div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-red"><i className="bi bi-question-circle"></i></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.doubts}</div><div className="text-muted-custom" style={{ fontSize: '0.82rem' }}>Unanswered Doubts</div></div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="scim-card">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-chat-dots me-2"></i>Recent Feedback</h5>
              {recentFeedback.length === 0 ? (
                <p className="text-muted-custom">No feedback received yet.</p>
              ) : (
                recentFeedback.map((f) => (
                  <div key={f.id} className="d-flex align-items-center justify-content-between py-2 border-bottom border-custom">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.email}</div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(f.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="scim-card">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-lightning me-2"></i>Quick Actions</h5>
              <div className="d-grid gap-2">
                <a href="/admin/students" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-person-plus me-2"></i> Add New Student
                </a>
                <a href="/admin/tests" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-clipboard-plus me-2"></i> Create New Test
                </a>
                <a href="/admin/materials" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-upload me-2"></i> Upload Study Material
                </a>
                <a href="/admin/notices" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-megaphone me-2"></i> Post a Notice
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
