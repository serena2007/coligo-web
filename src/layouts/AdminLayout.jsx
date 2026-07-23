// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '../rbac/permissions';
import { Phone } from 'lucide-react';
import { useAlerts } from '../contexts/AlertsContext';

// ── DÉFINITION COMPLÈTE DU MENU ───────────────────────────────
// Chaque item déclare le module requis pour être visible
const NAV_DEFINITION = [
  {
    section: 'Principal',
    items: [
      { icon: '📊', label: 'Dashboard',   to: '/dashboard',   module: 'dashboard'   },
      { icon: '📦', label: 'Expéditions', to: '/expeditions', module: 'expeditions', badge: null },
      { icon: '🗺️', label: 'Carte GPS',   to: '/tracking',    module: 'tracking'    },
    ],
  },
  {
    section: 'Acteurs',
    items: [
      { icon: '👥', label: 'Clients',     to: '/clients',     module: 'clients'     },
      { icon: '🚕', label: 'Chauffeurs',  to: '/drivers',     module: 'chauffeurs', badge: null },
      { icon: '🏢', label: 'Agences',     to: '/agencies',    module: 'agences'     },
    ],
  },
  {
    section: 'Finance',
    items: [
      { icon: '💰', label: 'Finance',     to: '/payments',    module: 'payments'    },
      { icon: '🔒', label: 'Escrow',      to: '/escrow',      module: 'escrow'      },
    ],
  },
  {
    section: 'Sécurité',
    items: [
   //   { icon: '🚨', label: 'Fraude',      to: '/fraud',       module: 'fraude',     badge: 4 },
      { icon: '⚖️', label: 'Litiges',     to: '/disputes',    module: 'litiges'     },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      // { icon: '🤖', label: 'Analyse IA',  to: '/analytics',   module: 'analytics'   },
      { icon: '📋', label: 'Rapports',    to: '/reports',     module: 'reports'     },
    ],
  },
  {
    section: 'Système',
    items: [
      { icon: '👤', label: 'Admins',      to: '/admins',      module: 'admins'      },
      { icon: '⚙️', label: 'Paramètres',  to: '/settings',    module: 'settings'    },
    ],
  },
];

function getCurrentLabel(pathname) {
  for (const group of NAV_DEFINITION)
    for (const item of group.items)
      if (pathname.startsWith(item.to)) return item.label;
  return 'Dashboard';
}

function useDateTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return {
    heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date:  (() => { const d = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); return d.charAt(0).toUpperCase() + d.slice(1); })(),
  };
}

