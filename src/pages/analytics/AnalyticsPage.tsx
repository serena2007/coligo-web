// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import { formatMontant } from '../../data/mockData';

const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#F0FDF4',
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

const REVENUS_PREVISION = [
  { mois: 'Jan', reel: 28500000, prevu: null },
  { mois: 'Fév', reel: 31200000, prevu: null },
  { mois: 'Mar', reel: 29800000, prevu: null },
  { mois: 'Avr', reel: 34500000, prevu: null },
  { mois: 'Mai', reel: 36800000, prevu: null },
  { mois: 'Juin', reel: 38500000, prevu: 38500000 },
  { mois: 'Juil', reel: null, prevu: 41600000 },
  { mois: 'Août', reel: null, prevu: 44200000 },
  { mois: 'Sep', reel: null, prevu: 47800000 },
];

const DEMANDE_ZONES = [
  { zone: 'Akwa', demande: 92, evolution: +8, lat: 45, lng: 55 },
  { zone: 'Bonanjo', demande: 78, evolution: +12, lat: 52, lng: 48 },
  { zone: 'Bonapriso', demande: 65, evolution: -3, lat: 38, lng: 62 },
  { zone: 'Bassa', demande: 54, evolution: +5, lat: 60, lng: 70 },
  { zone: 'Makepe', demande: 41, evolution: +18, lat: 68, lng: 42 },
  { zone: 'Ndokotti', demande: 33, evolution: -7, lat: 30, lng: 55 },
  { zone: 'Logbessou', demande: 28, evolution: +2, lat: 72, lng: 35 },
];

const ETA_PREDICTIONS = [
  { trajet: 'Douala → Akwa', distance: '4.2 km', eta: '18 min', confiance: 94, meteo: '☀️ Ensoleillé', trafic: 'Fluide', icon: '🟢' },
  { trajet: 'Bonapriso → Bassa', distance: '7.8 km', eta: '32 min', confiance: 87, meteo: '⛅ Nuageux', trafic: 'Modéré', icon: '🟡' },
  { trajet: 'Makepe → Bonanjo', distance: '11.2 km', eta: '48 min', confiance: 79, meteo: '🌧️ Pluvieux', trafic: 'Dense', icon: '🟠' },
  { trajet: 'Douala → Yaoundé', distance: '240 km', eta: '4h 32min', confiance: 92, meteo: '☀️ Ensoleillé', trafic: 'Fluide', icon: '🟢' },
  { trajet: 'Douala → Bafoussam', distance: '380 km', eta: '5h 15min', confiance: 88, meteo: '⛅ Nuageux', trafic: 'Modéré', icon: '🟡' },
];

const FRAUDE_IA = [
  { id: 'FIA-001', type: 'Détour anormal', chauffeur: 'T-033 Eric Bouka', score: 94, gravite: 'critique', confiance: 97, description: 'Détour de 8.3 km supplémentaires détecté — route optimale ignorée délibérément', recommandation: 'Suspension immédiate recommandée — pattern récurrent', couleur: C.rouge },
  { id: 'FIA-002', type: 'GPS incohérent', chauffeur: 'T-027 Jean Tamba', score: 78, gravite: 'haute', confiance: 91, description: 'Téléportation GPS 12 km en 30 secondes — vitesse physiquement impossible', recommandation: 'Mise sous surveillance active — première occurrence', couleur: C.ambre },
  { id: 'FIA-003', type: 'Multi-comptes', client: 'Client #8 Samuel K.', score: 72, gravite: 'haute', confiance: 89, description: '3 comptes distincts créés depuis même IMEI en 20 minutes', recommandation: 'Blocage des comptes secondaires — investigation requise', couleur: C.ambre },
  { id: 'FIA-004', type: 'Missions abandonnées', chauffeur: 'T-041 Samuel Kotto', score: 58, gravite: 'moyenne', confiance: 84, description: '5 missions acceptées puis abandonnées en 48h — pattern suspect', recommandation: 'Avertissement automatique envoyé — surveillance 7 jours', couleur: '#F59E0B' },
  { id: 'FIA-005', type: 'Arrêts suspects', chauffeur: 'T-014 Paul Nguema', score: 32, gravite: 'faible', confiance: 76, description: 'Arrêt de 47 min dans zone non résidentielle — probablement pause', recommandation: 'Surveillance passive — faible probabilité de fraude', couleur: C.vert },
];

