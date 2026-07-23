// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { AGENCES, formatMontant } from '../../data/mockData';
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';
import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';
import AccesRefuse from '../../components/AccesRefuse';

const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#F0FDF4',
  rouge: '#EF4444', rougeClair: '#FEF2F2',
  ambre: '#F59E0B', ambreClair: '#FFFBEB',
  bleu: '#3B82F6', bleuClair: '#EFF6FF',
  violet: '#8B5CF6', violetClair: '#EDE9FE',
  texte: '#0F172A', texteMuted: '#94A3B8',
  border: '#E2E8F0', surface: '#F8FAFC', blanc: '#fff',
};

const STATUT_CONFIG = {
  actif: { label: 'Actif', bg: '#DCFCE7', color: '#15803D' },
  suspendu: { label: 'Suspendu', bg: '#FEE2E2', color: '#B91C1C' },
  en_attente: { label: 'En attente', bg: '#FEF3C7', color: '#B45309' },
};

// ── DONNÉES ENRICHIES ─────────────────────────────────────────
const AGENCES_ENRICHIES = AGENCES.map((a, i) => ({
  ...a,
  score: [92, 78, 65, 45][i] || 70,
  date_expiration_contrat: ['2027-06-01', '2026-08-15', '2026-07-10', '2026-06-20'][i],
  evolution_ca: [
    [680000, 720000, 810000, 745000, 892000, 920000],
    [400000, 450000, 480000, 510000, 524000, 540000],
    [120000, 145000, 160000, 175000, 198000, 210000],
    [60000, 70000, 80000, 85000, 98000, 110000],
  ][i] || [100000, 120000, 140000],
  alertes: i === 3 ? [
    { type: 'CA faible', desc: 'CA à 49% de l\'objectif depuis 2 mois', severite: 'critique' },
    { type: 'SLA bas', desc: 'SLA à 88.5% — seuil contractuel à 90%', severite: 'haute' },
  ] : i === 2 ? [
    { type: 'CA faible', desc: 'CA à 66% de l\'objectif ce mois', severite: 'haute' },
  ] : [],
  documents: [
    { label: 'Contrat signé', statut: 'valide', date: '2025-06-01', icone: '📄' },
    { label: 'Registre de commerce', statut: 'valide', date: '2028-01-01', icone: '🏛️' },
    { label: 'Attestation fiscale', statut: i < 2 ? 'valide' : 'en_attente', date: '2026-12-31', icone: '📋' },
    { label: 'Avenant tarifaire 2026', statut: i === 0 ? 'valide' : 'manquant', date: null, icone: '✏️' },
  ],
}));

function scoreColor(score) {
  return score >= 85 ? C.vert : score >= 65 ? C.ambre : C.rouge;
}

