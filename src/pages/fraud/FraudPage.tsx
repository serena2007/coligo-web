// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { formatMontant } from '../../data/mockData';
import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';
const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#F0FDF4',
  lime: '#84CC16', limeClair: '#F7FEE7',
  rouge: '#EF4444', rougeClair: '#FEF2F2',
  ambre: '#F59E0B', ambreClair: '#FFFBEB',
  bleu: '#3B82F6', bleuClair: '#EFF6FF',
  violet: '#8B5CF6', violetClair: '#EDE9FE',
  texte: '#0F172A', texteMuted: '#94A3B8',
  border: '#E2E8F0', surface: '#F8FAFC', blanc: '#fff',
  dark: '#0F172A', darkCard: '#1E293B',
};

// ── DONNÉES ───────────────────────────────────────────────────
const ALERTES = [
  {
    id: 1, type: 'Faux GPS', severite: 'critique', score: 94,
    utilisateur: { nom: 'Eric Bouka', role: 'chauffeur', driver_id: 'T-033', avatar: 'EB', telephone: '+237 655 555 666', ville: 'Douala', date_inscription: '2025-07-20', nb_courses: 203, note: 4.7 },
    description: 'Téléportation GPS détectée — déplacement de 12 km en 30 secondes physiquement impossible',
    heure: 'il y a 4 min', statut: 'non_traite',
    incidents_precedents: 2,
    score_confiance: 12,
    timeline: [
      { heure: '08:14:23', event: 'Position GPS : Akwa (4.0511, 9.7679)', type: 'normal' },
      { heure: '08:14:53', event: 'Position GPS : Logbessou (4.1234, 9.8456) — 12.3 km en 30s', type: 'anomalie' },
      { heure: '08:15:10', event: 'Alerte automatique déclenchée par système', type: 'alerte' },
      { heure: '08:15:45', event: 'Course EXP-014 acceptée depuis position suspecte', type: 'anomalie' },
    ],
    historique_gps: [
      { lat: 4.0511, lng: 9.7679, heure: '08:14', normal: true },
      { lat: 4.1234, lng: 9.8456, heure: '08:14+30s', normal: false },
      { lat: 4.0890, lng: 9.8123, heure: '08:15', normal: true },
    ],
    historique_courses: [
      { id: 'EXP-007', statut: 'livree', montant: 500, date: '06/06/2026' },
      { id: 'EXP-003', statut: 'livree', montant: 2000, date: '05/06/2026' },
      { id: 'EXP-014', statut: 'en_cours', montant: 1200, date: '06/06/2026' },
    ],
  },
  {
    id: 2, type: 'Multi-compte', severite: 'haute', score: 78,
    utilisateur: { nom: 'Samuel Kotto', role: 'client', driver_id: null, avatar: 'SK', telephone: '+237 688 012 345', ville: 'Douala', date_inscription: '2025-12-14', nb_courses: 12, note: 3.2 },
    description: '3 comptes différents créés depuis le même appareil (IMEI identique) — comportement de fraude en cascade',
    heure: 'il y a 18 min', statut: 'surveillance',
    incidents_precedents: 1,
    score_confiance: 28,
    timeline: [
      { heure: '07:45:00', event: 'Compte #1 créé (email1@gmail.com)', type: 'normal' },
      { heure: '07:52:00', event: 'Compte #2 créé depuis même IMEI (email2@yahoo.fr)', type: 'anomalie' },
      { heure: '08:01:00', event: 'Compte #3 créé depuis même IMEI (email3@outlook.com)', type: 'anomalie' },
      { heure: '08:14:00', event: 'Tentative de paiement depuis 3 comptes simultanément', type: 'alerte' },
    ],
    historique_gps: [],
    historique_courses: [
      { id: 'EXP-005', statut: 'annulee', montant: 0, date: '05/06/2026' },
      { id: 'EXP-008', statut: 'livree', montant: 1200, date: '06/06/2026' },
    ],
  },
  {
    id: 3, type: 'Annulations abusives', severite: 'moyenne', score: 61,
    utilisateur: { nom: 'Amina Diallo', role: 'client', driver_id: null, avatar: 'AD', telephone: '+237 655 234 567', ville: 'Douala', date_inscription: '2026-04-01', nb_courses: 0, note: null },
    description: '7 annulations consécutives après assignation chauffeur — pattern suspect de test de disponibilité',
    heure: 'il y a 1h 12min', statut: 'en_cours',
    incidents_precedents: 0,
    score_confiance: 45,
    timeline: [
      { heure: '06:30:00', event: 'EXP-010 créée puis annulée (chauffeur assigné)', type: 'anomalie' },
      { heure: '06:45:00', event: 'EXP-011 créée puis annulée (chauffeur assigné)', type: 'anomalie' },
      { heure: '07:00:00', event: 'EXP-012 créée puis annulée (chauffeur assigné)', type: 'anomalie' },
      { heure: '07:15:00', event: 'Seuil d\'alerte atteint — 5 annulations consécutives', type: 'alerte' },
    ],
    historique_gps: [],
    historique_courses: [],
  },
  {
    id: 4, type: 'OTP partagé', severite: 'moyenne', score: 52,
    utilisateur: { nom: 'Paul Nguema', role: 'chauffeur', driver_id: 'T-014', avatar: 'PN', telephone: '+237 677 111 222', ville: 'Douala', date_inscription: '2025-08-15', nb_courses: 142, note: 4.9 },
    description: 'Code OTP EXP-007 utilisé depuis une adresse IP différente de la position GPS du chauffeur',
    heure: 'il y a 3h 40min', statut: 'resolu',
    incidents_precedents: 0,
    score_confiance: 72,
    timeline: [
      { heure: '05:10:00', event: 'OTP généré pour EXP-007', type: 'normal' },
      { heure: '05:42:00', event: 'OTP validé depuis IP 102.231.45.12 (Yaoundé)', type: 'anomalie' },
      { heure: '05:43:00', event: 'Position GPS chauffeur : Douala — incohérence IP', type: 'alerte' },
    ],
    historique_gps: [],
    historique_courses: [
      { id: 'EXP-007', statut: 'livree', montant: 500, date: '06/06/2026' },
    ],
  },
];

