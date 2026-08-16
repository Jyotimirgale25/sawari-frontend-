import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import FindRide from "./pages/dashboard/FindRide";
import CreateRide from "./pages/dashboard/CreateRide";
import Verification from "./pages/dashboard/Verification";
import SOS from "./pages/dashboard/SOS";
import AdminSOS from "./pages/dashboard/AdminSOS";
import LiveTracking from "./pages/dashboard/LiveTracking";
import AdminVerification from "./pages/dashboard/AdminVerification";
import BookingConfirmation from "./pages/dashboard/BookingConfirmation";
import Bookings from "./pages/dashboard/Bookings";
import MyRides from "./pages/dashboard/MyRides";
import AdminRides from "./pages/dashboard/AdminRides";
import Settings from "./pages/dashboard/Settings";
import AdminUsersVerification from "./pages/dashboard/AdminUsersVerification";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* DASHBOARD ROOT */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* USER ROUTES */}
      <Route
        path="/dashboard/find-ride"
        element={
          <ProtectedRoute>
            <FindRide />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/booking-confirmation"
        element={
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/verification"
        element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/sos"
        element={
          <ProtectedRoute>
            <SOS />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/live-tracking"
        element={
          <ProtectedRoute>
            <LiveTracking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* DRIVER ROUTES */}
      <Route
        path="/dashboard/create-ride"
        element={
          <ProtectedRoute requireRole="DRIVER">
            <CreateRide />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/my-rides"
        element={
          <ProtectedRoute requireRole="DRIVER">
            <MyRides />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/dashboard/admin-sos"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminSOS />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin-verification"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminVerification />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin-users"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminUsersVerification />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin-rides"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminRides />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}