const FRAUDE_REPARTITION = [
  { name: 'Faux GPS', value: 35, color: C.rouge },
  { name: 'Multi-comptes', value: 25, color: C.ambre },
  { name: 'Détours', value: 20, color: '#F59E0B' },
  { name: 'Abandons', value: 12, color: C.bleu },
  { name: 'Financière', value: 8, color: C.violet },
];

const FRAUDE_TENDANCE = [
  { semaine: 'S-5', alertes: 12 }, { semaine: 'S-4', alertes: 18 },
  { semaine: 'S-3', alertes: 14 }, { semaine: 'S-2', alertes: 22 },
  { semaine: 'S-1', alertes: 16 }, { semaine: 'S0', alertes: 19 },
];

const ROUTES_OPTIMISEES = [
  { route: 'Akwa → Bonanjo', distance_avant: 5.2, distance_apres: 3.8, gain_km: 1.4, gain_min: 8, gain_carburant: '0.8L', gain_fcfa: 1200, frequence: 48 },
  { route: 'Makepe → Bassa', distance_avant: 12.8, distance_apres: 9.4, gain_km: 3.4, gain_min: 18, gain_carburant: '1.9L', gain_fcfa: 2850, frequence: 31 },
  { route: 'Logbessou → Akwa', distance_avant: 18.5, distance_apres: 14.2, gain_km: 4.3, gain_min: 24, gain_carburant: '2.4L', gain_fcfa: 3600, frequence: 22 },
  { route: 'Bonaberi → Deido', distance_avant: 9.1, distance_apres: 7.2, gain_km: 1.9, gain_min: 11, gain_carburant: '1.1L', gain_fcfa: 1650, frequence: 67 },
];

const ZONES_CONGESTION = [
  { zone: 'Carrefour Ndokotti', niveau: 'critique', heure_pointe: '07h-09h · 17h-19h', impact_eta: '+22 min', couleur: C.rouge },
  { zone: 'Axe Bassa-Douala', niveau: 'haute', heure_pointe: '12h-14h', impact_eta: '+14 min', couleur: C.ambre },
  { zone: 'Boulevard de la Liberté', niveau: 'modérée', heure_pointe: '08h-10h', impact_eta: '+8 min', couleur: '#F59E0B' },
];

const CHAUFFEURS_ANALYSE = [
  { nom: 'Paul Nguema', driver_id: 'T-014', avatar: 'PN', performance: 96, fiabilite: 98, comportement: 94, risque: 8, trend: '+2%', statut: 'excellent' },
  { nom: 'Claire Ndong', driver_id: 'T-011', avatar: 'CN', performance: 94, fiabilite: 96, comportement: 97, risque: 6, trend: '+1%', statut: 'excellent' },
  { nom: 'Jean Tamba', driver_id: 'T-027', avatar: 'JT', performance: 78, fiabilite: 82, comportement: 75, risque: 42, trend: '-3%', statut: 'surveillance' },
  { nom: 'Samuel Kotto', driver_id: 'T-041', avatar: 'SK', performance: 71, fiabilite: 68, comportement: 65, risque: 58, trend: '-5%', statut: 'risque' },
  { nom: 'Eric Bouka', driver_id: 'T-033', avatar: 'EB', performance: 85, fiabilite: 78, comportement: 62, risque: 74, trend: '-8%', statut: 'critique' },
];

const RADAR_DATA = (chauffeur) => [
  { metric: 'Performance', value: chauffeur.performance },
  { metric: 'Fiabilité', value: chauffeur.fiabilite },
  { metric: 'Comportement', value: chauffeur.comportement },
  { metric: 'Ponctualité', value: Math.round((chauffeur.performance + chauffeur.fiabilite) / 2) },
  { metric: 'Sécurité', value: 100 - chauffeur.risque },
];

