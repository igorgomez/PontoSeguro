import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter basename="/PontoSeguro">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute userType="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;