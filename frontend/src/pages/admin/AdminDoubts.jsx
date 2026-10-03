import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function AdminDoubts() {
  const { profile } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const canManage = profile?.role === 'admin' || (profile?.permissions?.includes('manage_doubts') ?? false);

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const data = await api.getDoubts();
      setDoubts(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const fetchResponses = async (doubtId) => {
    try {
      const data = await api.getDoubtResponses(doubtId);
      setResponses({ ...responses, [doubtId]: data || [] });
    } catch {
      setResponses({ ...responses, [doubtId]: [] });
    }
  };

  const toggleExpand = (doubtId) => {
    if (expandedId === doubtId) {
      setExpandedId(null);
    } else {
      setExpandedId(doubtId);
      setReplyText('');
      if (!responses[doubtId]) fetchResponses(doubtId);
    }
  };

  const handleReply = async (e, doubtId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await api.replyDoubt(doubtId, replyText);

      setReplyText('');
      fetchResponses(doubtId);
      fetchDoubts();
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <h5 className="fw-bold mb-3"><i className="bi bi-question-circle me-2"></i>Doubt Board</h5>

      {doubts.length === 0 ? (
        <EmptyState icon="bi-question-circle" title="No doubts yet" message="Student questions will appear here." />
      ) : (
        <div className="d-flex flex-column gap-2">
          {doubts.map((d) => (
            <div className="scim-card" key={d.id}>
              <div className="card-body p-3" onClick={() => toggleExpand(d.id)} style={{ cursor: 'pointer' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge-role-${d.is_answered ? 'student' : 'admin'}`} style={{ fontSize: '0.7rem' }}>
                        {d.is_answered ? 'Answered' : 'Pending'}
                      </span>
                      <strong style={{ fontSize: '0.88rem' }}>{d.subject}</strong>
                    </div>
                    <p className="mb-1" style={{ fontSize: '0.88rem' }}>{d.question}</p>
                    <p className="text-muted-custom mb-0" style={{ fontSize: '0.76rem' }}>
                      {d.student_name} • {d.course} • Sem {d.semester} • {new Date(d.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <i className={`bi ${expandedId === d.id ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '0.9rem' }}></i>
                </div>
              </div>

              {expandedId === d.id && (
                <div className="border-top border-custom p-3 fade-in">
                  {(responses[d.id] || []).map((r) => (
                    <div key={r.id} className="mb-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge-role-comember" style={{ fontSize: '0.68rem' }}>{r.responder_name}</span>
                        <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.86rem' }}>{r.response_text}</p>
                    </div>
                  ))}

                  {canManage && (
                    <form onSubmit={(e) => handleReply(e, d.id)} className="mt-2">
                      <div className="d-flex gap-2">
                        <input
                          className="scim-form-control"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button type="submit" className="btn btn-navy btn-sm">
                          <i className="bi bi-send"></i>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
