// @ts-nocheck
import RoleGuard from '../../rbac/RoleGuard';
import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';
import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';
// import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';


const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#DCFCE7',
  lime: '#84CC16', limeClair: '#F7FEE7',
  rouge: '#EF4444', rougeClair: '#FEF2F2',
  ambre: '#F59E0B', ambreClair: '#FFFBEB',
  bleu: '#3B82F6', bleuClair: '#EFF6FF',
  violet: '#8B5CF6', violetClair: '#EDE9FE',
  cyan: '#06B6D4', cyanClair: '#ECFEFF',
  texte: '#0F172A', texteMuted: '#94A3B8',
  border: '#E2E8F0', surface: '#F8FAFC', blanc: '#fff',
  ia: '#052E16', iaBord: '#166534',
};

// ── DONNÉES MOCK ──────────────────────────────────────────────

const CHAUFFEURS = [
   
];

const LIVRAISONS_JOURS = [

  ];

const VILLES_PERF = [
 
];

const STATUTS_PIE = [
 ];

const INSIGHTS_IA = [
 ];

const SPARKLINE = [3, 6, 4, 9, 7, 11, 8, 14, 10, 16];

// ── COMPOSANTS ────────────────────────────────────────────────

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 58},${18 - (v / max) * 16}`).join(' ');
  return (
    <svg width="60" height="20" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color || C.texte }}>{p.name}: {p.value}</div>)}
    </div>
  );
}

function KPICard({ label, valeur, icone, bg, color, tendance }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '14px 16px', boxShadow: hov ? '0 8px 28px rgba(0,0,0,.09)' : '0 2px 8px rgba(0,0,0,.04)', transition: 'all 220ms ease', transform: hov ? 'translateY(-3px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icone}</div>
        {tendance !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: tendance >= 0 ? '#DCFCE7' : '#FEE2E2', color: tendance >= 0 ? '#15803D' : '#B91C1C' }}>
            {tendance >= 0 ? '↑' : '↓'}{Math.abs(tendance)}%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: color || C.texte, lineHeight: 1 }}>{valeur}</div>
          <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
        </div>
        <Sparkline data={SPARKLINE} color={color || C.vert} />
      </div>
    </div>
  );
}

const STATUT_CFG = {
  disponible: { label: 'Disponible', bg: '#DCFCE7', color: '#15803D', dot: C.vert },
  en_mission: { label: 'En mission', bg: '#DBEAFE', color: '#1D4ED8', dot: C.bleu },
  pause: { label: 'Pause', bg: '#FEF3C7', color: '#B45309', dot: C.ambre },
  suspendu: { label: 'Suspendu', bg: '#FEE2E2', color: '#B91C1C', dot: C.rouge },
  en_attente: { label: '⏳ Candidature', bg: '#EDE9FE', color: '#6D28D9', dot: C.violet },
};

const NIVEAU_CFG = {
  elite: { label: '🥇 Elite', bg: '#FEF3C7', color: '#B45309' },
  premium: { label: '🥈 Premium', bg: '#EDE9FE', color: '#6D28D9' },
  standard: { label: '🥉 Standard', bg: '#F1F5F9', color: '#475569' },
  debutant: { label: '⭐ Débutant', bg: '#F0FDF4', color: '#15803D' },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CFG[statut] || { label: statut, bg: C.surface, color: C.texteMuted, dot: C.texteMuted };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
    </span>
  );
}

function NiveauBadge({ niveau }) {
  const cfg = NIVEAU_CFG[niveau] || { label: niveau, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function TauxBarre({ taux }) {
  const color = taux >= 95 ? C.vert : taux >= 88 ? C.ambre : C.rouge;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: `${taux}%`, height: '100%', background: color, borderRadius: 10 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 38, textAlign: 'right' }}>{taux}%</span>
    </div>
  );
}

function Etoiles({ note }) {
  return (
    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ color: '#F59E0B', fontWeight: 700 }}>{note}</span>
      <span style={{ color: '#F59E0B' }}>★</span>
    </span>
  );
}

function RisqueBadge({ score }) {
  const cfg = score >= 70 ? { label: `${score} Critique`, color: '#B91C1C', bg: '#FEE2E2' }
    : score >= 40 ? { label: `${score} Moyen`, color: '#B45309', bg: '#FEF3C7' }
    : { label: `${score} Faible`, color: '#15803D', bg: '#DCFCE7' };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

// ── MINI CARTE GPS ────────────────────────────────────────────

function MiniCarteGPS({ chauffeurs }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const loop = () => {
      ctx.fillStyle = '#0a0f0a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const routes = [
        [[0.1, 0.5], [0.3, 0.4], [0.5, 0.45], [0.7, 0.4], [0.9, 0.45]],
        [[0.5, 0.1], [0.45, 0.35], [0.5, 0.55], [0.55, 0.75], [0.5, 0.9]],
        [[0.15, 0.2], [0.35, 0.3], [0.55, 0.25], [0.75, 0.3]],
      ];
      routes.forEach(r => {
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2;
        ctx.beginPath(); r.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H)); ctx.stroke();
      });

      const t = tick.current;
      const colorMap = { disponible: C.vert, en_mission: C.bleu, pause: C.ambre, suspendu: C.rouge };

      chauffeurs.forEach(c => {
        const x = c.lat * W, y = c.lng * H;
        const col = colorMap[c.statut] || C.vert;
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.04 + c.id));

        const grad = ctx.createRadialGradient(x, y, 0, x, y, 16);
        grad.addColorStop(0, col + '30'); grad.addColorStop(1, col + '00');
        ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();

        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.statut === 'en_mission' ? '▶' : c.statut === 'suspendu' ? '✕' : '●', x, y);

        ctx.fillStyle = 'rgba(0,0,0,.75)';
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x - 20, y + 10, 40, 12, 3); else ctx.rect(x - 20, y + 10, 40, 12);
        ctx.fill();
        ctx.fillStyle = col; ctx.font = 'bold 7px Inter';
        ctx.fillText(c.driver_id, x, y + 16);
      });

      tick.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [chauffeurs]);

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} width={500} height={200} style={{ width: '100%', height: 200, display: 'block' }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', padding: '3px 8px', borderRadius: 6 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.6)' }}>GPS simulé · Douala</span>
      </div>
      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
        {Object.entries(STATUT_CFG).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.65)', padding: '3px 8px', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.dot }} />
            <span style={{ fontSize: 9, color: '#fff' }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MODAL CHAUFFEUR ───────────────────────────────────────────

function ModalChauffeur({ chauffeur: c, onClose }) {
  const [onglet, setOnglet] = useState('profil');
  if (!c) return null;

  const docsOk = Object.values(c.documents).filter(Boolean).length;
  const docsTotal = Object.keys(c.documents).length;
  const dossierPct = Math.round((docsOk / docsTotal) * 100);

  const ONGLETS = [
    { id: 'profil', label: '👤 Profil' },
    { id: 'documents', label: '📄 Documents' },
    { id: 'performance', label: '📊 Performance' },
    { id: 'gps', label: '🗺️ GPS' },
    { id: 'fraude', label: '🛡️ Fraude' },
    { id: 'sanctions', label: '⚠️ Sanctions' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 520, background: C.blanc, zIndex: 301, boxShadow: '-16px 0 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideInR 220ms ease' }}>
        <style>{`@keyframes slideInR { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

        {/* Header modal */}
        <div style={{ padding: '20px 24px 14px', borderBottom: `.5px solid ${C.border}`, background: c.statut === 'suspendu' ? '#FEF2F2' : C.blanc, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar"
                  style={{ width: 56, height: 56, borderRadius: '50%', border: `2.5px solid ${c.statut === 'suspendu' ? C.rouge : C.vert}` }} />
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: '50%', background: STATUT_CFG[c.statut]?.dot || C.vert, border: '2px solid #fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.texte }}>{c.nom}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: C.vert }}>{c.driver_id}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                  <StatutBadge statut={c.statut} />
                  <NiveauBadge niveau={c.niveau} />
                  <RisqueBadge score={c.score_risque} />
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>

          {/* Barre dossier */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.texteMuted }}>Complétude dossier</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: dossierPct === 100 ? C.vert : C.ambre }}>{dossierPct}%</span>
            </div>
            <div style={{ height: 5, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: `${dossierPct}%`, height: '100%', background: dossierPct === 100 ? C.vert : C.ambre, borderRadius: 10, transition: 'width 600ms ease' }} />
            </div>
          </div>
        </div>

        {/* Onglets modal */}
        <div style={{ display: 'flex', borderBottom: `.5px solid ${C.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: onglet === o.id ? 600 : 400, color: onglet === o.id ? C.vert : C.texteMuted, borderBottom: onglet === o.id ? `2px solid ${C.vert}` : '2px solid transparent', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu modal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px' }}>

          {/* PROFIL */}
          {onglet === 'profil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: '📞 Téléphone', v: c.telephone },
                  { l: '✉️ Email', v: c.email },
                  { l: '📍 Ville', v: c.ville },
                  { l: '🏠 Adresse', v: c.adresse },
                  { l: '🚗 Véhicule', v: c.vehicule },
                  { l: '🔖 Plaque', v: c.plaque },
                  { l: '📅 Année', v: c.annee },
                  { l: '🎨 Couleur', v: c.couleur },
                ].map((r, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 2 }}>{r.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, borderRadius: 14, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center' }}>
                {[
                  { l: 'Missions', v: c.missions },
                  { l: 'Livraisons', v: c.livraisons },
                  { l: 'Note', v: `${c.note}★` },
                  { l: 'Revenus', v: `${(c.revenus / 1000).toFixed(0)}K F` },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.v}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {onglet === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'permis', label: 'Permis de conduire', icone: '🪪', details: 'Catégorie B+C · Valide jusqu\'en 2028' },
                { key: 'assurance', label: 'Assurance véhicule', icone: '🛡️', details: 'Tous risques · Renouvellement annuel' },
                { key: 'carte_grise', label: 'Carte grise', icone: '📋', details: `Immat. ${c.plaque}` },
                { key: 'cni', label: 'Carte Nationale d\'Identité', icone: '🪪', details: 'CNI biométrique · Valide' },
              ].map((doc, i) => {
                const ok = c.documents[doc.key];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: ok ? C.vertClair : '#FEF2F2', borderRadius: 12, border: `.5px solid ${ok ? '#BBF7D0' : '#FECACA'}` }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{doc.icone}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{doc.label}</div>
                      <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{doc.details}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ok ? '#15803D' : '#B91C1C' }}>
                        {ok ? '✓ Validé' : '✕ Manquant'}
                      </span>
                      {ok && <button style={{ padding: '3px 8px', borderRadius: 6, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 10, cursor: 'pointer' }}>👁️</button>}
                      {!ok && <button style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#FEE2E2', color: C.rouge, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Demander</button>}
                    </div>
                  </div>
                );
              })}
              {dossierPct < 100 && (
                <div style={{ background: C.ambreClair, border: `.5px solid #FDE68A`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B45309' }}>
                  ⚠️ Dossier incomplet — validation des missions bloquée jusqu'à régularisation.
                </div>
              )}
            </div>
          )}

          {/* PERFORMANCE */}
          {onglet === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { l: 'Taux réussite', v: `${c.taux_reussite}%`, color: c.taux_reussite >= 95 ? C.vert : C.ambre },
                  { l: 'Temps moyen', v: `${c.temps_moyen} min`, color: C.bleu },
                  { l: 'Retards', v: c.retards, color: c.retards > 20 ? C.rouge : C.ambre },
                  { l: 'Note clients', v: `${c.note}/5`, color: C.ambre },
                  { l: 'Score risque', v: c.score_risque, color: c.score_risque >= 70 ? C.rouge : c.score_risque >= 40 ? C.ambre : C.vert },
                  { l: 'Revenus', v: `${(c.revenus / 1000).toFixed(0)}K F`, color: C.vert },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '12px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 10 }}>Livraisons — 7 derniers jours</div>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={c.perf_data} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="j" tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
                    <Tooltip content={<TooltipCustom />} />
                    <Bar dataKey="livraisons" name="Livraisons" fill={C.vert} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 8 }}>Profil de performance IA</div>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={c.radar} cx="50%" cy="50%" outerRadius={60}>
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: C.texteMuted }} />
                    <Radar name={c.nom} dataKey="value" stroke={C.vert} fill={C.vert} fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* GPS */}
          {onglet === 'gps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: C.bleuClair, borderRadius: 12, padding: '12px 14px', border: `.5px solid #BFDBFE` }}>
                <div style={{ fontSize: 11, color: C.bleu, fontWeight: 600, marginBottom: 4 }}>Dernière position connue</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{c.adresse}</div>
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>Lat: {c.lat.toFixed(4)} · Lng: {c.lng.toFixed(4)}</div>
                <div style={{ fontSize: 11, color: C.texteMuted }}>Vitesse actuelle : {c.statut === 'en_mission' ? '38 km/h' : 'À l\'arrêt'}</div>
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.texte }}>Historique trajets récents</div>
                {c.historique_gps.map((trajet, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, alignItems: 'center' }}>
                    <span style={{ fontSize: 14 }}>🗺️</span>
                    <span style={{ fontSize: 12, color: C.texte }}>{trajet}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: 'Zones desservies', v: c.ville },
                  { l: 'Distance totale', v: `${c.missions * 8} km` },
                  { l: 'Incidents GPS', v: c.alertes_fraude.filter(a => a.type.includes('GPS')).length },
                  { l: 'Précision moy.', v: '94%' },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.texte }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FRAUDE */}
          {onglet === 'fraude' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '14px', background: c.score_risque >= 70 ? '#FEF2F2' : c.score_risque >= 40 ? '#FFFBEB' : C.vertClair, borderRadius: 14, border: `.5px solid ${c.score_risque >= 70 ? '#FECACA' : c.score_risque >= 40 ? '#FDE68A' : '#BBF7D0'}` }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: c.score_risque >= 70 ? C.rouge : c.score_risque >= 40 ? C.ambre : C.vert }}>{c.score_risque}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>Score de risque IA</div>
                <div style={{ height: 6, background: C.border, borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
                  <div style={{ width: `${c.score_risque}%`, height: '100%', background: c.score_risque >= 70 ? C.rouge : c.score_risque >= 40 ? C.ambre : C.vert, borderRadius: 10 }} />
                </div>
              </div>

              {c.alertes_fraude.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: C.texteMuted, background: C.vertClair, borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15803D' }}>Aucune alerte fraude détectée</div>
                </div>
              ) : c.alertes_fraude.map((a, i) => (
                <div key={i} style={{ padding: '14px 16px', background: a.gravite === 'critique' ? '#FEF2F2' : '#FFFBEB', borderRadius: 12, border: `.5px solid ${a.gravite === 'critique' ? '#FECACA' : '#FDE68A'}`, borderLeft: `3px solid ${a.gravite === 'critique' ? C.rouge : C.ambre}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: a.gravite === 'critique' ? C.rouge : C.ambre }}>⚠️ {a.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: a.gravite === 'critique' ? '#FEE2E2' : '#FEF3C7', color: a.gravite === 'critique' ? '#B91C1C' : '#B45309' }}>{a.gravite}</span>
                    <span style={{ fontSize: 10, color: C.texteMuted, marginLeft: 'auto' }}>{a.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.texteMuted }}>{a.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* SANCTIONS */}
          {onglet === 'sanctions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.sanctions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: C.texteMuted, background: C.vertClair, borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎖️</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15803D' }}>Aucune sanction enregistrée</div>
                </div>
              ) : c.sanctions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#FEF2F2', borderRadius: 10, border: `.5px solid #FECACA`, borderLeft: `3px solid ${C.rouge}` }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>🚫</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.rouge }}>{s.type}</div>
                    <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{s.date} · {s.motif}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions footer modal */}
        <div style={{ padding: '14px 24px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>📞 Appeler</button>
          <button style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>✏️ Modifier</button>
          {c.statut !== 'suspendu'
            ? <button style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>⏸ Suspendre</button>
            : <button style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vert, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>▶ Réactiver</button>
          }
        </div>
      </div>
    </>
  );
}

function normaliseDriver(d) {
  return {
    id: d.id,
    source: d.source || 'driver_profile',
    driver_id: d.driver_id || '—',
    nom: d.nom || '—',
    telephone: d.telephone || '—',
    email: d.email || '—',
    ville: d.ville || '—',
    adresse: d.adresse || '—',
    vehicule: d.vehicule || '—',
    plaque: d.plaque || '—',
    annee: d.annee || '—',
    couleur: d.couleur || '—',
    statut: d.statut || 'disponible',
    niveau: d.niveau || 'standard',
    missions: d.missions ?? d.nb_courses ?? 0,
    livraisons: d.livraisons ?? d.nb_courses ?? 0,
    taux_reussite: d.taux_reussite ?? 0,
    note: d.note ?? d.note_moyenne ?? 0,
    revenus: d.revenus ?? 0,
    temps_moyen: d.temps_moyen ?? 0,
    retards: d.retards ?? 0,
    score_risque: d.score_risque ?? 0,
    inscription: d.inscription || d.date_inscription || null,
    derniere_connexion: d.derniere_connexion || null,
    lat: d.latitude ?? d.lat ?? 0.45,
    lng: d.longitude ?? d.lng ?? 0.45,
    documents: d.documents || { permis: false, assurance: false, carte_grise: false, cni: false },
    alertes_fraude: d.alertes_fraude || [],
    perf_data: d.perf_data || [],
    radar: d.radar || [
      { metric: 'Performance', value: 50 }, { metric: 'Fiabilité', value: 50 },
      { metric: 'Ponctualité', value: 50 }, { metric: 'Sécurité', value: 50 },
      { metric: 'Satisfaction', value: 50 },
    ],
    historique_gps: d.historique_gps || [],
    sanctions: d.sanctions || [],
    gabarit: d.gabarit || null,
    cni: d.cni || null,
    permis_conduire: d.permis_conduire || null,
    photo_vehicule: d.photo_vehicule || null,
    cni_verified: d.cni_verified || false,
    permis_verified: d.permis_verified || false,
    vehicule_verified: d.vehicule_verified || false,
    documents_tous_verifies: d.documents_tous_verifies || false,
  };
}

// ── MODAL CANDIDATURE ─────────────────────────────────────────

function ModalCandidature({ candidature: c, onClose, onActionDone }) {
  const [loading, setLoading] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');
  const [showRejetInput, setShowRejetInput] = useState(false);
  const [docsState, setDocsState] = useState({
    cni: c?.cni_verified || false,
    permis: c?.permis_verified || false,
    vehicule: c?.vehicule_verified || false,
  });
  const [agences, setAgences] = useState<any[]>([]);
  const [agenceSelectionnee, setAgenceSelectionnee] = useState<string>('');

useEffect(() => {
  apiCall(API.AGENCIES)
    .then((d: any) => setAgences(Array.isArray(d) ? d : d.results || []))
    .catch(() => {});
}, []);

  if (!c) return null;

  async function toggleDocVerif(doc) {
    const newVal = !docsState[doc];
    setDocsState(prev => ({ ...prev, [doc]: newVal }));
    try {
      await apiCall(API.VERIFY_DOCUMENT(c.id), 'POST', { document: doc, verified: newVal });
    } catch (err) {
      alert('Erreur : ' + err.message);
      setDocsState(prev => ({ ...prev, [doc]: !newVal }));
    }
  }

  async function handleValider() {
    setLoading(true);
    try {
      await apiCall(API.CANDIDATURE_ACTION(c.id), 'POST', { action: 'valider' });
      alert('✅ Candidature validée. Le chauffeur a reçu ses identifiants par email/SMS.');
      onActionDone();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRejeter() {
    if (!motifRejet.trim()) {
      alert('Merci de préciser un motif de rejet.');
      return;
    }
    setLoading(true);
    try {
      await apiCall(API.CANDIDATURE_ACTION(c.id), 'POST', { action: 'rejeter', motif: motifRejet });
      alert('Candidature rejetée. Le candidat a été notifié du motif.');
      onActionDone();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: number, action: 'valider' | 'rejeter', motif = '') {
  // Si validation d'un chauffeur agence, vérifier qu'une agence est sélectionnée
  const candidature = candidatures.find((c: any) => c.id === id);
  if (action === 'valider' && candidature?.type_chauffeur === 'agence' && !agenceSelectionnee) {
    alert('Veuillez sélectionner une agence pour ce chauffeur.');
    return;
  }

  try {
    const payload: any = { action };
    if (motif) payload.motif = motif;
    if (action === 'valider' && agenceSelectionnee) payload.agence_id = agenceSelectionnee;

    const res: any = await apiCall(API.CANDIDATURE_ACTION(id), 'PATCH', payload);
    alert(`✅ ${res.detail || 'Action effectuée.'} ${res.driver_unique_id ? `\n\nIdentifiant : ${res.driver_unique_id}` : ''}`);
    setAgenceSelectionnee('');
    loadData();
    setSelectedCandidature(null);
  } catch (err: any) {
    alert('Erreur : ' + err.message);
  }
}

  const tousVerifies = docsState.cni && docsState.permis && docsState.vehicule;

  const DOCS = [
    { key: 'cni', label: 'Carte Nationale d\'Identité', url: c.cni },
    { key: 'permis', label: 'Permis de conduire', url: c.permis_conduire },
    { key: 'vehicule', label: 'Photo du véhicule', url: c.photo_vehicule },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 480, background: C.blanc, zIndex: 301, boxShadow: '-16px 0 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, background: '#EDE9FE', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=6d28d9&textColor=ffffff`} alt="avatar" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>{c.nom}</div>
                <div style={{ fontSize: 11, color: C.violet, fontWeight: 600 }}>⏳ Candidature en attente</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Infos perso */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { l: '📞 Téléphone', v: c.telephone },
              { l: '✉️ Email', v: c.email || '—' },
              { l: '🚗 Gabarit', v: c.gabarit || '—' },
              { l: '🔖 Plaque', v: c.plaque || '—' },
            ].map((r, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 2 }}>{r.l}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{r.v}</div>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.texte, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.04em' }}>Documents à vérifier</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {DOCS.map(doc => (
              <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: docsState[doc.key] ? C.vertClair : C.surface, borderRadius: 10, border: `.5px solid ${docsState[doc.key] ? '#BBF7D0' : C.border}` }}>
                <div style={{ flex: 1 }}>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: C.bleu, textDecoration: 'underline' }}>
                      {doc.label}
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.texteMuted }}>{doc.label} — manquant</span>
                  )}
                </div>
                <button onClick={() => toggleDocVerif(doc.key)} disabled={!doc.url}
                  style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: docsState[doc.key] ? C.vert : C.surface, color: docsState[doc.key] ? '#fff' : C.texteMuted, fontSize: 11, fontWeight: 600, cursor: doc.url ? 'pointer' : 'not-allowed' }}>
                  {docsState[doc.key] ? '✓ Vérifié' : 'Marquer vérifié'}
                </button>
              </div>
            ))}
          </div>

          {!tousVerifies && (
            <div style={{ background: '#FFFBEB', border: `.5px solid #FDE68A`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B45309', marginBottom: 16 }}>
              ⚠️ Tous les documents doivent être marqués vérifiés avant de pouvoir valider la candidature.
            </div>
          )}

          {/* Rejet — champ motif */}
          {showRejetInput && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Motif de rejet *</label>
              <textarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)} placeholder="Expliquez la raison du rejet..."
                style={{ width: '100%', height: 80, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '10px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
{/* Select agence pour chauffeur de type agence */}
{selectedCandidature?.type_chauffeur === 'agence' && (
  <div style={{ marginBottom: 16, padding: '14px 16px', background: '#EEF3FB', borderRadius: 12, border: '.5px solid #BBD0F0' }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#1F3864', marginBottom: 8, textTransform: 'uppercase' }}>
      🏢 Assigner à une agence *
    </div>
    <select
      value={agenceSelectionnee}
      onChange={e => setAgenceSelectionnee(e.target.value)}
      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '.5px solid #BBD0F0', fontSize: 13, color: '#1F3864', background: '#fff', outline: 'none' }}
    >
      <option value="">-- Sélectionner une agence --</option>
      {agences.filter((a: any) => a.is_active).map((a: any) => (
        <option key={a.id} value={a.id}>{a.nom}</option>
      ))}
    </select>
    {!agenceSelectionnee && (
      <div style={{ fontSize: 11, color: '#E02424', marginTop: 6 }}>
        ⚠️ Obligatoire pour valider un chauffeur d'agence
      </div>
    )}
  </div>
)}

        {/* Actions */}
        <div style={{ padding: '16px 24px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          {!showRejetInput ? (
            <>
              <button onClick={() => setShowRejetInput(true)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                ✕ Rejeter
              </button>
              <button onClick={handleValider} disabled={!tousVerifies || loading} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: tousVerifies ? C.vert : C.border, color: '#fff', fontWeight: 700, cursor: tousVerifies ? 'pointer' : 'not-allowed', fontSize: 13 }}>
                {loading ? '...' : '✓ Valider'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowRejetInput(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                Annuler
              </button>
              <button onClick={handleRejeter} disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: C.rouge, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {loading ? '...' : 'Confirmer le rejet'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ModalAjouterChauffeur({ onClose, onSuccess, gabarits }) {
  const [form, setForm] = useState({
    type_chauffeur: 'autonome',
    nom: '', prenom: '', age: '', sexe: 'M',
    telephone: '', email: '', ville: '',
    plaque: '', gabarit: '',
  });
  const [cni, setCni] = useState(null);
  const [permis, setPermis] = useState(null);
  const [photoVehicule, setPhotoVehicule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Champ requis';
    if (!form.prenom.trim()) e.prenom = 'Champ requis';
    if (!form.telephone.trim()) e.telephone = 'Champ requis';
    if (!form.age || isNaN(form.age)) e.age = 'Âge invalide';
    if (!form.gabarit_id) e.gabarit = 'Champ requis';
    if (!cni) e.cni = 'CNI requise';
    if (!permis) e.permis = 'Permis requis';
    if (!photoVehicule) e.photoVehicule = 'Photo requise';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('cni', cni);
      formData.append('permis_conduire', permis);
      formData.append('photo_vehicule', photoVehicule);

      await apiCall(API.CANDIDATURE_CREATE, 'POST', formData, true);
      alert('✅ Candidature créée avec succès.');
      onSuccess();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (key) => ({
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `.5px solid ${errors[key] ? C.rouge : C.border}`,
    fontSize: 13, color: C.texte, outline: 'none',
    background: C.blanc, boxSizing: 'border-box',
    fontFamily: 'inherit',
  });

  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: C.texteMuted,
    textTransform: 'uppercase', letterSpacing: '.04em',
    display: 'block', marginBottom: 5,
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 520, background: C.blanc, zIndex: 301, boxShadow: '-16px 0 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, background: C.vertClair, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.texte }}>+ Ajouter un chauffeur</div>
              <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 3 }}>Soumettre une nouvelle candidature chauffeur</div>
            </div>
            <button onClick={onClose} style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Type chauffeur */}
          <div>
            <label style={labelStyle}>Type de chauffeur *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'autonome', label: '🚗 Autonome' }, { id: 'agence', label: '🏢 Agence' }].map(t => (
                <button key={t.id} onClick={() => handleChange('type_chauffeur', t.id)}
                  style={{ flex: 1, padding: '9px', borderRadius: 9, border: `.5px solid ${form.type_chauffeur === t.id ? C.vert : C.border}`, background: form.type_chauffeur === t.id ? C.vertClair : C.blanc, color: form.type_chauffeur === t.id ? C.vertFonce : C.texte, fontWeight: form.type_chauffeur === t.id ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nom / Prénom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input style={inputStyle('nom')} value={form.nom} onChange={e => handleChange('nom', e.target.value)} placeholder="Nguema" />
              {errors.nom && <span style={{ fontSize: 10, color: C.rouge }}>{errors.nom}</span>}
            </div>
            <div>
              <label style={labelStyle}>Prénom *</label>
              <input style={inputStyle('prenom')} value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} placeholder="Paul" />
              {errors.prenom && <span style={{ fontSize: 10, color: C.rouge }}>{errors.prenom}</span>}
            </div>
          </div>

          {/* Âge / Sexe */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Âge *</label>
              <input style={inputStyle('age')} type="number" value={form.age} onChange={e => handleChange('age', e.target.value)} placeholder="35" min="18" max="70" />
              {errors.age && <span style={{ fontSize: 10, color: C.rouge }}>{errors.age}</span>}
            </div>
            <div>
              <label style={labelStyle}>Sexe *</label>
              <select style={inputStyle('sexe')} value={form.sexe} onChange={e => handleChange('sexe', e.target.value)}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          {/* Téléphone / Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Téléphone *</label>
              <input style={inputStyle('telephone')} value={form.telephone} onChange={e => handleChange('telephone', e.target.value)} placeholder="+237 677 111 222" />
              {errors.telephone && <span style={{ fontSize: 10, color: C.rouge }}>{errors.telephone}</span>}
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle('email')} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="paul@gmail.com" />
            </div>
          </div>

          {/* Ville / Plaque */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Ville</label>
              <input style={inputStyle('ville')} value={form.ville} onChange={e => handleChange('ville', e.target.value)} placeholder="Douala" />
            </div>
            <div>
              <label style={labelStyle}>Plaque</label>
              <input style={inputStyle('plaque')} value={form.plaque} onChange={e => handleChange('plaque', e.target.value)} placeholder="LT-4521-A" />
            </div>
          </div>

          {/* Gabarit */}
          <div>
            <label style={labelStyle}>Type de véhicule (Gabarit) *</label>
            <select style={inputStyle('gabarit')} value={form.gabarit_id} onChange={e => handleChange('gabarit_id', e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {gabarits.map(g => (
                <option key={g.id} value={g.id}>{g.nom} ({g.charge_min} – {g.charge_max} T)</option>
              ))}
            </select>
            {errors.gabarit_id && <span style={{ fontSize: 10, color: C.rouge }}>{errors.gabarit_id}</span>}
          </div>

          {/* Documents */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.texte, textTransform: 'uppercase', letterSpacing: '.04em' }}>Documents *</div>
          {[
            { key: 'cni', label: '🪪 Carte Nationale d\'Identité', setter: setCni, val: cni },
            { key: 'permis', label: '🚗 Permis de conduire', setter: setPermis, val: permis },
            { key: 'photoVehicule', label: '📸 Photo du véhicule', setter: setPhotoVehicule, val: photoVehicule },
          ].map(doc => (
            <div key={doc.key}>
              <label style={labelStyle}>{doc.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: doc.val ? C.vertClair : C.surface, borderRadius: 10, border: `.5px solid ${errors[doc.key] ? C.rouge : doc.val ? '#BBF7D0' : C.border}` }}>
                <span style={{ flex: 1, fontSize: 12, color: doc.val ? C.vertFonce : C.texteMuted }}>
                  {doc.val ? `✓ ${doc.val.name}` : 'Aucun fichier sélectionné'}
                </span>
                <label style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Parcourir
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => doc.setter(e.target.files[0])} />
                </label>
              </div>
              {errors[doc.key] && <span style={{ fontSize: 10, color: C.rouge }}>{errors[doc.key]}</span>}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            {loading ? '⏳ Envoi...' : '✓ Soumettre la candidature'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

const PAR_PAGE = 5;

export default function DriversPage() {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreNiveau, setFiltreNiveau] = useState('tous');
  const [tri, setTri] = useState({ col: 'livraisons', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [gabarits, setGabarits] = useState([]);

  useEffect(() => {
    apiCall<any>(API.DRIVERS)
      .then(data => {
        const liste = Array.isArray(data) ? data : data.results || data.drivers || [];
        setChauffeurs(liste.map(normaliseDriver));
      })
      .catch(err => console.error('Drivers error:', err))
      .finally(() => setLoading(false));
      reloadDrivers();
      apiCall(API.GABARITS)
      .then(data => setGabarits(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
    }, []);


  const filtered = chauffeurs.filter(c => {
    const ms = !search || `${c.nom} ${c.driver_id} ${c.ville} ${c.vehicule}`.toLowerCase().includes(search.toLowerCase());
    const mst = filtreStatut === 'tous' || c.statut === filtreStatut;
    const mniv = filtreNiveau === 'tous' || c.niveau === filtreNiveau;
    return ms && mst && mniv;
  }).sort((a, b) => {
    const va = a[tri.col], vb = b[tri.col];
    return tri.dir === 'desc' ? vb - va : va - vb;
  });

  const paginated = filtered.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const totalPages = Math.ceil(filtered.length / PAR_PAGE);

  const stats = {
    total: chauffeurs.length,
    actifs: chauffeurs.filter(c => c.statut !== 'suspendu').length,
    livraisons_jour: chauffeurs.reduce((s, c) => s + Math.round(c.livraisons / 30), 0),
    note_moy: (chauffeurs.reduce((s, c) => s + c.note, 0) / chauffeurs.length).toFixed(1),
    revenus: chauffeurs.reduce((s, c) => s + c.revenus, 0),
    temps_moy: Math.round(chauffeurs.reduce((s, c) => s + c.temps_moyen, 0) / chauffeurs.length),
    surveillance: chauffeurs.filter(c => c.score_risque >= 40).length,
    alertes: chauffeurs.filter(c => c.alertes_fraude.some(a => a.gravite === 'critique')).length,
  };

  function reloadDrivers() {
  setLoading(true);
  apiCall<any>(API.DRIVERS)
    .then(data => {
      const liste = Array.isArray(data) ? data : data.results || data.drivers || [];
      setChauffeurs(liste.map(normaliseDriver));
    })
    .catch(err => console.error('Drivers error:', err))
    .finally(() => setLoading(false));
}

  function exporterChauffeurs(liste, stats) {
  imprimerRapport({
    titre: 'Rapport Chauffeurs',
    sousTitre: `${liste.length} chauffeur${liste.length > 1 ? 's' : ''} affiché${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '🚖 Détail des chauffeurs',
        colonnes: ['Chauffeur', 'ID', 'Téléphone', 'Véhicule', 'Missions', 'Livraisons', 'Taux réussite', 'Note', 'Revenus', 'Statut'],
        lignes: liste.map(c => [
          c.nom,
          c.driver_id,
          c.telephone,
          c.vehicule,
          c.missions,
          c.livraisons,
          `${c.taux_reussite}%`,
          c.note,
          formatMontantExport(c.revenus),
          c.statut,
        ]),
      },
    ],
  });
}

if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Chargement des chauffeurs...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1350, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🚖 Gestion Chauffeurs
            {stats.alertes > 0 && <span style={{ fontSize: 11, fontWeight: 700, background: C.rouge, color: '#fff', padding: '3px 10px', borderRadius: 20, animation: 'blink 2s infinite' }}>{stats.alertes} ALERTE{stats.alertes > 1 ? 'S' : ''}</span>}
          </h1>
          <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 3 }}>Supervision des chauffeurs, performances, sécurité et activité terrain.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
<RoleGuard module="chauffeurs" action="export">
  <button onClick={() => exporterChauffeurs(filtered, stats)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📥 Exporter CSV</button>
</RoleGuard>
          <button style={{ padding: '8px 14px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📄 Rapport</button>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Ajouter chauffeur</button>
        </div>

        {showAddModal && (
  <ModalAjouterChauffeur
    onClose={() => setShowAddModal(false)}
    onSuccess={() => { setShowAddModal(false); reloadDrivers(); }}
    gabarits={gabarits}
  />
)}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
        <KPICard label="Chauffeurs" valeur={stats.total} icone="🚖" bg={C.bleuClair} color={C.bleu} tendance={3} />
        <KPICard label="Actifs" valeur={stats.actifs} icone="🟢" bg={C.vertClair} color={C.vert} tendance={5} />
        <KPICard label="Livraisons/jour" valeur={stats.livraisons_jour} icone="📦" bg={C.cyanClair} color={C.cyan} tendance={12} />
        <KPICard label="Satisfaction" valeur={`${stats.note_moy}★`} icone="⭐" bg={C.ambreClair} color={C.ambre} />
        <KPICard label="Revenus" valeur={`${(stats.revenus / 1000).toFixed(0)}K F`} icone="💰" bg={C.vertClair} color={C.vert} tendance={8} />
        <KPICard label="Temps moyen" valeur={`${stats.temps_moy} min`} icone="⏱" bg={C.violetClair} color={C.violet} tendance={-6} />
        <KPICard label="Surveillance" valeur={stats.surveillance} icone="⚠️" bg={C.ambreClair} color={C.ambre} />
        <KPICard label="Alertes" valeur={stats.alertes} icone="🚨" bg={C.rougeClair} color={C.rouge} />
      </div>

      {/* Top chauffeurs + Carte GPS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Top chauffeurs */}
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.texte }}>🏆 Top Chauffeurs du mois</div>
          <div>
            {[...chauffeurs].sort((a, b) => b.livraisons - a.livraisons).slice(0, 5).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: i < 4 ? `.5px solid ${C.border}` : 'none', cursor: 'pointer', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelectedDriver(c)}
              >
                <span style={{ fontSize: i < 3 ? 20 : 14, fontWeight: 700, color: C.texteMuted, width: 26, textAlign: 'center', flexShrink: 0 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nom}</div>
                  <div style={{ fontSize: 10, color: C.texteMuted }}>{c.ville} · {c.livraisons} livraisons</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.vert }}>{(c.revenus / 1000).toFixed(0)}K F</div>
                  <Etoiles note={c.note} />
                </div>
                <NiveauBadge niveau={c.niveau} />
              </div>
            ))}
          </div>
        </div>

        {/* Carte GPS + légende */}
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>📡 Suivi Terrain GPS</span>
            <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
              {[
                { n: chauffeurs.filter(c => c.statut === 'en_mission').length, l: 'Mission', color: C.bleu },
                { n: chauffeurs.filter(c => c.statut === 'disponible').length, l: 'Dispo', color: C.vert },
              ].map((s, i) => (
                <span key={i} style={{ fontWeight: 600, color: s.color, background: `${s.color}15`, padding: '2px 8px', borderRadius: 20 }}>{s.n} {s.l}</span>
              ))}
            </div>
          </div>
          <MiniCarteGPS chauffeurs={chauffeurs} />
        </div>
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.texte, marginBottom: 14 }}>📊 Livraisons par jour — 7 jours</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={LIVRAISONS_JOURS} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="count" name="Livraisons" fill={C.vert} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.texte, marginBottom: 14 }}>📍 Par ville</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={VILLES_PERF} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" hide />
              <YAxis dataKey="ville" type="category" tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} width={64} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="livraisons" name="Livraisons" radius={[0, 5, 5, 0]}>
                {VILLES_PERF.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.texte, marginBottom: 14 }}>📊 Statuts</div>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={STATUTS_PIE} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={4} dataKey="value">
                {STATUTS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            {STATUTS_PIE.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: C.texte, flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights IA */}
      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 16, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>🧠 Analyse IA Chauffeurs</span>
          <span style={{ fontSize: 10, background: C.lime, color: '#1a2e05', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {INSIGHTS_IA.map((ins, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '12px 14px', borderLeft: `2px solid ${ins.couleur}`, animation: `fadeInUp 300ms ease ${i * 60}ms both` }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{ins.icone}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: ins.couleur, background: `${ins.couleur}25`, padding: '1px 7px', borderRadius: 20 }}>{ins.tag}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>{ins.texte}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surface, borderRadius: 10, padding: '8px 12px', border: `.5px solid ${C.border}`, flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher nom, ID, ville, véhicule..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: C.texte, outline: 'none', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.texteMuted, fontSize: 14 }}>✕</button>}
        </div>
        <select value={filtreStatut} onChange={e => { setFiltreStatut(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 12, color: C.texte, cursor: 'pointer', outline: 'none' }}>
          <option value="tous">Tous statuts</option>
          <option value="disponible">Disponible</option>
          <option value="en_mission">En mission</option>
          <option value="pause">Pause</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <select value={filtreNiveau} onChange={e => { setFiltreNiveau(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 12, color: C.texte, cursor: 'pointer', outline: 'none' }}>
          <option value="tous">Tous niveaux</option>
          <option value="elite">🥇 Elite</option>
          <option value="premium">🥈 Premium</option>
          <option value="standard">🥉 Standard</option>
          <option value="debutant">⭐ Débutant</option>
        </select>
        <div style={{ fontSize: 12, color: C.texteMuted, marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</div>
      </div>

      {/* Tableau */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {[
                { l: 'Chauffeur', col: null },
                { l: 'Contact', col: null },
                { l: 'Véhicule', col: null },
                { l: 'Missions', col: 'missions' },
                { l: 'Livraisons', col: 'livraisons' },
                { l: 'Taux réussite', col: 'taux_reussite' },
                { l: 'Note', col: 'note' },
                { l: 'Revenus', col: 'revenus' },
                { l: 'Risque IA', col: 'score_risque' },
                { l: 'Statut', col: null },
                { l: 'Niveau', col: null },
                { l: '', col: null },
              ].map((h, i) => (
                <th key={i} onClick={() => h.col && (() => { setTri(p => ({ col: h.col, dir: p.col === h.col && p.dir === 'desc' ? 'asc' : 'desc' })); setPage(1); })()}
                  style={{ padding: '10px 10px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', cursor: h.col ? 'pointer' : 'default' }}>
                  {h.l}{h.col && <span style={{ marginLeft: 3, opacity: tri.col === h.col ? 1 : 0.3 }}>{tri.col === h.col ? (tri.dir === 'desc' ? '↓' : '↑') : '↕'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={12} style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🚖</div>
                <div>Aucun chauffeur trouvé</div>
              </td></tr>
            ) : paginated.map((c, i) => (
              <tr key={c.id}
                style={{ borderBottom: `.5px solid ${C.border}`, transition: 'background 150ms', cursor: 'pointer', background: c.statut === 'suspendu' ? '#FEF2F2' : c.alertes_fraude.length > 0 ? '#FFFBEB' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = c.statut === 'suspendu' ? '#FEF2F2' : c.alertes_fraude.length > 0 ? '#FFFBEB' : 'transparent'}
              >
                <td style={{ padding: '11px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ position: 'relative' }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: STATUT_CFG[c.statut]?.dot || C.vert, border: '1.5px solid #fff' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{c.nom}</div>
                      <div style={{ fontSize: 9, color: C.vert, fontFamily: 'monospace', fontWeight: 600 }}>{c.driver_id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 10px' }}>
                  <div style={{ fontSize: 11, color: C.texte }}>{c.telephone}</div>
                  <div style={{ fontSize: 10, color: C.texteMuted }}>{c.ville}</div>
                </td>
                <td style={{ padding: '11px 10px' }}>
                  <div style={{ fontSize: 11, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{c.vehicule}</div>
                  <div style={{ fontSize: 9, color: C.texteMuted, fontFamily: 'monospace' }}>{c.plaque}</div>
                </td>
                <td style={{ padding: '11px 10px', fontSize: 13, fontWeight: 700, color: C.texte, textAlign: 'center' }}>{c.missions}</td>
                <td style={{ padding: '11px 10px', fontSize: 13, fontWeight: 700, color: C.texte, textAlign: 'center' }}>{c.livraisons}</td>
                <td style={{ padding: '11px 10px', minWidth: 110 }}><TauxBarre taux={c.taux_reussite} /></td>
                <td style={{ padding: '11px 10px' }}><Etoiles note={c.note} /></td>
                <td style={{ padding: '11px 10px', fontSize: 12, fontWeight: 700, color: C.vert }}>{(c.revenus / 1000).toFixed(0)}K F</td>
                <td style={{ padding: '11px 10px' }}><RisqueBadge score={c.score_risque} /></td>
                <td style={{ padding: '11px 10px' }}><StatutBadge statut={c.statut} /></td>
                <td style={{ padding: '11px 10px' }}><NiveauBadge niveau={c.niveau} /></td>
                <td style={{ padding: '11px 10px' }}>
                  <button onClick={() => c.statut === 'en_attente' ? setSelectedCandidature(c) : setSelectedDriver(c)} style={{ padding: '5px 10px', borderRadius: 7, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Voir →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '12px 16px', borderTop: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.texteMuted }}>{filtered.length} chauffeur{filtered.length > 1 ? 's' : ''} · Page {page}/{Math.max(totalPages, 1)}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: page === 1 ? C.texteMuted : C.texte, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Précédent</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: p === page ? C.vert : C.surface, color: p === page ? '#fff' : C.texteMuted, cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 600 : 400 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: page >= totalPages ? C.texteMuted : C.texte, cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 12 }}>Suivant →</button>
          </div>
        </div>
      </div>

      {/* Modal chauffeur */}
      <ModalCandidature
  candidature={selectedCandidature}
  onClose={() => setSelectedCandidature(null)}
  onActionDone={() => { setSelectedCandidature(null); reloadDrivers(); }}
/>
    </div>
  );
}