const INSIGHTS = [
  { id: 1, type: 'prevision', icone: '📈', titre: 'Hausse revenus prévue', texte: 'Une augmentation de 8.2% des revenus est attendue la semaine prochaine grâce à la période de fin de mois.', confiance: 91, couleur: C.vert, bg: C.vertClair, tag: 'Revenus' },
  { id: 2, type: 'trafic', icone: '🚦', titre: 'Congestion prévisible demain', texte: 'Le trafic sur l\'axe Douala → Yaoundé augmentera de 12% demain matin entre 07h et 09h. Repositionner 4 chauffeurs en amont.', confiance: 87, couleur: C.ambre, bg: C.ambreClair, tag: 'Trafic' },
  { id: 3, type: 'chauffeur', icone: '🚕', titre: 'Risque annulation élevé', texte: 'Le chauffeur T-041 Samuel K. présente un risque d\'annulation de 73% sur les 48 prochaines heures. Prévoir un chauffeur de remplacement.', confiance: 84, couleur: C.rouge, bg: C.rougeClair, tag: 'Chauffeur' },
  { id: 4, type: 'demande', icone: '📦', titre: 'Pic demande weekend', texte: 'Les livraisons de ce weekend devraient augmenter de 15% dans les zones Akwa et Bonanjo. Activer 6 chauffeurs supplémentaires.', confiance: 89, couleur: C.bleu, bg: C.bleuClair, tag: 'Demande' },
  { id: 5, type: 'optimisation', icone: '⚡', titre: 'Économie carburant possible', texte: 'En appliquant les routes optimisées IA sur 80% des courses, COLIGO économiserait 145 000 F de carburant ce mois.', confiance: 93, couleur: C.lime, bg: C.limeClair, tag: 'Optimisation' },
  { id: 6, type: 'fraude', icone: '🛡️', titre: 'Pattern fraude détecté', texte: 'Nouveau pattern de fraude GPS détecté sur 3 chauffeurs de la zone Bassa. Probabilité de groupe organisé : 68%.', confiance: 78, couleur: C.violet, bg: C.violetClair, tag: 'Fraude' },
];

// ── COMPOSANTS ────────────────────────────────────────────────

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color }}>
          {p.name} : {typeof p.value === 'number' && p.value > 10000 ? formatMontant(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

function ProgressRing({ score, size = 100, strokeWidth = 8, label, sublabel }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? C.vert : score >= 60 ? C.ambre : C.rouge;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 80 ? 24 : 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{score}</span>
        {label && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{label}</span>}
      </div>
    </div>
  );
}

function MiniRing({ score, size = 44 }) {
  const color = score >= 80 ? C.vert : score >= 60 ? C.ambre : C.rouge;
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  );
}

