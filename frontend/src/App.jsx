import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import VehicleManagementPage from './pages/VehicleManagementPage';
import BrandManagementPage from './pages/BrandManagementPage';
import AppointmentManagementPage from './pages/AppointmentManagementPage';
import ChatManagementPage from './pages/ChatManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import ReviewManagementPage from './pages/ReviewManagementPage';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="vehicles" element={<VehicleManagementPage />} />
          <Route path="brands" element={<BrandManagementPage />} />
          <Route path="appointments" element={<AppointmentManagementPage />} />
          <Route path="messages" element={<ChatManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="reviews" element={<ReviewManagementPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
