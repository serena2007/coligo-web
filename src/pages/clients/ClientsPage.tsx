// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';
import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';
import AccesRefuse from '../../components/AccesRefuse';

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

const CLIENTS = [
  { id: 1, nom: 'Marie Obiang', telephone: '+237 699 345 678', email: 'marie.obiang@gmail.com', ville: 'Douala', colis: 35, depenses: 112000, score_fidelite: 94, segment: 'premium', statut: 'actif', inscription: '2025-03-12', satisfaction: 4.9, avatar: 'MO', pays: 'CM', adresse: 'Bonapriso, Douala' },
  { id: 2, nom: 'Eric Bouka', telephone: '+237 655 555 666', email: 'eric.bouka@yahoo.fr', ville: 'Douala', colis: 28, depenses: 89500, score_fidelite: 88, segment: 'premium', statut: 'actif', inscription: '2025-01-08', satisfaction: 4.8, avatar: 'EB', pays: 'CM', adresse: 'Akwa, Douala' },
  { id: 3, nom: 'Laure Eto', telephone: '+237 691 567 890', email: 'laure.eto@gmail.com', ville: 'Yaoundé', colis: 21, depenses: 67000, score_fidelite: 82, segment: 'fidele', statut: 'actif', inscription: '2025-05-20', satisfaction: 4.8, avatar: 'LE', pays: 'CM', adresse: 'Bastos, Yaoundé' },
  { id: 4, nom: 'Jean Mbemba', telephone: '+242 064 123 456', email: 'j.mbemba@outlook.com', ville: 'Brazzaville', colis: 19, depenses: 58000, score_fidelite: 76, segment: 'fidele', statut: 'actif', inscription: '2025-07-03', satisfaction: 4.7, avatar: 'JM', pays: 'CG', adresse: 'Poto-Poto, Brazzaville' },
  { id: 5, nom: 'Serena Kameni', telephone: '+237 622 202 461', email: 'serena.k@gmail.com', ville: 'Douala', colis: 14, depenses: 38500, score_fidelite: 68, segment: 'fidele', statut: 'actif', inscription: '2025-09-14', satisfaction: 4.8, avatar: 'SK', pays: 'CM', adresse: 'Makepe, Douala' },
  { id: 6, nom: 'Samuel Kotto', telephone: '+237 688 777 888', email: 'samuel.kotto@gmail.com', ville: 'Douala', colis: 12, depenses: 31000, score_fidelite: 61, segment: 'standard', statut: 'actif', inscription: '2025-10-01', satisfaction: 4.7, avatar: 'SK', pays: 'CM', adresse: 'Bassa, Douala' },
  { id: 7, nom: 'Fatou Sow', telephone: '+237 670 456 789', email: 'fatou.sow@gmail.com', ville: 'Douala', colis: 9, depenses: 24000, score_fidelite: 54, segment: 'standard', statut: 'actif', inscription: '2025-11-22', satisfaction: 4.6, avatar: 'FS', pays: 'CM', adresse: 'Logbessou, Douala' },
  { id: 8, nom: 'David Monga', telephone: '+242 066 234 567', email: 'david.monga@gmail.com', ville: 'Brazzaville', colis: 7, depenses: 19500, score_fidelite: 48, segment: 'standard', statut: 'actif', inscription: '2026-01-10', satisfaction: 4.5, avatar: 'DM', pays: 'CG', adresse: 'Moungali, Brazzaville' },
  { id: 9, nom: 'Amina Diallo', telephone: '+224 622 111 222', email: 'amina.d@gmail.com', ville: 'Libreville', colis: 3, depenses: 7500, score_fidelite: 28, segment: 'inactif', statut: 'suspendu', inscription: '2025-08-05', satisfaction: 3.2, avatar: 'AD', pays: 'GA', adresse: 'Libreville Centre' },
  { id: 10, nom: 'Paul Nkeng', telephone: '+237 677 890 123', email: 'paul.nkeng@gmail.com', ville: 'Bafoussam', colis: 2, depenses: 5000, score_fidelite: 18, segment: 'inactif', statut: 'inactif', inscription: '2025-06-18', satisfaction: 4.0, avatar: 'PN', pays: 'CM', adresse: 'Centre, Bafoussam' },
];

