// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
function formatMontant(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n) + ' F';
}
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';
import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';


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
  mapDark: '#0a0f0a',
};

// ── DONNÉES MOCK ──────────────────────────────────────────────

const EXPEDITIONS = [
  {
    id: 'EXP-001', statut: 'livre', priorite: 'normale',
    client: { nom: 'Serena Kameni', avatar: 'SK', telephone: '+237 622 202 461' },
    chauffeur: { nom: 'Paul Nguema', driver_id: 'T-014', avatar: 'PN', note: 4.9 },
    agence: 'Express Cargo Douala',
    origine: 'Akwa, Douala', destination: 'Bonanjo, Douala',
    distance_km: 3.2, format_colis: 'S', description: 'Documents administratifs',
    valeur_marchandise: 150000, poids_kg: 2.5, volume_m3: 0.02,
    tarif: 500, commission: 50, mode_paiement: 'especes',
    date_creation: '2026-06-05T07:00:00',
    date_depart: '2026-06-05T08:15:00',
    date_livraison: '2026-06-05T09:45:00',
    eta: '—', eta_minutes: null,
    note_client: 5.0, note_chauffeur: 4.9,
    temps_reel: '1h 30min',
    score_risque: 5, niveau_risque: 'faible',
    otp_code: '1859',
    position_actuelle: null, vitesse: 0,
    lat: 0.48, lng: 0.52,
    timeline: [
      { heure: '07:00', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '07:05', event: 'Chauffeur T-014 assigné', type: 'assignation', icon: '🚕' },
      { heure: '07:12', event: 'Mission acceptée par Paul Nguema', type: 'acceptation', icon: '✅' },
      { heure: '08:00', event: 'Chargement effectué — Akwa', type: 'chargement', icon: '📤' },
      { heure: '08:15', event: 'Départ confirmé', type: 'depart', icon: '▶️' },
      { heure: '08:52', event: 'Checkpoint — mi-parcours', type: 'checkpoint', icon: '📍' },
      { heure: '09:45', event: 'Livraison effectuée — Bonanjo', type: 'livraison', icon: '✓' },
      { heure: '09:48', event: 'Confirmation OTP client', type: 'confirmation', icon: '🔐' },
    ],
    alertes: [],
    documents: [
      { nom: 'Bon de livraison', statut: 'disponible', icone: '📄' },
      { nom: 'Facture', statut: 'disponible', icone: '💰' },
      { nom: 'Photo preuve livraison', statut: 'disponible', icone: '📷' },
    ],
    ia: { risque_retard: 5, proba_livraison: 99, risque_fraude: 'Très faible', itineraire_optimise: false },
  },
  {
    id: 'EXP-002', statut: 'en_cours', priorite: 'normale',
    client: { nom: 'Marie Obiang', avatar: 'MO', telephone: '+237 699 345 678' },
    chauffeur: { nom: 'Jean Tamba', driver_id: 'T-027', avatar: 'JT', note: 4.6 },
    agence: 'Express Cargo Douala',
    origine: 'Bonapriso, Douala', destination: 'Bassa, Douala',
    distance_km: 7.8, format_colis: 'M', description: 'Matériel informatique',
    valeur_marchandise: 850000, poids_kg: 12.5, volume_m3: 0.4,
    tarif: 1200, commission: 120, mode_paiement: 'mobile_money',
    date_creation: '2026-06-06T07:00:00',
    date_depart: '2026-06-06T07:20:00',
    date_livraison: null,
    eta: '14 min', eta_minutes: 14,
    note_client: null, note_chauffeur: null,
    temps_reel: null,
    score_risque: 18, niveau_risque: 'faible',
    otp_code: '4521',
    position_actuelle: 'Bonapriso → Bassa (4.2 km restants)',
    vitesse: 38,
    lat: 0.38, lng: 0.52,
    timeline: [
      { heure: '07:00', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '07:08', event: 'Chauffeur T-027 assigné', type: 'assignation', icon: '🚕' },
      { heure: '07:15', event: 'Mission acceptée par Jean Tamba', type: 'acceptation', icon: '✅' },
      { heure: '07:18', event: 'Chargement — Bonapriso', type: 'chargement', icon: '📤' },
      { heure: '07:20', event: 'Départ confirmé', type: 'depart', icon: '▶️' },
      { heure: '07:45', event: 'Checkpoint — mi-parcours', type: 'checkpoint', icon: '📍' },
    ],
    alertes: [],
    documents: [
      { nom: 'Bon de livraison', statut: 'en_attente', icone: '📄' },
      { nom: 'Facture', statut: 'disponible', icone: '💰' },
    ],
    ia: { risque_retard: 18, proba_livraison: 94, risque_fraude: 'Faible', itineraire_optimise: true },
  },
  {
    id: 'EXP-003', statut: 'chauffeur_assigne', priorite: 'haute',
    client: { nom: 'Eric Bouka', avatar: 'EB', telephone: '+237 655 555 666' },
    chauffeur: { nom: 'Samuel Kotto', driver_id: 'T-041', avatar: 'SK', note: 4.8 },
    agence: 'TransLog Congo',
    origine: 'Makepe, Douala', destination: 'Deido, Douala',
    distance_km: 5.1, format_colis: 'L', description: 'Mobilier de bureau',
    valeur_marchandise: 2400000, poids_kg: 180, volume_m3: 3.2,
    tarif: 2000, commission: 200, mode_paiement: 'mobile_money',
    date_creation: '2026-06-06T07:40:00',
    date_depart: null,
    date_livraison: null,
    eta: '35 min', eta_minutes: 35,
    note_client: null, note_chauffeur: null,
    temps_reel: null,
    score_risque: 32, niveau_risque: 'moyen',
    otp_code: '7823',
    position_actuelle: 'En attente départ — Makepe',
    vitesse: 0,
    lat: 0.62, lng: 0.38,
    timeline: [
      { heure: '07:40', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '07:48', event: 'Chauffeur T-041 assigné', type: 'assignation', icon: '🚕' },
      { heure: '07:55', event: 'Mission acceptée par Samuel Kotto', type: 'acceptation', icon: '✅' },
    ],
    alertes: [],
    documents: [
      { nom: 'Contrat transport', statut: 'disponible', icone: '📋' },
      { nom: 'Facture', statut: 'disponible', icone: '💰' },
    ],
    ia: { risque_retard: 32, proba_livraison: 88, risque_fraude: 'Faible', itineraire_optimise: false },
  },
  {
    id: 'EXP-004', statut: 'en_attente_chauffeur', priorite: 'normale',
    client: { nom: 'Jean Mbemba', avatar: 'JM', telephone: '+242 064 123 456' },
    chauffeur: null,
    agence: null,
    origine: 'New Bell, Douala', destination: 'Akwa, Douala',
    distance_km: 4.3, format_colis: 'S', description: 'Colis alimentaire',
    valeur_marchandise: 45000, poids_kg: 8, volume_m3: 0.1,
    tarif: 500, commission: 50, mode_paiement: 'especes',
    date_creation: '2026-06-06T08:00:00',
    date_depart: null,
    date_livraison: null,
    eta: '45 min', eta_minutes: 45,
    note_client: null, note_chauffeur: null,
    temps_reel: null,
    score_risque: 22, niveau_risque: 'faible',
    otp_code: '3344',
    position_actuelle: 'En recherche chauffeur',
    vitesse: 0,
    lat: 0.30, lng: 0.65,
    timeline: [
      { heure: '08:00', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '08:02', event: 'Recherche chauffeur en cours', type: 'recherche', icon: '🔍' },
    ],
    alertes: [{ type: 'Attente longue', description: 'Aucun chauffeur disponible depuis 8 min', severite: 'moyenne' }],
    documents: [{ nom: 'Bon de commande', statut: 'disponible', icone: '📄' }],
    ia: { risque_retard: 45, proba_livraison: 78, risque_fraude: 'Faible', itineraire_optimise: false },
  },
  {
    id: 'EXP-005', statut: 'en_cours', priorite: 'critique',
    client: { nom: 'Laure Eto', avatar: 'LE', telephone: '+237 691 567 890' },
    chauffeur: { nom: 'Claire Ndong', driver_id: 'T-011', avatar: 'CN', note: 4.9 },
    agence: 'Express Cargo Douala',
    origine: 'Logbessou, Douala', destination: 'Bonaberi, Douala',
    distance_km: 12.4, format_colis: 'L', description: 'Équipement ménager — fragile',
    valeur_marchandise: 3200000, poids_kg: 250, volume_m3: 5.8,
    tarif: 2000, commission: 200, mode_paiement: 'mobile_money',
    date_creation: '2026-06-05T13:00:00',
    date_depart: '2026-06-05T14:20:00',
    date_livraison: null,
    eta: '+18 min retard', eta_minutes: -18,
    note_client: null, note_chauffeur: null,
    temps_reel: null,
    score_risque: 72, niveau_risque: 'eleve',
    otp_code: '9912',
    position_actuelle: 'Bonaberi — arrêt prolongé détecté',
    vitesse: 0,
    lat: 0.72, lng: 0.25,
    timeline: [
      { heure: '13:00', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '13:10', event: 'Chauffeur T-011 assigné', type: 'assignation', icon: '🚕' },
      { heure: '14:00', event: 'Chargement — Logbessou', type: 'chargement', icon: '📤' },
      { heure: '14:20', event: 'Départ confirmé', type: 'depart', icon: '▶️' },
      { heure: '15:10', event: '⚠️ Retard détecté — trafic dense', type: 'alerte', icon: '⚠️' },
      { heure: '15:48', event: '🚨 Arrêt prolongé suspect — Bonaberi', type: 'incident', icon: '🚨' },
    ],
    alertes: [
      { type: 'Retard', description: 'ETA dépassé de 18 minutes', severite: 'haute' },
      { type: 'Arrêt suspect', description: 'Véhicule immobilisé 24 min zone non-résidentielle', severite: 'haute' },
    ],
    documents: [
      { nom: 'Contrat transport', statut: 'disponible', icone: '📋' },
      { nom: 'Photos colis', statut: 'disponible', icone: '📷' },
    ],
    ia: { risque_retard: 72, proba_livraison: 65, risque_fraude: 'Moyen', itineraire_optimise: true },
  },
  {
    id: 'EXP-006', statut: 'annule', priorite: 'normale',
    client: { nom: 'Paul Nkeng', avatar: 'PN', telephone: '+237 677 890 123' },
    chauffeur: null,
    agence: null,
    origine: 'Ndokotti, Douala', destination: 'Makepe, Douala',
    distance_km: 6.7, format_colis: 'M', description: 'Vêtements',
    valeur_marchandise: 280000, poids_kg: 15, volume_m3: 0.6,
    tarif: 1200, commission: 0, mode_paiement: 'especes',
    date_creation: '2026-06-04T11:00:00',
    date_depart: null, date_livraison: null,
    eta: '—', eta_minutes: null,
    note_client: null, note_chauffeur: null,
    temps_reel: null,
    score_risque: 8, niveau_risque: 'faible',
    otp_code: '5566',
    position_actuelle: null, vitesse: 0,
    lat: 0.50, lng: 0.50,
    timeline: [
      { heure: '11:00', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '11:32', event: 'Annulée par le client', type: 'annulation', icon: '✕' },
    ],
    alertes: [],
    documents: [],
    ia: { risque_retard: 0, proba_livraison: 0, risque_fraude: 'Faible', itineraire_optimise: false },
  },
  {
    id: 'EXP-007', statut: 'livre', priorite: 'normale',
    client: { nom: 'Fatou Sow', avatar: 'FS', telephone: '+237 670 456 789' },
    chauffeur: { nom: 'Paul Nguema', driver_id: 'T-014', avatar: 'PN', note: 4.9 },
    agence: 'Express Cargo Douala',
    origine: 'Bonanjo, Douala', destination: 'Akwa, Douala',
    distance_km: 2.9, format_colis: 'S', description: 'Courrier urgent',
    valeur_marchandise: 50000, poids_kg: 1.2, volume_m3: 0.01,
    tarif: 500, commission: 50, mode_paiement: 'especes',
    date_creation: '2026-06-06T06:30:00',
    date_depart: '2026-06-06T06:45:00',
    date_livraison: '2026-06-06T07:40:00',
    eta: '—', eta_minutes: null,
    note_client: 5.0, note_chauffeur: 5.0,
    temps_reel: '55 min',
    score_risque: 3, niveau_risque: 'faible',
    otp_code: '2277',
    position_actuelle: null, vitesse: 0,
    lat: 0.45, lng: 0.45,
    timeline: [
      { heure: '06:30', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '06:35', event: 'Chauffeur T-014 assigné', type: 'assignation', icon: '🚕' },
      { heure: '06:40', event: 'Mission acceptée', type: 'acceptation', icon: '✅' },
      { heure: '06:42', event: 'Chargement — Bonanjo', type: 'chargement', icon: '📤' },
      { heure: '06:45', event: 'Départ confirmé', type: 'depart', icon: '▶️' },
      { heure: '07:40', event: 'Livraison effectuée — Akwa', type: 'livraison', icon: '✓' },
      { heure: '07:42', event: 'Confirmation OTP client', type: 'confirmation', icon: '🔐' },
    ],
    alertes: [],
    documents: [
      { nom: 'Bon de livraison', statut: 'disponible', icone: '📄' },
      { nom: 'Facture', statut: 'disponible', icone: '💰' },
      { nom: 'Photo preuve', statut: 'disponible', icone: '📷' },
    ],
    ia: { risque_retard: 3, proba_livraison: 99, risque_fraude: 'Très faible', itineraire_optimise: false },
  },
  {
    id: 'EXP-008', statut: 'en_cours', priorite: 'haute',
    client: { nom: 'David Monga', avatar: 'DM', telephone: '+242 066 234 567' },
    chauffeur: { nom: 'Samuel Manga', driver_id: 'T-052', avatar: 'SM', note: 4.5 },
    agence: 'TransLog Congo',
    origine: 'Akwa, Douala', destination: 'Bassa, Douala',
    distance_km: 9.2, format_colis: 'M', description: 'Produits pharmaceutiques',
    valeur_marchandise: 1800000, poids_kg: 22, volume_m3: 0.8,
    tarif: 1200, commission: 120, mode_paiement: 'mobile_money',
    date_creation: '2026-06-06T08:00:00',
    date_depart: '2026-06-06T08:15:00',
    date_livraison: null,
    eta: '28 min', eta_minutes: 28,
    note_client: null, note_chauffeur: null,
    temps_reel: null,
    score_risque: 25, niveau_risque: 'moyen',
    otp_code: '8834',
    position_actuelle: 'Akwa → Bassa (6.1 km restants)',
    vitesse: 42,
    lat: 0.35, lng: 0.58,
    timeline: [
      { heure: '08:00', event: 'Commande créée', type: 'creation', icon: '📦' },
      { heure: '08:08', event: 'Chauffeur T-052 assigné', type: 'assignation', icon: '🚕' },
      { heure: '08:12', event: 'Mission acceptée', type: 'acceptation', icon: '✅' },
      { heure: '08:13', event: 'Chargement — Akwa', type: 'chargement', icon: '📤' },
      { heure: '08:15', event: 'Départ confirmé', type: 'depart', icon: '▶️' },
    ],
    alertes: [],
    documents: [
      { nom: 'Certificat produits', statut: 'disponible', icone: '📋' },
      { nom: 'Facture', statut: 'disponible', icone: '💰' },
    ],
    ia: { risque_retard: 25, proba_livraison: 91, risque_fraude: 'Faible', itineraire_optimise: true },
  },
];

