import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth.jsx';
import Navbar from '@/components/shared/Navbar.jsx';
import ThemeToggle from '@/components/shared/ThemeToggle.jsx';

const studentNav = [
  { to: '/student', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
  { to: '/student/materials', icon: 'bi-folder2-open', label: 'Study Materials' },
  { to: '/student/tests', icon: 'bi-clipboard-check', label: 'Tests' },
  { to: '/student/doubts', icon: 'bi-question-circle', label: 'Doubt Section' },
  { to: '/student/calendar', icon: 'bi-calendar3', label: 'Calendar' },
  { to: '/student/saved', icon: 'bi-bookmark', label: 'Saved' },
];

export default function StudentLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <div className="dashboard-sidebar-section">Academics</div>
          {studentNav.map((item) => (
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
          <NavLink to="/" className="dashboard-sidebar-item" onClick={() => setSidebarOpen(false)}>
            <i className="bi bi-house-door"></i>
            Back to Home
          </NavLink>
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
                {profile?.course} • Sem {profile?.semester}
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
