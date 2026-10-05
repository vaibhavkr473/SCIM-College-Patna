import { api } from '@/lib/api.js';
import { useEffect, useState } from 'react';

export default function NoticeTicker() {
  const [notices, setNotices] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api
      .getNotices(true)
      .then((data) => {
        setNotices(Array.isArray(data) ? data.slice(0, 10) : []);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  const fallbackMessage = {
    loading: 'Loading the latest college updates…',
    loaded: 'There are no new announcements right now.',
    error: 'College announcements are temporarily unavailable. Please check back soon.',
  }[status];

  return (
    <div className={`notice-ticker${notices.length ? ' notice-ticker-active' : ''}`} role="region" aria-label="Latest college notices">
      <div className="notice-ticker-label">
        <span className="notice-ticker-label-icon"><i className="bi bi-megaphone-fill" aria-hidden="true" /></span>
        <span>College updates</span>
      </div>
      <div className="notice-ticker-content" aria-live="polite">
        {notices.length > 0 ? (
          <div className="notice-ticker-track">
            {[0, 1].map((copy) => (
              <div className="notice-ticker-group" key={copy} aria-hidden={copy === 1}>
                {notices.map((notice) => (
                  <span key={`${copy}-${notice.id}`} className="notice-ticker-item">
                    <i className="bi bi-arrow-up-right" aria-hidden="true" />
                    <span>{notice.title}</span>
                    <span className="notice-ticker-divider" aria-hidden="true" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className={`notice-ticker-message${status === 'error' ? ' notice-ticker-message-error' : ''}`} role={status === 'error' ? 'status' : undefined}>
            <i className={`bi ${status === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'}`} aria-hidden="true" />
            {fallbackMessage}
          </p>
        )}
      </div>
      {notices.length > 0 && (
        <div className="notice-ticker-live">
          <span className="notice-ticker-live-dot" />
          <span>Updates</span>
        </div>
      )}
    </div>
  );
}
