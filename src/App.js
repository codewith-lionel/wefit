import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Trainers from './pages/admin/Trainers';
import Plans from './pages/admin/Plans';
import Payments from './pages/admin/Payments';
import Attendance from './pages/admin/Attendance';
import Announcements from './pages/admin/Announcements';
import TrainerDashboard from './pages/trainer/Dashboard';
import MemberDashboard from './pages/member/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Trainers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/plans"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Plans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />

            {/* Trainer Routes */}
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute roles={['trainer']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Member Routes */}
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute roles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect based on role */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/unauthorized" element={<div className="error-page"><h1>Unauthorized Access</h1></div>} />
            <Route path="*" element={<div className="error-page"><h1>404 - Page Not Found</h1></div>} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
