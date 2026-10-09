import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { SeminarsPage } from './pages/SeminarsPage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LiveStreamPage } from './pages/LiveStreamPage';
import { StatusPage } from './pages/StatusPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage';
import { QuoteReviewPage } from './pages/QuoteReviewPage';
import { PaymentTestCheckoutPage } from './pages/PaymentTestCheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import {
  PrivacyPolicyPage,
  TermsPage,
  CancellationRefundPolicyPage,
} from './pages/Policies';

// Admin Dashboard Components
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminSeminars } from './pages/admin/AdminSeminars';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminLivestream } from './pages/admin/AdminLivestream';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminRefunds } from './pages/admin/AdminRefunds';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [currentSearch, setCurrentSearch] = useState<string>(() => window.location.search || '');
  const [currentAdminTab, setCurrentAdminTab] = useState<string>('overview');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const [pathname, search] = path.split('?');
    setCurrentPath(pathname);
    setCurrentSearch(search ? `?${search}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if current route is an admin page
  const isAdminRoute = currentPath.startsWith('/admin');

  // Parse path for dynamic routes
  const searchParams = new URLSearchParams(currentSearch);
  const selectedProductId = searchParams.get('product') || undefined;
  const selectedServiceId = searchParams.get('service') || undefined;
  const selectedSeminarId = searchParams.get('seminar') || undefined;

  // Render Admin View
  if (isAdminRoute) {
    return (
      <AdminLayout
        currentAdminTab={currentAdminTab}
        setAdminTab={setCurrentAdminTab}
        navigate={navigate}
      >
        {currentAdminTab === 'overview' && <AdminOverview setAdminTab={setCurrentAdminTab} />}
        {currentAdminTab === 'appointments' && <AdminAppointments />}
        {currentAdminTab === 'seminars' && <AdminSeminars />}
        {currentAdminTab === 'products' && <AdminProducts />}
        {currentAdminTab === 'orders' && <AdminOrders />}
        {currentAdminTab === 'livestream' && <AdminLivestream />}
        {currentAdminTab === 'payments' && <AdminPayments />}
        {currentAdminTab === 'refunds' && <AdminRefunds />}
        {currentAdminTab === 'notifications' && <AdminNotifications />}
        {currentAdminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Render Public Website Page
  let PageComponent = <HomePage navigate={navigate} />;

  if (currentPath === '/appointments') {
    PageComponent = <AppointmentsPage navigate={navigate} selectedServiceId={selectedServiceId} />;
  } else if (currentPath === '/seminars') {
    PageComponent = <SeminarsPage navigate={navigate} selectedSeminarId={selectedSeminarId} />;
  } else if (currentPath === '/shop') {
    PageComponent = <ShopPage navigate={navigate} selectedProductId={selectedProductId} />;
  } else if (currentPath === '/cart') {
    PageComponent = <CartPage navigate={navigate} />;
  } else if (currentPath === '/checkout') {
    PageComponent = <CheckoutPage navigate={navigate} />;
  } else if (currentPath === '/livestream') {
    PageComponent = <LiveStreamPage navigate={navigate} />;
  } else if (currentPath === '/status') {
    PageComponent = <StatusPage navigate={navigate} />;
  } else if (currentPath === '/payment-success') {
    PageComponent = <PaymentSuccessPage navigate={navigate} />;
  } else if (currentPath === '/payment-failed') {
    PageComponent = <PaymentFailedPage navigate={navigate} />;
  } else if (currentPath.startsWith('/quote')) {
    PageComponent = <QuoteReviewPage navigate={navigate} />;
  } else if (currentPath === '/payment-test-checkout') {
    PageComponent = <PaymentTestCheckoutPage navigate={navigate} />;
  } else if (currentPath === '/about') {
    PageComponent = <AboutPage navigate={navigate} />;
  } else if (currentPath === '/contact') {
    PageComponent = <ContactPage navigate={navigate} />;
  } else if (currentPath === '/faq') {
    PageComponent = <FaqPage navigate={navigate} />;
  } else if (currentPath === '/privacy') {
    PageComponent = <PrivacyPolicyPage navigate={navigate} />;
  } else if (currentPath === '/terms') {
    PageComponent = <TermsPage navigate={navigate} />;
  } else if (currentPath === '/cancellation-policy') {
    PageComponent = <CancellationRefundPolicyPage navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-[#0d472b] font-sans selection:bg-[#198754]/20 selection:text-[#146C43]">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{PageComponent}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}
