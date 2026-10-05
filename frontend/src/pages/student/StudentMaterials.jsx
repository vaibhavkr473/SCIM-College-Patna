import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

const iconForType = (type) => {
  const map = { pdf: 'bi-file-earmark-pdf', video: 'bi-play-circle', image: 'bi-image', link: 'bi-link-45deg', text: 'bi-file-text' };
  return map[type] || 'bi-file';
};

export default function StudentMaterials() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchBookmarks();
  }, [profile]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await api.getMaterials(profile?.course, profile?.semester);
      setMaterials(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    try {
      const data = await api.getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch {
      // ignore
    }
  };

  const toggleBookmark = async (materialId) => {
    try {
      if (bookmarks.includes(materialId)) {
        await api.removeBookmark(materialId);
        setBookmarks(bookmarks.filter((id) => id !== materialId));
      } else {
        await api.addBookmark(materialId);
        setBookmarks([...bookmarks, materialId]);
      }
    } catch {
      // ignore
    }
  };

  const filtered = filterSubject
    ? materials.filter((m) => m.title.toLowerCase().includes(filterSubject.toLowerCase()) || (m.description || '').toLowerCase().includes(filterSubject.toLowerCase()))
    : materials;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-folder2-open me-2"></i>Study Materials</h5>
        <input
          className="scim-form-control"
          style={{ maxWidth: 250 }}
          placeholder="Search..."
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
      </div>

      <p className="text-muted-custom mb-3" style={{ fontSize: '0.85rem' }}>
        Showing materials for {profile?.course} • Semester {profile?.semester}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon="bi-folder2-open" title="No materials found" message="Materials for your course will appear here." />
      ) : (
        <div className="row g-3">
          {filtered.map((m) => (
            <div className="col-md-6 col-lg-4" key={m.id}>
              <div className="material-card">
                <div className="d-flex align-items-start gap-3">
                  <div className={`material-type-icon material-type-${m.type}`}>
                    <i className={`bi ${iconForType(m.type)}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1" style={{ fontSize: '0.92rem' }}>{m.title}</h6>
                    {m.description && <p className="text-muted-custom mb-0" style={{ fontSize: '0.78rem' }}>{m.description}</p>}
                  </div>
                  <button
                    className="btn btn-sm btn-link p-0"
                    onClick={() => toggleBookmark(m.id)}
                    title={bookmarks.includes(m.id) ? 'Remove bookmark' : 'Save'}
                  >
                    <i className={`bi ${bookmarks.includes(m.id) ? 'bi-bookmark-fill text-warning' : 'bi-bookmark'}`} style={{ fontSize: '1.1rem' }}></i>
                  </button>
                </div>
                <div className="d-flex gap-2 mt-2">
                  {m.type === 'text' ? (
                    <Link to={`/student/materials/${m.id}`} className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-eye me-1"></i> Read
                    </Link>
                  ) : (
                    <Link to={`/student/materials/${m.id}`} className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-eye me-1"></i> View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