function joursRestants(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ── COMPOSANTS ────────────────────────────────────────────────

function StatCard({ label, valeur, icone, bg, color, sous }) {
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icone}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: color || C.texte }}>{valeur}</div>
        <div style={{ fontSize: 11, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 2 }}>{label}</div>
        {sous && <div style={{ fontSize: 11, color: C.vert, marginTop: 2 }}>{sous}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 600ms ease' }} />
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 40, height: 40 }}>
        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 40, height: 40 }}>
          <circle cx="18" cy="18" r="15" fill="none" stroke={C.border} strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score * 0.942} 94.2`} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color }}>{score}</div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color }}>
          {score >= 85 ? 'Excellent' : score >= 65 ? 'Moyen' : 'Faible'}
        </div>
        <div style={{ fontSize: 10, color: C.texteMuted }}>Score global</div>
      </div>
    </div>
  );
}

function MiniSparkline({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 120, H = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  const lastUp = data[data.length - 1] > data[data.length - 2];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <polyline points={points} fill="none" stroke={C.vert} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = H - ((v - min) / range) * (H - 8) - 4;
          return i === data.length - 1 ? <circle key={i} cx={x} cy={y} r="3" fill={C.vert} /> : null;
        })}
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, color: lastUp ? C.vert : C.rouge }}>
        {lastUp ? '↑' : '↓'} {Math.abs(Math.round((data[data.length - 1] - data[data.length - 2]) / data[data.length - 2] * 100))}%
      </span>
    </div>
  );
}

function AlerteBadge({ alertes }) {
  if (!alertes?.length) return null;
  const critique = alertes.some(a => a.severite === 'critique');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: critique ? '#FEF2F2' : '#FFFBEB', border: `.5px solid ${critique ? '#FECACA' : '#FDE68A'}`, borderRadius: 8, padding: '3px 8px' }}>
      <span style={{ fontSize: 10 }}>{critique ? '🚨' : '⚠️'}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: critique ? C.rouge : C.ambre }}>{alertes.length} alerte{alertes.length > 1 ? 's' : ''}</span>
    </div>
  );
}

// ── MODAL COMPARAISON ─────────────────────────────────────────
function ComparaisonModal({ agences, onClose }) {
  if (agences.length < 2) return null;
  const [a1, a2] = agences;
  const metrics = [
    { label: 'Score global', v1: a1.score, v2: a2.score, unit: '/100', higher: true },
    { label: 'CA mensuel', v1: a1.ca_mois, v2: a2.ca_mois, unit: ' F', higher: true, format: formatMontant },
    { label: 'Taux SLA', v1: a1.taux_sla, v2: a2.taux_sla, unit: '%', higher: true },
    { label: 'Courses/mois', v1: a1.courses_mois, v2: a2.courses_mois, unit: '', higher: true },
    { label: 'Chauffeurs', v1: a1.nb_chauffeurs, v2: a2.nb_chauffeurs, unit: '', higher: true },
    { label: 'Alertes actives', v1: a1.alertes.length, v2: a2.alertes.length, unit: '', higher: false },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 300, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '92%', maxWidth: 680, background: C.blanc, zIndex: 301, borderRadius: 20, boxShadow: '0 30px 100px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>⚖️ Comparaison agences</span>
          <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div />
            {[a1, a2].map((a, i) => (
              <div key={i} style={{ textAlign: 'center', background: C.surface, borderRadius: 12, padding: '14px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>{a.nom}</div>
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>📍 {a.ville}</div>
                <ScoreBadge score={a.score} />
              </div>
            ))}
          </div>
          {/* Métriques */}
          {metrics.map((m, i) => {
            const v1Better = m.higher ? m.v1 > m.v2 : m.v1 < m.v2;
            const v2Better = m.higher ? m.v2 > m.v1 : m.v2 < m.v1;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: C.texteMuted, fontWeight: 500 }}>{m.label}</div>
                {[{ val: m.v1, better: v1Better }, { val: m.v2, better: v2Better }].map((item, j) => (
                  <div key={j} style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: item.better ? C.vertClair : C.surface, border: `.5px solid ${item.better ? '#BBF7D0' : C.border}` }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: item.better ? C.vert : C.texte }}>
                      {m.format ? m.format(item.val) : item.val}{m.unit}
                    </span>
                    {item.better && <span style={{ fontSize: 10, color: C.vert, marginLeft: 4 }}>★</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── CARTE GÉOGRAPHIQUE SIMULÉE ────────────────────────────────
function CarteGeo({ agences }) {
  const positions = [
    { nom: 'Douala', x: 45, y: 55 },
    { nom: 'Brazzaville', x: 62, y: 68 },
    { nom: 'Yaoundé', x: 52, y: 48 },
    { nom: 'Libreville', x: 38, y: 62 },
  ];

  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.texte }}>🗺️ Carte des agences</span>
        <span style={{ fontSize: 11, color: C.texteMuted }}>Carte simulée · Interactive en production</span>
      </div>
      <div style={{ position: 'relative', height: 280, background: 'linear-gradient(135deg, #0d1b0d, #1a3320)', overflow: 'hidden' }}>
        {/* Grille */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`h${i}`} style={{ position: 'absolute', top: `${i * 14}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.05)' }} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`v${i}`} style={{ position: 'absolute', left: `${i * 11}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.05)' }} />
        ))}
        {/* Connexions */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {positions.map((p1, i) => positions.slice(i + 1).map((p2, j) => (
            <line key={`${i}-${j}`} x1={`${p1.x}%`} y1={`${p1.y}%`} x2={`${p2.x}%`} y2={`${p2.y}%`}
              stroke="rgba(34,197,94,.15)" strokeWidth="1" strokeDasharray="4 4" />
          )))}
        </svg>
        {/* Marqueurs */}
        {positions.map((pos, i) => {
          const agence = agences.find(a => a.ville === pos.nom);
          if (!agence) return null;
          const sc = STATUT_CONFIG[agence.statut] || STATUT_CONFIG.en_attente;
          const hasAlerte = (agence.alertes || []).length > 0;
          return (
            <div key={i} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              {/* Pulse ring */}
              <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: hasAlerte ? 'rgba(239,68,68,.2)' : 'rgba(34,197,94,.2)', animation: 'pulse 2s infinite' }} />
              {/* Marker */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: hasAlerte ? C.rouge : C.vert, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 12px rgba(0,0,0,.3)', cursor: 'pointer', position: 'relative' }}>
                🏢
              </div>
              {/* Label */}
              <div style={{ position: 'absolute', top: 42, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                {localAgence?.nom || '—'.split(' ')[0]}
                {hasAlerte && ' ⚠️'}
              </div>
            </div>
          );
        })}
        {/* Légende */}
        <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 10 }}>
          {[{ c: C.vert, l: 'Actif' }, { c: C.rouge, l: 'Alertes' }, { c: C.ambre, l: 'En attente' }].map(item => (
            <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.5)', padding: '3px 8px', borderRadius: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.c }} />
              <span style={{ fontSize: 9, color: '#fff' }}>{item.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PODIUM ────────────────────────────────────────────────────
function Podium({ agences }) {
  const top3 = [...agences].filter(a => a.statut === 'actif').sort((a, b) => b.score - a.score).slice(0, 3);
  const medailles = ['🥇', '🥈', '🥉'];
  const heights = [100, 75, 60];

  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.texte, marginBottom: 16 }}>🏆 Classement agences du mois</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, height: 160 }}>
        {[top3[1], top3[0], top3[2]].map((a, i) => {
          if (!a) return <div key={i} style={{ width: 100 }} />;
          const realRank = i === 0 ? 1 : i === 1 ? 0 : 2;
          const h = [75, 100, 60][i];
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.texte, textAlign: 'center', maxWidth: 90 }}>{a.nom.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: scoreColor(a.score), fontWeight: 700 }}>Score {a.score}</div>
              <div style={{ width: 80, height: h, background: `linear-gradient(180deg, ${scoreColor(a.score)}22, ${scoreColor(a.score)}44)`, border: `.5px solid ${scoreColor(a.score)}`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                <span style={{ fontSize: 24 }}>{medailles[realRank]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MODAL AGENCE ──────────────────────────────────────────────
function AgenceModal({ agence, onClose, onToggle }: any) {
  const [onglet, setOnglet] = useState('informations');
  const [localAgence, setLocalAgence] = useState<any>(agence || {});

  useEffect(() => {
    if (!agence?.id) return;
    setLocalAgence(agence);
    apiCall(API.AGENCY_DETAIL(agence.id))
      .then((d: any) => {
        console.log('AGENCY DETAIL:', d); 
        setLocalAgence((prev: any) => ({
          ...prev,
          nb_chauffeurs: d.stats?.total_chauffeurs ?? 0,
          courses_mois: d.stats?.total_courses ?? 0,
          ca_mois: Number(d.stats?.total_revenus ?? 0),
          note_globale: d.stats?.note_moyenne ?? 0,
          responsable: d.responsable?.nom || '—',
          email: d.email || prev?.email,
          telephone: d.telephone || prev?.telephone,
          created_at: d.created_at || prev?.created_at,
          chauffeurs_list: d.chauffeurs || [],
          statut: d.is_active ? 'actif' : 'suspendu',
        }));
      })
      .catch(() => {});
  }, [agence?.id]);

  // Le return conditionnel APRÈS tous les hooks
 if (!agence) return null;

// const sc = (localAgence?.statut || agence?.statut) === 'actif'
//   ? { label: 'Actif', bg: C.vertClair, color: C.vertFonce }
//   : (localAgence?.statut || agence?.statut) === 'suspendu'
//   ? { label: 'Suspendu', bg: C.rougeClair, color: C.rouge }
//   : { label: 'En attente', bg: '#FEF3C7', color: '#B45309' };
//   console.log('SC:', sc, 'STATUT:', localAgence?.statut, agence?.statut);

const statut = localAgence?.statut || agence?.statut || 'en_attente';
const sc = STATUT_CONFIG[statut] || STATUT_CONFIG['en_attente'];

const contratExpireBientot = false;
const contratExpire = false;
const jours = 0;

const ONGLETS = [
  { id: 'informations', label: 'Informations', icone: '📋' },
  { id: 'performance', label: 'Performance', icone: '📈' },
  { id: 'chauffeurs', label: `Chauffeurs (${localAgence?.nb_chauffeurs || 0})`, icone: '🚗' },
  { id: 'contrat', label: 'Contrat', icone: '📄' },
  { id: 'facturation', label: 'Facturation', icone: '💰' },
];

const chauffeurs_agence = localAgence?.chauffeurs_list || [];
const factures = [];
const sla = localAgence?.taux_sla || 0;
const pctCA2 = localAgence?.objectif_ca ? Math.round((localAgence?.ca_mois || 0) / localAgence.objectif_ca * 100) : 0;

return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '92%', maxWidth: 780, maxHeight: '90vh', background: C.blanc, zIndex: 201, borderRadius: 20, boxShadow: '0 30px 100px rgba(0,0,0,.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏢</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.texte }}>{localAgence?.nom || '—'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
             {(localAgence?.alertes || []).length > 0 && <AlerteBadge alertes={localAgence?.alertes || []} />}
              {contratExpireBientot && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#FFFBEB', color: C.ambre }}>⚠️ Contrat expire dans {jours}j</span>}
              {contratExpire && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#FEF2F2', color: C.rouge }}>🚨 Contrat expiré</span>}
            </div>
            <div style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>👤 {localAgence?.responsable || '—'} · 📍 {localAgence?.adresse || '—'}</div>
          </div>
          <ScoreBadge score={localAgence?.score || 0} />
          <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
        </div>

        {/* Alertes banner */}
        {(localAgence?.alertes || []).length > 0 && (
          <div style={{ padding: '10px 24px', background: '#FEF2F2', borderBottom: `.5px solid #FECACA`, flexShrink: 0 }}>
            {localAgence?.alertes || [].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < localAgence?.alertes || [].length - 1 ? 6 : 0 }}>
                <span style={{ fontSize: 12 }}>{a.severite === 'critique' ? '🚨' : '⚠️'}</span>
                <span style={{ fontSize: 12, color: a.severite === 'critique' ? C.rouge : C.ambre, fontWeight: 500 }}>{a.type} — {a.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: `.5px solid ${C.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: onglet === o.id ? 600 : 400, color: onglet === o.id ? C.vert : C.texteMuted, borderBottom: onglet === o.id ? `2px solid ${C.vert}` : '2px solid transparent', whiteSpace: 'nowrap' }}>{o.label}</button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ── INFORMATIONS ── */}
          {onglet === 'infos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {console.log('LOCAL AGENCE DANS ONGLET:', localAgence)}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Chauffeurs', val: localAgence?.nb_chauffeurs || 0, icone: '🚕' },
                  { label: 'Courses/mois', val: localAgence?.courses_mois || 0, icone: '📦' },
                  { label: 'CA mensuel', val: formatMontant(localAgence?.ca_mois || 0), icone: '💰' },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 12, padding: '14px', textAlign: 'center', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icone}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.texte }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: C.texteMuted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 8 }}>CA vs objectif mensuel</div>
                 <ProgressBar pct={pctCA2} color={pctCA2 >= 90 ? C.vert : C.ambre} height={8} />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: C.texteMuted }}>
                    <span>{formatMontant(localAgence?.ca_mois || 0)}</span>
                    <span>/ {formatMontant(localAgence?.objectif_ca || 0)}</span>
                 </div>
                </div>
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 8 }}>Taux SLA contractuel</div>
                  <ProgressBar pct={ localAgence?.taux_sla || 0} color={(localAgence?.taux_sla || 0) >= 95 ? C.vert : (localAgence?.taux_sla || 0) >= 88 ? C.ambre : C.rouge} height={8} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: C.texteMuted }}>
                    <span style={{ fontWeight: 600, color: (localAgence?.taux_sla || 0) >= 95 ? C.vert : C.ambre }}>{ localAgence?.taux_sla || 0}%</span>
                    <span>Seuil min : 90%</span>
                  </div>
                </div>
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Informations contact</div>
                {[
                  { label: 'Responsable', val: localAgence?.responsable || '—', icone: '👤' },
                  { label: 'Email', val: localAgence?.email || '—', icone: '📧' },
                  { label: 'Téléphone', val: localAgence?.telephone || '—', icone: '📞' },
                  { label: 'Ville', val: localAgence?.adresse || '—', icone: '📍' },
                  { label: 'Membre depuis', val: localAgence?.created_at || '—', icone: '📅' },
                  { label: 'Expiration contrat', val: null ? new Date(null).toLocaleDateString('fr-FR') : '—' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `.5px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.texteMuted }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>📧 Envoyer identifiants</button>
                <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: '#FEF9C3', color: '#B45309', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>📄 Générer facture PDF</button>
                <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>🔄 Renouveler contrat</button>
                <button onClick={async () => {
  if (!confirm(`Voulez-vous ${localAgency.is_active ? 'suspendre' : 'réactiver'} cette agence ?`)) return;
  try {
    await apiCall(API.AGENCY_SUSPEND(localAgency.id), 'PATCH');
    setLocalAgency(prev => ({ ...prev, is_active: !prev.is_active }));
  } catch (err: any) { alert(err.message); }
}} style={{ padding: '11px', borderRadius: 10, border: 'none', background: localAgency.statut === 'actif' ? '#FEF2F2' : C.vertClair, color: localAgence?.statut || '—' === 'actif' ? C.rouge : C.vertFonce, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  {localAgence?.statut || '—' === 'actif' ? '⏸ Suspendre' : '✓ Réactiver'}
                </button>
              </div>
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {onglet === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { label: 'Score global', val: `${localAgence?.score || 0}/100`, color: scoreColor(localAgence?.score || 0), bg: `${scoreColor(localAgence?.score || 0)}15` },
                  { label: 'Taux SLA', val: `${localAgence?.taux_sla || 0}%`, color: (localAgence?.taux_sla || 0) >= 95 ? C.vert : C.ambre, bg: (localAgence?.taux_sla || 0) >= 95 ? C.vertClair : C.ambreClair },
                  { label: 'CA mensuel', val: formatMontant(localAgence?.ca_mois || 0), color: C.vert, bg: C.vertClair },
                  { label: 'Objectif CA', val: formatMontant(localAgence?.objectif_ca || 0), color: C.violet, bg: C.violetClair },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '16px', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Évolution CA */}
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Évolution CA — 6 derniers mois</div>
                {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((mois, i) => {
                  const evoCA = localAgence?.evolution_ca || [0,0,0,0,0,0];
                  const val = evoCA[i] || 0;
                  const max = Math.max(...evoCA) || 1;
                  const pct = Math.round(val / max * 100);
                  const isLast = i === 5;
                  return (
                    <div key={mois} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.texteMuted, width: 32 }}>{mois}</span>
                      <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isLast ? C.vert : `${C.vert}80`, borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: isLast ? 700 : 400, color: isLast ? C.vert : C.texteMuted, width: 90, textAlign: 'right' }}>{formatMontant(val || 0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Prévision */}
              <div style={{ background: '#052E16', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>⚡ Prévision IA — Mois prochain</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  {formatMontant(Math.round((localAgence?.evolution_ca || [0,0,0,0,0,0]?.[5] || localAgence?.ca_mois || 0 || 0) * 1.08))}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                  Basé sur la tendance des 6 derniers mois · ±8% intervalle de confiance
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Tendance haussière', 'Saison favorable', '+2 chauffeurs prévus'].map(f => (
                    <span key={f} style={{ fontSize: 10, background: 'rgba(74,222,128,.15)', color: '#4ADE80', padding: '2px 8px', borderRadius: 20 }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CHAUFFEURS ── */}
          {onglet === 'chauffeurs' && (
            <div>
              {chauffeurs_agence.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: C.texteMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🚕</div>
                  <div>Aucun chauffeur rattaché</div>
                </div>
              ) : (
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden', marginBottom: 12 }}>
                  {chauffeurs_agence.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < chauffeurs_agence.length - 1 ? `.5px solid ${C.border}` : 'none' }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{c.nom}</div>
                        <div style={{ fontSize: 11, color: C.texteMuted }}>{c.driver_id} · {c.courses} courses · ⭐ {c.note}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#DCFCE7', color: '#15803D' }}>Actif</span>
                    </div>
                  ))}
                </div>
              )}
              <button style={{ width: '100%', padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                + Ajouter un chauffeur
              </button>
            </div>
          )}

          {/* ── CONTRAT ── */}
          {onglet === 'contrat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Infos contrat */}
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Conditions contractuelles</div>
                {[
                  { label: 'Date début', val: new Date(localAgence?.create_at || '—').toLocaleDateString('fr-FR') },
                  { label: 'Date expiration', val: null ? new Date(null).toLocaleDateString('fr-FR') : '—' },
                  { label: 'Jours restants', val: jours !== null ? (jours > 0 ? `${jours} jours` : 'Expiré') : '—' },
                  { label: 'Objectif CA mensuel', val: formatMontant(localAgence?.objectif_ca || 0|| 0) },
                  { label: 'Commission COLIGO', val: '10% du CA' },
                  { label: 'SLA minimum', val: '90% livraisons à temps' },
                  { label: 'Pénalité SLA', val: '5% commission si SLA < 85%' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `.5px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.texteMuted }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Alerte renouvellement */}
              {(contratExpireBientot || contratExpire) && (
                <div style={{ background: contratExpire ? '#FEF2F2' : '#FFFBEB', border: `.5px solid ${contratExpire ? '#FECACA' : '#FDE68A'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{contratExpire ? '🚨' : '⚠️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: contratExpire ? C.rouge : C.ambre }}>
                      {contratExpire ? 'Contrat expiré — Renouvellement urgent' : `Contrat expire dans ${jours} jours`}
                    </div>
                    <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>
                      Contactez le responsable pour renouveler les conditions
                    </div>
                  </div>
                  <button style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: contratExpire ? C.rouge : C.ambre, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                    Renouveler →
                  </button>
                </div>
              )}

              {/* Documents */}
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Documents contractuels</span>
                  <button style={{ fontSize: 11, color: C.vert, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>+ Uploader</button>
                </div>
                {localAgence?.documents || []?.map((doc, i) => {
                  const cfg = {
                    valide: { bg: '#DCFCE7', color: '#15803D', label: '✓ Valide' },
                    en_attente: { bg: '#FEF3C7', color: '#B45309', label: '⏳ En attente' },
                    manquant: { bg: '#F1F5F9', color: '#64748B', label: '— Manquant' },
                  }[doc.statut];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < localAgence?.documents || [].length - 1 ? `.5px solid ${C.border}` : 'none' }}>
                      <span style={{ fontSize: 20 }}>{doc.icone}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{doc.label}</div>
                        {doc.date && <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>Expire le {new Date(doc.date).toLocaleDateString('fr-FR')}</div>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: cfg?.bg, color: cfg?.color }}>{cfg?.label}</span>
                      {doc.statut === 'valide' && <button style={{ padding: '4px 10px', borderRadius: 6, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texteMuted, fontSize: 11, cursor: 'pointer' }}>PDF</button>}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>🔄 Renouveler contrat</button>
                <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>✏️ Modifier conditions</button>
              </div>
            </div>
          )}

          {/* ── FACTURATION ── */}
          {onglet === 'facturation' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #14532D, #22C55E)', borderRadius: 16, padding: '24px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>CA total généré</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: '#fff' }}>{formatMontant(localAgence?.evolution_ca || [0,0,0,0,0,0]?.reduce((s, v) => s + v, 0) || localAgence?.ca_mois || 0 || 0 * 6)}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Depuis la création · Commission COLIGO : {formatMontant(Math.round((localAgence?.evolution_ca || [0,0,0,0,0,0]?.reduce((s, v) => s + v, 0) || localAgence?.ca_mois || 0 || 0 * 6) * 0.1))}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <button style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>📄 Générer facture juin</button>
                <button style={{ padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>📥 Exporter historique</button>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Historique factures</div>
              {factures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface, borderRadius: 10, marginBottom: 8, border: `.5px solid ${C.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: f.statut === 'payee' ? C.vertClair : C.ambreClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {f.statut === 'payee' ? '✓' : '⏳'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>Facture {f.mois}</div>
                    <div style={{ fontSize: 11, color: C.texteMuted }}>{f.statut === 'payee' ? `Payée le ${f.date}` : 'En cours de génération'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.vert }}>{formatMontant(Math.round(f.montant || 0))}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 20, background: f.statut === 'payee' ? '#DCFCE7' : '#FEF3C7', color: f.statut === 'payee' ? '#15803D' : '#B45309' }}>
                      {f.statut === 'payee' ? 'Payée' : 'En cours'}
                    </span>
                  </div>
                  {f.statut === 'payee' && <button style={{ padding: '5px 10px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texteMuted, fontSize: 11, cursor: 'pointer' }}>PDF</button>}
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
export default function AgenciesPage() {
  const [agences, setAgences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accesRefuse, setAccesRefuse] = useState(false);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('all');
  const [selectedAgence, setSelectedAgence] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [vueMode, setVueMode] = useState('cartes');
  const [comparaison, setComparaison] = useState([]);
  const [showComparaison, setShowComparaison] = useState(false);
  const [form, setForm] = useState({ nom: '', responsable: '', email: '', telephone: '', ville: '' });

  useEffect(() => {
  apiCall(API.AGENCIES)
    .then((d: any) => {
      const raw = Array.isArray(d) ? d : d.results || [];
      const mapped = raw.map((a: any) => ({
        id: a.id,
        nom: a.nom,
        email: a.email,
        telephone: a.telephone,
        adresse: a.adresse || '',
        ville: '',
        responsable: '',
        statut: a.is_active ? 'actif' : 'suspendu',
        score: 0,
        nb_chauffeurs: 0,
        courses_mois: 0,
        ca_mois: 0,
        objectif_ca: 0,
        taux_sla: 0,
        note_globale: 0,
        evolution_ca: [0, 0, 0, 0, 0, 0],
        alertes: [],
        documents: [],
        chauffeurs_list: [],
      }));
      setAgences(mapped);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
}, []);

  const filtered = agences.filter((a: any) => {
    const matchSearch = !search || `${a.nom} ${a.email} ${a.telephone}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filtreStatut === 'all' || (filtreStatut === 'actif' ? a.is_active : !a.is_active);
    return matchSearch && matchStatut;
  });

  const stats = {
    total: agences.length,
    actives: agences.filter((a: any) => a.is_active).length,
    ca_total: 0,
    chauffeurs_total: 0,
  };

  const alertesGlobales: any[] = [];

  // const stats = {
  //   total: agences.length,
  //   actives: agences.filter((a: any) => a.statut === 'actif').length,
  //   ca_total: agences.reduce((s, a: any) => s + (a.ca_mois || 0), 0),
  //   chauffeurs_total: agences.reduce((s, a: any) => s + (a.nb_chauffeurs || 0), 0),
  // };

 
  async function toggleStatut(id: number) {
  try {
    await apiCall(API.AGENCY_SUSPEND(id), 'PATCH');
    setLocalAgence((prev: any) => ({
      ...prev,
      statut: prev.statut === 'actif' ? 'suspendu' : 'actif',
      is_active: !prev.is_active,
    }));
  } catch (err: any) {
    alert(err.message);
  }
}

  function toggleComparaison(agence: any) {
    setComparaison(prev => {
      if (prev.find((a: any) => a.id === agence.id)) return prev.filter((a: any) => a.id !== agence.id);
      if (prev.length >= 2) return [prev[1], agence];
      return [...prev, agence];
    });
  }


  async function creerAgence(e) {
  e.preventDefault();
  try {
    const data = await apiCall(API.AGENCIES, 'POST', {
      nom: form.nom,
      responsable: form.responsable,
      email: form.email,
      telephone: form.telephone,
      adresse: form.adresse || form.ville,
      ville: form.ville,
    });
    setAgences(prev => [...prev, {
      ...data,
      score: 0,
      alertes: [],
      documents: [],
      evolution_ca: [0, 0, 0, 0, 0, 0],
      taux_sla: 90,
      objectif_ca: 500000,
      nb_chauffeurs: 0,
      courses_mois: 0,
      ca_mois: 0,
      statut: data.statut || 'en_attente',
    }]);
    setShowCreate(false);
    setForm({ nom: '', responsable: '', email: '', telephone: '', ville: '' });
    alert('✅ Agence créée. Un email de bienvenue a été envoyé au responsable.');
  } catch (err: any) {
    // Vérifier si c'est une erreur d'email déjà utilisé par un admin
    if (err.message?.includes('administrateur') || err.message?.includes('admin')) {
      try {
        const errData = JSON.parse(err.message);
        if (errData.admin_existant) {
          const admin = errData.admin_existant;
          alert(
            `⚠️ Un administrateur est déjà assigné à cet email.\n\n` +
            `👤 ${admin.first_name} ${admin.last_name}\n` +
            `🔑 Rôle : ${admin.role}\n\n` +
            `Vous pouvez modifier les informations de cet admin depuis la page Admins.`
          );
          return;
        }
      } catch {}
      alert('⚠️ Un administrateur est déjà assigné à cet email. Vous pouvez modifier ses informations depuis la page Admins.');
    } else {
      alert('Erreur : ' + err.message);
    }
  }
 }

 function exporterAgences(liste, stats) {
  imprimerRapport({
    titre: 'Rapport Agences',
    sousTitre: `${liste.length} agence${liste.length > 1 ? 's' : ''} affichée${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '🏢 Détail des agences',
        colonnes: ['Agence', 'Responsable', 'Ville', 'Score', 'CA mensuel', 'SLA', 'Chauffeurs', 'Statut'],
        lignes: liste.map((a: any) => [
          a.nom,
          a.responsable,
          a.ville,
          `${a.score}/100`,
          formatMontantExport(a.ca_mois || 0),
          `${a.taux_sla}%`,
          a.nb_chauffeurs,
          a.statut,
        ]),
      },
    ],
  });
 }

 if (accesRefuse) return <AccesRefuse module="la gestion des agences" />;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Chargement des agences...</div>
    </div>
  );

  // Le reste du return est identique à l'original — remplace juste AGENCES_ENRICHIES par agences
  // et les données mock par les variables locales ci-dessus

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.8);opacity:0} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0 }}>Gestion Agences</h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>{filtered.length} agence{filtered.length > 1 ? 's' : ''} · Données réelles</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {comparaison.length === 2 && (
            <button onClick={() => setShowComparaison(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.violet, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⚖️ Comparer</button>
          )}
       <button onClick={() => exporterAgences(filtered, stats)} style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>📥 Exporter CSV</button>          <button onClick={() => setShowCreate(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Nouvelle agence</button>
        </div>
      </div>

      {/* Alertes globales */}
      {alertesGlobales.length > 0 && (
        <div style={{ background: '#FEF2F2', border: `.5px solid #FECACA`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.rouge }}>{alertesGlobales.length} alerte{alertesGlobales.length > 1 ? 's' : ''} active{alertesGlobales.length > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>{alertesGlobales.map((a: any) => `${a.agence} — ${a.type}`).join(' · ')}</div>
          </div>
        </div>
      )}

      {/* Podium */}
      <Podium agences={agences} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Agences total" valeur={stats.total} icone="🏢" bg={C.bleuClair} />
        <StatCard label="Agences actives" valeur={stats.actives} icone="✓" bg={C.vertClair} color={C.vert} />
        <StatCard label="CA total ce mois" valeur={formatMontant(stats.ca_total || 0)} icone="💰" bg={C.ambreClair} color={C.ambre} />
        <StatCard label="Chauffeurs partenaires" valeur={stats.chauffeurs_total} icone="🚕" bg={C.vertClair} />
      </div>

      {/* Carte géo */}
      <div style={{ marginBottom: 20 }}>
        <CarteGeo agences={agences} />
      </div>

      {/* Filtres */}
      <div style={{ background: C.blanc, borderRadius: 14, border: `.5px solid ${C.border}`, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surface, borderRadius: 10, padding: '8px 14px', border: `.5px solid ${C.border}`, flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une agence..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: C.texte, outline: 'none', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ id: 'all', label: 'Toutes' }, { id: 'actif', label: 'Actives' }, { id: 'en_attente', label: 'En attente' }, { id: 'suspendu', label: 'Suspendues' }].map(f => (
            <button key={f.id} onClick={() => setFiltreStatut(f.id)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: filtreStatut === f.id ? C.vert : C.surface, color: filtreStatut === f.id ? '#fff' : C.texteMuted }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, background: C.surface, borderRadius: 8, padding: 3 }}>
          {[{ id: 'cartes', label: '⊞' }, { id: 'tableau', label: '≡' }].map(v => (
            <button key={v.id} onClick={() => setVueMode(v.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, background: vueMode === v.id ? C.blanc : 'transparent', boxShadow: vueMode === v.id ? '0 1px 3px rgba(0,0,0,.1)' : 'none' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* VUE CARTES */}
      {vueMode === 'cartes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: C.texteMuted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🏢</div>
              <div>Aucune agence trouvée</div>
            </div>
          ) : (filtered as any[]).map(agence => {
            const sc = STATUT_CONFIG[agence.statut] || STATUT_CONFIG.en_attente;
            const pctCA = agence.objectif_ca > 0 ? Math.min(Math.round(agence.ca_mois / agence.objectif_ca * 100), 100) : 0;
            const colorCA = pctCA >= 90 ? C.vert : pctCA >= 60 ? C.ambre : C.rouge;
            const isSelected = comparaison.find((a: any) => a.id === agence.id);
            const jours = joursRestants(null);
            return (
              <div key={agence.id} style={{ background: C.blanc, border: `.5px solid ${isSelected ? C.violet : C.border}`, borderRadius: 16, padding: '18px 20px', cursor: 'pointer', transition: 'all 200ms ease', boxShadow: '0 2px 8px rgba(0,0,0,.04)', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; }}
                onClick={() => setSelectedAgence(agence)}
              >
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }} onClick={e => { e.stopPropagation(); toggleComparaison(agence); }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `.5px solid ${isSelected ? C.violet : C.border}`, background: isSelected ? C.violet : C.blanc, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {isSelected && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 24 }}>{agence.nom || '—'}</div>
                    <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>👤 {agence.responsable || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  {agence.alertes || []?.length > 0 && <AlerteBadge alertes={agence.alertes || []} />}
                  {jours !== null && jours <= 30 && jours > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FFFBEB', color: C.ambre }}>⚠️ Contrat {jours}j</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <ScoreBadge score={agence.score || 0} />
                  <MiniSparkline data={agence.evolution_ca || [0,0,0,0,0,0] || [agence.ca_mois || 0 || 100000]} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                  {[
                    { label: 'Chauffeurs', val:agence.nb_chauffeurs || 0 },
                    { label: 'Courses', val: agence.courses_mois || 0 },
                    { label: 'SLA', val: `${ agence.taux_sla || 0}%` },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', background: C.surface, borderRadius: 8, padding: '6px 4px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: C.texteMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.texteMuted }}>CA mensuel</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: colorCA }}>{pctCA}%</span>
                  </div>
                  <ProgressBar pct={pctCA} color={colorCA} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: C.texteMuted }}>
                    <span>{formatMontant(agence.ca_mois || 0 || 0)}</span>
                    <span>/ {formatMontant(agence.objectif_ca || 0|| 0)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `.5px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.texteMuted }}>📍 {agence.adresse || '—'}</span>
                  <button onClick={e => { e.stopPropagation(); setSelectedAgence(agence); }}
                    style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    Voir →
                  </button>
                </div>
              </div>
            );
            
          })}
        </div>
      )}

      {/* VUE TABLEAU */}
      {vueMode === 'tableau' && (
        <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['', 'Agence', 'Score', 'CA mensuel', 'Objectif', 'SLA', 'Chauffeurs', 'Statut', 'Alertes', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filtered as any[]).map(agence => {
                const sc = STATUT_CONFIG[agence.statut || '—'] || STATUT_CONFIG.en_attente;
                const isSelected = comparaison.find((a: any) => a.id === agence.id);
                return (
                  <tr key={agence.id} style={{ borderBottom: `.5px solid ${C.border}`, cursor: 'pointer', transition: 'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setSelectedAgence(agence)}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <div onClick={e => { e.stopPropagation(); toggleComparaison(agence); }}
                        style={{ width: 18, height: 18, borderRadius: 4, border: `.5px solid ${isSelected ? C.violet : C.border}`, background: isSelected ? C.violet : C.blanc, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{agence.nom || '—'}</div>
                      <div style={{ fontSize: 11, color: C.texteMuted }}>📍 {agence.adresse || '—'} · 👤 {agence.responsable || '—'}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(agence.score || 0) }}>{agence.score || 0}/100</span></td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: C.vert }}>{formatMontant(agence.ca_mois || 0 || 0)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 3 }}>{agence.objectif_ca || 0> 0 ? Math.round(agence.ca_mois || 0 / agence.objectif_ca || 0* 100) : 0}%</div>
                      <ProgressBar pct={agence.objectif_ca || 0> 0 ? Math.round(localAgence?.ca_mois || 0 / localAgence?.objectif_ca || 0* 100) : 0} color={C.vert} height={4} />
                    </td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 13, fontWeight: 600, color:  localAgence?.taux_sla || 0 >= 95 ? C.vert :  localAgence?.taux_sla || 0 >= 88 ? C.ambre : C.rouge }}>{ localAgence?.taux_sla || 0}%</span></td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: C.texte, textAlign: 'center' }}>{localAgence?.nb_chauffeurs || 0}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                    <td style={{ padding: '10px 14px' }}>
                      {localAgence?.alertes || []?.length > 0 ? <AlerteBadge alertes={localAgence?.alertes || []} /> : <span style={{ fontSize: 12, color: C.texteMuted }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={e => { e.stopPropagation(); setSelectedAgence(agence); }} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Voir →</button>
                    </td>
                  </tr>
                );
                
              })}
            </tbody>
          </table>
          <div style={{ padding: '12px 16px', borderTop: `.5px solid ${C.border}`, fontSize: 12, color: C.texteMuted }}>
            {filtered.length} agence{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
      

      {/* Modal création */}
      {showCreate && (
        <>
          <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 480, background: C.blanc, zIndex: 201, borderRadius: 20, boxShadow: '0 25px 80px rgba(0,0,0,.25)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.texte, margin: 0 }}>Nouvelle agence</h3>
                <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 4 }}>Les identifiants seront envoyés par email</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
            </div>
            <form onSubmit={creerAgence}>
              {[
                { key: 'nom', label: "Nom de l'agence", placeholder: 'Express Cargo Douala' },
                { key: 'responsable', label: 'Responsable', placeholder: 'Marcel Fotso' },
                { key: 'email', label: 'Email', placeholder: 'contact@agence.cm' },
                { key: 'telephone', label: 'Téléphone', placeholder: '+237 233 111 222' },
                { key: 'ville', label: 'Ville', placeholder: 'Douala' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input required value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                    style={{ width: '100%', height: 40, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 14px', fontSize: 13, outline: 'none', background: C.surface, color: C.texte, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✓ Créer l'agence</button>
              </div>
            </form>
          </div>
        </>
      )}
        
      <AgenceModal agence={selectedAgence} onClose={() => setSelectedAgence(null)} onToggle={toggleStatut} />
      {showComparaison && comparaison.length === 2 && (
        <ComparaisonModal agences={comparaison} onClose={() => setShowComparaison(false)} />
      )}
    </div>
  );

}

