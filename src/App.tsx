// @ts-nocheck
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuth';
import { AlertsProvider } from './contexts/AlertsContext';
import ProtectedRoute from './rbac/ProtectedRoute';

import LoginPage      from './pages/auth/LoginPage';
import AccessDenied   from './pages/errors/AccessDenied';
import DashboardPage  from './pages/dashboard/DashboardPage';
import ClientsPage    from './pages/clients/ClientsPage';
import DriversPage    from './pages/drivers/DriversPage';
import AgenciesPage   from './pages/agencies/AgenciesPage';
import PaymentsPage   from './pages/payments/PaymentsPage';
import EscrowPage     from './pages/escrow/EscrowPage';
import FraudPage      from './pages/fraud/FraudPage';
import DisputesPage   from './pages/disputes/DisputesPage';
import AnalyticsPage  from './pages/analytics/AnalyticsPage';
import ReportsPage    from './pages/reports/ReportsPage';
import TrackingPage   from './pages/tracking/TrackingPage';
import ExpeditionsPage from './pages/expeditions/ExpeditionsPage';
import AdminsPage     from './pages/admins/AdminsPage';
import SettingsPage   from './pages/settings/SettingsPage';
import AgencyDashboardPage from './pages/agencies/AgencyDashboardPage';


function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const ROLE_ROUTES: Record<string, string> = {
    superadmin: '/dashboard',
    admin_ops: '/expeditions',
    admin_operations: '/expeditions',
    admin_finance: '/payments',
    admin_fraude: '/fraud',
    admin_chauffeurs: '/drivers',
    support: '/disputes',
    support_client: '/disputes',
    analyste_ia: '/analytics',
    responsable_agence: '/expeditions',
  };

  const route = ROLE_ROUTES[user.role] || '/dashboard';
  return <Navigate to={route} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* ── Toutes les routes protégées ── */}
      <Route element={<ProtectedRoute module="dashboard" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute module="expeditions" />}>
        <Route path="/expeditions" element={<ExpeditionsPage />} />
      </Route>

      <Route element={<ProtectedRoute module="tracking" />}>
        <Route path="/tracking" element={<TrackingPage />} />
      </Route>

      <Route element={<ProtectedRoute module="clients" />}>
        <Route path="/clients" element={<ClientsPage />} />
      </Route>

      <Route element={<ProtectedRoute module="chauffeurs" />}>
        <Route path="/drivers" element={<DriversPage />} />
      </Route>

      <Route element={<ProtectedRoute module="agences" />}>
        <Route path="/agencies" element={<AgenciesPage />} />
      </Route>

      <Route element={<ProtectedRoute module="payments" />}>
        <Route path="/payments" element={<PaymentsPage />} />
      </Route>

      <Route element={<ProtectedRoute module="escrow" />}>
        <Route path="/escrow" element={<EscrowPage />} />
      </Route>

      <Route element={<ProtectedRoute
        module="fraude"
        roles={['superadmin', 'admin_fraude', 'admin_operations']}
      />}>
        <Route path="/fraud" element={<FraudPage />} />
      </Route>

      <Route element={<ProtectedRoute module="litiges" />}>
        <Route path="/disputes" element={<DisputesPage />} />
      </Route>

      <Route element={<ProtectedRoute module="analytics" />}>
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute module="reports" />}>
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      <Route element={<ProtectedRoute
        module="admins"
        roles="superadmin"
      />}>
        <Route path="/admins" element={<AdminsPage />} />
      </Route>

      <Route element={<ProtectedRoute
        module="settings"
        roles="superadmin"
      />}>
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />

      <Route path="/agency-dashboard" element={<AgencyDashboardPage />} />
      <Route path="/agency-dashboard/*" element={<AgencyDashboardPage />} />
    </Routes>
  );
}

function getDefaultRoute(role: string): string {
  if (role === 'responsable_agence') return '/agency-dashboard';
  return '/dashboard';
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertsProvider>
          <AppRoutes />
        </AlertsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}