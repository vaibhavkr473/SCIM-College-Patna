import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

const PERMISSION_OPTIONS = [
  { key: 'manage_materials', label: 'Manage Study Materials' },
  { key: 'manage_doubts', label: 'Respond to Doubts' },
  { key: 'manage_tests', label: 'Manage Tests' },
  { key: 'manage_calendar', label: 'Manage Calendar' },
  { key: 'manage_notices', label: 'Manage Notices' },
];

export default function AdminTeam() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', permissions: [] });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);

  const canManage = profile?.role === 'admin';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getMembers();
      if (data) setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      const result = await api.createMember({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        permissions: form.permissions,
      });

      if (!result?.success) throw new Error(result?.message || 'Failed to create team member');

      setSuccess('Team member created successfully!');
      setForm({ full_name: '', email: '', password: '', permissions: [] });
      setShowForm(false);
      fetchMembers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create team member');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-shield-check me-2"></i>Team Authorization Manager</h5>
        {canManage && (
          <button className="btn btn-navy" onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}>
            <i className="bi bi-person-plus me-1"></i> Add Co-Member
          </button>
        )}
      </div>

      {success && (
        <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>
          <i className="bi bi-check-circle me-1"></i> {success}
        </div>
      )}

      {showForm && canManage && (
        <div className="scim-card mb-3 fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-person-plus me-2"></i>Create Co-Member Account</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="scim-form-label">Full Name</label>
                  <input className="scim-form-control" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Email</label>
                  <input type="email" className="scim-form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Password</label>
                  <input type="password" className="scim-form-control" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="scim-form-label">Permissions</label>
                  <div className="d-flex flex-wrap gap-3 mt-1">
                    {PERMISSION_OPTIONS.map((p) => (
                      <div className="form-check" key={p.key}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={p.key}
                          checked={form.permissions.includes(p.key)}
                          onChange={() => togglePermission(p.key)}
                        />
                        <label className="form-check-label" htmlFor={p.key} style={{ fontSize: '0.88rem' }}>{p.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                {error && <div className="col-12"><div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div></div>}
                <div className="col-12">
                  <button type="submit" className="btn btn-navy" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Co-Member'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <EmptyState icon="bi-shield-check" title="No team members yet" />
      ) : (
        <div className="scim-card">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="scim-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Permissions</th><th>Joined</th></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.full_name}</td>
                    <td>{m.email}</td>
                    <td><span className={`badge-role-${m.role}`}>{m.role}</span></td>
                    <td>
                      {m.permissions && m.permissions.length > 0
                        ? m.permissions.map((p) => <span key={p} className="badge-role-comember me-1">{p.replace(/_/g, ' ')}</span>)
                        : '—'}
                    </td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
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
