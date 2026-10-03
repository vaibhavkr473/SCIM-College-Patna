import { Outlet } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar.jsx';
import Footer from '@/components/shared/Footer.jsx';

export default function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
