import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function AdminNotices() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const canManage = profile?.role === 'admin' || (profile?.permissions?.includes('manage_notices') ?? false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.getNotices();
      if (data) setNotices(data);
    } catch (err) {
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      await api.createNotice({
        title: form.title,
        content: form.content || null,
      });

      setForm({ title: '', content: '' });
      setShowForm(false);
      fetchNotices();
    } catch (err) {
      setError(err.message || 'Failed to create notice');
    } finally {
      setCreating(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setError(null);
    setSendingNotification(true);
    try {
      const result = await api.sendNotification(notificationForm);
      setNotificationForm({ title: '', message: '' });
      setShowNotificationForm(false);
      setSuccess(`Notification sent to ${result.recipient_count} active users.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const toggleActive = async (n) => {
    try {
      await api.updateNotice(n.id, { is_active: !n.is_active });
      fetchNotices();
    } catch (err) {
      setError(err.message || 'Failed to update notice');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      fetchNotices();
    } catch (err) {
      setError(err.message || 'Failed to delete notice');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-megaphone me-2"></i>Notice Manager</h5>
        {canManage && (
          <div className="d-flex gap-2">
            {profile?.role === 'admin' && (
              <button className="btn btn-outline-primary" onClick={() => { setShowNotificationForm(!showNotificationForm); setError(null); }}>
                <i className="bi bi-bell me-1"></i> Send Notification
              </button>
            )}
            <button className="btn btn-navy" onClick={() => setShowForm(!showForm)}>
              <i className="bi bi-plus-circle me-1"></i> Post Notice
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>
          <i className="bi bi-check-circle me-1"></i> {success}
        </div>
      )}
      {error && !showForm && !showNotificationForm && (
        <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div>
      )}

      {showNotificationForm && profile?.role === 'admin' && (
        <div className="scim-card mb-3 fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-bell me-2"></i>Send Notification to Users</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowNotificationForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSendNotification}>
              <div className="mb-3">
                <label className="scim-form-label">Title</label>
                <input className="scim-form-control" required maxLength={160} value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="scim-form-label">Message</label>
                <textarea className="scim-form-control" rows={4} required maxLength={5000} value={notificationForm.message} onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })} />
              </div>
              {error && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div>}
              <button type="submit" className="btn btn-navy" disabled={sendingNotification}>
                {sendingNotification ? 'Sending...' : 'Send to All Active Users'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showForm && canManage && (
        <div className="scim-card mb-3 fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-megaphone me-2"></i>Create Notice</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="scim-form-label">Title</label>
                <input className="scim-form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="scim-form-label">Content (optional)</label>
                <textarea className="scim-form-control" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              {error && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div>}
              <button type="submit" className="btn btn-navy" disabled={creating}>
                {creating ? 'Posting...' : 'Post Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {notices.length === 0 ? (
        <EmptyState icon="bi-megaphone" title="No notices yet" message="Post notices to keep students informed." />
      ) : (
        <div className="scim-card">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="scim-table">
              <thead><tr><th>Title</th><th>Active</th><th>Posted</th><th>Actions</th></tr></thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>{n.title}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${n.is_active ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => canManage && toggleActive(n)}
                        disabled={!canManage}
                        style={{ fontSize: '0.76rem' }}
                      >
                        {n.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td>{new Date(n.created_at).toLocaleDateString()}</td>
                    <td>
                      {canManage && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(n.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
