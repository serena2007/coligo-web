import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertsBell } from '../AlertsBell'; // ajuste le chemin selon où se trouve ce fichier par rapport à DashboardLayout.tsx

const NAV_ITEMS = [
  { path: '/dashboard', icon: '📊', label: 'Tableau de bord', perm: null },
  { path: '/clients', icon: '👥', label: 'Clients', perm: 'can_manage_clients' },
  { path: '/drivers', icon: '🚕', label: 'Chauffeurs', perm: 'can_manage_drivers' },
  { path: '/agencies', icon: '🏢', label: 'Agences', perm: 'can_manage_agencies' },
  { path: '/payments', icon: '💰', label: 'Finance', perm: null },
  { path: '/admins', icon: '🔐', label: 'Administrateurs', superadmin: true },
  { path: '/settings', icon: '⚙️', label: 'Paramètres', perm: null },
];

interface Props { children: React.ReactNode; }

export function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  function canAccess(item: any): boolean {
    if (item.superadmin) return user?.role === 'superadmin';
    if (!item.perm) return true;
    if (user?.role === 'superadmin') return true;
    return !!(user?.permissions && user.permissions[item.perm as keyof typeof user.permissions]);
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Admin';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8F9FA' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? 72 : 260,
        background: '#0A1628',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '24px 16px' : '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {!collapsed && (
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: -1 }}>
              COLI<span style={{ color: '#4ADE80' }}>GO</span><span style={{ color: '#7FFF00', fontSize: 18 }}>⚡</span>
            </span>
          )}
          {collapsed && <span style={{ fontSize: 20 }}>⚡</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16,
            }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.filter(canAccess).map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '10px' : '10px 14px',
                  borderRadius: 10, marginBottom: 2,
                  background: active ? 'rgba(26,143,60,0.25)' : 'transparent',
                  borderLeft: active ? '3px solid #1A8F3C' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && (
                    <span style={{
                      fontSize: 14, fontWeight: active ? 600 : 400,
                      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}>
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#1A8F3C', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user?.role === 'superadmin' ? 'Super Admin' : 'Administrateur'}</div>
              </div>
              <button onClick={logout} title="Déconnexion" style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18,
              }}>⏻</button>
            </>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
<div style={{
  height: 60, background: '#fff', borderBottom: '1px solid #E8E8E8',
  display: 'flex', alignItems: 'center', paddingInline: 24,
  gap: 12, flexShrink: 0,
}}>
  <div style={{ flex: 1 }}>
    {/* <span style={{ fontSize: 13, color: '#9E9E9E' }}>
      🌤️ 28°C · Brazzaville &nbsp;|&nbsp; {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    </span> */}
  </div>
  <AlertsBell />
</div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
