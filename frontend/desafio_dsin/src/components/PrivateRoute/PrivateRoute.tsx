import React from 'react';
import { Navigate } from 'react-router-dom';
import type { Usuario } from '../../types';

interface PrivateRouteProps {
  children: React.ReactNode;
  roleRequired?: 'cliente' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roleRequired }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null') as Usuario | null;
  if (!usuario) return <Navigate to="/login" />;
  if (roleRequired && usuario.role !== roleRequired) return <Navigate to="/agendamento" />;
  return <>{children}</>;
};

export default PrivateRoute;