import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import './MainLayout.css';

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="main-layout">
      <Navbar />
      <main className={`main-content${isHome ? ' main-content--home' : ''}`}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