// ── COMPOSANTS UTILITAIRES ────────────────────────────────────

const STATUT_CFG = {
  en_attente_chauffeur: { label: 'En attente', bg: '#F1F5F9', color: '#64748B', dot: C.texteMuted },
  chauffeur_assigne: { label: 'Assigné', bg: '#EDE9FE', color: '#6D28D9', dot: C.violet },
  en_cours: { label: 'En cours', bg: '#DBEAFE', color: '#1D4ED8', dot: C.bleu },
  livre: { label: 'Livrée', bg: '#DCFCE7', color: '#15803D', dot: C.vert },
  annule: { label: 'Annulée', bg: '#FEE2E2', color: '#B91C1C', dot: C.rouge },
};

const RISQUE_CFG = {
  faible: { label: 'Faible', color: C.vert, bg: '#DCFCE7' },
  moyen: { label: 'Moyen', color: C.ambre, bg: '#FEF3C7' },
  eleve: { label: 'Élevé', color: C.rouge, bg: '#FEE2E2' },
  critique: { label: 'Critique', color: '#7F1D1D', bg: '#FEF2F2' },
};

const FORMAT_CFG = {
  S: { label: 'Petit', color: C.vert },
  M: { label: 'Moyen', color: C.bleu },
  L: { label: 'Grand', color: C.violet },
};