const SURVEILLES = [
  { id: 1, nom: 'Samuel Kotto', role: 'client', avatar: 'SK', score: 28, depuis: '3 jours', incidents: 3, statut: 'haute_vigilance', derniere_activite: 'il y a 2h' },
  { id: 2, nom: 'Amina Diallo', role: 'client', avatar: 'AD', score: 45, depuis: '1 jour', incidents: 1, statut: 'surveillance', derniere_activite: 'il y a 1h' },
  { id: 3, nom: 'Eric Bouka', role: 'chauffeur', avatar: 'EB', score: 12, depuis: '2 heures', incidents: 2, statut: 'haute_vigilance', derniere_activite: 'il y a 4 min' },
];

const HISTORIQUE_DECISIONS = [
  { id: 1, date: '06/06/2026 08:15', type: 'Faux GPS', utilisateur: 'T-033 Eric Bouka', decision: 'Mise sous surveillance', admin: 'Super Admin', motif: 'Premier incident — surveillance préventive' },
  { id: 2, date: '05/06/2026 14:30', type: 'Multi-compte', utilisateur: 'Client #8 Samuel Kotto', decision: 'Compte suspendu temporairement', admin: 'Admin Opérationnel', motif: '3 comptes créés depuis même appareil' },
  { id: 3, date: '04/06/2026 11:00', type: 'OTP partagé', utilisateur: 'T-041 Samuel Kotto', decision: 'Ignoré — faux positif', admin: 'Super Admin', motif: 'Enquête conclut à une erreur de géolocalisation IP' },
  { id: 4, date: '03/06/2026 09:45', type: 'Annulations abusives', utilisateur: 'Client #5 Amina Diallo', decision: 'Avertissement envoyé', admin: 'Admin Opérationnel', motif: 'Premier avertissement — comportement signalé' },
];

