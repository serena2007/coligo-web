// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatMontant } from '../../data/mockData';
import CarteGPSLeaflet from './CarteGPSLeaflet'; // ⚠️ adaptez le chemin selon où vous placez le fichier

const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#F0FDF4',
  lime: '#84CC16', limeClair: '#F7FEE7',
  rouge: '#EF4444', rougeClair: '#FEF2F2',
  ambre: '#F59E0B', ambreClair: '#FFFBEB',
  bleu: '#3B82F6', bleuClair: '#EFF6FF',
  violet: '#8B5CF6', violetClair: '#EDE9FE',
  cyan: '#06B6D4',
  texte: '#0F172A', texteMuted: '#94A3B8',
  border: '#E2E8F0', surface: '#F8FAFC', blanc: '#fff',
  ia: '#052E16', iaBord: '#166534',
  mapDark: '#0a0f0a',
};

// ── DONNÉES ───────────────────────────────────────────────────

const CHAUFFEURS_GPS = [
  // { id: 1, driver_id: 'T-014', nom: 'Paul Nguema', avatar: 'PN', statut: 'en_mission', lat: 0.38, lng: 0.42, vitesse: 45, cap: 85, plaque: 'LT-4521-A', gabarit: 'Fourgonnette compacte', telephone: '+237 677 111 222', score_perf: 96, score_fiab: 98, risque: 8, mission_id: 'EXP-002', destination: 'Bassa, Douala', eta: '14 min', distance_restante: '5.2 km', trail: [[0.28, 0.30], [0.31, 0.34], [0.34, 0.38], [0.38, 0.42]] },
  // { id: 2, driver_id: 'T-011', nom: 'Claire Ndong', avatar: 'CN', statut: 'disponible', lat: 0.55, lng: 0.30, vitesse: 0, cap: 0, plaque: 'LT-1234-F', gabarit: 'Grand fourgon', telephone: '+237 691 111 333', score_perf: 94, score_fiab: 96, risque: 6, mission_id: null, destination: null, eta: null, distance_restante: null, trail: [] },
  // { id: 3, driver_id: 'T-027', nom: 'Jean Tamba', avatar: 'JT', statut: 'en_mission', lat: 0.65, lng: 0.60, vitesse: 38, cap: 200, plaque: 'CE-7823-B', gabarit: 'Petite voiture', telephone: '+237 699 333 444', score_perf: 78, score_fiab: 82, risque: 42, mission_id: 'EXP-003', destination: 'Deido, Douala', eta: '22 min', distance_restante: '8.1 km', trail: [[0.72, 0.48], [0.70, 0.52], [0.68, 0.56], [0.65, 0.60]] },
  // { id: 4, driver_id: 'T-041', nom: 'Samuel Kotto', avatar: 'SK', statut: 'retard', lat: 0.25, lng: 0.68, vitesse: 12, cap: 160, plaque: 'CE-3456-D', gabarit: 'Petite voiture', telephone: '+237 688 777 888', score_perf: 71, score_fiab: 68, risque: 58, mission_id: 'EXP-004', destination: 'Akwa, Douala', eta: '+18 min retard', distance_restante: '12.4 km', trail: [[0.20, 0.58], [0.22, 0.62], [0.23, 0.65], [0.25, 0.68]] },
  // { id: 5, driver_id: 'T-033', nom: 'Eric Bouka', avatar: 'EB', statut: 'incident', lat: 0.75, lng: 0.25, vitesse: 0, cap: 0, plaque: 'LT-9012-C', gabarit: 'Fourgon moyen', telephone: '+237 655 555 666', score_perf: 85, score_fiab: 78, risque: 74, mission_id: 'EXP-005', destination: 'Bonaberi, Douala', eta: null, distance_restante: '15.8 km', trail: [[0.80, 0.20], [0.78, 0.22], [0.77, 0.24], [0.75, 0.25]] },
  // { id: 6, driver_id: 'T-052', nom: 'Samuel Manga', avatar: 'SM', statut: 'disponible', lat: 0.42, lng: 0.72, vitesse: 0, cap: 0, plaque: 'LT-6789-E', gabarit: 'Fourgonnette compacte', telephone: '+237 670 999 000', score_perf: 82, score_fiab: 85, risque: 18, mission_id: null, destination: null, eta: null, distance_restante: null, trail: [] },
];