const EVOLUTION_CLIENTS = [
  { jour: '1', val: 3 }, { jour: '5', val: 7 }, { jour: '8', val: 5 },
  { jour: '12', val: 12 }, { jour: '15', val: 8 }, { jour: '18', val: 15 },
  { jour: '21', val: 11 }, { jour: '24', val: 18 }, { jour: '27', val: 14 },
  { jour: '30', val: 22 },
];

const VILLES_DATA = [
  { ville: 'Douala', clients: 6, color: C.vert },
  { ville: 'Yaoundé', clients: 1, color: C.bleu },
  { ville: 'Brazzaville', clients: 2, color: C.violet },
  { ville: 'Libreville', clients: 1, color: C.ambre },
];

const ACTIVITE_DATA = [
  { name: 'Actifs', value: 8, color: C.vert },
  { name: 'Inactifs', value: 1, color: C.texteMuted },
  { name: 'Suspendus', value: 1, color: C.rouge },
];

const SPARKLINE = [2, 5, 3, 8, 6, 9, 7, 11, 8, 14];

const INSIGHTS = [
  { icone: '⚠️', texte: '12 clients à forte valeur n\'ont effectué aucune commande depuis 14 jours.', couleur: C.ambre, bg: C.ambreClair, tag: 'Rétention' },
  { icone: '📍', texte: 'Les clients de Douala génèrent 47% du chiffre d\'affaires total de la plateforme.', couleur: C.bleu, bg: C.bleuClair, tag: 'Géographie' },
  { icone: '🚨', texte: 'Risque de perte détecté chez 4 clients Premium — intervention recommandée.', couleur: C.rouge, bg: C.rougeClair, tag: 'Risque' },
  { icone: '💡', texte: 'Potentiel d\'upsell détecté chez 8 comptes — proposition de forfait mensuel recommandée.', couleur: C.vert, bg: C.vertClair, tag: 'Opportunité' },
];

const ORDRES_MOCK = [
  { id: 'EXP-001', date: '07/06/2026', destination: 'Bonanjo', montant: 1500, statut: 'livree' },
  { id: 'EXP-007', date: '06/06/2026', destination: 'Akwa', montant: 500, statut: 'livree' },
  { id: 'EXP-002', date: '05/06/2026', destination: 'Bassa', montant: 1200, statut: 'en_cours' },
];

