// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '../../rbac/permissions';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(iv);
  }, []);

  const roleLabel = role ? ROLE_LABELS[role] : '—';
  const roleColor = role ? ROLE_COLORS[role] : '#94A3B8';

  // Particules flottantes
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: 10 + (i * 8.5) % 90,
    y: 15 + (i * 13) % 75,
    size: 3 + (i % 3) * 2,
    speed: 0.3 + (i % 4) * 0.2,
    offset: i * 0.8,
  }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F8FAFC',
      fontFamily: 'Inter, sans-serif', padding: 24, position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.08)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>

      {/* Fond décoratif SVG */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.035 }}
          viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 9} x2="100" y2={i * 9} stroke="#14532D" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 9} y1="0" x2={i * 9} y2="100" stroke="#14532D" strokeWidth="0.3" />
          ))}
        </svg>

        {/* Particules flottantes */}
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.x + Math.sin((tick * p.speed * 0.02) + p.offset) * 2}%`,
            top: `${p.y + Math.cos((tick * p.speed * 0.015) + p.offset) * 2}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#22C55E' : i % 3 === 1 ? '#14532D' : '#84CC16',
            opacity: 0.12 + (i % 4) * 0.04,
          }} />
        ))}

        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,83,45,.07) 0%, transparent 70%)' }} />
      </div>

      {/* Carte principale */}
      <div style={{
        background: '#fff', borderRadius: 28,
        boxShadow: '0 20px 80px rgba(0,0,0,.10), 0 4px 20px rgba(0,0,0,.06)',
        padding: '52px 48px', maxWidth: 520, width: '100%',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        border: '0.5px solid #E2E8F0', animation: 'fadeUp 400ms ease both',
      }}>

        {/* Ligne décorative haut */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #14532D, #22C55E, #84CC16)' }} />

        {/* Illustration icône verrouillé */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            {/* Cercle extérieur pulsant */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239,68,68,.08) 0%, rgba(239,68,68,.02) 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 3s ease-in-out infinite',
            }}>
              {/* Cercle intérieur */}
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FEF2F2, #FFFBEB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(239,68,68,.2)',
                boxShadow: '0 8px 24px rgba(239,68,68,.12)',
              }}>
                {/* SVG Cadenas */}
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                  <rect x="8" y="20" width="26" height="18" rx="4" fill="#EF4444" opacity="0.9" />
                  <path d="M14 20V14a7 7 0 0 1 14 0v6" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                  <circle cx="21" cy="28" r="2.5" fill="white" />
                  <line x1="21" y1="30" x2="21" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Badge x rouge flottant */}
            <div style={{
              position: 'absolute', top: 4, right: 4,
              width: 24, height: 24, borderRadius: '50%',
              background: '#EF4444', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#fff', fontWeight: 800,
              boxShadow: '0 2px 8px rgba(239,68,68,.4)',
              animation: 'float 2s ease-in-out infinite',
            }}>
              ✕
            </div>
          </div>
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: '#0F172A',
          margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>
          Accès refusé
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 28px', lineHeight: 1.6 }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette section de la plateforme.
        </p>

        {/* Infos utilisateur */}
        {user && (
          <div style={{
            background: '#F8FAFC', borderRadius: 14,
            border: '0.5px solid #E2E8F0', padding: '14px 18px',
            marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14,
            textAlign: 'left',
          }}>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}${user.last_name}&backgroundColor=14532d&textColor=ffffff`}
              alt="avatar"
              style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                {user.first_name} {user.last_name}
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600, marginTop: 3,
                padding: '2px 10px', borderRadius: 20,
                background: `${roleColor}18`, color: roleColor,
                border: `1px solid ${roleColor}30`,
              }}>
                {roleLabel}
              </span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Permission</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>Insuffisante</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {/* Actions */}
<div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
  <button
    onClick={() => {
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
      const route = user?.role ? (ROLE_ROUTES[user.role] || '/dashboard') : '/login';
      navigate(route);
    }}
    style={{
      padding: '11px 22px', borderRadius: 12,
      border: '0.5px solid #E2E8F0', background: '#fff',
      color: '#374151', fontWeight: 600, fontSize: 13,
      cursor: 'pointer', transition: 'all 200ms',
      display: 'flex', alignItems: 'center', gap: 7,
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
  >
    ← Ma page d'accueil
  </button>

  <button
    onClick={() => { logout(); navigate('/login'); }}
    style={{
      padding: '11px 24px', borderRadius: 12, border: 'none',
      background: 'linear-gradient(135deg, #14532D, #22C55E)',
      color: '#fff', fontWeight: 700, fontSize: 13,
      cursor: 'pointer', transition: 'all 200ms',
      display: 'flex', alignItems: 'center', gap: 7,
      boxShadow: '0 4px 14px rgba(34,197,94,.35)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    🔐 Se déconnecter
  </button>
</div>

        {/* Footer */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '0.5px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #14532D, #22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
                <path d="M4 14 L10 4 L16 14 Z" fill="rgba(255,255,255,.9)" />
                <path d="M7 14 L10 9 L13 14 Z" fill="rgba(132,204,22,.9)" />
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>COLIGO<span style={{ color: '#16A34A' }}>⚡</span></span>
          </div>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>
            Contactez votre administrateur pour obtenir les droits nécessaires.
          </p>
        </div>
      </div>
    </div>
  );
}