import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterial() {
      try {
        const data = await api.getMaterial(id);
        if (data) setMaterial(data);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchMaterial();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!material) {
    return <div className="fade-in"><p className="text-muted-custom">Material not found.</p></div>;
  }

  const watermarkText = `${profile?.email || 'student'} — SCIM College`;
  const watermarkElements = [];
  for (let i = 0; i < 30; i++) {
    watermarkElements.push(
      <div
        key={i}
        className="pdf-watermark-text"
        style={{
          top: `${(i % 6) * 16 + 5}%`,
          left: `${Math.floor(i / 6) * 25 - 10}%`,
        }}
      >
        {watermarkText}
      </div>
    );
  }

  const contentUrl = material.url || material.file_path;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Link to="/student/materials" className="text-muted-custom" style={{ fontSize: '0.82rem' }}>
            <i className="bi bi-arrow-left me-1"></i> Back to Materials
          </Link>
          <h5 className="fw-bold mt-1 mb-0">{material.title}</h5>
          <p className="text-muted-custom mb-0" style={{ fontSize: '0.78rem' }}>
            {material.course} • Sem {material.semester}
          </p>
        </div>
      </div>

      {material.description && (
        <p className="text-secondary-custom mb-3" style={{ fontSize: '0.88rem' }}>{material.description}</p>
      )}

      {material.type === 'text' ? (
        <div className="scim-card">
          <div className="card-body p-4">
            <div className="pdf-viewer-container" style={{ height: 'auto', minHeight: '300px' }}>
              <div className="pdf-watermark">{watermarkElements}</div>
              <div style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {material.text_content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : material.type === 'pdf' ? (
        <div className="pdf-viewer-container">
          <div className="pdf-watermark">{watermarkElements}</div>
          <iframe
            src={contentUrl}
            style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', border: 'none' }}
            title={material.title}
          />
        </div>
      ) : material.type === 'video' ? (
        <div className="pdf-viewer-container" style={{ height: 'auto' }}>
          <div className="pdf-watermark">{watermarkElements}</div>
          <video
            src={contentUrl}
            controls
            style={{ position: 'relative', zIndex: 1, width: '100%', maxHeight: '70vh' }}
          />
        </div>
      ) : (
        <div className="pdf-viewer-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pdf-watermark">{watermarkElements}</div>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <i className="bi bi-link-45deg" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
            <p className="mt-2 mb-3 text-muted-custom">This is an external link.</p>
            <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-navy">
              <i className="bi bi-box-arrow-up-right me-1"></i> Open Link
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
