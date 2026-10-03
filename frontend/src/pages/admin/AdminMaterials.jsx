import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

const iconForType = (type) => {
  const map = { pdf: 'bi-file-earmark-pdf', video: 'bi-play-circle', image: 'bi-image', link: 'bi-link-45deg', text: 'bi-file-text' };
  return map[type] || 'bi-file';
};

const getContentUrl = (m) => {
  if (m.type === 'text') return null;
  return m.url || m.file_path || '#';
};

export default function AdminMaterials() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'pdf', content: '', course: 'BBA', semester: '1' });
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const canManage = profile?.role === 'admin' || (profile?.permissions?.includes('manage_materials') ?? false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await api.getMaterials();
      setMaterials(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const materialData = {
        title: form.title,
        description: form.description || '',
        type: form.type,
        course: form.course,
        semester: parseInt(form.semester),
      };

      if (form.type === 'text') {
        materialData.text_content = form.content;
      } else {
        materialData.url = form.content;
      }

      await api.createMaterial(materialData);

      setForm({ title: '', description: '', type: 'pdf', content: '', course: 'BBA', semester: '1' });
      setShowForm(false);
      fetchMaterials();
    } catch (err) {
      setError(err.message || 'Failed to upload material');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this study material?')) return;
    try {
      await api.deleteMaterial(id);
      fetchMaterials();
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-folder2-open me-2"></i>Study Material Hub</h5>
        {canManage && (
          <button className="btn btn-navy" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-upload me-1"></i> Upload Material
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="scim-card mb-3 fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-upload me-2"></i>Upload New Material</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="scim-form-label">Title</label>
                  <input className="scim-form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Type</label>
                  <select className="form-select scim-form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="link">Google Drive Link</option>
                    <option value="text">Text Snippet</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="scim-form-label">
                    {form.type === 'link' ? 'Google Drive URL' : form.type === 'text' ? 'Text Content' : 'File URL'}
                  </label>
                  {form.type === 'text' ? (
                    <textarea className="scim-form-control" required rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                  ) : (
                    <input className="scim-form-control" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="https://..." />
                  )}
                </div>
                <div className="col-md-6">
                  <label className="scim-form-label">Description</label>
                  <input className="scim-form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="scim-form-label">Course</label>
                  <select className="form-select scim-form-control" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="scim-form-label">Semester</label>
                  <select className="form-select scim-form-control" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                {error && <div className="col-12"><div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div></div>}
                <div className="col-12">
                  <button type="submit" className="btn btn-navy" disabled={creating}>
                    {creating ? 'Uploading...' : 'Upload Material'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {materials.length === 0 ? (
        <EmptyState icon="bi-folder2-open" title="No materials uploaded yet" message="Upload study materials for your students." />
      ) : (
        <div className="row g-3">
          {materials.map((m) => {
            const url = getContentUrl(m);
            return (
              <div className="col-md-6 col-lg-4" key={m.id}>
                <div className="material-card">
                  <div className="d-flex align-items-start gap-3">
                    <div className={`material-type-icon material-type-${m.type}`}>
                      <i className={`bi ${iconForType(m.type)}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1" style={{ fontSize: '0.92rem' }}>{m.title}</h6>
                      <p className="text-muted-custom mb-0" style={{ fontSize: '0.78rem' }}>
                        {m.course} • Sem {m.semester}
                      </p>
                    </div>
                  </div>
                  {m.description && <p className="text-secondary-custom mt-2 mb-2" style={{ fontSize: '0.82rem' }}>{m.description}</p>}
                  <div className="d-flex gap-2 mt-2">
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-eye me-1"></i> View
                      </a>
                    ) : (
                      <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>Text content</span>
                    )}
                    {canManage && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
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
