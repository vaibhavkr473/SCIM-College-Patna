import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedback();
      setFeedback(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await api.updateFeedback(id, { is_read: true });
      fetchFeedback();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.deleteFeedback(id);
      fetchFeedback();
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <h5 className="fw-bold mb-3"><i className="bi bi-chat-dots me-2"></i>Feedback Inbox</h5>

      {feedback.length === 0 ? (
        <EmptyState icon="bi-chat-dots" title="No feedback yet" message="Messages from the contact form will appear here." />
      ) : (
        <div className="d-flex flex-column gap-2">
          {feedback.map((f) => (
            <div className="scim-card" key={f.id}>
              <div
                className="card-body p-3"
                onClick={() => {
                  setExpandedId(expandedId === f.id ? null : f.id);
                  if (!f.is_read) markAsRead(f.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {!f.is_read && <span className="badge-role-admin" style={{ fontSize: '0.65rem' }}>New</span>}
                      <strong style={{ fontSize: '0.9rem' }}>{f.name}</strong>
                    </div>
                    <p className="text-muted-custom mb-0" style={{ fontSize: '0.78rem' }}>
                      {f.email} • {new Date(f.created_at).toLocaleDateString()}
                    </p>
                    {expandedId === f.id && (
                      <p className="mt-2 mb-0" style={{ fontSize: '0.88rem' }}>{f.message}</p>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <i className={`bi ${expandedId === f.id ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '0.9rem' }}></i>
                  </div>
                </div>
              </div>
              {expandedId === f.id && (
                <div className="border-top border-custom p-2 d-flex justify-content-end">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(f.id)}>
                    <i className="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