// ── COMPOSANTS ────────────────────────────────────────────────

function ScoreGauge({ score, size = 80 }) {
  const color = score >= 80 ? C.rouge : score >= 60 ? C.ambre : score >= 40 ? '#F59E0B' : C.vert;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 8} fill="none" stroke={C.border} strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 8} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 60 ? 18 : 13, fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: 9, color: C.texteMuted }}>risque</span>
      </div>
    </div>
  );
}

function SeveriteBadge({ severite }) {
  const cfg = {
    critique: { label: '🔴 Critique', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
    haute: { label: '🟠 Haute', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    moyenne: { label: '🟡 Moyenne', bg: '#FEFCE8', color: '#854D0E', border: '#FEF08A' },
    faible: { label: '🟢 Faible', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  }[severite] || { label: severite, bg: C.surface, color: C.texteMuted, border: C.border };
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `.5px solid ${cfg.border}` }}>{cfg.label}</span>;
}

function StatutBadge({ statut }) {
  const cfg = {
    non_traite: { label: '⚡ Non traité', bg: '#FEF2F2', color: C.rouge },
    surveillance: { label: '👁 Surveillance', bg: '#FFFBEB', color: C.ambre },
    en_cours: { label: '🔄 En cours', bg: '#EFF6FF', color: C.bleu },
    resolu: { label: '✓ Résolu', bg: '#F0FDF4', color: C.vert },
  }[statut] || { label: statut, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function Timeline({ events }) {
  const typeConfig = {
    normal: { color: C.vert, bg: C.vertClair },
    anomalie: { color: C.ambre, bg: C.ambreClair },
    alerte: { color: C.rouge, bg: C.rougeClair },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((e, i) => {
        const tc = typeConfig[e.type] || typeConfig.normal;
        return (
          <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: tc.color, border: `2px solid ${tc.color}40`, flexShrink: 0, marginTop: 14 }} />
              {i < events.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.border, minHeight: 20 }} />}
            </div>
            <div style={{ padding: '10px 0', flex: 1 }}>
              <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 2, fontFamily: 'monospace' }}>{e.heure}</div>
              <div style={{ fontSize: 12, color: e.type === 'normal' ? C.texte : e.type === 'anomalie' ? C.ambre : C.rouge, fontWeight: e.type !== 'normal' ? 600 : 400, background: e.type !== 'normal' ? tc.bg : 'transparent', padding: e.type !== 'normal' ? '4px 8px' : '0', borderRadius: 6 }}>
                {e.type === 'anomalie' ? '⚠ ' : e.type === 'alerte' ? '🚨 ' : ''}{e.event}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CarteAnomaliesGPS({ alerte }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0d1b0d';
    ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 30) { ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (alerte.historique_gps?.length > 1) {
      const points = alerte.historique_gps.map((p, i) => ({ x: 40 + i * 120, y: H / 2 + (Math.random() - 0.5) * 60, normal: p.normal }));
      ctx.strokeStyle = 'rgba(34,197,94,.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);
      points.forEach((p, i) => {
        const color = p.normal ? C.vert : C.rouge;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.normal ? 6 : 10, 0, Math.PI * 2);
        ctx.fillStyle = color + '40';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.normal ? 4 : 7, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (!p.normal) {
          ctx.strokeStyle = C.rouge;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('!', p.x, p.y + 4);
        }
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(alerte.historique_gps[i]?.heure || '', p.x, p.y + 22);
      });
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Pas de données GPS disponibles', W / 2, H / 2);
    }
  }, [alerte]);
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} width={440} height={140} style={{ width: '100%', height: 140, display: 'block' }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 8 }}>
        {[{ c: C.vert, l: 'Normal' }, { c: C.rouge, l: 'Anomalie' }].map(i => (
          <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.6)', padding: '2px 8px', borderRadius: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: i.c }} />
            <span style={{ fontSize: 9, color: '#fff' }}>{i.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DRAWER PROFIL ─────────────────────────────────────────────
function DrawerProfil({ alerte, onClose, onAction }) {
  const [onglet, setOnglet] = useState('overview');
  const [motifAction, setMotifAction] = useState('');
  const [showActionInput, setShowActionInput] = useState(null);
  if (!alerte) return null;
  const u = alerte.utilisateur;
  const scoreConfianceColor = alerte.score_confiance >= 70 ? C.vert : alerte.score_confiance >= 40 ? C.ambre : C.rouge;

  const ONGLETS = [
    { id: 'overview', label: '📊 Vue d\'ensemble' },
    { id: 'gps', label: '🗺️ Carte GPS' },
    { id: 'courses', label: '📦 Historique courses' },
    { id: 'incidents', label: '🚨 Incidents' },
    { id: 'actions', label: '⚡ Actions' },
  ];

  const ACTIONS = [
    { id: 'ignorer', label: 'Ignorer — faux positif', icone: '✓', color: C.vert, bg: C.vertClair },
    { id: 'surveillance', label: 'Mettre sous surveillance', icone: '👁', color: C.ambre, bg: C.ambreClair },
    { id: 'suspendre', label: 'Suspendre temporairement', icone: '⏸', color: C.ambre, bg: C.ambreClair },
    { id: 'bloquer', label: 'Bloquer le compte', icone: '🚫', color: C.rouge, bg: C.rougeClair },
    { id: 'escalader', label: 'Escalader admin senior', icone: '↑', color: C.violet, bg: C.violetClair },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 540, background: C.blanc, zIndex: 201, boxShadow: '-20px 0 60px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header drawer */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, background: alerte.severite === 'critique' ? '#FEF2F2' : alerte.severite === 'haute' ? '#FFFBEB' : C.blanc, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${alerte.severite === 'critique' ? C.rouge : C.border}`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>{u.nom}</span>
                {u.driver_id && <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: C.vert, background: C.vertClair, padding: '1px 7px', borderRadius: 6 }}>{u.driver_id}</span>}
                <span style={{ fontSize: 11, color: C.texteMuted, background: C.surface, padding: '1px 8px', borderRadius: 20, border: `.5px solid ${C.border}` }}>
                  {u.role === 'chauffeur' ? '🚕 Chauffeur' : '👤 Client'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 4 }}>{u.telephone} · 📍 {u.ville}</div>
            </div>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 16, color: C.texteMuted, flexShrink: 0 }}>✕</button>
          </div>

          {/* Scores header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ background: C.blanc, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: alerte.score >= 80 ? C.rouge : alerte.score >= 60 ? C.ambre : C.vert }}>{alerte.score}</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>Score risque</div>
            </div>
            <div style={{ background: C.blanc, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: scoreConfianceColor }}>{alerte.score_confiance}%</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>Confiance</div>
            </div>
            <div style={{ background: C.blanc, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: alerte.incidents_precedents > 0 ? C.rouge : C.vert }}>{alerte.incidents_precedents}</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>Incidents</div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', borderBottom: `.5px solid ${C.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: onglet === o.id ? 600 : 400, color: onglet === o.id ? C.vert : C.texteMuted, borderBottom: onglet === o.id ? `2px solid ${C.vert}` : '2px solid transparent', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu drawer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* VUE D'ENSEMBLE */}
          {onglet === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Alerte */}
              <div style={{ background: alerte.severite === 'critique' ? '#FEF2F2' : '#FFFBEB', border: `.5px solid ${alerte.severite === 'critique' ? '#FECACA' : '#FDE68A'}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <SeveriteBadge severite={alerte.severite} />
                  <span style={{ fontSize: 12, color: C.texteMuted }}>{alerte.heure}</span>
                </div>
                <div style={{ fontSize: 13, color: C.texte, fontWeight: 500 }}>{alerte.description}</div>
              </div>

              {/* Infos utilisateur */}
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Profil utilisateur</div>
                {[
                  { label: 'Rôle', val: u.role === 'chauffeur' ? '🚕 Chauffeur' : '👤 Client' },
                  { label: 'Membre depuis', val: new Date(u.date_inscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                  { label: u.role === 'chauffeur' ? 'Courses effectuées' : 'Expéditions', val: u.nb_courses },
                  { label: 'Note', val: u.note ? `⭐ ${u.note}` : '—' },
                  { label: 'Incidents passés', val: alerte.incidents_precedents > 0 ? `🚨 ${alerte.incidents_precedents} incident(s)` : '✓ Aucun' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `.5px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: '14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Timeline des événements</div>
                <Timeline events={alerte.timeline} />
              </div>
            </div>
          )}

          {/* CARTE GPS */}
          {onglet === 'gps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Visualisation des anomalies GPS
                </div>
                <div style={{ padding: 12 }}>
                  <CarteAnomaliesGPS alerte={alerte} />
                </div>
              </div>
              {alerte.type === 'Faux GPS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Vitesse détectée', val: '1 480 km/h', anomalie: true },
                    { label: 'Distance déplacée', val: '12.3 km', anomalie: false },
                    { label: 'Durée', val: '30 secondes', anomalie: true },
                    { label: 'Vitesse max physique', val: '< 120 km/h en ville', anomalie: false },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: r.anomalie ? '#FEF2F2' : C.surface, borderRadius: 8, border: `.5px solid ${r.anomalie ? '#FECACA' : C.border}` }}>
                      <span style={{ fontSize: 12, color: C.texteMuted }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.anomalie ? C.rouge : C.texte }}>{r.val} {r.anomalie ? '⚠' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
              {alerte.historique_gps.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: C.texteMuted, background: C.surface, borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
                  <div>Pas de données GPS pour ce type d'alerte</div>
                </div>
              )}
            </div>
          )}

          {/* HISTORIQUE COURSES */}
          {onglet === 'courses' && (
            <div>
              {alerte.historique_courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: C.texteMuted, background: C.surface, borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                  <div>Aucune course dans l'historique</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {alerte.historique_courses.map((c, i) => {
                    const sc = { livree: { label: 'Livrée', color: C.vert, bg: '#DCFCE7' }, annulee: { label: 'Annulée', color: C.rouge, bg: '#FEE2E2' }, en_cours: { label: 'En cours', color: C.bleu, bg: '#DBEAFE' } }[c.statut] || { label: c.statut, color: C.texteMuted, bg: C.surface };
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}` }}>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: C.texte, flex: 1 }}>#{c.id}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.vert }}>{c.montant > 0 ? formatMontant(c.montant) : '—'}</span>
                        <span style={{ fontSize: 11, color: C.texteMuted }}>{c.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INCIDENTS */}
          {onglet === 'incidents' && (
            <div>
              {alerte.incidents_precedents === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: C.vertClair, borderRadius: 12, border: `.5px solid #BBF7D0` }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.vert }}>Aucun incident antérieur</div>
                  <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 4 }}>Premier signalement pour cet utilisateur</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Array.from({ length: alerte.incidents_precedents }).map((_, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: '#FEF2F2', borderRadius: 10, border: `.5px solid #FECACA`, borderLeft: `3px solid ${C.rouge}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.rouge, marginBottom: 4 }}>Incident #{i + 1} — {i === 0 ? 'Faux GPS' : 'Vitesse anormale'}</div>
                      <div style={{ fontSize: 11, color: C.texteMuted }}>{i === 0 ? 'il y a 3 jours' : 'il y a 1 semaine'} · Résolu par surveillance</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIONS */}
          {onglet === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#FFFBEB', border: `.5px solid #FDE68A`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B45309' }}>
                ⚠️ Chaque action est enregistrée dans le journal d'audit et notifiée à l'utilisateur concerné.
              </div>
              {ACTIONS.map(a => (
                <div key={a.id}>
                  <button onClick={() => setShowActionInput(showActionInput === a.id ? null : a.id)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: showActionInput === a.id ? a.bg : C.blanc, color: a.color, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'all 150ms' }}>
                    <span style={{ fontSize: 16 }}>{a.icone}</span>
                    <span style={{ flex: 1 }}>{a.label}</span>
                    <span style={{ fontSize: 12 }}>{showActionInput === a.id ? '▲' : '▼'}</span>
                  </button>
                  {showActionInput === a.id && (
                    <div style={{ padding: '12px', background: a.bg, borderRadius: '0 0 10px 10px', border: `.5px solid ${C.border}`, borderTop: 'none' }}>
                      <textarea value={motifAction} onChange={e => setMotifAction(e.target.value)}
                        placeholder="Motif de cette action (optionnel)..."
                        style={{ width: '100%', height: 70, borderRadius: 8, border: `.5px solid ${C.border}`, padding: '8px 10px', fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'inherit', background: C.blanc, boxSizing: 'border-box' }} />
                      <button onClick={() => { onAction(alerte.id, a.id, motifAction); setShowActionInput(null); setMotifAction(''); }}
                        style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, border: 'none', background: a.color, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Confirmer : {a.label}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────
export default function FraudPage() {
  const [onglet, setOnglet] = useState('alertes');
  const [alertes, setAlertes] = useState(ALERTES);
  const [selectedAlerte, setSelectedAlerte] = useState(null);
  const [pulseAnim, setPulseAnim] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulseAnim(p => !p), 1500);
    return () => clearInterval(interval);
  }, []);

  const alertesActives = alertes.filter(a => a.statut !== 'resolu');
  const alertesCritiques = alertes.filter(a => a.severite === 'critique' && a.statut !== 'resolu');
  const alertesMoyennes = alertes.filter(a => ['moyenne', 'haute'].includes(a.severite) && a.statut !== 'resolu');
  const alertesResolues = alertes.filter(a => a.statut === 'resolu');
  const scoreRisqueGlobal = Math.round(alertes.reduce((s, a) => s + a.score, 0) / alertes.length);

  const ONGLETS = [
    { id: 'alertes', label: '🚨 Alertes actives', count: alertesActives.length },
    { id: 'surveillance', label: '👁 Sous surveillance', count: SURVEILLES.length },
    { id: 'historique', label: '📋 Historique & décisions', count: null },
  ];

  function handleAction(alerteId, action, motif) {
    setAlertes(prev => prev.map(a => a.id === alerteId ? {
      ...a,
      statut: action === 'ignorer' ? 'resolu' : action === 'surveillance' ? 'surveillance' : action === 'bloquer' || action === 'suspendre' ? 'resolu' : a.statut,
    } : a));
    setSelectedAlerte(null);
  }

  function exporterFraude(liste) {
  imprimerRapport({
    titre: 'Rapport Sécurité & Fraude',
    sousTitre: `${liste.length} alerte${liste.length > 1 ? 's' : ''} active${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '🚨 Alertes actives',
        colonnes: ['Type', 'Utilisateur', 'Rôle', 'Score risque', 'Sévérité', 'Statut', 'Description'],
        lignes: liste.map(a => [
          a.type,
          a.utilisateur.nom,
          a.utilisateur.role,
          a.score,
          a.severite,
          a.statut,
          a.description,
        ]),
      },
    ],
  });
}

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.05)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🛡️ Centre de Sécurité & Fraude
            {alertesCritiques.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, background: C.rouge, color: '#fff', padding: '3px 10px', borderRadius: 20, animation: 'blink 1.5s infinite' }}>
                {alertesCritiques.length} CRITIQUE{alertesCritiques.length > 1 ? 'S' : ''}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>Surveillance temps réel · Détection automatique · Données simulées</p>
        </div>
        <button onClick={() => exporterFraude(alertesActives)} style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>📥 Rapport sécurité</button>      </div>

      {/* Score risque global — Section IA style */}
      <div style={{ background: '#052E16', borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ScoreGauge score={scoreRisqueGlobal} size={90} />
          <div>
            <div style={{ fontSize: 11, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Score de risque global · Plateforme</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
              {scoreRisqueGlobal >= 80 ? 'ÉLEVÉ' : scoreRisqueGlobal >= 60 ? 'MODÉRÉ' : 'FAIBLE'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Mis à jour en temps réel</div>
          </div>
        </div>

        <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,.1)', flexShrink: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flex: 1 }}>
          {[
            { label: 'Alertes critiques', val: alertesCritiques.length, color: C.rouge, animate: alertesCritiques.length > 0 },
            { label: 'Alertes moyennes', val: alertesMoyennes.length, color: C.ambre, animate: false },
            { label: 'Résolues', val: alertesResolues.length, color: '#4ADE80', animate: false },
            { label: 'Taux fraude', val: '1.6%', color: '#4ADE80', animate: false },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, animation: s.animate ? 'blink 1.5s infinite' : 'none' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,.1)', flexShrink: 0 }} />

        {/* Évolution 30j mini */}
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 10, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Évolution 30j</div>
          <svg width={120} height={40}>
            {[24, 18, 35, 22, 41, 28, 36, 30, 45, 38, 52, 44, 38, 47, 42, 36, 52, 48, 56, 44, 50, 46, 42, 38, 44, 40, 36, 48, 52, scoreRisqueGlobal].map((v, i, arr) => {
              const x = (i / (arr.length - 1)) * 110 + 5;
              const y = 35 - (v / 100) * 30;
              const prev = i > 0 ? arr[i - 1] : v;
              const prevX = ((i - 1) / (arr.length - 1)) * 110 + 5;
              const prevY = 35 - (prev / 100) * 30;
              return i > 0 ? <line key={i} x1={prevX} y1={prevY} x2={x} y2={y} stroke="#4ADE80" strokeWidth="1.5" opacity=".7" /> : null;
            })}
          </svg>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            {o.label}
            {o.count !== null && o.count > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: onglet === o.id ? 'rgba(255,255,255,.25)' : (o.id === 'alertes' && o.count > 0 ? C.rouge : C.surface), color: onglet === o.id ? '#fff' : (o.id === 'alertes' ? '#fff' : C.texteMuted) }}>
                {o.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ALERTES ACTIVES ── */}
      {onglet === 'alertes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alertesActives.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: C.vertClair, borderRadius: 16, border: `.5px solid #BBF7D0` }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🛡️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.vert }}>Aucune alerte active</div>
              <div style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>La plateforme est sécurisée</div>
            </div>
          ) : alertesActives.map(alerte => (
            <div key={alerte.id}
              onClick={() => setSelectedAlerte(alerte)}
              style={{
                background: C.blanc,
                border: `.5px solid ${alerte.severite === 'critique' ? '#FECACA' : alerte.severite === 'haute' ? '#FDE68A' : C.border}`,
                borderRadius: 14, padding: '16px 20px',
                cursor: 'pointer', transition: 'all 150ms',
                borderLeft: `4px solid ${alerte.severite === 'critique' ? C.rouge : alerte.severite === 'haute' ? C.ambre : '#F59E0B'}`,
                boxShadow: alerte.severite === 'critique' ? '0 2px 12px rgba(239,68,68,.1)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = alerte.severite === 'critique' ? '0 2px 12px rgba(239,68,68,.1)' : 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* Score */}
                <ScoreGauge score={alerte.score} size={56} />

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>{alerte.type}</span>
                    <SeveriteBadge severite={alerte.severite} />
                    <StatutBadge statut={alerte.statut} />
                    <span style={{ fontSize: 11, color: C.texteMuted, marginLeft: 'auto' }}>{alerte.heure}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${alerte.utilisateur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{alerte.utilisateur.nom}</span>
                    {alerte.utilisateur.driver_id && <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.vert }}>{alerte.utilisateur.driver_id}</span>}
                    <span style={{ fontSize: 11, color: C.texteMuted, background: C.surface, padding: '1px 8px', borderRadius: 20 }}>{alerte.utilisateur.role}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.texteMuted, lineHeight: 1.5 }}>{alerte.description}</div>
                </div>

                {/* Actions rapides */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedAlerte(alerte)} style={{ padding: '6px 14px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Voir profil →
                  </button>
                  <button onClick={() => handleAction(alerte.id, 'ignorer', '')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.vertClair, color: C.vert, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    ✓ Ignorer
                  </button>
                  <button onClick={() => handleAction(alerte.id, 'bloquer', '')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#FEF2F2', color: C.rouge, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    🚫 Bloquer
                  </button>
                </div>
              </div>

              {/* Barre progression confiance */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `.5px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: C.texteMuted }}>Score de confiance utilisateur</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: alerte.score_confiance >= 70 ? C.vert : alerte.score_confiance >= 40 ? C.ambre : C.rouge }}>{alerte.score_confiance}%</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${alerte.score_confiance}%`, height: '100%', background: alerte.score_confiance >= 70 ? C.vert : alerte.score_confiance >= 40 ? C.ambre : C.rouge, borderRadius: 10 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SOUS SURVEILLANCE ── */}
      {onglet === 'surveillance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {SURVEILLES.map(s => (
            <div key={s.id} style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${s.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${s.score < 30 ? C.rouge : s.score < 50 ? C.ambre : C.border}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>{s.nom}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>{s.role} · Depuis {s.depuis}</div>
                </div>
                <ScoreGauge score={100 - s.score} size={44} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Score confiance', val: `${s.score}%`, color: s.score < 30 ? C.rouge : s.score < 50 ? C.ambre : C.vert },
                  { label: 'Incidents', val: s.incidents, color: s.incidents > 0 ? C.rouge : C.vert },
                  { label: 'Statut', val: s.statut === 'haute_vigilance' ? '🔴 Haute vigilance' : '🟡 Surveillance', color: s.statut === 'haute_vigilance' ? C.rouge : C.ambre },
                  { label: 'Dernière activité', val: s.derniere_activite, color: C.texteMuted },
                ].map((item, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 8, padding: '8px 10px', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: C.vertClair, color: C.vertFonce, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✓ Lever surveillance</button>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#FEF2F2', color: C.rouge, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>🚫 Bloquer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORIQUE & DÉCISIONS ── */}
      {onglet === 'historique' && (
        <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.texte }}>Journal des décisions administrateur</span>
            <button style={{ fontSize: 11, color: C.vert, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>📥 Exporter</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['Date', 'Type fraude', 'Utilisateur', 'Décision', 'Admin', 'Motif'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORIQUE_DECISIONS.map((h, i) => (
                <tr key={h.id} style={{ borderBottom: `.5px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', fontSize: 11, color: C.texteMuted, whiteSpace: 'nowrap' }}>{h.date}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FEF2F2', color: C.rouge }}>{h.type}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 500, color: C.texte }}>{h.utilisateur}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: h.decision.includes('suspendu') || h.decision.includes('Bloqué') ? '#FEF2F2' : h.decision.includes('surveillance') ? '#FFFBEB' : h.decision.includes('Ignoré') ? '#F0FDF4' : '#EFF6FF', color: h.decision.includes('suspendu') || h.decision.includes('Bloqué') ? C.rouge : h.decision.includes('surveillance') ? C.ambre : h.decision.includes('Ignoré') ? C.vert : C.bleu }}>
                      {h.decision}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: C.texteMuted }}>{h.admin}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: C.texteMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.motif}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer profil */}
      <DrawerProfil alerte={selectedAlerte} onClose={() => setSelectedAlerte(null)} onAction={handleAction} />
    </div>
  );
}