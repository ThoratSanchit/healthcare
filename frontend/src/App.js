import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DoctorList from './pages/Public/DoctorList';
import PublicDoctorProfile from './pages/Public/DoctorProfile';
import About from './pages/About';
import Contact from './pages/Contact';

// Patient Pages
import PatientDashboard from './pages/Patient/Dashboard';
import BookAppointment from './pages/Patient/BookAppointment';
import MyAppointments from './pages/Patient/MyAppointments';
import PatientProfile from './pages/Patient/Profile';
import MedicalHistory from './pages/Patient/MedicalHistory';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import DoctorAppointments from './pages/Doctor/Appointments';
import DoctorProfile from './pages/Doctor/Profile';
import DoctorAvailability from './pages/Doctor/Availability';
import PatientRecords from './pages/Doctor/PatientRecords';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import SystemAnalytics from './pages/Admin/Analytics';
import AdminAppointments from './pages/Admin/Appointments';
import AdminSettings from './pages/Admin/Settings';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load user on app start if token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardRoute(user?.role)} />} />
          <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardRoute(user?.role)} />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="doctors/:id" element={<PublicDoctorProfile />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Patient Routes */}
          <Route path="patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>} />
          <Route path="patient/book-appointment" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />
          <Route path="patient/medical-history" element={<ProtectedRoute allowedRoles={['patient']}><MedicalHistory /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
          <Route path="doctor/availability" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAvailability /></ProtectedRoute>} />
          <Route path="doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientRecords /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><SystemAnalytics /></ProtectedRoute>} />
          <Route path="admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
        </Route>

        {/* Redirect authenticated users to their dashboard */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <Navigate to={getDashboardRoute(user?.role)} /> : 
            <Navigate to="/login" />
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

// Helper function to get dashboard route based on user role
const getDashboardRoute = (role) => {
  switch (role) {
    case 'patient':
      return '/dashboard/patient';
    case 'doctor':
      return '/dashboard/doctor';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/';
  }
};

export default App;
