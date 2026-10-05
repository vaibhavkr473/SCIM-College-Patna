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

export default function StudentSaved() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const data = await api.getBookmarks();
        setMaterials(data.materials || []);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    if (profile) fetchSaved();
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <h5 className="fw-bold mb-3"><i className="bi bi-bookmark me-2"></i>Saved Materials</h5>

      {materials.length === 0 ? (
        <EmptyState
          icon="bi-bookmark"
          title="No saved materials"
          message="Bookmark study materials to find them quickly here."
          action={<Link to="/student/materials" className="btn btn-navy btn-sm mt-2">Browse Materials</Link>}
        />
      ) : (
        <div className="row g-3">
          {materials.map((m) => (
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
                <div className="d-flex gap-2 mt-2">
                  <Link to={`/student/materials/${m.id}`} className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-eye me-1"></i> View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
