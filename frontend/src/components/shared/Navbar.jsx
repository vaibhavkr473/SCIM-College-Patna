import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import NoticeTicker from './NoticeTicker.jsx';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="scim-navbar navbar navbar-expand-lg sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <div className="scim-logo-badge">SC</div>
            <span>SCIM College</span>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-expanded="false"
          >
            <i className="bi bi-list text-white" style={{ fontSize: '1.5rem' }}></i>
          </button>

          <div className="collapse navbar-collapse" id="navbarMain">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  <i className="bi bi-house-door"></i> Home
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-globe"></i> Website
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-youtube"></i> YouTube
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-instagram"></i> Instagram
                </a>
              </li>

              {!user ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right"></i> Login
                  </Link>
                </li>
              ) : (
                <>
                  {profile?.role === 'student' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/student">
                        <i className="bi bi-mortarboard"></i> Portal
                      </Link>
                    </li>
                  )}
                  {(profile?.role === 'admin' || profile?.role === 'co_member') && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">
                        <i className="bi bi-speedometer2"></i> Dashboard
                      </Link>
                    </li>
                  )}
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
      <NoticeTicker />
    </>
  );
}