const LIVRAISONS_ACTIVES = [
  // { id: 'EXP-002', client: 'Marie Obiang', chauffeur: 'Paul Nguema', driver_id: 'T-014', statut: 'en_cours', eta: '14 min', distance: '5.2 km', priorite: 'normale' },
  // { id: 'EXP-003', client: 'Eric Bouka', chauffeur: 'Jean Tamba', driver_id: 'T-027', statut: 'en_cours', eta: '22 min', distance: '8.1 km', priorite: 'normale' },
  // { id: 'EXP-004', client: 'Jean Mbemba', chauffeur: 'Samuel Kotto', driver_id: 'T-041', statut: 'retard', eta: '+18 min', distance: '12.4 km', priorite: 'haute' },
  // { id: 'EXP-005', client: 'Laure Eto', chauffeur: 'Eric Bouka', driver_id: 'T-033', statut: 'incident', eta: 'Inconnu', distance: '15.8 km', priorite: 'critique' },
];

const ALERTES_GPS = [
  // { id: 1, type: 'Détour suspect', chauffeur: 'T-033 Eric Bouka', severite: 'critique', heure: '14:42', icon: '🚨' },
  // { id: 2, type: 'Retard important', chauffeur: 'T-041 Samuel Kotto', severite: 'haute', heure: '14:38', icon: '⏰' },
  // { id: 3, type: 'Arrêt prolongé', chauffeur: 'T-027 Jean Tamba', severite: 'moyenne', heure: '14:25', icon: '⚠️' },
  // { id: 4, type: 'Vitesse anormale', chauffeur: 'T-014 Paul Nguema', severite: 'faible', heure: '14:15', icon: '💨' },
];

const TIMELINE_EVENTS = [
  // { heure: '15:34', event: 'EXP-001 livrée avec succès', type: 'succes', chauffeur: 'T-011' },
  // { heure: '15:10', event: 'Alerte retard — EXP-004', type: 'alerte', chauffeur: 'T-041' },
  // { heure: '14:52', event: 'Signal GPS perdu — T-033', type: 'incident', chauffeur: 'T-033' },
  // { heure: '14:42', event: 'Checkpoint atteint — EXP-002', type: 'info', chauffeur: 'T-014' },
  // { heure: '14:18', event: 'T-027 démarré sa mission', type: 'info', chauffeur: 'T-027' },
  // { heure: '14:05', event: 'EXP-003 acceptée — T-027', type: 'succes', chauffeur: 'T-027' },
];

const RECOMMANDATIONS_IA = [
  // { texte: 'Risque retard élevé — Makepe → Deido. Embouteillage détecté.', icone: '🚦', type: 'alerte' },
  // { texte: 'Itinéraire alternatif pour T-027 via Bonaberi (-12 min).', icone: '🗺️', type: 'optimisation' },
  // { texte: 'T-033 comportement GPS anormal — surveillance suggérée.', icone: '🛡️', type: 'fraude' },
  // { texte: 'Repositionner T-011 vers Akwa — forte demande prévue.', icone: '⚡', type: 'optimisation' },
];

// ── COMPOSANTS ────────────────────────────────────────────────

function StatutDot({ statut, size = 8 }) {
  const colors = { disponible: C.vert, en_mission: C.bleu, retard: C.ambre, incident: C.rouge };
  return <span style={{ width: size, height: size, borderRadius: '50%', background: colors[statut] || C.texteMuted, display: 'inline-block', flexShrink: 0 }} />;
}

function StatutBadge({ statut, small = false }) {
  const cfg = {
    disponible: { label: 'Disponible', bg: '#DCFCE7', color: '#15803D' },
    en_mission: { label: 'En mission', bg: '#DBEAFE', color: '#1D4ED8' },
    retard: { label: 'Retard', bg: '#FEF3C7', color: '#B45309' },
    incident: { label: 'Incident', bg: '#FEE2E2', color: '#B91C1C' },
  }[statut] || { label: statut, bg: C.surface, color: C.texteMuted };
  return (
    <span style={{ fontSize: small ? 10 : 11, fontWeight: 600, padding: small ? '2px 8px' : '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <StatutDot statut={statut} size={small ? 5 : 6} />
      {cfg.label}
    </span>
  );
}

function ScoreRing({ val, size = 40, color }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (val / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color }}>{val}</div>
    </div>
  );
}

