import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth.jsx';
import { api } from '@/lib/api.js';
import ThemeToggle from './ThemeToggle.jsx';
import NoticeTicker from './NoticeTicker.jsx';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [noticePopup, setNoticePopup] = useState(null);
  const [notificationError, setNotificationError] = useState('');
  const knownNotificationIds = useRef(new Set());

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNoticePopup(null);
      knownNotificationIds.current = new Set();
      return undefined;
    }

    let active = true;
    let initialLoad = true;
    knownNotificationIds.current = new Set();

    const loadNotifications = async () => {
      try {
        const data = await api.getNotifications();
        if (!active) return;

        const items = Array.isArray(data) ? data : [];
        const unread = items.filter((item) => !item.is_read);
        const newlyCreated = unread.find((item) => !knownNotificationIds.current.has(item.id));
        if (newlyCreated) setNoticePopup(newlyCreated);
        else if (initialLoad && unread.length) setNoticePopup(unread[0]);

        knownNotificationIds.current = new Set(items.map((item) => item.id));
        setNotifications(items);
        setNotificationError('');
        initialLoad = false;
      } catch (err) {
        if (active) setNotificationError(err.message || 'Could not load notifications.');
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const markNotificationRead = async (notification) => {
    try {
      await api.markNotificationRead(notification.id);
      setNotifications((items) => items.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setSelectedNotification((current) => (
        current?.id === notification.id ? { ...current, is_read: true } : current
      ));
      if (noticePopup?.id === notification.id) setNoticePopup(null);
    } catch (err) {
      setNotificationError(err.message || 'Could not update notification.');
    }
  };

  return (
    <>
      <nav className="scim-navbar navbar navbar-expand-lg sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img className="scim-logo-badge" src="/scim-college-logo.jpeg" alt="" />
            <span>Sampoorna College of IT & Management</span>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            aria-controls="navbarMain"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} text-white`} aria-hidden="true" style={{ fontSize: '1.5rem' }}></i>
          </button>

          <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="navbarMain">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>
                  <i className="bi bi-house-door" aria-hidden="true"></i><span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                  <i className="bi bi-globe" aria-hidden="true"></i><span>Website</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                  <i className="bi bi-youtube" aria-hidden="true"></i><span>YouTube</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                  <i className="bi bi-instagram" aria-hidden="true"></i><span>Instagram</span>
                </a>
              </li>

              {!user ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>
                    <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i><span>Login</span>
                  </Link>
                </li>
              ) : (
                <>
                  {profile?.role === 'student' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/student" onClick={() => setMenuOpen(false)}>
                        <i className="bi bi-mortarboard"></i> Portal
                      </Link>
                    </li>
                  )}
                  {(profile?.role === 'admin' || profile?.role === 'co_member') && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin" onClick={() => setMenuOpen(false)}>
                        <i className="bi bi-speedometer2"></i> Dashboard
                      </Link>
                    </li>
                  )}
                  <li className="nav-item scim-notification-item">
                    <button
                      className="nav-link scim-notification-button"
                      type="button"
                      aria-label={`Notifications${notifications.some((item) => !item.is_read) ? `, ${notifications.filter((item) => !item.is_read).length} unread` : ''}`}
                      aria-expanded={notificationsOpen}
                      onClick={() => setNotificationsOpen((open) => !open)}
                    >
                      <i className="bi bi-bell" aria-hidden="true"></i>
                      {notifications.some((item) => !item.is_read) && (
                        <span className="scim-notification-count">
                          {notifications.filter((item) => !item.is_read).length}
                        </span>
                      )}
                    </button>
                    {notificationsOpen && (
                      <div className="scim-notification-menu" role="region" aria-label="Notifications">
                        <div className="scim-notification-menu-header">Notifications</div>
                        {notificationError && <p className="scim-notification-error" role="status">{notificationError}</p>}
                        {selectedNotification ? (
                          <div className="scim-notification-detail">
                            <button
                              type="button"
                              className="scim-notification-back"
                              onClick={() => setSelectedNotification(null)}
                            >
                              <i className="bi bi-arrow-left" aria-hidden="true"></i> All notifications
                            </button>
                            <h6>{selectedNotification.title}</h6>
                            <p>{selectedNotification.message}</p>
                            <time>{new Date(selectedNotification.created_at).toLocaleString()}</time>
                          </div>
                        ) : notifications.length ? notifications.slice(0, 10).map((notification) => (
                          <button
                            className={`scim-notification-entry${notification.is_read ? '' : ' unread'}`}
                            key={notification.id}
                            type="button"
                            onClick={() => {
                              setSelectedNotification(notification);
                              if (!notification.is_read) markNotificationRead(notification);
                              if (noticePopup?.id === notification.id) setNoticePopup(null);
                            }}
                          >
                            <span className="scim-notification-entry-title">{notification.title}</span>
                            <span className="scim-notification-entry-message">{notification.message}</span>
                            {!notification.is_read && <span className="scim-notification-entry-new">New</span>}
                          </button>
                        )) : !notificationError && (
                          <p className="scim-notification-empty">You’re all caught up.</p>
                        )}
                      </div>
                    )}
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link border-0 bg-transparent" onClick={handleSignOut}>
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </>
              )}

              <li className="nav-item ms-lg-1">
                <ThemeToggle />
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {noticePopup && (
        <aside className="scim-notice-toast" role="status" aria-live="polite">
          <div className="scim-notice-toast-icon"><i className="bi bi-megaphone-fill" aria-hidden="true"></i></div>
          <div className="scim-notice-toast-content">
            <strong>{noticePopup.title}</strong>
            <p>{noticePopup.message}</p>
          </div>
          <button
            type="button"
            className="scim-notice-toast-close"
            aria-label="Dismiss new notice"
            onClick={() => markNotificationRead(noticePopup)}
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </aside>
      )}
      <NoticeTicker />
    </>
  );
}
