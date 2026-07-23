// @ts-nocheck
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Module, Role } from './permissions';
import AccessDenied from '../pages/errors/AccessDenied';
import AdminLayout from '../layouts/AdminLayout';

interface ProtectedRouteProps {
  // Nécessite authentification + optionnellement : module/rôle
  module?: Module;
  action?: string;
  roles?: Role | Role[];
  // Si true, affiche AdminLayout autour du contenu
  withLayout?: boolean;
}

export default function ProtectedRoute({
  module,
  action = 'view',
  roles,
  withLayout = true,
}: ProtectedRouteProps) {
  const { user, loading, can, isRole } = useAuth();

  // Chargement
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#F8FAFC', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          border: '3px solid #E2E8F0', borderTopColor: '#22C55E',
          animation: 'spin 700ms linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
          Chargement COLIGO...
        </div>
      </div>
    );
  }

  // Non authentifié → login
  if (!user) return <Navigate to="/login" replace />;

  // Vérification rôle
  if (roles !== undefined && !isRole(roles)) {
    return <AccessDenied />;
  }

  // Vérification permission
  if (module !== undefined && !can(module, action)) {
    return <AccessDenied />;
  }

  // Accès autorisé
  if (withLayout) return <AdminLayout />;
  return <Outlet />;
}