// ── COMPOSANTS ────────────────────────────────────────────────

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - (v / max) * 18}`).join(' ');
  return (
    <svg width="60" height="22" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

function KPICard({ label, valeur, icone, bg, color, tendance, sparkColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', boxShadow: hov ? '0 8px 28px rgba(0,0,0,.10)' : '0 2px 8px rgba(0,0,0,.04)', transition: 'all 220ms ease', transform: hov ? 'translateY(-3px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icone}</div>
        {tendance !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: tendance >= 0 ? '#DCFCE7' : '#FEE2E2', color: tendance >= 0 ? '#15803D' : '#B91C1C' }}>
            {tendance >= 0 ? '↑' : '↓'} {Math.abs(tendance)}%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: color || C.texte, lineHeight: 1 }}>{valeur}</div>
          <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
        </div>
        <Sparkline data={SPARKLINE} color={sparkColor || color || C.vert} />
      </div>
    </div>
  );
}

function SegmentCard({ icone, label, count, pct, color, bg }) {
  return (
    <div style={{ background: bg, border: `.5px solid ${color}30`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icone}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.texteMuted, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color }}>{pct}%</div>
        <div style={{ fontSize: 10, color: C.texteMuted }}>du total</div>
      </div>
    </div>
  );
}

function StatutBadge({ statut }) {
  const cfg = {
    actif: { label: 'Actif', bg: '#DCFCE7', color: '#15803D' },
    inactif: { label: 'Inactif', bg: '#F1F5F9', color: '#64748B' },
    suspendu: { label: 'Suspendu', bg: '#FEE2E2', color: '#B91C1C' },
  }[statut] || { label: statut, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />{cfg.label}</span>;
}

function SegmentBadge({ segment }) {
  const cfg = {
    premium: { label: '🥇 Premium', bg: '#FEF3C7', color: '#B45309' },
    fidele: { label: '🥈 Fidèle', bg: '#E0E7FF', color: '#4338CA' },
    standard: { label: '🥉 Standard', bg: '#F1F5F9', color: '#475569' },
    inactif: { label: '⚠️ Inactif', bg: '#FEE2E2', color: '#B91C1C' },
  }[segment] || { label: segment, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function ValeurBadge({ depenses }) {
  const cfg = depenses >= 80000 ? { label: 'VIP', color: '#B45309', bg: '#FEF3C7' }
    : depenses >= 40000 ? { label: 'Élevée', color: '#15803D', bg: '#DCFCE7' }
    : depenses >= 15000 ? { label: 'Moyenne', color: '#1D4ED8', bg: '#DBEAFE' }
    : { label: 'Faible', color: '#64748B', bg: '#F1F5F9' };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function ScoreBarre({ score }) {
  const color = score >= 80 ? C.vert : score >= 60 ? C.ambre : C.rouge;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 10 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 26, textAlign: 'right' }}>{score}</span>
    </div>
  );
}

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.name} : {p.value}</div>)}
    </div>
  );
}

// ── MODAL CLIENT ──────────────────────────────────────────────

function ModalClient({ client, onClose }) {
  const [onglet, setOnglet] = useState('infos');
  if (!client) return null;

  const ONGLETS = [
    { id: 'infos', label: '👤 Infos' },
    { id: 'commandes', label: '📦 Commandes' },
    { id: 'paiements', label: '💰 Paiements' },
    { id: 'activite', label: '📊 Activité' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 480, background: C.blanc, zIndex: 301, boxShadow: '-16px 0 60px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideInRight 220ms ease' }}>
        <style>{`@keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: `.5px solid ${C.border}`, background: client.segment === 'premium' ? '#FFFBEB' : C.blanc, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar"
                style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${client.segment === 'premium' ? C.ambre : C.vert}` }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>{client.nom}</div>
                <div style={{ fontSize: 12, color: C.texteMuted }}>{client.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <SegmentBadge segment={client.segment} />
                  <StatutBadge statut={client.statut} />
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', borderBottom: `.5px solid ${C.border}`, flexShrink: 0 }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ flex: 1, padding: '10px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: onglet === o.id ? 600 : 400, color: onglet === o.id ? C.vert : C.texteMuted, borderBottom: onglet === o.id ? `2px solid ${C.vert}` : '2px solid transparent', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {onglet === 'infos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: '📞 Téléphone', v: client.telephone },
                  { l: '🌍 Ville', v: client.ville },
                  { l: '📍 Adresse', v: client.adresse },
                  { l: '📅 Inscrit le', v: new Date(client.inscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                ].map((r, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>{r.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{r.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, borderRadius: 14, padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { l: 'Colis expédiés', v: client.colis },
                  { l: 'Dépenses totales', v: `${(client.depenses / 1000).toFixed(0)}K F` },
                  { l: 'Satisfaction', v: `⭐ ${client.satisfaction}` },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 8 }}>Score fidélité</div>
                <ScoreBarre score={client.score_fidelite} />
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 6 }}>
                  {client.score_fidelite >= 80 ? 'Client très fidèle — engagement élevé.' : client.score_fidelite >= 60 ? 'Client régulier — potentiel de montée en gamme.' : 'Client à risque — reengagement recommandé.'}
                </div>
              </div>

              <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>⚡ Analyse IA</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}>
                  {client.segment === 'premium' ? 'Client VIP stratégique. Taux de réachat : 87%. Recommandation : programme de fidélité exclusif.' :
                    client.segment === 'fidele' ? 'Client régulier avec fort potentiel d\'upsell. Dernière commande il y a 3 jours.' :
                      'Client à réactiver. Dernier achat > 30 jours. Proposer une offre de réengagement.'}
                </div>
              </div>
            </div>
          )}

          {onglet === 'commandes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: C.texteMuted, marginBottom: 4 }}>{ORDRES_MOCK.length} commandes récentes</div>
              {ORDRES_MOCK.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, borderLeft: `3px solid ${o.statut === 'livree' ? C.vert : C.bleu}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.texte, fontFamily: 'monospace' }}>{o.id}</div>
                    <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{o.date} · {o.destination}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.texte }}>{o.montant} F</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: o.statut === 'livree' ? C.vertClair : C.bleuClair, color: o.statut === 'livree' ? '#15803D' : C.bleu }}>
                      {o.statut === 'livree' ? '✓ Livrée' : '🔄 En cours'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onglet === 'paiements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: 'Total dépensé', v: `${client.depenses.toLocaleString()} F`, color: C.vert },
                  { l: 'Commandes payées', v: client.colis, color: C.bleu },
                  { l: 'Valeur moyenne', v: `${Math.round(client.depenses / Math.max(client.colis, 1)).toLocaleString()} F`, color: C.violet },
                  { l: 'Mode favori', v: '📱 Mobile Money', color: C.ambre },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '12px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onglet === 'activite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 10 }}>Activité 30 derniers jours</div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={EVOLUTION_CLIENTS}>
                    <defs>
                      <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.vert} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={C.vert} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke={C.vert} strokeWidth={2} fill="url(#gAct)" />
                    <Tooltip content={<TooltipCustom />} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {[
                { icone: '📦', label: 'Dernière commande', val: '07/06/2026' },
                { icone: '💬', label: 'Dernière interaction', val: 'Il y a 2 jours' },
                { icone: '⭐', label: 'Note moyenne donnée', val: `${client.satisfaction} / 5.0` },
                { icone: '🔁', label: 'Taux de réachat', val: client.segment === 'premium' ? '87%' : client.segment === 'fidele' ? '68%' : '34%' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.texteMuted }}>{r.icone} {r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{r.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '14px 24px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>📞 Contacter</button>
          <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vertFonce, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>✏️ Modifier</button>
          {client.statut === 'actif' ? (
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>⏸ Suspendre</button>
          ) : (
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: C.vertClair, color: C.vert, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>▶ Réactiver</button>
          )}
        </div>
      </div>
    </>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

const PAR_PAGE = 6;

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accesRefuse, setAccesRefuse] = useState(false);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreSegment, setFiltreSegment] = useState('tous');
  const [tri, setTri] = useState({ col: 'depenses', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const PAR_PAGE = 6;

  useEffect(() => {
    apiCall<any>(API.CLIENTS)
      .then(data => {
        const liste = Array.isArray(data) ? data : data.results || data.clients || [];
        setClients(liste);
      })
      .catch(err => {
        if (err.status === 403) setAccesRefuse(true);
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const ms = !search || `${c.nom || c.first_name || ''} ${c.email || ''} ${c.telephone || ''} ${c.ville || ''}`.toLowerCase().includes(search.toLowerCase());
    const mst = filtreStatut === 'tous' || c.statut === filtreStatut;
    const mseg = filtreSegment === 'tous' || c.segment === filtreSegment;
    return ms && mst && mseg;
  }).sort((a, b) => {
    const va = a[tri.col], vb = b[tri.col];
    const v = tri.dir === 'desc' ? vb - va : va - vb;
    return isNaN(v) ? 0 : v;
  });

  const paginated = filtered.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const totalPages = Math.ceil(filtered.length / PAR_PAGE);

  const stats = {
    total: clients.length,
    actifs: clients.filter(c => c.statut === 'actif').length,
    nouveaux: clients.filter(c => {
      const d = new Date(c.date_inscription || c.date_joined);
      return (Date.now() - d.getTime()) < 30 * 24 * 3600 * 1000;
    }).length,
    chiffre: clients.reduce((s, c) => s + (c.depenses || c.depenses_total || 0), 0),
    colis: clients.reduce((s, c) => s + (c.colis || c.nb_expeditions || 0), 0),
    satisfaction: clients.length > 0
      ? (clients.reduce((s, c) => s + (c.satisfaction || c.note_moyenne || 0), 0) / clients.length).toFixed(1)
      : '0.0',
  };

  function setSort(col) {
    setTri(prev => ({ col, dir: prev.col === col && prev.dir === 'desc' ? 'asc' : 'desc' }));
  }

  // Normaliser un client selon la structure Django
  function normalise(c) {
    return {
      ...c,
      nom: c.nom || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      colis: c.colis || c.nb_expeditions || 0,
      depenses: c.depenses || c.depenses_total || 0,
      satisfaction: c.satisfaction || c.note_moyenne || 0,
      score_fidelite: c.score_fidelite || 50,
      segment: c.segment || 'standard',
      statut: c.statut || c.status || 'actif',
      inscription: c.inscription || c.date_joined || c.date_inscription,
      ville: c.ville || c.city || '—',
      telephone: c.telephone || c.phone || '—',
      email: c.email || '—',
      adresse: c.adresse || c.address || '—',
    };
  }

  if (accesRefuse) return <AccesRefuse module="la gestion des clients" />;
  
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Chargement des clients...</div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>❌</div>
      <div style={{ fontSize: 14, color: '#EF4444' }}>Erreur : {error}</div>
      <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#22C55E', color: '#fff', cursor: 'pointer' }}>Réessayer</button>
    </div>
  );

  const clientsNorm = filtered.map(normalise);
  const paginatedNorm = clientsNorm.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function exporterClients(liste, stats) {
  imprimerRapport({
    titre: 'Rapport Clients',
    sousTitre: `${liste.length} client${liste.length > 1 ? 's' : ''} affiché${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '👥 Détail des clients',
        colonnes: ['Client', 'Téléphone', 'Ville', 'Colis', 'Dépenses', 'Score fidélité', 'Segment', 'Statut'],
        lignes: liste.map(c => [
          c.nom,
          c.telephone,
          c.ville,
          c.colis,
          formatMontantExport(c.depenses),
          `${c.score_fidelite}/100`,
          c.segment,
          c.statut,
        ]),
      },
    ],
  });
}
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0 }}>👥 Gestion Clients</h1>
          <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 3 }}>Analyse et supervision du portefeuille clients · {clients.length} clients</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exporterClients(clientsNorm, stats)} style={{ padding: '8px 14px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📥 Exporter</button>          <button style={{ padding: '8px 14px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📊 Rapport</button>
          {/* <button style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Inviter Client</button> */}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        <KPICard label="Total clients" valeur={stats.total} icone="👥" bg={C.bleuClair} color={C.bleu} tendance={5} sparkColor={C.bleu} />
        <KPICard label="Clients actifs" valeur={stats.actifs} icone="🟢" bg={C.vertClair} color={C.vert} tendance={8} sparkColor={C.vert} />
        <KPICard label="Nouveaux ce mois" valeur={stats.nouveaux} icone="🆕" bg={C.violetClair} color={C.violet} tendance={12} sparkColor={C.violet} />
        <KPICard label="Chiffre généré" valeur={`${(stats.chiffre / 1000).toFixed(0)}K F`} icone="💰" bg={C.ambreClair} color={C.ambre} tendance={9} sparkColor={C.ambre} />
        <KPICard label="Colis expédiés" valeur={stats.colis} icone="📦" bg={C.cyanClair} color={C.cyan} tendance={15} sparkColor={C.cyan} />
        <KPICard label="Satisfaction" valeur={`${stats.satisfaction}⭐`} icone="⭐" bg={C.limeClair} color={C.lime} sparkColor={C.lime} />
      </div>

      {/* Segmentation + Top clients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.texte, marginBottom: 14 }}>🎯 Segmentation clients</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SegmentCard icone="🥇" label="Premium" count={clients.filter(c => c.segment === 'premium').length} pct={clients.length ? Math.round(clients.filter(c => c.segment === 'premium').length / clients.length * 100) : 0} color={C.ambre} bg={C.ambreClair} />
            <SegmentCard icone="🥈" label="Fidèles" count={clients.filter(c => c.segment === 'fidele').length} pct={clients.length ? Math.round(clients.filter(c => c.segment === 'fidele').length / clients.length * 100) : 0} color={C.violet} bg={C.violetClair} />
            <SegmentCard icone="🥉" label="Occasionnels" count={clients.filter(c => c.segment === 'standard').length} pct={clients.length ? Math.round(clients.filter(c => c.segment === 'standard').length / clients.length * 100) : 0} color={C.bleu} bg={C.bleuClair} />
            <SegmentCard icone="⚠️" label="Inactifs" count={clients.filter(c => c.segment === 'inactif').length} pct={clients.length ? Math.round(clients.filter(c => c.segment === 'inactif').length / clients.length * 100) : 0} color={C.rouge} bg={C.rougeClair} />
          </div>
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `.5px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.texte }}>🏆 Top clients du mois</div>
          <div style={{ padding: '4px 0' }}>
            {[...clients].map(normalise).sort((a, b) => b.depenses - a.depenses).slice(0, 5).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i < 4 ? `.5px solid ${C.border}` : 'none', cursor: 'pointer', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelectedClient(c)}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#FEF3C7' : i === 1 ? '#E0E7FF' : C.surface, border: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nom}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>{c.ville} · {c.colis} colis</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.vert }}>{(c.depenses / 1000).toFixed(0)}K F</div>
                  <SegmentBadge segment={c.segment} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights IA */}
      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 16, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>🧠 Recommandations IA</span>
          <span style={{ fontSize: 10, background: C.lime, color: '#1a2e05', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {INSIGHTS.map((ins, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '12px 14px', borderLeft: `2px solid ${ins.couleur}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
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
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher nom, email, ville..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: C.texte, outline: 'none', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.texteMuted, fontSize: 14 }}>✕</button>}
        </div>
        <select value={filtreStatut} onChange={e => { setFiltreStatut(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 12, color: C.texte, cursor: 'pointer', outline: 'none' }}>
          <option value="tous">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <select value={filtreSegment} onChange={e => { setFiltreSegment(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, fontSize: 12, color: C.texte, cursor: 'pointer', outline: 'none' }}>
          <option value="tous">Tous segments</option>
          <option value="premium">🥇 Premium</option>
          <option value="fidele">🥈 Fidèles</option>
          <option value="standard">🥉 Standard</option>
          <option value="inactif">⚠️ Inactifs</option>
        </select>
        <div style={{ fontSize: 12, color: C.texteMuted, marginLeft: 'auto' }}>{clientsNorm.length} résultat{clientsNorm.length > 1 ? 's' : ''}</div>
      </div>

      {/* Tableau */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {[
                { label: 'Client', col: null }, { label: 'Contact', col: null }, { label: 'Ville', col: null },
                { label: 'Colis', col: 'colis' }, { label: 'Dépenses', col: 'depenses' },
                { label: 'Score fidélité', col: 'score_fidelite' }, { label: 'Valeur', col: null },
                { label: 'Segment', col: null }, { label: 'Statut', col: null }, { label: '', col: null },
              ].map((h, i) => (
                <th key={i} onClick={() => h.col && setSort(h.col)}
                  style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', cursor: h.col ? 'pointer' : 'default' }}>
                  {h.label}{h.col && <span style={{ marginLeft: 4, opacity: tri.col === h.col ? 1 : 0.3 }}>{tri.col === h.col ? (tri.dir === 'desc' ? '↓' : '↑') : '↕'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedNorm.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 14 }}>Aucun client trouvé</div>
              </td></tr>
            ) : paginatedNorm.map((c, i) => (
              <tr key={c.id || i} style={{ borderBottom: `.5px solid ${C.border}`, transition: 'background 150ms', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{c.nom}</div>
                      <div style={{ fontSize: 10, color: C.texteMuted }}>Depuis {c.inscription ? new Date(c.inscription).getFullYear() : '—'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ fontSize: 11, color: C.texte }}>{c.telephone}</div>
                  <div style={{ fontSize: 10, color: C.texteMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{c.email}</div>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 12, color: C.texte }}>{c.ville}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: C.texte, textAlign: 'center' }}>{c.colis}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: C.vert }}>{(c.depenses / 1000).toFixed(0)}K F</td>
                <td style={{ padding: '11px 12px', minWidth: 110 }}><ScoreBarre score={c.score_fidelite} /></td>
                <td style={{ padding: '11px 12px' }}><ValeurBadge depenses={c.depenses} /></td>
                <td style={{ padding: '11px 12px' }}><SegmentBadge segment={c.segment} /></td>
                <td style={{ padding: '11px 12px' }}><StatutBadge statut={c.statut} /></td>
                <td style={{ padding: '11px 12px' }}>
                  <button onClick={() => setSelectedClient(c)} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Voir →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '12px 16px', borderTop: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.texteMuted }}>{clientsNorm.length} client{clientsNorm.length > 1 ? 's' : ''} · Page {page}/{Math.max(totalPages, 1)}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: page === 1 ? C.texteMuted : C.texte, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Précédent</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: p === page ? C.vert : C.surface, color: p === page ? '#fff' : C.texteMuted, cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 600 : 400 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: page >= totalPages ? C.texteMuted : C.texte, cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 12 }}>Suivant →</button>
          </div>
        </div>
      </div>

      <ModalClient client={selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}