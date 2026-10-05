import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function StudentTests() {
  const { profile } = useAuth();
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [testsData, subsData] = await Promise.all([
          api.getTests(profile?.course, profile?.semester, true),
          api.getSubmissions(),
        ]);
        setTests(testsData || []);
        setSubmissions(subsData || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (profile) fetchAll();
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  const getSubmission = (testId) => submissions.find((s) => s.test_id === testId);

  return (
    <div className="fade-in">
      <h5 className="fw-bold mb-3"><i className="bi bi-clipboard-check me-2"></i>Tests</h5>
      <p className="text-muted-custom mb-3" style={{ fontSize: '0.85rem' }}>
        Available tests for {profile?.course} • Semester {profile?.semester}
      </p>

      {tests.length === 0 ? (
        <EmptyState icon="bi-clipboard-check" title="No tests available" message="Tests will appear here when your faculty publishes them." />
      ) : (
        <div className="row g-3">
          {tests.map((t) => {
            const sub = getSubmission(t.id);
            return (
              <div className="col-md-6 col-lg-4" key={t.id}>
                <div className="scim-card h-100">
                  <div className="card-body p-3">
                    <h6 style={{ fontSize: '0.95rem' }}>{t.title}</h6>
                    {t.description && <p className="text-muted-custom" style={{ fontSize: '0.82rem' }}>{t.description}</p>}
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span className="badge-role-admin"><i className="bi bi-clock"></i> {t.duration_minutes}m</span>
                      <span className="badge-role-comember">{(t.questions || []).length} questions</span>
                    </div>
                    {sub ? (
                      <div>
                        <span className={`badge-role-${sub.status === 'submitted' ? 'student' : 'comember'}`}>
                          {sub.status === 'submitted' ? `Submitted — ${sub.score ?? '—'}/${sub.total_marks}` : sub.status}
                        </span>
                        {sub.violation_flags > 0 && (
                          <span className="badge-role-admin ms-1">{sub.violation_flags} violations</span>
                        )}
                      </div>
                    ) : (
                      <Link to={`/student/tests/${t.id}`} className="btn btn-navy btn-sm">
                        <i className="bi bi-pencil-square me-1"></i> Start Test
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
