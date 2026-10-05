export default function Footer() {
  return (
    <footer className="scim-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img className="scim-logo-badge" src="/scim-college-logo.jpeg" alt="" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>SCIM College, Patna</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              Serving BBA and BCA students with a comprehensive academic portal for study materials,
              online tests, doubt resolution, and institutional updates.
            </p>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer">Official Website</a></li>
              <li className="mb-2"><a href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
              <li className="mb-2"><a href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer">Instagram Page</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5>Departments</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#!">BBA Program</a></li>
              <li className="mb-2"><a href="#!">BCA Program</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5>Contact</h5>
            <p style={{ fontSize: '0.85rem' }}>
              <a href="mailto:vaibhavkr387@gmail.com">
                <i className="bi bi-envelope me-1"></i> vaibhavkr387@gmail.com
              </a>
            </p>
            <div className="d-flex gap-2 mt-3">
              <a href="https://www.scimpatna.org/" target="_blank" rel="noopener noreferrer" className="footer-social">
                <i className="bi bi-globe"></i>
              </a>
              <a href="https://www.youtube.com/@SCIMPATNA_25" target="_blank" rel="noopener noreferrer" className="footer-social">
                <i className="bi bi-youtube"></i>
              </a>
              <a href="https://www.instagram.com/scimpatna/" target="_blank" rel="noopener noreferrer" className="footer-social">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="scim-footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>&copy; {new Date().getFullYear()} SCIM College, Patna. All rights reserved.</span>
          <span>BBA &amp; BCA Academic Portal</span>
        </div>
      </div>
    </footer>
  );
}