function StatutBadge({ statut, small = false }) {
  const cfg = STATUT_CFG[statut] || { label: statut, bg: C.surface, color: C.texteMuted, dot: C.texteMuted };
  return (
    <span style={{ fontSize: small ? 10 : 11, fontWeight: 600, padding: small ? '2px 8px' : '3px 12px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      <span style={{ width: small ? 5 : 6, height: small ? 5 : 6, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function RisqueBadge({ niveau, score }) {
  const cfg = RISQUE_CFG[niveau] || RISQUE_CFG.faible;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
      {score} · {cfg.label}
    </span>
  );
}

function PrioriteBadge({ priorite }) {
  const cfg = {
    critique: { label: '🔴 Critique', color: '#B91C1C', bg: '#FEF2F2' },
    haute: { label: '🟠 Haute', color: '#B45309', bg: '#FFFBEB' },
    normale: { label: '🟢 Normale', color: '#15803D', bg: '#DCFCE7' },
  }[priorite] || { label: priorite, color: C.texteMuted, bg: C.surface };
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function ETABadge({ exp }) {
  if (!exp.eta || exp.eta === '—') return <span style={{ color: C.texteMuted, fontSize: 12 }}>—</span>;
  const enRetard = exp.eta_minutes !== null && exp.eta_minutes < 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: enRetard ? C.rouge : C.vert, background: enRetard ? '#FEF2F2' : '#DCFCE7', padding: '2px 8px', borderRadius: 8 }}>
      {enRetard ? '⏰ ' : ''}{exp.eta}
    </span>
  );
}

function KPICard({ label, valeur, icone, bg, color, tendance, sous }) {
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,.04)', transition: 'all 200ms' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,.04)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icone}</div>
        {tendance !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: tendance >= 0 ? '#DCFCE7' : '#FEE2E2', color: tendance >= 0 ? '#15803D' : '#B91C1C' }}>
            {tendance >= 0 ? '↑' : '↓'} {Math.abs(tendance)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.texte, lineHeight: 1 }}>{valeur}</div>
      <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      {sous && <div style={{ fontSize: 10, color: C.vert, marginTop: 3 }}>{sous}</div>}
    </div>
  );
}

// ── MINI CARTE GPS ────────────────────────────────────────────

function MiniCarteGPS({ exp }) {
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

      // Grille
      ctx.strokeStyle = 'rgba(255,255,255,.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Route simulée
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.15, H * 0.85);
      ctx.bezierCurveTo(W * 0.35, H * 0.6, W * 0.65, H * 0.4, W * 0.85, H * 0.2);
      ctx.stroke();

      const t = tick.current;

      // Marqueur origine
      const ox = W * 0.15, oy = H * 0.85;
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fillStyle = C.vert;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '7px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('A', ox, oy + 14);

      // Marqueur destination
      const dx = W * 0.85, dy = H * 0.2;
      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fillStyle = C.rouge;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('B', dx, dy + 14);

      // Véhicule animé si en cours
      if (exp.statut === 'en_cours' || exp.statut === 'chauffeur_assigne') {
        const progress = (Math.sin(t * 0.015) * 0.5 + 0.5) * 0.7 + 0.1;
        const vx = W * (0.15 + (0.85 - 0.15) * progress);
        const vy = H * (0.85 + (0.2 - 0.85) * progress);

        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.04));
        ctx.beginPath();
        ctx.arc(vx, vy, 10 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${pulse * 0.2})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(vx, vy, 7, 0, Math.PI * 2);
        ctx.fillStyle = C.bleu;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Inter';
        ctx.fillText('▶', vx, vy + 3);
      }

      tick.current += 1;
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [exp]);

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} width={380} height={160} style={{ width: '100%', height: 160, display: 'block' }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
        <div style={{ background: 'rgba(0,0,0,.7)', borderRadius: 6, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)' }}>GPS simulé</div>
      </div>
    </div>
  );
}

// ── TIMELINE ──────────────────────────────────────────────────

