// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [tick, setTick] = useState(0);

  const { login, user } = useAuth();

useEffect(() => {
  if (!user) return;

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
  navigate(route);
}, [user]);

 async function handleLogin(e?: any) {
  if (e) e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const data = await login(email, password);
    localStorage.setItem('coligo_user', JSON.stringify(data.user));
    if (data.user?.role === 'responsable_agence') {
      window.location.href = '/agency-dashboard';
    } else {
      navigate('/dashboard');
    }
  } catch (err: any) {
    setError(err.message || 'Identifiants incorrects.');
  } finally {
    setLoading(false);
  }
}

  const floatY  = Math.sin(tick * 0.012) * 6;
  const floatY2 = Math.sin(tick * 0.009 + 1.2) * 8;
  const floatY3 = Math.sin(tick * 0.015 + 2.4) * 5;
  const floatY4 = Math.sin(tick * 0.010 + 0.8) * 7;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: '#f0f4f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.1)} 66%{transform:translate(-20px,40px) scale(0.95)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,20px) scale(0.9)} 66%{transform:translate(30px,-40px) scale(1.08)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,35px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .login-input {
          width:100%; height:52px; background:#f8fbf8;
          border:1.5px solid #d1ddd1; border-radius:12px;
          padding:0 48px 0 46px; font-size:14px;
          font-family:'DM Sans',sans-serif; color:#111;
          outline:none; transition:all 200ms ease; -webkit-appearance:none;
        }
        .login-input:hover { border-color:#a3c9a3; }
        .login-input::placeholder { color:#aab4aa; }
        .hero-card {
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.14);
          border-radius:16px; backdrop-filter:blur(12px);
          padding:14px 18px; transition:transform 300ms ease;
        }
        .hero-card:hover { transform:translateY(-3px) !important; }
        @media (max-width:900px) {
          .login-layout { flex-direction:column !important; }
          .hero-col { display:none !important; }
          .form-col { width:100% !important; max-width:100% !important; padding:32px 20px !important; }
        }
      `}</style>

      <div className="login-layout" style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>

        {/* ── COLONNE GAUCHE 55% ── */}
        <div className="hero-col" style={{
          width: '55%', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, #031B34 0%, #0a2d1a 35%, #14532D 65%, #16A34A 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px',
        }}>
          {/* Orbs animés */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,.28) 0%, transparent 70%)', animation: 'orb1 18s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,83,45,.35) 0%, transparent 70%)', animation: 'orb2 22s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', top: '40%', right: '20%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(132,204,22,.15) 0%, transparent 70%)', animation: 'orb3 15s ease-in-out infinite' }} />
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 70} x2="600" y2={i * 70} stroke="#fff" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 65} y1="0" x2={i * 65} y2="800" stroke="#fff" strokeWidth="0.5" />
              ))}
            </svg>
          </div>

          {/* Contenu */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, animation: 'fadeUp 600ms ease both' }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                  <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
                    <path d="M8 28 L20 8 L32 28 Z" fill="rgba(255,255,255,.9)" />
                    <path d="M14 28 L20 18 L26 28 Z" fill="rgba(132,204,22,.9)" />
                    <circle cx="20" cy="28" r="3.5" fill="#4ADE80" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
                    COLI<span style={{ color: '#4ADE80' }}>GO</span><span style={{ color: '#84CC16', fontSize: 20 }}>⚡</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Enterprise Logistics</div>
                </div>
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.3px' }}>
                Plateforme intelligente<br />
                <span style={{ color: '#4ADE80' }}>de gestion logistique</span>
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', margin: 0, lineHeight: 1.6, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                Connectez chauffeurs, clients et agences sur une seule plateforme alimentée par l'IA.
              </p>
            </div>

            {/* 4 cartes flottantes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {[
                { icone: '🚚', label: 'Livraisons', valeur: '12 847', badge: '+18%', badgeColor: '#4ADE80', floatVal: floatY },
                { icone: '📍', label: 'GPS Temps réel', valeur: '96%', badge: 'LIVE', badgeColor: '#4ADE80', floatVal: floatY2 },
                { icone: '🤖', label: 'IA Active', valeur: '94%', badge: 'v2.4', badgeColor: '#84CC16', floatVal: floatY3 },
                { icone: '💰', label: 'Revenus', valeur: '18.4M FCFA', badge: '+8%', badgeColor: '#FCD34D', floatVal: floatY4 },
              ].map((card, i) => (
                <div key={i} className="hero-card" style={{ transform: `translateY(${card.floatVal}px)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{card.icone}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: card.badgeColor, background: `${card.badgeColor}25`, padding: '2px 7px', borderRadius: 20 }}>{card.badge}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{card.valeur}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Avantages */}
            <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {['Suivi GPS temps réel', 'Détection fraude IA', 'Gestion chauffeurs', 'Paiements sécurisés', 'Gestion agences', 'Rapports avancés'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                    <span style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE 45% ── */}
        <div className="form-col" style={{
          width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 32px', background: '#f0f4f0',
        }}>
          <div style={{ width: '100%', maxWidth: 460, animation: 'fadeUp 700ms ease 100ms both' }}>

            <div style={{
              background: '#fff', borderRadius: 24,
              boxShadow: '0 8px 40px rgba(0,0,0,.10), 0 2px 12px rgba(0,0,0,.06)',
              padding: '36px 36px 28px', border: '0.5px solid #dde8dd',
            }}>

              {/* En-tête */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#15803D', letterSpacing: '0.04em' }}>Administration COLIGO</span>
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Connexion</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Accédez au centre de contrôle de la plateforme.</p>
              </div>

              {/* Erreur */}
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin}>

                {/* Email */}
                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, letterSpacing: '0.02em' }}>Adresse email</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: emailFocus ? '#16A34A' : '#9CA3AF', transition: 'color 200ms', pointerEvents: 'none' }}>✉</span>
                    <input
                      className="login-input"
                      type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                      placeholder="admin@coligo.app"
                      required
                      style={{ borderColor: emailFocus ? '#16A34A' : '#d1ddd1', boxShadow: emailFocus ? '0 0 0 3px rgba(22,163,74,.12)' : 'none' }}
                    />
                    {email && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#22C55E' }}>✓</span>}
                  </div>
                </div>

                {/* Mot de passe */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', letterSpacing: '0.02em' }}>Mot de passe</label>
                    <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: '#16A34A', textDecoration: 'none', fontWeight: 500 }}>Mot de passe oublié ?</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: passFocus ? '#16A34A' : '#9CA3AF', transition: 'color 200ms', pointerEvents: 'none' }}>🔑</span>
                    <input
                      className="login-input"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      placeholder="••••••••••"
                      required
                      style={{ borderColor: passFocus ? '#16A34A' : '#d1ddd1', boxShadow: passFocus ? '0 0 0 3px rgba(22,163,74,.12)' : 'none' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#9CA3AF', padding: 0, lineHeight: 1 }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Se souvenir */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                  <div onClick={() => setRemember(!remember)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${remember ? '#16A34A' : '#D1D5DB'}`, background: remember ? '#16A34A' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms', flexShrink: 0 }}>
                    {remember && <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: '#6B7280', cursor: 'pointer', userSelect: 'none' }} onClick={() => setRemember(!remember)}>
                    Se souvenir de moi pendant 30 jours
                  </span>
                </div>

                {/* Bouton */}
                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', height: 52, borderRadius: 14, border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? '#86EFAC' : 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                    color: '#fff', fontSize: 15, fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(22,163,74,.35)',
                    transition: 'all 200ms ease', position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(22,163,74,.45)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 16px rgba(22,163,74,.35)'; }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 700ms linear infinite' }} />
                      <span>Connexion en cours…</span>
                    </>
                  ) : (
                    <>
                      <span>Accéder au Dashboard</span>
                      <span style={{ fontSize: 16 }}>→</span>
                    </>
                  )}
                  
                  {!loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%)', transform: 'translateX(-100%)', animation: 'shimmer 2.5s ease-in-out infinite' }} />
                  )}
                </button>
              </form>

              {/* Badges sécurité */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, paddingTop: 18, borderTop: '0.5px solid #f0f4f0' }}>
                {[
                  { icone: '🔒', label: 'Connexion sécurisée' },
                  { icone: '🛡', label: 'Auth protégée' },
                  { icone: '📡', label: 'Surveillance live' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12 }}>{b.icone}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #14532D, #22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
                    <path d="M4 14 L10 4 L16 14 Z" fill="rgba(255,255,255,.9)" />
                    <path d="M7 14 L10 9 L13 14 Z" fill="rgba(132,204,22,.9)" />
                  </svg>
                </div>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: '#374151' }}>COLIGO<span style={{ color: '#16A34A' }}>⚡</span></span>
              </div>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>© 2026 COLIGO · Version Enterprise · Tous droits réservés</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}