import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function AdminStudents() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', course: 'BBA', semester: '1', phone: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);

  const canManage = profile?.role === 'admin';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      if (data) setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      const result = await api.createStudent({
        full_name: form.full_name,
        email: form.email,
        course: form.course,
        semester: form.semester,
        phone: form.phone || null,
        password: form.password,
      });

      if (!result?.success) throw new Error(result?.message || 'Failed to create student');

      setSuccess('Student account created successfully!');
      setForm({ full_name: '', email: '', course: 'BBA', semester: '1', phone: '', password: '' });
      setShowForm(false);
      fetchStudents();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  const viewTrackRecord = async (student) => {
    setSelectedStudent(student);
    try {
      const data = await api.getStudentSubmissions(student.id);
      if (data) setSubmissions(data);
    } catch (err) {
      setSubmissions([]);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-people me-2"></i>Student Management</h5>
        {canManage && (
          <button className="btn btn-navy" onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}>
            <i className="bi bi-person-plus me-1"></i> Add Student
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
              <h6 className="fw-bold mb-0"><i className="bi bi-person-plus me-2"></i>Create New Student Account</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="scim-form-label">Full Name</label>
                  <input className="scim-form-control" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="scim-form-label">Email</label>
                  <input type="email" className="scim-form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Course</label>
                  <select className="form-select scim-form-control" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Semester</label>
                  <select className="form-select scim-form-control" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Phone</label>
                  <input className="scim-form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
                </div>
                <div className="col-md-6">
                  <label className="scim-form-label">Password</label>
                  <input type="password" className="scim-form-control" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                </div>
                {error && <div className="col-12"><div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div></div>}
                <div className="col-12">
                  <button type="submit" className="btn btn-navy" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Student'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedStudent(null)}>
          <div className="scim-card" style={{ maxWidth: 700, width: '100%', maxHeight: '85vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-clipboard-data me-2"></i>Track Record — {selectedStudent.full_name}</h6>
                <button className="btn btn-sm btn-link p-0" onClick={() => setSelectedStudent(null)}><i className="bi bi-x-lg"></i></button>
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge-role-student">{selectedStudent.email}</span>
                <span className={`badge-course-${selectedStudent.course?.toLowerCase()}`}>{selectedStudent.course}</span>
                <span className="badge-role-comember">Sem {selectedStudent.semester}</span>
              </div>
              {submissions.length === 0 ? (
                <EmptyState icon="bi-clipboard" title="No test history" message="This student hasn't taken any tests yet." />
              ) : (
                <div className="table-responsive">
                  <table className="scim-table">
                    <thead><tr><th>Test</th><th>Score</th><th>Violations</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {submissions.map((s, i) => (
                        <tr key={i}>
                          <td>{s.tests?.title || 'Unknown'}</td>
                          <td>{s.score ?? '—'} / {s.total_marks ?? '—'}</td>
                          <td>{s.violation_flags > 0 ? <span className="text-danger fw-bold">{s.violation_flags}</span> : '0'}</td>
                          <td><span className={`badge-role-${s.status === 'submitted' ? 'student' : 'admin'}`}>{s.status}</span></td>
                          <td>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <EmptyState icon="bi-people" title="No students yet" message="Create student accounts to see them here." />
      ) : (
        <div className="scim-card">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="scim-table">
              <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Sem</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td><span className={`badge-course-${s.course?.toLowerCase()}`}>{s.course}</span></td>
                    <td>{s.semester}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => viewTrackRecord(s)}>
                        <i className="bi bi-clipboard-data me-1"></i> Track Record
                      </button>
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
