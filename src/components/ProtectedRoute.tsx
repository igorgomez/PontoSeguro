import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'admin' | 'employee';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.user_type !== userType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}