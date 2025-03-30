import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ShiftProvider } from './contexts/ShiftContext';

// Components
import PrivateRoute from './components/shared/PrivateRoute';
import AdminRoute from './components/shared/AdminRoute';
import Layout from './components/shared/Layout';

// Admin Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POSPage from './pages/POSPage';
import DevicesPage from './pages/DevicesPage';
import MembersPage from './pages/MembersPage';
import FoodItemsPage from './pages/FoodItemsPage';
import ReportsPage from './pages/ReportsPage';
import ShiftPage from './pages/ShiftPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Playbox Pages
import PlayboxLandingPage from './pages/playbox/PlayboxLandingPage';
import PlayboxReservationPage from './pages/playbox/PlayboxReservationPage';
import PlayboxTrackingPage from './pages/playbox/PlayboxTrackingPage';
import AdminPlayboxPage from './pages/playbox/AdminPlayboxPage';

function App() {
  return (
    <AuthProvider>
      <ShiftProvider>
        <CartProvider>
          <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              {/* Public Playbox Routes */}
              <Route path="/playbox" element={<PlayboxLandingPage />} />
              <Route path="/playbox/reservation" element={<PlayboxReservationPage />} />
              <Route path="/playbox/tracking/:bookingCode" element={<PlayboxTrackingPage />} />
              <Route path="/playbox/tracking" element={<PlayboxTrackingPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Admin Routes */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pos" element={<POSPage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="food" element={<FoodItemsPage />} />
                <Route path="reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
                <Route path="shift" element={<ShiftPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin-playbox" element={<AdminRoute><AdminPlayboxPage /></AdminRoute>} />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </ShiftProvider>
    </AuthProvider>
  );
}

export default App;