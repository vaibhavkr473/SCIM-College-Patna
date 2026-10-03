import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth.jsx';
import Navbar from '@/components/shared/Navbar.jsx';
import ThemeToggle from '@/components/shared/ThemeToggle.jsx';

const adminNav = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
  { to: '/admin/students', icon: 'bi-people', label: 'Students' },
  { to: '/admin/team', icon: 'bi-shield-check', label: 'Team Members' },
  { to: '/admin/materials', icon: 'bi-folder2-open', label: 'Study Materials' },
  { to: '/admin/tests', icon: 'bi-clipboard-check', label: 'Test Builder' },
  { to: '/admin/notices', icon: 'bi-megaphone', label: 'Notices' },
  { to: '/admin/calendar', icon: 'bi-calendar3', label: 'Calendar' },
  { to: '/admin/doubts', icon: 'bi-question-circle', label: 'Doubt Board' },
  { to: '/admin/feedback', icon: 'bi-chat-dots', label: 'Feedback' },
];

const memberNav = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
  { to: '/admin/materials', icon: 'bi-folder2-open', label: 'Study Materials' },
  { to: '/admin/doubts', icon: 'bi-question-circle', label: 'Doubt Board' },
];

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = profile?.role === 'admin' ? adminNav : memberNav;
  const isCoMember = profile?.role === 'co_member';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="dashboard-layout">
        <div className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="dashboard-sidebar-section">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dashboard-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}

          <div className="dashboard-sidebar-section">Account</div>
          <Link to="/" className="dashboard-sidebar-item" onClick={() => setSidebarOpen(false)}>
            <i className="bi bi-house-door"></i>
            Back to Home
          </Link>
          <button className="dashboard-sidebar-item btn btn-link text-decoration-none w-100 text-start border-0" onClick={handleSignOut}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>

          <div className="px-3 mt-3 d-flex align-items-center justify-content-between">
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {profile?.full_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {profile?.role === 'admin' ? 'Administrator' : 'Co-Member'}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