function Timeline({ events }) {
  const typeColor = {
    creation: C.bleu, assignation: C.violet, acceptation: C.vert,
    chargement: C.ambre, depart: C.vert, checkpoint: C.cyan,
    livraison: C.vert, confirmation: '#4ADE80',
    alerte: C.ambre, incident: C.rouge, annulation: C.rouge, recherche: C.texteMuted,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((e, i) => {
        const col = typeColor[e.type] || C.texteMuted;
        const isDone = e.type !== 'alerte' && e.type !== 'incident';
        return (
          <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${col}18`, border: `.5px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 8 }}>
                {e.icon}
              </div>
              {i < events.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.border, minHeight: 12 }} />}
            </div>
            <div style={{ padding: '8px 0 8px', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: C.texteMuted, fontFamily: 'monospace', marginBottom: 2 }}>{e.heure}</div>
              <div style={{ fontSize: 12, color: e.type === 'alerte' || e.type === 'incident' ? col : C.texte, fontWeight: e.type === 'alerte' || e.type === 'incident' ? 600 : 400, lineHeight: 1.4 }}>{e.event}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DRAWER EXPÉDITION ─────────────────────────────────────────

function DrawerExpedition({ exp, onClose }) {
  const [onglet, setOnglet] = useState('infos');
  if (!exp) return null;

  const sc = STATUT_CFG[exp.statut] || {};
  const rc = RISQUE_CFG[exp.niveau_risque] || {};

  const ONGLETS = [
    { id: 'infos', label: '📋 Infos' },
    { id: 'trajet', label: '🗺️ Trajet' },
    { id: 'timeline', label: '🕐 Timeline' },
    { id: 'financier', label: '💰 Finance' },
    { id: 'documents', label: '📄 Docs' },
    { id: 'ia', label: '🤖 IA' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 460, background: C.blanc, zIndex: 201, boxShadow: '-12px 0 50px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideIn 220ms ease' }}>
        <style>{`@keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: `.5px solid ${C.border}`, background: exp.score_risque >= 60 ? '#FEF2F2' : exp.score_risque >= 30 ? '#FFFBEB' : C.blanc, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.texte, fontFamily: 'monospace' }}>{exp.id}</span>
              <StatutBadge statut={exp.statut} />
              <PrioriteBadge priorite={exp.priorite} />
            </div>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.texte, marginBottom: 6 }}>{exp.description}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <RisqueBadge niveau={exp.niveau_risque} score={exp.score_risque} />
            <ETABadge exp={exp} />
            <span style={{ fontSize: 11, color: C.texteMuted }}>{exp.distance_km} km · {FORMAT_CFG[exp.format_colis]?.label}</span>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', borderBottom: `.5px solid ${C.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: onglet === o.id ? 600 : 400, color: onglet === o.id ? C.vert : C.texteMuted, borderBottom: onglet === o.id ? `2px solid ${C.vert}` : '2px solid transparent', whiteSpace: 'nowrap', transition: 'all 150ms' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>

          {/* ── INFOS ── */}
          {onglet === 'infos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Client */}
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                  <div style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Client</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${exp.client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{exp.client.nom}</div>
                      <div style={{ fontSize: 10, color: C.texteMuted }}>{exp.client.telephone}</div>
                    </div>
                  </div>
                </div>
                {/* Chauffeur */}
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                  <div style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Chauffeur</div>
                  {exp.chauffeur ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${exp.chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{exp.chauffeur.nom}</div>
                        <div style={{ fontSize: 10, color: C.vert, fontFamily: 'monospace', fontWeight: 600 }}>{exp.chauffeur.driver_id}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: C.texteMuted }}>En recherche...</div>
                  )}
                </div>
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Détails colis</div>
                {[
                  { label: 'Description', val: exp.description },
                  { label: 'Format', val: `${FORMAT_CFG[exp.format_colis]?.label} (${exp.format_colis})` },
                  { label: 'Poids', val: `${exp.poids_kg} kg` },
                  { label: 'Volume', val: `${exp.volume_m3} m³` },
                  { label: 'Valeur marchandise', val: formatMontant(exp.valeur_marchandise) },
                  { label: 'Agence', val: exp.agence || '—' },
                  { label: 'OTP', val: exp.otp_code },
                  { label: 'Mode paiement', val: exp.mode_paiement === 'mobile_money' ? '📱 Mobile Money' : '💵 Espèces' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: `.5px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Alertes */}
              {exp.alertes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {exp.alertes.map((a, i) => (
                    <div key={i} style={{ background: '#FEF2F2', border: `.5px solid #FECACA`, borderRadius: 10, padding: '10px 14px', borderLeft: `3px solid ${C.rouge}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.rouge }}>⚠️ {a.type}</div>
                      <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{a.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TRAJET ── */}
          {onglet === 'trajet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MiniCarteGPS exp={exp} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '📍 Origine', val: exp.origine, color: C.vert },
                  { label: '🏁 Destination', val: exp.destination, color: C.rouge },
                  { label: '📏 Distance', val: `${exp.distance_km} km`, color: C.texte },
                  { label: '⏱️ ETA', val: exp.eta || '—', color: exp.eta_minutes !== null && exp.eta_minutes < 0 ? C.rouge : C.vert },
                ].map((r, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.val}</div>
                  </div>
                ))}
              </div>

              {exp.position_actuelle && (
                <div style={{ background: C.bleuClair, borderRadius: 10, padding: '10px 14px', border: `.5px solid #BFDBFE` }}>
                  <div style={{ fontSize: 10, color: C.bleu, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Position actuelle</div>
                  <div style={{ fontSize: 12, color: C.texte }}>{exp.position_actuelle}</div>
                  {exp.vitesse > 0 && <div style={{ fontSize: 11, color: C.bleu, marginTop: 3 }}>🚗 {exp.vitesse} km/h</div>}
                </div>
              )}
            </div>
          )}

          {/* ── TIMELINE ── */}
          {onglet === 'timeline' && (
            <div>
              <Timeline events={exp.timeline} />
              {exp.statut !== 'livre' && exp.statut !== 'annule' && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}`, borderStyle: 'dashed' }}>
                  <div style={{ fontSize: 11, color: C.texteMuted, textAlign: 'center' }}>Étapes suivantes à confirmer...</div>
                </div>
              )}
            </div>
          )}

          {/* ── FINANCIER ── */}
          {onglet === 'financier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'linear-gradient(135deg, #14532D, #22C55E)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Tarif de transport</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{formatMontant(exp.tarif)}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#4ADE80' }}>{formatMontant(exp.tarif - exp.commission)}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)' }}>Net chauffeur</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,.15)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#4ADE80' }}>{formatMontant(exp.commission)}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)' }}>Commission COLIGO</div>
                  </div>
                </div>
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Détail financier</div>
                {[
                  { label: 'Prix convenu', val: formatMontant(exp.tarif) },
                  { label: 'Commission (10%)', val: formatMontant(exp.commission) },
                  { label: 'Net chauffeur', val: formatMontant(exp.tarif - exp.commission) },
                  { label: 'Valeur marchandise', val: formatMontant(exp.valeur_marchandise) },
                  { label: 'Mode paiement', val: exp.mode_paiement === 'mobile_money' ? '📱 Mobile Money' : '💵 Espèces' },
                  { label: 'Escrow', val: exp.statut === 'en_cours' ? '🔒 Bloqué' : exp.statut === 'livre' ? '✓ Libéré' : '—' },
                  { label: 'Statut paiement', val: exp.statut === 'livre' ? '✓ Payé' : exp.statut === 'annule' ? '✕ Annulé' : '⏳ En cours' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: `.5px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {onglet === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exp.documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: C.texteMuted, background: C.surface, borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <div>Aucun document disponible</div>
                </div>
              ) : exp.documents.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: C.blanc, border: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{doc.icone}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{doc.nom}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: doc.statut === 'disponible' ? C.vert : C.ambre }}>
                      {doc.statut === 'disponible' ? '✓ Disponible' : '⏳ En attente'}
                    </span>
                  </div>
                  {doc.statut === 'disponible' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '4px 10px', borderRadius: 6, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 10, cursor: 'pointer' }}>👁️</button>
                      <button style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: C.bleuClair, color: C.bleu, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>📥</button>
                    </div>
                  )}
                </div>
              ))}
              <button style={{ padding: '10px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                + Demander un document
              </button>
            </div>
          )}

          {/* ── IA ── */}
          {onglet === 'ia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>⚡ Analyse IA — {exp.id}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: 'Risque retard', val: `${exp.ia.risque_retard}%`, color: exp.ia.risque_retard >= 60 ? C.rouge : exp.ia.risque_retard >= 30 ? C.ambre : '#4ADE80' },
                    { label: 'Proba. livraison', val: `${exp.ia.proba_livraison}%`, color: exp.ia.proba_livraison >= 90 ? '#4ADE80' : exp.ia.proba_livraison >= 70 ? C.ambre : C.rouge },
                    { label: 'Risque fraude', val: exp.ia.risque_fraude, color: exp.ia.risque_fraude === 'Très faible' || exp.ia.risque_fraude === 'Faible' ? '#4ADE80' : C.ambre },
                    { label: 'Itinéraire IA', val: exp.ia.itineraire_optimise ? '✓ Disponible' : '—', color: exp.ia.itineraire_optimise ? '#4ADE80' : 'rgba(255,255,255,.4)' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textAlign: 'center' }}>
                  Modèle v2.4 · Précision 94.2% · Mis à jour il y a 2 min
                </div>
              </div>

              {/* Barres risque */}
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Indicateurs de risque</div>
                {[
                  { label: 'Risque retard', val: exp.ia.risque_retard, color: exp.ia.risque_retard >= 60 ? C.rouge : exp.ia.risque_retard >= 30 ? C.ambre : C.vert },
                  { label: 'Probabilité succès', val: exp.ia.proba_livraison, color: exp.ia.proba_livraison >= 90 ? C.vert : C.ambre },
                  { label: 'Score risque global', val: exp.score_risque, color: exp.score_risque >= 60 ? C.rouge : exp.score_risque >= 30 ? C.ambre : C.vert },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.texteMuted }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.val}%</span>
                    </div>
                    <div style={{ height: 5, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${s.val}%`, height: '100%', background: s.color, borderRadius: 10, transition: 'width 600ms ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        {exp.statut !== 'livre' && exp.statut !== 'annule' && (
          <div style={{ padding: '14px 22px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>📞 Contacter</button>
            {exp.statut === 'en_cours' && <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>📍 Suivre GPS</button>}
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>✕ Annuler</button>
          </div>
        )}
        {exp.statut === 'livre' && (
          <div style={{ padding: '14px 22px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>📄 Voir facture</button>
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>📥 Exporter</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── MODE CENTRE D'OPÉRATIONS ──────────────────────────────────

function CentreOperations({ expeditions, onExit, onSelectExp, selectedExp }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const actives = expeditions.filter(e => ['en_cours', 'chauffeur_assigne', 'en_attente_chauffeur'].includes(e.statut));
  const alertes = expeditions.filter(e => e.alertes.length > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060b06', zIndex: 1000, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} } @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ height: 56, background: 'linear-gradient(90deg, rgba(5,46,22,.98), rgba(0,0,0,.92))', borderBottom: '1px solid rgba(74,222,128,.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>COLI<span style={{ color: '#4ADE80' }}>GO</span><span style={{ color: C.lime }}>⚡</span></span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.12em' }}>CENTRE D'OPÉRATIONS</span>
        </div>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.08)' }} />
        <div style={{ display: 'flex', gap: 24, flex: 1 }}>
          {[
            { label: 'Actives', val: actives.length, color: '#4ADE80' },
            { label: 'En cours', val: expeditions.filter(e => e.statut === 'en_cours').length, color: C.bleu },
            { label: 'Alertes', val: alertes.length, color: C.rouge, blink: alertes.length > 0 },
            { label: 'Livrées/jour', val: expeditions.filter(e => e.statut === 'livre').length, color: '#4ADE80' },
            { label: 'Valeur', val: '8.7M F', color: '#4ADE80' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, animation: s.blink ? 'blink 1.2s infinite' : 'none' }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{time.toLocaleTimeString('fr-FR')}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
          <button onClick={onExit} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✕ Quitter</button>
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 300px', gap: 0, overflow: 'hidden' }}>

        {/* Panneau gauche */}
        <div style={{ background: 'rgba(0,0,0,.8)', borderRight: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.bleu, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>📦 Expéditions actives</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {actives.map((e, i) => (
                <span key={i} onClick={() => onSelectExp(e)} style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: e.score_risque >= 60 ? 'rgba(239,68,68,.2)' : 'rgba(59,130,246,.15)', color: e.score_risque >= 60 ? C.rouge : C.bleu, cursor: 'pointer', border: selectedExp?.id === e.id ? `1px solid ${C.bleu}` : '1px solid transparent' }}>
                  {e.id}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {actives.map((e, i) => (
              <div key={i} onClick={() => onSelectExp(e)}
                style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', background: selectedExp?.id === e.id ? 'rgba(34,197,94,.08)' : 'transparent', borderLeft: `2px solid ${e.score_risque >= 60 ? C.rouge : e.score_risque >= 30 ? C.ambre : C.vert}`, transition: 'background 150ms', animation: `fadeInUp 300ms ease ${i * 50}ms both` }}
                onMouseEnter={ev => { if (selectedExp?.id !== e.id) ev.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
                onMouseLeave={ev => { if (selectedExp?.id !== e.id) ev.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>{e.id}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: e.eta_minutes !== null && e.eta_minutes < 0 ? C.rouge : '#4ADE80' }}>ETA {e.eta}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 3 }}>{e.client.nom}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{e.origine.split(',')[0]} → {e.destination.split(',')[0]}</div>
                {e.alertes.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 10, color: C.rouge }}>⚠️ {e.alertes[0].type}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zone centrale — tableau */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#070c07', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Toutes les expéditions</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ID', 'Client', 'Trajet', 'Statut', 'ETA', 'Risque'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.3)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,.05)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expeditions.map((e, i) => {
                  const sc = STATUT_CFG[e.statut] || {};
                  return (
                    <tr key={i} onClick={() => onSelectExp(e)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,.03)', cursor: 'pointer', background: selectedExp?.id === e.id ? 'rgba(34,197,94,.06)' : 'transparent', transition: 'background 150ms' }}
                      onMouseEnter={ev => { if (selectedExp?.id !== e.id) ev.currentTarget.style.background = 'rgba(255,255,255,.02)'; }}
                      onMouseLeave={ev => { if (selectedExp?.id !== e.id) ev.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>{e.id}</td>
                      <td style={{ padding: '9px 14px', fontSize: 11, color: 'rgba(255,255,255,.7)' }}>{e.client.nom}</td>
                      <td style={{ padding: '9px 14px', fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                        {e.origine.split(',')[0]} → {e.destination.split(',')[0]}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${sc.dot}20`, color: sc.dot }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px', fontSize: 11, fontWeight: 600, color: e.eta_minutes !== null && e.eta_minutes < 0 ? C.rouge : '#4ADE80' }}>
                        {e.eta || '—'}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: e.score_risque >= 60 ? C.rouge : e.score_risque >= 30 ? C.ambre : '#4ADE80' }}>{e.score_risque}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panneau droit */}
        <div style={{ background: 'rgba(0,0,0,.8)', borderLeft: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Alertes */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', flex: alertes.length ? '0 0 auto' : '0 0 60px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.rouge, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
              🚨 Alertes actives {alertes.length > 0 && <span style={{ animation: 'blink 1.2s infinite' }}>({alertes.length})</span>}
            </div>
            {alertes.length === 0 ? (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>✓ Aucune alerte</div>
            ) : alertes.map((e, i) => (
              e.alertes.map((a, j) => (
                <div key={`${i}-${j}`} style={{ padding: '6px 8px', background: 'rgba(239,68,68,.1)', borderRadius: 6, marginBottom: 4, borderLeft: `2px solid ${C.rouge}` }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{e.id} · {a.type}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{a.description}</div>
                </div>
              ))
            ))}
          </div>

          {/* Détail expédition sélectionnée */}
          {selectedExp && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Détail — {selectedExp.id}</div>
              {[
                { l: 'Client', v: selectedExp.client.nom },
                { l: 'Chauffeur', v: selectedExp.chauffeur?.nom || 'En attente' },
                { l: 'Origine', v: selectedExp.origine },
                { l: 'Destination', v: selectedExp.destination },
                { l: 'ETA', v: selectedExp.eta || '—' },
                { l: 'Distance', v: `${selectedExp.distance_km} km` },
                { l: 'Tarif', v: formatMontant(selectedExp.tarif) },
                { l: 'Risque IA', v: `${selectedExp.score_risque}%` },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{r.l}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#fff' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedExp.timeline.slice(-3).map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, padding: '5px 8px', background: 'rgba(255,255,255,.03)', borderRadius: 6 }}>
                    <span style={{ fontSize: 10 }}>{e.icon}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>{e.heure} · {e.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IA */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(74,222,128,.1)', background: 'rgba(5,46,22,.5)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>⚡ IA COLIGO</div>
            {RECOMMANDATIONS_IA_EXP.slice(0, 2).map((r, i) => (
              <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginBottom: 4, display: 'flex', gap: 5 }}>
                <span>{r.icone}</span><span>{r.texte}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RECOMMANDATIONS_IA_EXP = [
  { texte: 'EXP-005 : Risque retard élevé — intervention recommandée.', icone: '⚠️' },
  { texte: 'EXP-004 : Aucun chauffeur disponible depuis 8 min.', icone: '🔍' },
  { texte: 'EXP-008 : Itinéraire optimisé disponible (+8 min économisées).', icone: '🗺️' },
];

function ModalNouvelleExpedition({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    adresse_ramassage: '',
    adresse_livraison: '',
    format_colis: 'S',
    description: '',
    telephone_destinataire: '',
    mode_paiement: 'especes',
    lat_ramassage: '-4.0505',
    lng_ramassage: '9.7679',
    lat_livraison: '-4.0469',
    lng_livraison: '9.6966',
    driver_souhaite: '',
  });
  const [photoColis, setPhotoColis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [chauffeurs, setChauffeurs] = useState([]);
  const [chauffeurChoisi, setChauffeurChoisi] = useState('');
 
  useEffect(() => {
  apiCall(API.CHAUFFEURS_DISPONIBLES)
    .then(data => setChauffeurs(Array.isArray(data) ? data : []))
    .catch(() => {});
}, []);

  function handleChange(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.adresse_ramassage.trim()) e.adresse_ramassage = 'Champ requis';
    if (!form.adresse_livraison.trim()) e.adresse_livraison = 'Champ requis';
    if (!form.description.trim()) e.description = 'Champ requis';
    if (!form.telephone_destinataire.trim()) e.telephone_destinataire = 'Champ requis';
    if (!photoColis) e.photoColis = 'Photo requise';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
  if (v !== '') formData.append(k, v);  // 👈 ignore les champs vides
});
      formData.append('photo_colis', photoColis);

      const res = await apiCall(API.EXPEDITION_CREATE, 'POST', formData, true);
      alert(`✅ Expédition #${res.id} créée !\n\nTarif : ${res.tarif} F\nCode OTP : ${res.otp_code}`);
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

  const FORMATS = [
    { id: 'S', label: '📦 Petit', desc: 'Enveloppe, docs', prix: '500–1000 F' },
    { id: 'M', label: '📫 Moyen', desc: 'Sac, vêtements', prix: '1500–2500 F' },
    { id: 'L', label: '📦 Grand', desc: 'Carton, bagages', prix: '3000–5000 F' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 520, background: C.blanc, zIndex: 301, boxShadow: '-16px 0 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, background: C.bleuClair, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.texte }}>+ Nouvelle expédition</div>
              <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 3 }}>Créer une expédition manuellement</div>
            </div>
            <button onClick={onClose} style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Adresses */}
          <div>
            <label style={labelStyle}>Adresse de ramassage *</label>
            <input style={inputStyle('adresse_ramassage')} value={form.adresse_ramassage} onChange={e => handleChange('adresse_ramassage', e.target.value)} placeholder="Ex: Akwa, Douala" />
            {errors.adresse_ramassage && <span style={{ fontSize: 10, color: C.rouge }}>{errors.adresse_ramassage}</span>}
          </div>

          <div>
            <label style={labelStyle}>Adresse de livraison *</label>
            <input style={inputStyle('adresse_livraison')} value={form.adresse_livraison} onChange={e => handleChange('adresse_livraison', e.target.value)} placeholder="Ex: Bonanjo, Douala" />
            {errors.adresse_livraison && <span style={{ fontSize: 10, color: C.rouge }}>{errors.adresse_livraison}</span>}
          </div>

          {/* Format colis */}
          <div>
            <label style={labelStyle}>Format du colis *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => handleChange('format_colis', f.id)}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `.5px solid ${form.format_colis === f.id ? C.bleu : C.border}`, background: form.format_colis === f.id ? C.bleuClair : C.blanc, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.format_colis === f.id ? C.bleu : C.texte }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 2 }}>{f.desc}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.bleu, marginTop: 2 }}>{f.prix}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description du colis *</label>
            <textarea style={{ ...inputStyle('description'), height: 72, resize: 'none' }} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Ex: Documents administratifs, matériel informatique..." />
            {errors.description && <span style={{ fontSize: 10, color: C.rouge }}>{errors.description}</span>}
          </div>

          {/* Téléphone destinataire */}
          <div>
            <label style={labelStyle}>Téléphone destinataire *</label>
            <input style={inputStyle('telephone_destinataire')} value={form.telephone_destinataire} onChange={e => handleChange('telephone_destinataire', e.target.value)} placeholder="+242 06 XXX XXXX" />
            {errors.telephone_destinataire && <span style={{ fontSize: 10, color: C.rouge }}>{errors.telephone_destinataire}</span>}
          </div>

          {/* Mode paiement */}
          <div>
            <label style={labelStyle}>Mode de paiement *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'especes', label: '💵 Espèces' }, { id: 'mobile_money', label: '📱 Mobile Money' }].map(p => (
                <button key={p.id} onClick={() => handleChange('mode_paiement', p.id)}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: `.5px solid ${form.mode_paiement === p.id ? C.vert : C.border}`, background: form.mode_paiement === p.id ? C.vertClair : C.blanc, color: form.mode_paiement === p.id ? C.vertFonce : C.texte, fontWeight: form.mode_paiement === p.id ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Choix chauffeur */}
<div>
  <label style={labelStyle}>Chauffeur (optionnel)</label>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <button
      onClick={() => { handleChange('driver_souhaite', ''); setChauffeurChoisi(''); }}
      style={{ padding: '10px 14px', borderRadius: 10, border: `.5px solid ${!chauffeurChoisi ? C.bleu : C.border}`, background: !chauffeurChoisi ? C.bleuClair : C.blanc, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>⚡</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: !chauffeurChoisi ? C.bleu : C.texte }}>Choix automatique</div>
        <div style={{ fontSize: 11, color: C.texteMuted }}>Le premier chauffeur disponible acceptera</div>
      </div>
      {!chauffeurChoisi && <span style={{ marginLeft: 'auto', color: C.bleu, fontWeight: 700 }}>✓</span>}
    </button>

    {chauffeurs.length === 0 ? (
      <div style={{ fontSize: 12, color: C.texteMuted, padding: '8px 12px', background: C.surface, borderRadius: 8 }}>
        Aucun chauffeur disponible actuellement
      </div>
    ) : chauffeurs.map(c => (
      <button key={c.id}
        onClick={() => { setChauffeurChoisi(c.id); handleChange('driver_souhaite', String(c.id)); }}
        style={{ padding: '10px 14px', borderRadius: 10, border: `.5px solid ${chauffeurChoisi === c.id ? C.bleu : C.border}`, background: chauffeurChoisi === c.id ? C.bleuClair : C.blanc, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.vertClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🚗</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: chauffeurChoisi === c.id ? C.bleu : C.texte }}>{c.nom}</div>
          <div style={{ fontSize: 11, color: C.texteMuted }}>⭐ {Number(c.note_moyenne).toFixed(1)} · {c.nb_courses} courses · {c.gabarit}</div>
        </div>
        {chauffeurChoisi === c.id && <span style={{ color: C.bleu, fontWeight: 700 }}>✓</span>}
      </button>
    ))}
  </div>
</div>

          {/* Photo colis */}
          <div>
            <label style={labelStyle}>Photo du colis *</label>
            <div style={{ padding: '14px', background: photoColis ? C.vertClair : C.surface, borderRadius: 10, border: `.5px solid ${errors.photoColis ? C.rouge : photoColis ? '#BBF7D0' : C.border}`, borderStyle: photoColis ? 'solid' : 'dashed', textAlign: 'center' }}>
              {photoColis ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={URL.createObjectURL(photoColis)} alt="preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.vertFonce }}>✓ {photoColis.name}</div>
                    <div style={{ fontSize: 10, color: C.texteMuted }}>{(photoColis.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={() => setPhotoColis(null)} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#FEE2E2', color: C.rouge, fontSize: 11, cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>Cliquez pour sélectionner</div>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 3 }}>JPG, PNG · Max 5 MB</div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPhotoColis(e.target.files[0])} />
                </label>
              )}
            </div>
            {errors.photoColis && <span style={{ fontSize: 10, color: C.rouge }}>{errors.photoColis}</span>}
          </div>

          {/* Info OTP */}
          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16 }}>🔐</span>
            <div style={{ fontSize: 12, color: C.bleu, lineHeight: 1.5 }}>Un code OTP sera automatiquement généré et affiché après création. Communiquez-le au destinataire pour valider la livraison.</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: C.bleu, color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Création...' : '📦 Créer l\'expédition'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('toutes');
  const [selectedExp, setSelectedExp] = useState(null);
  const [centreOps, setCentreOps] = useState(false);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtrePriorite, setFiltrePriorite] = useState('toutes');
  const [page, setPage] = useState(1);
  const PAR_PAGE = 6;
  const [showAddModal, setShowAddModal] = useState(false);
  

  useEffect(() => {
    apiCall<any>(API.EXPEDITIONS)
      .then(data => {
        const liste = Array.isArray(data) ? data : data.results || data.expeditions || [];
        setExpeditions(liste);
      })
      .catch(err => console.error('Expeditions error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Normaliser une expédition selon la structure Django
  function normalise(e: any) {
    const client = e.client || {};
    const chauffeur = e.chauffeur || e.driver || null;
    return {
      ...e,
      id: e.id || e.expedition_id || `EXP-${e.id}`,
      client: {
        nom: client.nom || `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.name || '—',
        telephone: client.telephone || client.phone || '—',
      },
      chauffeur: chauffeur ? {
        nom: chauffeur.nom || `${chauffeur.first_name || ''} ${chauffeur.last_name || ''}`.trim() || '—',
        driver_id: chauffeur.driver_id || chauffeur.driver_unique_id || '—',
      } : null,
      origine: e.origine || e.pickup_address || e.adresse_ramassage || '—',
      destination: e.destination || e.delivery_address || e.adresse_livraison || '—',
      statut: e.statut || e.status || 'en_attente_chauffeur',
      tarif: e.tarif || e.price || e.montant || 0,
      commission: e.commission || e.fee || 0,
      valeur_marchandise: e.valeur_marchandise || e.parcel_value || 0,
      distance_km: e.distance_km || e.distance || 0,
      format_colis: e.format_colis || e.parcel_size || 'M',
      poids_kg: e.poids_kg || e.weight || 0,
      volume_m3: e.volume_m3 || 0,
      eta: e.eta || null,
      eta_minutes: e.eta_minutes || null,
      score_risque: e.score_risque || 0,
      niveau_risque: e.niveau_risque || 'faible',
      priorite: e.priorite || 'normale',
      otp_code: e.otp_code || '—',
      mode_paiement: e.mode_paiement || e.payment_method || 'especes',
      agence: e.agence || null,
      alertes: e.alertes || [],
      documents: e.documents || [],
      timeline: e.timeline || [],
      position_actuelle: e.position_actuelle || null,
      vitesse: e.vitesse || 0,
      date_creation: e.date_creation || e.created_at,
      description: e.description || e.parcel_description || '—',
      ia: e.ia || { risque_retard: 0, proba_livraison: 100, risque_fraude: 'Faible', itineraire_optimise: false },
    };
  }

  const expNorm = expeditions.map(normalise);

  const filtered = expNorm.filter(e => {
    const ms = !search || String(e.id).toLowerCase().includes(search.toLowerCase()) || e.client.nom.toLowerCase().includes(search.toLowerCase()) || (e.chauffeur?.nom || '').toLowerCase().includes(search.toLowerCase()) || e.origine.toLowerCase().includes(search.toLowerCase()) || e.destination.toLowerCase().includes(search.toLowerCase());
    const mst = filtreStatut === 'tous' || e.statut === filtreStatut;
    const mp = filtrePriorite === 'toutes' || e.priorite === filtrePriorite;
    const mong = onglet === 'toutes' ? true :
      onglet === 'actives' ? ['en_cours', 'chauffeur_assigne', 'en_attente_chauffeur'].includes(e.statut) :
      onglet === 'terminees' ? e.statut === 'livre' :
      onglet === 'risque' ? e.score_risque >= 30 || e.alertes.length > 0 : true;
    return ms && mst && mp && mong;
  });

  const paginated = filtered.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const totalPages = Math.ceil(filtered.length / PAR_PAGE);

  const stats = {
    total: expNorm.length,
    aujourdhui: expNorm.filter(e => e.date_creation && new Date(e.date_creation).toDateString() === new Date().toDateString()).length,
    en_cours: expNorm.filter(e => e.statut === 'en_cours').length,
    terminees: expNorm.filter(e => e.statut === 'livre').length,
    retard: expNorm.filter(e => e.eta_minutes !== null && e.eta_minutes < 0).length,
    annulees: expNorm.filter(e => e.statut === 'annule').length,
    valeur_totale: expNorm.reduce((s, e) => s + e.valeur_marchandise, 0),
    taux_reussite: expNorm.filter(e => e.statut !== 'en_attente_chauffeur').length > 0
      ? Math.round(expNorm.filter(e => e.statut === 'livre').length / expNorm.filter(e => e.statut !== 'en_attente_chauffeur').length * 100)
      : 0,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Chargement des expéditions...</div>
    </div>
  );

  if (centreOps) return (
    <CentreOperations expeditions={expNorm} onExit={() => setCentreOps(false)} onSelectExp={setSelectedExp} selectedExp={selectedExp} />
  );

  const ONGLETS = [
    { id: 'toutes', label: 'Toutes', count: expNorm.length },
    { id: 'actives', label: '🔄 Actives', count: expNorm.filter(e => ['en_cours', 'chauffeur_assigne', 'en_attente_chauffeur'].includes(e.statut)).length },
    { id: 'terminees', label: '✓ Terminées', count: expNorm.filter(e => e.statut === 'livre').length },
    { id: 'risque', label: '⚠️ À risque', count: expNorm.filter(e => e.score_risque >= 30 || e.alertes.length > 0).length },
  ];

  function exporterExpeditions(liste, stats) {
  imprimerRapport({
    titre: 'Rapport Expéditions',
    sousTitre: `${liste.length} expédition${liste.length > 1 ? 's' : ''} affichée${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '📦 Détail des expéditions',
        colonnes: ['ID', 'Client', 'Chauffeur', 'Trajet', 'Format', 'Valeur', 'Statut', 'Priorité'],
        lignes: liste.map(e => [
          e.id,
          e.client.nom,
          e.chauffeur ? e.chauffeur.nom : '—',
          `${(e.origine || '').split(',')[0]} → ${(e.destination || '').split(',')[0]}`,
          e.format_colis,
          formatMontantExport(e.valeur_marchandise),
          STATUT_CFG[e.statut]?.label || e.statut,
          e.priorite,
        ]),
      },
    ],
  });
}

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            📦 Gestion des Expéditions
            {stats.retard > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, background: C.rouge, color: '#fff', padding: '3px 10px', borderRadius: 20, animation: 'blink 1.5s infinite' }}>
                {stats.retard} EN RETARD
              </span>
            )}
          </h1>
          <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 3 }}>Centre opérationnel · {expNorm.length} expéditions · Données réelles</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exporterExpeditions(filtered, stats)} style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>📥 Exporter</button>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.bleu, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Nouvelle expédition</button>
          <button onClick={() => setCentreOps(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,.3)' }}>
            🖥️ Centre d'opérations
          </button>
        </div>
      
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
        {[
          { label: 'Total', valeur: stats.total, icone: '📦', bg: C.bleuClair, color: C.bleu },
          { label: "Aujourd'hui", valeur: stats.aujourdhui, icone: '📅', bg: C.violetClair, color: C.violet },
          { label: 'En cours', valeur: stats.en_cours, icone: '🔄', bg: C.bleuClair, color: C.bleu },
          { label: 'Terminées', valeur: stats.terminees, icone: '✅', bg: C.vertClair, color: C.vert },
          { label: 'En retard', valeur: stats.retard, icone: '⏰', bg: C.rougeClair, color: C.rouge },
          { label: 'Annulées', valeur: stats.annulees, icone: '✕', bg: '#F1F5F9', color: '#64748B' },
          { label: 'Valeur totale', valeur: formatMontant(stats.valeur_totale).replace(' F', ''), icone: '💰', bg: C.ambreClair, color: C.ambre },
          { label: 'Taux réussite', valeur: `${stats.taux_reussite}%`, icone: '⭐', bg: C.vertClair, color: C.vert },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Filtres */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surface, borderRadius: 10, padding: '7px 12px', border: `.5px solid ${C.border}`, flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher ID, client, chauffeur, ville..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: C.texte, outline: 'none', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.texteMuted }}>✕</button>}
        </div>
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 12, color: C.texte, cursor: 'pointer', outline: 'none' }}>
          <option value="tous">Tous statuts</option>
          <option value="en_attente_chauffeur">En attente</option>
          <option value="chauffeur_assigne">Assigné</option>
          <option value="en_cours">En cours</option>
          <option value="livre">Livrée</option>
          <option value="annule">Annulée</option>
        </select>
        <select value={filtrePriorite} onChange={e => setFiltrePriorite(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 12, color: C.texte, cursor: 'pointer', outline: 'none' }}>
          <option value="toutes">Toutes priorités</option>
          <option value="critique">Critique</option>
          <option value="haute">Haute</option>
          <option value="normale">Normale</option>
        </select>
        <div style={{ fontSize: 12, color: C.texteMuted, marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4 }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => { setOnglet(o.id); setPage(1); }} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            {o.label}
            {o.count > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: onglet === o.id ? 'rgba(255,255,255,.25)' : C.surface, color: onglet === o.id ? '#fff' : C.texteMuted }}>{o.count}</span>}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {['ID', 'Client', 'Chauffeur', 'Trajet', 'Format', 'Valeur', 'ETA', 'Statut', 'Risque IA', 'Priorité', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={11} style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
                <div style={{ fontSize: 14 }}>Aucune expédition trouvée</div>
              </td></tr>
            ) : paginated.map((e, i) => (
              <tr key={e.id || i}
                onClick={() => setSelectedExp(selectedExp?.id === e.id ? null : e)}
                style={{ borderBottom: `.5px solid ${C.border}`, cursor: 'pointer', transition: 'background 150ms', background: selectedExp?.id === e.id ? C.vertClair : e.alertes.length > 0 ? '#FFFBEB' : 'transparent' }}
                onMouseEnter={ev => { if (selectedExp?.id !== e.id) ev.currentTarget.style.background = C.surface; }}
                onMouseLeave={ev => { if (selectedExp?.id !== e.id) ev.currentTarget.style.background = e.alertes.length > 0 ? '#FFFBEB' : 'transparent'; }}
              >
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: C.texte }}>{e.id}</div>
                  <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 1 }}>{e.date_creation ? new Date(e.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}</div>
                </td>
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${e.client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{e.client.nom.split(' ')[0]}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 12px' }}>
                  {e.chauffeur ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${e.chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, color: C.texte }}>{e.chauffeur.nom.split(' ')[0]}</div>
                        <div style={{ fontSize: 9, color: C.vert, fontFamily: 'monospace' }}>{e.chauffeur.driver_id}</div>
                      </div>
                    </div>
                  ) : <span style={{ fontSize: 11, color: C.texteMuted }}>—</span>}
                </td>
                <td style={{ padding: '11px 12px', maxWidth: 160 }}>
                  <div style={{ fontSize: 11, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(e.origine || '').split(',')[0]} → {(e.destination || '').split(',')[0]}
                  </div>
                  <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 1 }}>{e.distance_km} km</div>
                </td>
                <td style={{ padding: '11px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: `${FORMAT_CFG[e.format_colis]?.color || '#64748B'}15`, color: FORMAT_CFG[e.format_colis]?.color || '#64748B' }}>
                    {e.format_colis}
                  </span>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600, color: C.texte }}>{formatMontant(e.valeur_marchandise)}</td>
                <td style={{ padding: '11px 12px' }}><ETABadge exp={e} /></td>
                <td style={{ padding: '11px 12px' }}><StatutBadge statut={e.statut} small /></td>
                <td style={{ padding: '11px 12px' }}><RisqueBadge niveau={e.niveau_risque} score={e.score_risque} /></td>
                <td style={{ padding: '11px 12px' }}><PrioriteBadge priorite={e.priorite} /></td>
                <td style={{ padding: '11px 12px' }}>
                  <button onClick={ev => { ev.stopPropagation(); setSelectedExp(e); }}
                    style={{ padding: '4px 10px', borderRadius: 7, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
                    Voir →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '12px 16px', borderTop: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.texteMuted }}>{filtered.length} expédition{filtered.length > 1 ? 's' : ''} · Page {page}/{Math.max(totalPages, 1)}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: page === 1 ? C.texteMuted : C.texte, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Précédent</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: p === page ? C.vert : C.surface, color: p === page ? '#fff' : C.texteMuted, cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 600 : 400 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: page === totalPages ? C.texteMuted : C.texte, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12 }}>Suivant →</button>
          </div>
        </div>
      </div>

     <DrawerExpedition exp={selectedExp} onClose={() => setSelectedExp(null)} />

      {showAddModal && (
        <ModalNouvelleExpedition
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setLoading(true);
            apiCall(API.EXPEDITIONS)
              .then(data => setExpeditions(Array.isArray(data) ? data : data.results || []))
              .catch(err => console.error(err))
              .finally(() => setLoading(false));
          }
        }
        />
      )}
    </div>
  );
}