function GraviteBadge({ gravite }) {
  const cfg = {
    critique: { label: '🔴 Critique', bg: '#FEF2F2', color: '#B91C1C' },
    haute: { label: '🟠 Haute', bg: '#FFFBEB', color: '#B45309' },
    moyenne: { label: '🟡 Moyenne', bg: '#FEFCE8', color: '#854D0E' },
    faible: { label: '🟢 Faible', bg: '#F0FDF4', color: '#15803D' },
  }[gravite] || { label: gravite, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function StatutChauffeurBadge({ statut }) {
  const cfg = {
    excellent: { label: '⭐ Excellent', bg: '#F0FDF4', color: '#15803D' },
    surveillance: { label: '👁 Surveillance', bg: '#FFFBEB', color: '#B45309' },
    risque: { label: '⚠ Risque', bg: '#FEF3C7', color: '#B45309' },
    critique: { label: '🚨 Critique', bg: '#FEF2F2', color: '#B91C1C' },
  }[statut] || { label: statut, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

// ── ONGLET PRÉDICTIONS ────────────────────────────────────────

function OngletPredictions() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ETA Prédictif */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🕐 ETA Prédictif IA</span>
            <span style={{ fontSize: 12, color: C.texteMuted, marginLeft: 10 }}>Temps d'arrivée estimé avec conditions temps réel</span>
          </div>
          <span style={{ fontSize: 11, background: C.vertClair, color: C.vert, padding: '3px 10px', borderRadius: 20, fontWeight: 600, border: `.5px solid #BBF7D0` }}>⚡ IA Active</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ETA_PREDICTIONS.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < ETA_PREDICTIONS.length - 1 ? `.5px solid ${C.border}` : 'none', transition: 'background 150ms' }}
              onMouseEnter={ev => ev.currentTarget.style.background = C.surface}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 18 }}>{e.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{e.trajet}</div>
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{e.distance} · {e.meteo} · Trafic {e.trafic}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>{e.eta}</div>
                <div style={{ fontSize: 10, color: C.texteMuted }}>ETA prédit</div>
              </div>
              <div style={{ width: 80 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: C.texteMuted }}>Confiance</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: e.confiance >= 90 ? C.vert : e.confiance >= 80 ? C.ambre : C.rouge }}>{e.confiance}%</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${e.confiance}%`, height: '100%', background: e.confiance >= 90 ? C.vert : e.confiance >= 80 ? C.ambre : C.rouge, borderRadius: 10 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prévision revenus */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>📈 Prévision des Revenus</span>
          <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
            {[{ c: C.vert, l: 'Réels' }, { c: `${C.bleu}80`, l: 'Prévus IA' }].map(i => (
              <span key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 3, background: i.c, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ color: C.texteMuted }}>{i.l}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Revenus actuels', val: formatMontant(38500000), sub: 'Juin 2026', color: C.vert },
              { label: 'Prévision juillet', val: formatMontant(41600000), sub: '+8.1% estimé', color: C.bleu },
              { label: 'Prévision Q3', val: formatMontant(133600000), sub: 'Juil–Sep 2026', color: C.violet },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: '12px 14px', border: `.5px solid ${C.border}` }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: C.texte, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.texteMuted }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUS_PREVISION}>
              <defs>
                <linearGradient id="gradVert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.vert} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.vert} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBleu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.bleu} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={C.bleu} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<TooltipCustom />} />
              <Area type="monotone" dataKey="reel" name="Réels" stroke={C.vert} strokeWidth={2} fill="url(#gradVert)" connectNulls={false} />
              <Area type="monotone" dataKey="prevu" name="Prévus IA" stroke={C.bleu} strokeWidth={2} strokeDasharray="6 3" fill="url(#gradBleu)" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prédiction demande */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>📊 Prédiction de la Demande par Zone</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEMANDE_ZONES.map((z, i) => {
            const color = z.demande >= 70 ? C.rouge : z.demande >= 50 ? C.ambre : C.vert;
            const evColor = z.evolution > 0 ? C.vert : C.rouge;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: C.texte, fontWeight: 500, width: 90, flexShrink: 0 }}>{z.zone}</span>
                <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${z.demande}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 10, transition: 'width 800ms ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color, width: 36, textAlign: 'right' }}>{z.demande}%</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: evColor, width: 44, textAlign: 'right' }}>
                  {z.evolution > 0 ? '↑' : '↓'} {Math.abs(z.evolution)}%
                </span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: z.demande >= 70 ? '#FEF2F2' : z.demande >= 50 ? '#FFFBEB' : '#F0FDF4', color }}>
                  {z.demande >= 70 ? 'Forte' : z.demande >= 50 ? 'Moyenne' : 'Faible'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ONGLET FRAUDE IA ──────────────────────────────────────────

function OngletFraudeIA() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats fraude */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Comportements suspects', val: FRAUDE_IA.length, color: C.rouge, bg: C.rougeClair, icone: '🚨' },
          { label: 'Score moyen risque', val: `${Math.round(FRAUDE_IA.reduce((s, f) => s + f.score, 0) / FRAUDE_IA.length)}/100`, color: C.ambre, bg: C.ambreClair, icone: '📊' },
          { label: 'Critiques actives', val: FRAUDE_IA.filter(f => f.gravite === 'critique').length, color: C.rouge, bg: '#FEF2F2', icone: '🔴' },
          { label: 'Précision modèle', val: '94.2%', color: C.vert, bg: C.vertClair, icone: '✓' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `.5px solid ${s.color}30`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icone}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alertes fraude IA */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🤖 Comportements Suspects Détectés par IA</span>
          <span style={{ fontSize: 11, background: '#FEF2F2', color: C.rouge, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
            {FRAUDE_IA.filter(f => f.gravite === 'critique' || f.gravite === 'haute').length} nécessitent attention
          </span>
        </div>
        {FRAUDE_IA.map((f, i) => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: i < FRAUDE_IA.length - 1 ? `.5px solid ${C.border}` : 'none', borderLeft: `4px solid ${f.couleur}`, transition: 'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = C.surface}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.couleur}15`, border: `.5px solid ${f.couleur}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: f.couleur }}>{f.score}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: C.texteMuted }}>{f.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.texte }}>{f.type}</span>
                  <GraviteBadge gravite={f.gravite} />
                  <span style={{ fontSize: 10, color: C.texteMuted, marginLeft: 'auto' }}>Confiance IA : <strong style={{ color: f.couleur }}>{f.confiance}%</strong></span>
                </div>
                <div style={{ fontSize: 12, color: C.texte, marginBottom: 6 }}>{f.chauffeur || f.client}</div>
                <div style={{ fontSize: 12, color: C.texteMuted, marginBottom: 8 }}>{f.description}</div>
                <div style={{ background: `${f.couleur}10`, border: `.5px solid ${f.couleur}30`, borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>🤖</span>
                  <span style={{ fontSize: 11, color: f.couleur, fontWeight: 500 }}>Recommandation IA : {f.recommandation}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button style={{ padding: '5px 12px', borderRadius: 8, border: `none`, background: C.vertClair, color: C.vert, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>✓ Traiter</button>
                <button style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texteMuted, fontSize: 10, cursor: 'pointer' }}>Ignorer</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Répartition + tendance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.texte, marginBottom: 14 }}>Répartition des fraudes</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={FRAUDE_REPARTITION} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {FRAUDE_REPARTITION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FRAUDE_REPARTITION.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.texte }}>{f.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: f.color, marginLeft: 'auto' }}>{f.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.texte, marginBottom: 14 }}>Évolution alertes — 6 semaines</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={FRAUDE_TENDANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="semaine" tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="alertes" name="Alertes" fill={C.rouge} radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── ONGLET OPTIMISATION ───────────────────────────────────────

function OngletOptimisation() {
  const totalKm = ROUTES_OPTIMISEES.reduce((s, r) => s + r.gain_km * r.frequence, 0);
  const totalFCFA = ROUTES_OPTIMISEES.reduce((s, r) => s + r.gain_fcfa * r.frequence, 0);
  const totalMin = ROUTES_OPTIMISEES.reduce((s, r) => s + r.gain_min * r.frequence, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPIs optimisation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Km économisés/mois', val: `${totalKm.toFixed(0)} km`, icone: '🗺️', color: C.bleu, bg: C.bleuClair },
          { label: 'Économies carburant', val: formatMontant(Math.round(totalFCFA * 0.4)), icone: '⛽', color: C.vert, bg: C.vertClair },
          { label: 'Économies totales', val: formatMontant(totalFCFA), icone: '💰', color: C.vert, bg: C.vertClair },
          { label: 'Temps économisé', val: `${Math.round(totalMin / 60)}h/mois`, icone: '⏱️', color: C.violet, bg: C.violetClair },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `.5px solid ${s.color}30`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icone}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Routes optimisées */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🛣️ Routes Optimisées par IA</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {['Route', 'Avant IA', 'Après IA', 'Gain km', 'Gain temps', 'Gain carburant', 'Économie/course', 'Fréquence'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROUTES_OPTIMISEES.map((r, i) => (
              <tr key={i} style={{ borderBottom: `.5px solid ${C.border}`, transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: C.texte }}>{r.route}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: C.rouge }}>{r.distance_avant} km</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: C.vert, fontWeight: 600 }}>{r.distance_apres} km</td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 12, fontWeight: 700, color: C.vert }}>-{r.gain_km} km</span></td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 12, fontWeight: 700, color: C.bleu }}>-{r.gain_min} min</span></td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 12, color: C.ambre, fontWeight: 600 }}>-{r.gain_carburant}</span></td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 12, fontWeight: 700, color: C.vert }}>{formatMontant(r.gain_fcfa)}</span></td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 11, background: C.bleuClair, color: C.bleu, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{r.frequence}x/mois</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zones congestion */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🚦 Zones de Congestion Identifiées</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ZONES_CONGESTION.map((z, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < ZONES_CONGESTION.length - 1 ? `.5px solid ${C.border}` : 'none', borderLeft: `3px solid ${z.couleur}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${z.couleur}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🚦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{z.zone}</div>
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>Heures de pointe : {z.heure_pointe}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: `${z.couleur}15`, color: z.couleur }}>
                {z.niveau}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: z.couleur }}>+{z.impact_eta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: 12, color: '#4ADE80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>⚡ Suggestions IA — Optimisation Immédiate</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Rediriger 6 chauffeurs vers Akwa entre 07h–09h pour absorber le pic prévu de +18% de demande.',
            'Éviter l\'axe Bassa-Douala entre 12h–14h — proposer l\'itinéraire alternatif via Bonaberi (+4 km mais -14 min).',
            'Activer le mode "course express" pour les 8 chauffeurs disponibles en zone Bonanjo ce soir.',
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function AnalyticsPage() {
  const [onglet, setOnglet] = useState('predictions');
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [aiScore] = useState(87);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const ONGLETS = [
    { id: 'predictions', label: '🔮 Prédictions' },
    { id: 'fraude', label: '🛡️ Détection Fraude IA' },
    { id: 'optimisation', label: '⚡ Optimisation Logistique' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.02)} } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🤖 Centre d'Intelligence Artificielle
            <span style={{ fontSize: 11, fontWeight: 700, background: C.lime, color: '#1a2e05', padding: '3px 10px', borderRadius: 20 }}>BETA</span>
          </h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>Prédictions · Détection · Optimisation · Modèle v2.4</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 10, padding: '7px 14px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.vert, animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.vert }}>Modèle actif</span>
          </div>
          <button style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>📥 Rapport IA</button>
        </div>
      </div>

      {/* AI SCORE SECTION */}
      <div style={{ background: C.ia, borderRadius: 20, padding: '24px 28px', marginBottom: 20, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>

        {/* Score principal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <ProgressRing score={aiScore} size={110} strokeWidth={9} label="/ 100" />
          <div>
            <div style={{ fontSize: 10, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>COLIGO AI SCORE</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              {aiScore >= 80 ? 'EXCELLENT' : aiScore >= 60 ? 'BON' : 'MOYEN'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>
              Confiance modèle : 94.2% · Mis à jour il y a 2 min
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              {['Prédictions ✓', 'Fraude ✓', 'Routes ✓'].map(tag => (
                <span key={tag} style={{ fontSize: 10, background: 'rgba(74,222,128,.15)', color: '#4ADE80', padding: '2px 8px', borderRadius: 20 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,.1)', flexShrink: 0 }} />

        {/* KPIs IA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20, flex: 1 }}>
          {[
            { label: 'Analyses', val: '12 847', color: '#4ADE80' },
            { label: 'Prédictions', val: '3 241', color: C.bleu },
            { label: 'Risques détectés', val: '127', color: C.rouge },
            { label: 'Routes optimisées', val: '89', color: C.ambre },
            { label: 'Économies réalisées', val: '2.4M F', color: '#4ADE80' },
            { label: 'Temps économisé', val: '486h', color: C.violet },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* INSIGHTS IA */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>💡 Insights Automatiques</span>
            <span style={{ fontSize: 10, background: C.lime, color: '#1a2e05', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>LIVE</span>
          </div>
          <span style={{ fontSize: 12, color: C.texteMuted }}>{INSIGHTS.length} insights générés aujourd'hui</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {INSIGHTS.map((insight, i) => (
            <div key={i} style={{
              padding: '16px 18px',
              borderRight: i % 3 < 2 ? `.5px solid ${C.border}` : 'none',
              borderBottom: i < 3 ? `.5px solid ${C.border}` : 'none',
              background: C.blanc,
              transition: 'background 150ms',
              animation: `fadeIn 400ms ease ${i * 80}ms both`,
            }}
              onMouseEnter={e => e.currentTarget.style.background = insight.bg}
              onMouseLeave={e => e.currentTarget.style.background = C.blanc}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{insight.icone}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: insight.bg, color: insight.couleur, border: `.5px solid ${insight.couleur}30` }}>{insight.tag}</span>
                <span style={{ fontSize: 10, color: C.texteMuted, marginLeft: 'auto' }}>Confiance {insight.confiance}%</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.texte, marginBottom: 6 }}>{insight.titre}</div>
              <div style={{ fontSize: 11, color: C.texteMuted, lineHeight: 1.6 }}>{insight.texte}</div>
              <div style={{ height: 3, background: C.border, borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
                <div style={{ width: `${insight.confiance}%`, height: '100%', background: insight.couleur, borderRadius: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ANALYSE CHAUFFEURS */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🚕 Analyse Performance Chauffeurs</span>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Liste */}
          <div style={{ flex: 1, borderRight: `.5px solid ${C.border}` }}>
            {CHAUFFEURS_ANALYSE.map((c, i) => (
              <div key={i}
                onClick={() => setSelectedChauffeur(selectedChauffeur?.driver_id === c.driver_id ? null : c)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < CHAUFFEURS_ANALYSE.length - 1 ? `.5px solid ${C.border}` : 'none', cursor: 'pointer', background: selectedChauffeur?.driver_id === c.driver_id ? C.vertClair : 'transparent', transition: 'background 150ms' }}
                onMouseEnter={e => { if (selectedChauffeur?.driver_id !== c.driver_id) e.currentTarget.style.background = C.surface; }}
                onMouseLeave={e => { if (selectedChauffeur?.driver_id !== c.driver_id) e.currentTarget.style.background = 'transparent'; }}
              >
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{c.nom}</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.vert }}>{c.driver_id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                    <StatutChauffeurBadge statut={c.statut} />
                    <span style={{ fontSize: 10, color: c.trend.startsWith('+') ? C.vert : C.rouge, fontWeight: 600 }}>{c.trend}</span>
                  </div>
                </div>
                <MiniRing score={c.performance} />
                <div style={{ width: 60 }}>
                  <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>Risque</div>
                  <div style={{ height: 4, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${c.risque}%`, height: '100%', background: c.risque >= 60 ? C.rouge : c.risque >= 40 ? C.ambre : C.vert, borderRadius: 10 }} />
                  </div>
                  <div style={{ fontSize: 9, color: c.risque >= 60 ? C.rouge : c.risque >= 40 ? C.ambre : C.vert, fontWeight: 700, marginTop: 2 }}>{c.risque}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <div style={{ width: 280, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {selectedChauffeur ? (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 4, textAlign: 'center' }}>
                  {selectedChauffeur.nom}
                </div>
                <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 8, textAlign: 'center' }}>Profil de performance IA</div>
                <ResponsiveContainer width={220} height={200}>
                  <RadarChart data={RADAR_DATA(selectedChauffeur)}>
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: C.texteMuted }} />
                    <Radar name={selectedChauffeur.nom} dataKey="value" stroke={C.vert} fill={C.vert} fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%', marginTop: 8 }}>
                  {[
                    { label: 'Performance', val: selectedChauffeur.performance },
                    { label: 'Fiabilité', val: selectedChauffeur.fiabilite },
                    { label: 'Comportement', val: selectedChauffeur.comportement },
                    { label: 'Risque', val: selectedChauffeur.risque, inverse: true },
                  ].map((m, i) => (
                    <div key={i} style={{ background: C.surface, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: m.inverse ? (m.val >= 60 ? C.rouge : m.val >= 40 ? C.ambre : C.vert) : (m.val >= 80 ? C.vert : m.val >= 60 ? C.ambre : C.rouge) }}>{m.val}%</div>
                      <div style={{ fontSize: 9, color: C.texteMuted }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: C.texteMuted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 12 }}>Cliquez sur un chauffeur pour voir son profil IA</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all 150ms' }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      {onglet === 'predictions' && <OngletPredictions />}
      {onglet === 'fraude' && <OngletFraudeIA />}
      {onglet === 'optimisation' && <OngletOptimisation />}
    </div>
  );
}