function useMeteo() {
  const [meteo, setMeteo] = useState(null);
  useEffect(() => {
    async function fetch_() {
      try {
        const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=4.0511&longitude=9.7679&current=temperature_2m,weathercode&timezone=Africa%2FDouala');
        const d = await r.json();
        const code = d.current.weathercode;
        const temp = Math.round(d.current.temperature_2m);
        const icone = code === 0 ? '☀️' : code <= 2 ? '⛅' : code <= 48 ? '☁️' : '🌧️';
        setMeteo({ temp, icone });
      } catch {
        // setMeteo({ temp: '--', icone: '🌡️' });
      }
    }
    fetch_();
    const iv = setInterval(fetch_, 10 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);
  return meteo;
}

export default function AdminLayout() {
  const { user, role, canAccess, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip,   setTooltip]   = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const { alerts, unreadCount, markAllRead, dismissAlert } = useAlerts();
  const { heure, date } = useDateTime();
  const meteo = useMeteo();
  const currentLabel = getCurrentLabel(location.pathname);
  const sidebarWidth = collapsed ? 64 : 240;
  const mappedRole = role || (user?.role || null);
  const roleLabel = mappedRole ? (ROLE_LABELS[mappedRole] || user?.role || '') : '';
  const roleColor = mappedRole ? (ROLE_COLORS[mappedRole] || '#94A3B8') : '#94A3B8';
  // ── Filtrage dynamique du menu selon les permissions ─────────
  const visibleNav = NAV_DEFINITION
    .map(group => ({
      ...group,
      items: group.items.filter(item => canAccess(item.module)),
    }))
    .filter(group => group.items.length > 0);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarWidth,
        background: 'linear-gradient(180deg, #14532D 0%, #166534 60%, #15803D 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100, transition: 'width 200ms ease',
        overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(0,0,0,.15)',
      }}>

        {/* Logo */}
        <div style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}>
          {!collapsed && (
            <span style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: -1 }}>
              COLI<span style={{ color: '#4ADE80' }}>GO</span>
              <span style={{ color: '#84CC16', fontSize: 18 }}>⚡</span>
            </span>
          )}
          {collapsed && <span style={{ fontSize: 22, fontStyle: 'italic', fontWeight: 900, color: '#4ADE80' }}>C</span>}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 8, cursor: 'pointer', color: '#fff',
            fontSize: 12, padding: '4px 8px', flexShrink: 0, transition: 'all 150ms',
          }}>
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Badge rôle (mode étendu) */}
        {!collapsed && role && (
          <div style={{
            margin: '10px 12px 2px',
            padding: '6px 10px',
            borderRadius: 8,
            background: `${roleColor}20`,
            border: `1px solid ${roleColor}30`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: roleColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: roleColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {roleLabel}
            </span>
          </div>
        )}

        {/* Nav filtrée */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0' }}>
          {visibleNav.map(group => (
            <div key={group.section}>
              {!collapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '10px 20px 4px',
                }}>
                  {group.section}
                </div>
              )}
              {collapsed && <div style={{ height: 8 }} />}

              {group.items.map(item => (
                <div key={item.to} style={{ position: 'relative' }}
                  onMouseEnter={() => collapsed && setTooltip(item.label)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <NavLink to={item.to} style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '9px 0' : '8px 12px',
                    margin: '1px 8px', borderRadius: 8,
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,.7)',
                    background: isActive ? 'rgba(255,255,255,.15)' : 'transparent',
                    textDecoration: 'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 150ms ease',
                    whiteSpace: 'nowrap',
                    borderLeft: isActive ? '3px solid #4ADE80' : '3px solid transparent',
                  })}>
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && item.badge > 0 && (
                      <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>

                  {/* Tooltip collapsed */}
                  {collapsed && tooltip === item.label && (
                    <div style={{
                      position: 'absolute', left: 70, top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#0F172A', color: '#fff',
                      fontSize: 12, padding: '6px 12px', borderRadius: 8,
                      whiteSpace: 'nowrap', pointerEvents: 'none',
                      zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,.2)',
                    }}>
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer utilisateur */}
        <div style={{
          padding: collapsed ? '12px 0' : '14px 16px',
          borderTop: '1px solid rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center',
          gap: 10, justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}${user?.last_name}&backgroundColor=4ade80&textColor=14532d`}
            alt="avatar"
            style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }}
          />
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ fontSize: 10, color: '#4ADE80', fontWeight: 500, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roleLabel}
                </div>
              </div>
              <button onClick={handleLogout} title="Se déconnecter" style={{
                background: 'rgba(239,68,68,.2)', border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 8, cursor: 'pointer', color: '#FCA5A5',
                fontSize: 14, padding: '5px 8px', flexShrink: 0, transition: 'all 150ms',
              }}>⏻</button>
            </>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{
        marginLeft: sidebarWidth, flex: 1, display: 'flex',
        flexDirection: 'column', transition: 'margin-left 200ms ease', minWidth: 0,
      }}>

        {/* Header */}
        <header style={{
          height: 64, background: '#fff',
          borderBottom: '.5px solid #E2E8F0',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 14,
          position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 1px 3px rgba(0,0,0,.05)',
        }}>

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ color: '#94A3B8' }}>Administration</span>
            <span style={{ color: '#CBD5E1' }}>›</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>{currentLabel}</span>
          </div>

          {/* Météo */}
          {meteo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '.5px solid #BBF7D0', borderRadius: 10, padding: '5px 12px' }}>
              <span style={{ fontSize: 16 }}>{meteo.icone}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>{meteo.temp}°C</span>
            </div>
          )}

          {/* Heure */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{heure}</div>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>{date}</div>
          </div>

          <div style={{ width: .5, height: 32, background: '#E2E8F0' }} />

          {/* Notif */}
<div style={{ position: 'relative' }}>
  <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }} style={{
    width: 38, height: 38, borderRadius: 10, background: '#F8FAFC',
    border: '.5px solid #E2E8F0', cursor: 'pointer', fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
  }}>
    🔔
    {unreadCount > 0 && (
      <span style={{
        position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8,
        background: '#EF4444', border: '1.5px solid #fff', color: '#fff',
        fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 3px',
      }}>
        {unreadCount}
      </span>
    )}
  </button>

  {notifOpen && (
    <div style={{
      position: 'absolute', top: 46, right: 0, width: 360,
      background: '#fff', borderRadius: 14, border: '.5px solid #E2E8F0',
      boxShadow: '0 12px 40px rgba(0,0,0,.15)', zIndex: 200,
      maxHeight: 420, overflowY: 'auto',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '.5px solid #E2E8F0', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
        Alertes GPS
      </div>
      {alerts.length === 0 ? (
        <div style={{ padding: 20, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
          Aucune alerte pour le moment.
        </div>
      ) : alerts.map((alert) => (
        <div key={alert.id} style={{
          padding: '12px 16px', borderBottom: '.5px solid #F1F5F9',
          background: '#FEF2F2', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C' }}>
              ⚠️ GPS {alert.reason === 'desactive_manuellement' ? 'désactivé' : 'connexion perdue'}
            </span>
            <button onClick={() => dismissAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 12 }}>✕</button>
          </div>
          <span style={{ fontSize: 12, color: '#0F172A' }}>
            {alert.driver_prenom} {alert.driver_nom} — Course #{alert.expedition_id}
          </span>
          <span style={{ fontSize: 11, color: '#64748B' }}>{alert.adresse_livraison}</span>
          <a href={`tel:${alert.driver_telephone}`} style={{
            marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#2563EB', textDecoration: 'none', fontWeight: 600,
          }}>
            <Phone size={13} /> {alert.driver_telephone}
          </a>
        </div>
      ))}
    </div>
  )}
</div>

          {/* Profil utilisateur enrichi */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 12px', borderRadius: 12,
            border: '.5px solid #E2E8F0', background: '#F8FAFC',
            cursor: 'pointer',
          }}>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}${user?.last_name}&backgroundColor=14532d&textColor=ffffff`}
              alt="avatar"
              style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                background: `${roleColor}18`, color: roleColor,
                border: `1px solid ${roleColor}25`, textTransform: 'uppercase',
                letterSpacing: '.04em',
              }}>
                {ROLE_LABELS[role]?.replace(/^[^ ]+ /, '') || role}
              </span>
            </div>
          </div>

          {/* Bouton déconnexion header */}
          <button onClick={handleLogout} style={{
            padding: '7px 14px', borderRadius: 10,
            border: '.5px solid #FECACA', background: '#FEF2F2',
            color: '#DC2626', fontWeight: 600, fontSize: 12,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
          >
            ⏻
          </button>
        </header>

        {/* Contenu page */}
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}