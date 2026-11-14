import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MultiStepBookingModal } from './components/MultiStepBookingModal';
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Customer Dashboard
import { CustomerLayout } from './layouts/CustomerLayout';
import { CustomerOverview } from './pages/customer/Overview';
import { MyProjects } from './pages/customer/MyProjects';
import { ProjectDetail } from './pages/customer/ProjectDetail';
import { MyBookings } from './pages/customer/MyBookings';
import { PaymentHistory } from './pages/customer/PaymentHistory';
import { CustomerCalendar } from './pages/customer/CustomerCalendar';
import { ProfileSettings } from './pages/customer/ProfileSettings';

// Admin Command Center
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminPackages } from './pages/admin/AdminPackages';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminContent } from './pages/admin/AdminContent';

// Public Layout with Navbar & Footer
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          {/* Global Multi-Step Booking Modal */}
          <MultiStepBookingModal />

          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Customer Portal Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerOverview />} />
              <Route path="projects" element={<MyProjects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="calendar" element={<CustomerCalendar />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="content" element={<AdminContent />} />
            </Route>

            {/* 404 Catch-All */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <h1 className="text-6xl font-extrabold text-brand-electric">404</h1>
                  <h2 className="text-xl font-bold text-white">Page Not Found</h2>
                  <p className="text-xs text-slate-400 max-w-sm">
                    The requested URL does not exist on Next World Tech platform.
                  </p>
                  <a href="/" className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold">
                    Return to Homepage
                  </a>
                </div>
              }
            />
          </Routes>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}
