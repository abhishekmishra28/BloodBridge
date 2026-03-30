import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/auth/AuthPage';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminSlots from './pages/admin/AdminSlots';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRequests from './pages/admin/AdminRequests';

// User
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import DonatePage from './pages/user/DonatePage';
import RequestPage from './pages/user/RequestPage';
import SearchDonors from './pages/user/SearchDonors';
import HospitalsPage from './pages/user/HospitalsPage';
import ProfilePage from './pages/user/ProfilePage';
import NotificationsPage from './pages/user/NotificationsPage';

// Spinner for loading state
const FullSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f10' }}>
    <div className="spinner" />
  </div>
);

// Route Guards
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullSpinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="slots" element={<AdminSlots />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="requests" element={<AdminRequests />} />
        </Route>

        {/* User routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserLayout /></ProtectedRoute>}>
          <Route index element={<UserDashboard />} />
          <Route path="donate" element={<DonatePage />} />
          <Route path="request" element={<RequestPage />} />
          <Route path="search" element={<SearchDonors />} />
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