// ── CARTE GPS CANVAS ──────────────────────────────────────────

function CarteGPS({ chauffeurs, selectedChauffeur, onSelectChauffeur, vueMode }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(chauffeurs.map(c => ({ ...c })));
  const tick = useRef(0);

  const colorFor = (s) => ({ disponible: C.vert, en_mission: C.bleu, retard: C.ambre, incident: C.rouge }[s] || C.vert);

  useEffect(() => {
    const iv = setInterval(() => {
      posRef.current = posRef.current.map(c => {
        if (c.statut === 'en_mission') {
          const a = (c.cap * Math.PI) / 180;
          const d = 0.0015;
          return { ...c, lat: Math.max(0.05, Math.min(0.93, c.lat + Math.cos(a) * d)), lng: Math.max(0.05, Math.min(0.93, c.lng + Math.sin(a) * d)) };
        }
        return c;
      });
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Fond
    const bg = vueMode === 'satellite' ? '#0d1f0d' : vueMode === 'trafic' ? '#0d0d1f' : '#0a0f0a';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grille subtile
    ctx.strokeStyle = 'rgba(255,255,255,.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Réseau routier simulé
    const roads = [
      { pts: [[0.05, 0.50], [0.25, 0.42], [0.45, 0.45], [0.65, 0.48], [0.85, 0.42], [0.95, 0.45]], w: 3.5, alpha: .18 },
      { pts: [[0.50, 0.05], [0.45, 0.25], [0.48, 0.45], [0.52, 0.65], [0.48, 0.85], [0.50, 0.95]], w: 3, alpha: .15 },
      { pts: [[0.10, 0.20], [0.30, 0.30], [0.50, 0.25], [0.70, 0.28], [0.88, 0.20]], w: 2, alpha: .10 },
      { pts: [[0.15, 0.80], [0.35, 0.72], [0.55, 0.75], [0.72, 0.68], [0.88, 0.72]], w: 2, alpha: .10 },
      { pts: [[0.05, 0.50], [0.15, 0.65], [0.25, 0.68], [0.35, 0.72]], w: 1.5, alpha: .08 },
      { pts: [[0.65, 0.48], [0.72, 0.55], [0.75, 0.25], [0.78, 0.15]], w: 1.5, alpha: .08 },
      { pts: [[0.30, 0.30], [0.25, 0.42], [0.20, 0.58]], w: 1.5, alpha: .07 },
      { pts: [[0.50, 0.45], [0.60, 0.55], [0.65, 0.60]], w: 1.5, alpha: .07 },
    ];

    roads.forEach(r => {
      ctx.strokeStyle = `rgba(255,255,255,${r.alpha})`;
      ctx.lineWidth = r.w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      r.pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H));
      ctx.stroke();
    });

    // Heatmap zones (trafic ou heatmap)
    if (vueMode === 'trafic' || vueMode === 'heatmap') {
      const zones = [
        { x: 0.47, y: 0.46, r: 90, color: 'rgba(239,68,68,' },
        { x: 0.25, y: 0.68, r: 55, color: 'rgba(239,68,68,' },
        { x: 0.65, y: 0.58, r: 65, color: 'rgba(245,158,11,' },
        { x: 0.55, y: 0.30, r: 50, color: 'rgba(245,158,11,' },
        { x: 0.80, y: 0.70, r: 40, color: 'rgba(34,197,94,' },
      ];
      zones.forEach(z => {
        const grad = ctx.createRadialGradient(z.x * W, z.y * H, 0, z.x * W, z.y * H, z.r);
        grad.addColorStop(0, z.color + '.22)');
        grad.addColorStop(1, z.color + '0)');
        ctx.beginPath();
        ctx.arc(z.x * W, z.y * H, z.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
    }

    // Zones critiques pulsantes
    const t = tick.current;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.04);
    ctx.strokeStyle = `rgba(239,68,68,${0.2 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0.75 * W, 0.25 * H, 30 + pulse * 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trails chauffeurs
    posRef.current.forEach(c => {
      if (c.trail?.length > 1) {
        const col = colorFor(c.statut);
        ctx.strokeStyle = col + '35';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        c.trail.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H));
        // Continuer vers position actuelle
        ctx.lineTo(c.lat * W, c.lng * H);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Marqueurs chauffeurs
    posRef.current.forEach(c => {
      const x = c.lat * W;
      const y = c.lng * H;
      const col = colorFor(c.statut);
      const isSelected = selectedChauffeur?.id === c.id;
      const p = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.03 + c.id * 1.2));

      // Outer glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, isSelected ? 28 : 20);
      grad.addColorStop(0, col + '30');
      grad.addColorStop(1, col + '00');
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 28 : 20, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Ring sélection
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Pulse ring
      if (c.statut !== 'disponible') {
        ctx.beginPath();
        ctx.arc(x, y, 12 + p * 6, 0, Math.PI * 2);
        ctx.strokeStyle = col + Math.floor(p * 60 + 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Fond marqueur
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      // Icône
      ctx.fillStyle = '#fff';
      ctx.font = '700 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icn = c.statut === 'disponible' ? '●' : c.statut === 'en_mission' ? '▶' : c.statut === 'retard' ? '!' : '✕';
      ctx.fillText(icn, x, y);

      // Label
      const lw = 54;
      ctx.fillStyle = 'rgba(0,0,0,.82)';
      const lx = x - lw / 2, ly = y + 14;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx, ly, lw, 14, 4);
      else ctx.rect(lx, ly, lw, 14);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.font = '700 8px Inter, sans-serif';
      ctx.fillText(c.driver_id, x, ly + 7);

      // Flèche cap
      if (c.statut === 'en_mission' && c.vitesse > 0) {
        const a = (c.cap * Math.PI) / 180;
        const len = 22;
        ctx.strokeStyle = col + 'CC';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * len, y + Math.sin(a) * len, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Destinations (points rouges)
    posRef.current.filter(c => c.statut === 'en_mission').forEach(c => {
      if (c.trail?.length > 0) {
        const dest = c.trail[0];
        ctx.beginPath();
        ctx.arc(dest[0] * W, dest[1] * H, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF444450';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dest[0] * W, dest[1] * H, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.rouge;
        ctx.fill();
      }
    });

    tick.current += 1;
  }, [chauffeurs, selectedChauffeur, vueMode]);

  useEffect(() => {
    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const W = canvas.width, H = canvas.height;
    let hit = null;
    posRef.current.forEach(c => {
      const dist = Math.sqrt((mx - c.lat * W) ** 2 + (my - c.lng * H) ** 2);
      if (dist < 20) hit = chauffeurs.find(ch => ch.id === c.id);
    });
    onSelectChauffeur(hit);
  }, [chauffeurs, onSelectChauffeur]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} width={1200} height={800} onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />

      {/* Contrôles overlay */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['+', '−'].map((b, i) => (
          <button key={i} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,0,0,.75)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b}</button>
        ))}
      </div>

      {/* Légende overlay */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
        {[{ s: 'disponible', l: 'Disponible' }, { s: 'en_mission', l: 'En mission' }, { s: 'retard', l: 'Retard' }, { s: 'incident', l: 'Incident' }].map(i => (
          <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,.72)', padding: '5px 10px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
            <StatutDot statut={i.s} size={7} />
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{i.l}</span>
          </div>
        ))}
      </div>

      {/* Badge mode */}
      <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,.72)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '6px 12px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.vert, animation: 'blink 2s infinite' }} />
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>GPS LIVE · Douala</span>
        </div>
      </div>

      {/* Compteur chauffeurs */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,.72)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '6px 12px', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>{chauffeurs.filter(c => c.statut === 'en_mission').length} en mission · {chauffeurs.filter(c => c.statut === 'disponible').length} disponibles</span>
      </div>
    </div>
  );
}

// ── DRAWER CHAUFFEUR ──────────────────────────────────────────

function DrawerChauffeur({ chauffeur, onClose }) {
  if (!chauffeur) return null;
  const risqueColor = chauffeur.risque >= 60 ? C.rouge : chauffeur.risque >= 40 ? C.ambre : C.vert;
  const mission = LIVRAISONS_ACTIVES.find(l => l.driver_id === chauffeur.driver_id);

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 340,
        background: C.blanc, zIndex: 20,
        boxShadow: '-8px 0 40px rgba(0,0,0,.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 200ms ease',
        borderLeft: `.5px solid ${C.border}`,
      }}>
        <style>{`@keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `.5px solid ${C.border}`, background: chauffeur.statut === 'incident' ? '#FEF2F2' : chauffeur.statut === 'retard' ? '#FFFBEB' : C.blanc }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar"
                style={{ width: 48, height: 48, borderRadius: '50%', border: `2.5px solid ${chauffeur.statut === 'incident' ? C.rouge : C.vert}` }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>{chauffeur.nom}</div>
                <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: C.vert }}>{chauffeur.driver_id}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
          <StatutBadge statut={chauffeur.statut} />
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Vitesse + position */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Vitesse', val: chauffeur.vitesse > 0 ? `${chauffeur.vitesse} km/h` : 'À l\'arrêt', icone: '🚗' },
              { label: 'Plaque', val: chauffeur.plaque, icone: '🔖' },
              { label: 'Gabarit', val: chauffeur.gabarit.split(' ')[0], icone: '📦' },
              { label: 'Téléphone', val: chauffeur.telephone.slice(-8), icone: '📞' },
            ].map((r, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}` }}>
                <div style={{ fontSize: 11, marginBottom: 3 }}>{r.icone}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.texte }}>{r.val}</div>
                <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 2 }}>{r.label}</div>
              </div>
            ))}
          </div>

          {/* Mission */}
          {mission && (
            <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.texte }}>Mission en cours</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.vert, fontWeight: 600 }}>{mission.id}</span>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Client', val: mission.client },
                  { label: 'Destination', val: chauffeur.destination || '—' },
                  { label: 'ETA', val: chauffeur.eta || '—', highlight: chauffeur.statut === 'retard' },
                  { label: 'Distance restante', val: chauffeur.distance_restante || '—' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: r.highlight ? C.rouge : C.texte }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scores IA */}
          <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: '14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Scores IA</div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {[
                { label: 'Performance', val: chauffeur.score_perf, color: chauffeur.score_perf >= 90 ? C.vert : chauffeur.score_perf >= 70 ? C.ambre : C.rouge },
                { label: 'Fiabilité', val: chauffeur.score_fiab, color: chauffeur.score_fiab >= 90 ? C.vert : C.ambre },
                { label: 'Risque', val: chauffeur.risque, color: risqueColor },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <ScoreRing val={s.val} color={s.color} size={46} />
                  <span style={{ fontSize: 10, color: C.texteMuted }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              📞 Appeler le chauffeur
            </button>
            <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              💬 Envoyer un message
            </button>
            {chauffeur.statut === 'incident' && (
              <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                🚨 Signaler un incident
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── MODE CONTROL ROOM ─────────────────────────────────────────

function ControlRoomMode({ chauffeurs, selectedChauffeur, onSelectChauffeur, onExit }) {
  const [time, setTime] = useState(new Date());
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeAlert, setActiveAlert] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveAlert(a => (a + 1) % ALERTES_GPS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selectedChauffeur) setShowDrawer(true);
  }, [selectedChauffeur]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.mapDark, zIndex: 1000, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes slideInLeft { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
      `}</style>

      {/* Barre supérieure immersive */}
      <div style={{ height: 60, background: 'linear-gradient(90deg, rgba(5,46,22,.98) 0%, rgba(0,0,0,.92) 100%)', borderBottom: '1px solid rgba(74,222,128,.15)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0, flexShrink: 0, backdropFilter: 'blur(20px)', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.vert, animation: 'blink 1.5s infinite', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: 15, fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>COLI<span style={{ color: '#4ADE80' }}>GO</span><span style={{ color: C.lime }}>⚡</span></span>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.14em' }}>Centre de Commandement</span>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1 }}>
          {[
            { label: 'Chauffeurs', val: chauffeurs.length, color: '#4ADE80', icon: '🚕' },
            { label: 'En mission', val: chauffeurs.filter(c => c.statut === 'en_mission').length, color: C.bleu, icon: '📦' },
            { label: 'Disponibles', val: chauffeurs.filter(c => c.statut === 'disponible').length, color: '#4ADE80', icon: '✓' },
            { label: 'Alertes', val: ALERTES_GPS.filter(a => ['critique', 'haute'].includes(a.severite)).length, color: C.rouge, icon: '🚨', blink: true },
            { label: 'Revenus/jour', val: '1.24M F', color: '#4ADE80', icon: '💰' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1, animation: s.blink ? 'blink 1.2s infinite' : 'none' }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{s.label}</div>
              </div>
              {i < 4 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,.07)', marginLeft: 12 }} />}
            </div>
          ))}
        </div>

        {/* Heure + exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '.02em' }}>
              {time.toLocaleTimeString('fr-FR')}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.05em' }}>
              {time.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
            </div>
          </div>
          <button onClick={onExit} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
          >
            ✕ Quitter
          </button>
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Carte plein écran */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <CarteGPSLeaflet chauffeurs={chauffeurs} selectedChauffeur={selectedChauffeur} onSelectChauffeur={c => { onSelectChauffeur(c); if (c) setShowDrawer(true); }} vueMode="heatmap" />
        </div>

        {/* Panneau gauche flottant */}
        <div style={{ position: 'absolute', left: 16, top: 16, bottom: 16, width: 280, display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideInLeft 300ms ease', pointerEvents: 'auto' }}>

          {/* Alertes critiques */}
          <div style={{ background: 'rgba(0,0,0,.82)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.rouge, textTransform: 'uppercase', letterSpacing: '.08em' }}>🚨 Alertes actives</span>
              <span style={{ fontSize: 10, background: 'rgba(239,68,68,.2)', color: C.rouge, padding: '2px 8px', borderRadius: 20, fontWeight: 700, animation: 'blink 1.5s infinite' }}>{ALERTES_GPS.length}</span>
            </div>
            {ALERTES_GPS.map((a, i) => (
              <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', background: i === activeAlert ? 'rgba(239,68,68,.08)' : 'transparent', transition: 'background 400ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{a.type}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginLeft: 'auto' }}>{a.heure}</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{a.chauffeur}</div>
              </div>
            ))}
          </div>

          {/* Timeline live */}
          <div style={{ background: 'rgba(0,0,0,.82)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(16px)', flex: 1 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em' }}>📡 Événements live</span>
            </div>
            <div style={{ padding: '8px 0', overflowY: 'auto' }}>
              {TIMELINE_EVENTS.map((e, i) => {
                const col = e.type === 'succes' ? C.vert : e.type === 'alerte' ? C.rouge : e.type === 'incident' ? C.ambre : C.bleu;
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 14px', animation: `fadeInUp 300ms ease ${i * 60}ms both` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, marginTop: 3 }} />
                      {i < TIMELINE_EVENTS.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,.06)', minHeight: 12 }} />}
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ fontSize: 10, color: col, fontWeight: 600 }}>{e.heure}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{e.event}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panneau droit flottant */}
        <div style={{ position: 'absolute', right: 16, top: 16, bottom: 16, width: 280, display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideInRight 300ms ease', pointerEvents: 'auto' }}>

          {/* Livraisons actives */}
          <div style={{ background: 'rgba(0,0,0,.82)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.bleu, textTransform: 'uppercase', letterSpacing: '.08em' }}>📦 Livraisons actives</span>
            </div>
            {LIVRAISONS_ACTIVES.map((l, i) => {
              const col = l.statut === 'incident' ? C.rouge : l.statut === 'retard' ? C.ambre : C.vert;
              return (
                <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', borderLeft: `2px solid ${col}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>{l.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: col }}>ETA {l.eta}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>{l.client} · {l.chauffeur}</div>
                </div>
              );
            })}
          </div>

          {/* IA recommendations */}
          <div style={{ background: 'rgba(5,46,22,.9)', border: `1px solid ${C.iaBord}`, borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(74,222,128,.1)` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em' }}>⚡ Recommandations IA</span>
            </div>
            {RECOMMANDATIONS_IA.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(74,222,128,.06)' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{r.icone}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }}>{r.texte}</span>
              </div>
            ))}
          </div>

          {/* Détail chauffeur sélectionné */}
          {selectedChauffeur && showDrawer && (
            <div style={{ background: 'rgba(0,0,0,.85)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(16px)', animation: 'fadeInUp 200ms ease' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Véhicule sélectionné</span>
                <button onClick={() => { setShowDrawer(false); onSelectChauffeur(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedChauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedChauffeur.nom}</div>
                    <div style={{ fontSize: 10, color: '#4ADE80', fontFamily: 'monospace' }}>{selectedChauffeur.driver_id}</div>
                  </div>
                </div>
                {[
                  { l: 'Statut', v: selectedChauffeur.statut },
                  { l: 'Vitesse', v: `${selectedChauffeur.vitesse} km/h` },
                  { l: 'ETA', v: selectedChauffeur.eta || '—' },
                  { l: 'Score risque', v: `${selectedChauffeur.risque}%` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{r.l}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barre IA basse */}
      <div style={{ height: 40, background: 'rgba(5,46,22,.95)', borderTop: `1px solid rgba(74,222,128,.12)`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0, backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.1em', flexShrink: 0 }}>⚡ IA COLIGO</span>
        <div style={{ display: 'flex', gap: 20, overflow: 'hidden' }}>
          {RECOMMANDATIONS_IA.map((r, i) => (
            <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              {r.icone} {r.texte}
              {i < RECOMMANDATIONS_IA.length - 1 && <span style={{ color: 'rgba(255,255,255,.15)', marginLeft: 12 }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function TrackingPage() {
  const [chauffeurs, setChauffeurs] = useState(CHAUFFEURS_GPS);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [controlRoom, setControlRoom] = useState(false);
  const [vueMode, setVueMode] = useState('normal');
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');

  useEffect(() => {
    const iv = setInterval(() => {
      setChauffeurs(prev => prev.map(c => {
        if (c.statut === 'en_mission') {
          const a = (c.cap * Math.PI) / 180;
          const d = 0.0012;
          return { ...c, lat: Math.max(0.05, Math.min(0.93, c.lat + Math.cos(a) * d)), lng: Math.max(0.05, Math.min(0.93, c.lng + Math.sin(a) * d)) };
        }
        return c;
      }));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const filtered = chauffeurs.filter(c => {
    const ms = !search || c.nom.toLowerCase().includes(search.toLowerCase()) || c.driver_id.toLowerCase().includes(search.toLowerCase());
    const mf = filtreStatut === 'tous' || c.statut === filtreStatut;
    return ms && mf;
  });

  if (controlRoom) return (
    <ControlRoomMode chauffeurs={chauffeurs} selectedChauffeur={selectedChauffeur} onSelectChauffeur={setSelectedChauffeur} onExit={() => setControlRoom(false)} />
  );

  const alertesCritiques = ALERTES_GPS.filter(a => a.severite === 'critique' || a.severite === 'haute');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 120px)' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} } @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

      {/* Header épuré */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🗺️ Suivi GPS Temps Réel
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: C.vert }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.vert, display: 'inline-block', animation: 'blink 2s infinite' }} />
              LIVE
            </span>
          </h1>
          <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 3 }}>
            {chauffeurs.filter(c => c.statut === 'en_mission').length} en mission · {chauffeurs.filter(c => c.statut === 'disponible').length} disponibles · {alertesCritiques.length > 0 && <span style={{ color: C.rouge, fontWeight: 600 }}>{alertesCritiques.length} alertes critiques</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Vue mode */}
          {/* <div style={{ display: 'flex', gap: 3, background: C.surface, borderRadius: 10, padding: 3, border: `.5px solid ${C.border}` }}>
            {[
              { id: 'normal', label: '🗺️' },
              { id: 'satellite', label: '🛰️' },
              { id: 'trafic', label: '🚦' },
              { id: 'heatmap', label: '🔥' },
            ].map(v => (
              <button key={v.id} onClick={() => setVueMode(v.id)} title={v.id} style={{ width: 32, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, background: vueMode === v.id ? C.blanc : 'transparent', boxShadow: vueMode === v.id ? '0 1px 3px rgba(0,0,0,.1)' : 'none', transition: 'all 150ms' }}>
                {v.label}
              </button>
            ))}
          </div> */}
          {/* <button onClick={() => setControlRoom(true)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(34,197,94,.35)', transition: 'all 150ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🖥️ Mur de contrôle
          </button> */}
        </div>
      </div>

      {/* Barre synthétique KPIs */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        {[
          { label: 'En mission', val: chauffeurs.filter(c => c.statut === 'en_mission').length, color: C.bleu, bg: C.bleuClair, icon: '▶' },
          { label: 'Disponibles', val: chauffeurs.filter(c => c.statut === 'disponible').length, color: C.vert, bg: C.vertClair, icon: '●' },
          { label: 'Retards', val: chauffeurs.filter(c => c.statut === 'retard').length, color: C.ambre, bg: C.ambreClair, icon: '⏰' },
          { label: 'Incidents', val: chauffeurs.filter(c => c.statut === 'incident').length, color: C.rouge, bg: C.rougeClair, icon: '!' },
          { label: 'Alertes GPS', val: ALERTES_GPS.length, color: C.rouge, bg: '#FEF2F2', icon: '🚨', blink: alertesCritiques.length > 0 },
          { label: 'Livraisons actives', val: LIVRAISONS_ACTIVES.length, color: C.violet, bg: C.violetClair, icon: '📦' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.bg, border: `.5px solid ${s.color}30`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1, animation: s.blink ? 'blink 1.5s infinite' : 'none' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Corps principal : liste gauche + carte */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, overflow: 'hidden', minHeight: 0 }}>

        {/* Panneau gauche compact */}
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Recherche */}
          <div style={{ padding: '12px 14px', borderBottom: `.5px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surface, borderRadius: 8, padding: '7px 10px', border: `.5px solid ${C.border}`, marginBottom: 8 }}>
              <span>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher chauffeur..."
                style={{ border: 'none', background: 'transparent', fontSize: 12, color: C.texte, outline: 'none', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {[
                { id: 'tous', l: 'Tous' },
                { id: 'en_mission', l: 'Mission' },
                { id: 'disponible', l: 'Dispo' },
                { id: 'retard', l: 'Retard' },
                { id: 'incident', l: 'Incident' },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltreStatut(f.id)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 500, background: filtreStatut === f.id ? C.vert : C.surface, color: filtreStatut === f.id ? '#fff' : C.texteMuted, transition: 'all 150ms' }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {/* Liste chauffeurs */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map((c, i) => (
              <div key={c.id}
                onClick={() => setSelectedChauffeur(selectedChauffeur?.id === c.id ? null : c)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer', borderBottom: `.5px solid ${C.border}`, background: selectedChauffeur?.id === c.id ? C.vertClair : 'transparent', borderLeft: `2px solid ${selectedChauffeur?.id === c.id ? C.vert : 'transparent'}`, transition: 'all 150ms' }}
                onMouseEnter={e => { if (selectedChauffeur?.id !== c.id) e.currentTarget.style.background = C.surface; }}
                onMouseLeave={e => { if (selectedChauffeur?.id !== c.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: { disponible: C.vert, en_mission: C.bleu, retard: C.ambre, incident: C.rouge }[c.statut], border: '1.5px solid #fff' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nom}</div>
                  <div style={{ fontSize: 10, color: C.vert, fontFamily: 'monospace', fontWeight: 600 }}>{c.driver_id}</div>
                </div>
                {c.statut === 'en_mission' && c.eta && (
                  <div style={{ fontSize: 10, color: C.bleu, fontWeight: 600, background: C.bleuClair, padding: '2px 6px', borderRadius: 6 }}>
                    {c.eta}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Alertes en bas */}
          {alertesCritiques.length > 0 && (
            <div style={{ padding: '10px 14px', borderTop: `.5px solid ${C.border}`, background: '#FEF2F2', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.rouge, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                🚨 {alertesCritiques.length} alertes critiques
              </div>
              {alertesCritiques.slice(0, 2).map((a, i) => (
                <div key={i} style={{ fontSize: 10, color: '#B91C1C', marginBottom: 2 }}>
                  {a.icon} {a.type} · {a.chauffeur.split(' ')[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carte GPS + drawer */}
        <div style={{ position: 'relative', background: C.mapDark, borderRadius: 14, overflow: 'hidden' }}>
          <CarteGPSLeaflet
            chauffeurs={filtered}
            selectedChauffeur={selectedChauffeur}
            onSelectChauffeur={setSelectedChauffeur}
            vueMode={vueMode}
          />
          {/* Drawer dynamique sur sélection */}
          {selectedChauffeur && (
            <DrawerChauffeur
              chauffeur={selectedChauffeur}
              onClose={() => setSelectedChauffeur(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
