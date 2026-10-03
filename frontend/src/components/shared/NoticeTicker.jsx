import { api } from '@/lib/api.js';
import { useEffect, useState } from 'react';

export default function NoticeTicker() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api
      .getNotices(true)
      .then((data) => {
        if (data) setNotices(data.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  if (notices.length === 0) return null;

  const items = [...notices, ...notices];

  return (
    <div className="notice-ticker">
      <div className="notice-ticker-label">
        <i className="bi bi-megaphone-fill"></i> NOTICES
      </div>
      <div className="notice-ticker-content">
        <div className="notice-ticker-track">
          {items.map((n, i) => (
            <span key={`${n.id}-${i}`} className="notice-ticker-item">
              <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
              {n.title}
              <span className="notice-ticker-divider"></span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
