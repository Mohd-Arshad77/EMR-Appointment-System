import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminAppointments from './pages/AdminAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistBooking from './pages/ReceptionistBooking';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Super Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'Receptionist') return <Navigate to="/receptionist" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receptionist"
            element={
              <ProtectedRoute allowedRoles={['Receptionist', 'Super Admin']}>
                <ReceptionistBooking />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
