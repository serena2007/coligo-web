// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { PAIEMENTS, CHAUFFEURS, CLIENTS, EXPEDITIONS, formatMontant } from '../../data/mockData';
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';
import { imprimerRapport, formatMontantExport } from '../../utils/exportRapport';
const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#F0FDF4',
  rouge: '#EF4444', rougeClair: '#FEF2F2',
  ambre: '#F59E0B', ambreClair: '#FFFBEB',
  bleu: '#3B82F6', bleuClair: '#EFF6FF',
  violet: '#8B5CF6', violetClair: '#EDE9FE',
  texte: '#0F172A', texteMuted: '#94A3B8',
  border: '#E2E8F0', surface: '#F8FAFC', blanc: '#fff',
};

// ── DONNÉES ENRICHIES ─────────────────────────────────────────

const TRANSACTIONS = [
  { id: 1, type: 'paiement_client', ref: 'TXN-001', client: 'Serena Kameni', chauffeur: 'Paul Nguema', expedition_id: 1, montant: 500, commission: 50, mode: 'especes', statut: 'valide', date: '2026-06-05T09:45:00', description: 'Paiement course Akwa → Bonanjo' },
  { id: 2, type: 'paiement_client', ref: 'TXN-002', client: 'Laure Eto', chauffeur: 'Claire Ndong', expedition_id: 5, montant: 2000, commission: 200, mode: 'mobile_money', statut: 'valide', date: '2026-06-05T16:30:00', description: 'Paiement course Logbessou → Bonaberi' },
  { id: 3, type: 'paiement_client', ref: 'TXN-003', client: 'Fatou Sow', chauffeur: 'Paul Nguema', expedition_id: 7, montant: 500, commission: 50, mode: 'especes', statut: 'valide', date: '2026-06-06T07:40:00', description: 'Paiement course Bonanjo → Akwa' },
  { id: 4, type: 'paiement_client', ref: 'TXN-004', client: 'Marie Obiang', chauffeur: 'Jean Tamba', expedition_id: 2, montant: 1200, commission: 120, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T07:15:00', description: 'Paiement course Bonapriso → Bassa' },
  { id: 5, type: 'paiement_client', ref: 'TXN-005', client: 'Eric Bouka', chauffeur: 'Samuel Kotto', expedition_id: 3, montant: 2000, commission: 200, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T07:45:00', description: 'Paiement course Makepe → Deido' },
  { id: 6, type: 'commission', ref: 'COM-001', client: null, chauffeur: 'Paul Nguema', expedition_id: 1, montant: 50, commission: 50, mode: 'automatique', statut: 'valide', date: '2026-06-05T09:46:00', description: 'Commission COLIGO 10% — EXP-001' },
  { id: 7, type: 'commission', ref: 'COM-002', client: null, chauffeur: 'Claire Ndong', expedition_id: 5, montant: 200, commission: 200, mode: 'automatique', statut: 'valide', date: '2026-06-05T16:31:00', description: 'Commission COLIGO 10% — EXP-005' },
  { id: 8, type: 'retrait', ref: 'RET-001', client: null, chauffeur: 'Paul Nguema', expedition_id: null, montant: 15000, commission: 0, mode: 'mobile_money', statut: 'valide', date: '2026-06-03T10:00:00', description: 'Retrait wallet — Orange Money' },
  { id: 9, type: 'retrait', ref: 'RET-002', client: null, chauffeur: 'Claire Ndong', expedition_id: null, montant: 25000, commission: 0, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T08:00:00', description: 'Retrait wallet — MTN Mobile Money' },
  { id: 10, type: 'retrait', ref: 'RET-003', client: null, chauffeur: 'Eric Bouka', expedition_id: null, montant: 10000, commission: 0, mode: 'mobile_money', statut: 'rejete', date: '2026-06-04T14:00:00', description: 'Retrait wallet — Solde insuffisant' },
  { id: 11, type: 'remboursement', ref: 'RMB-001', client: 'Jean Mbemba', chauffeur: null, expedition_id: 6, montant: 1200, commission: 0, mode: 'mobile_money', statut: 'valide', date: '2026-06-04T12:00:00', description: 'Remboursement course annulée EXP-006' },
  { id: 12, type: 'remboursement', ref: 'RMB-002', client: 'Amina Diallo', chauffeur: null, expedition_id: null, montant: 500, commission: 0, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T09:00:00', description: 'Remboursement litige client' },
];

const PERIODES = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'week', label: '7 derniers jours' },
  { id: 'month', label: 'Ce mois' },
  { id: 'all', label: 'Tout' },
];

const TYPE_CONFIG = {
  paiement_client: { label: 'Paiement client', icone: '💳', bg: '#EFF6FF', color: '#1D4ED8' },
  commission: { label: 'Commission', icone: '⚡', bg: '#F0FDF4', color: '#15803D' },
  retrait: { label: 'Retrait chauffeur', icone: '↑', bg: '#FFFBEB', color: '#B45309' },
  remboursement: { label: 'Remboursement', icone: '↩', bg: '#FEF2F2', color: '#B91C1C' },
};

const STATUT_CONFIG = {
  valide: { label: 'Validé', bg: '#DCFCE7', color: '#15803D' },
  en_attente: { label: 'En attente', bg: '#FEF3C7', color: '#B45309' },
  rejete: { label: 'Rejeté', bg: '#FEE2E2', color: '#B91C1C' },
  reverse: { label: 'Reversé', bg: '#DBEAFE', color: '#1D4ED8' },
};

function filterByPeriode(transactions, periode) {
  const now = new Date();
  return transactions.filter(t => {
    const date = new Date(t.date);
    if (periode === 'today') return date.toDateString() === now.toDateString();
    if (periode === 'week') return (now - date) < 7 * 24 * 3600 * 1000;
    if (periode === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return true;
  });
}

// ── COMPOSANTS ────────────────────────────────────────────────

function StatCard({ label, valeur, icone, bg, color, sous }) {
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icone}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: color || C.texte }}>{valeur}</div>
        <div style={{ fontSize: 11, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 2 }}>{label}</div>
        {sous && <div style={{ fontSize: 11, color: C.vert, marginTop: 2 }}>{sous}</div>}
      </div>
    </div>
  );
}

function TransactionRow({ t, onAction }) {
  const tc = TYPE_CONFIG[t.type] || TYPE_CONFIG.paiement_client;
  const sc = STATUT_CONFIG[t.statut] || STATUT_CONFIG.en_attente;
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr style={{ borderBottom: `.5px solid ${C.border}`, cursor: 'pointer', transition: 'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background = C.surface}
        onMouseLeave={e => e.currentTarget.style.background = expanded ? C.surface : 'transparent'}
        onClick={() => setExpanded(!expanded)}
      >
        <td style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{tc.icone}</div>
            <div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: C.texte }}>{t.ref}</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>{tc.label}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '12px 14px', fontSize: 12, color: C.texte }}>{t.client || t.chauffeur || '—'}</td>
        <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>{t.description}</td>
        <td style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: t.mode === 'mobile_money' ? '#EDE9FE' : t.mode === 'especes' ? '#F0FDF4' : '#F1F5F9',
            color: t.mode === 'mobile_money' ? '#6D28D9' : t.mode === 'especes' ? '#15803D' : '#64748B' }}>
            {t.mode === 'mobile_money' ? '📱 Mobile Money' : t.mode === 'especes' ? '💵 Espèces' : '⚡ Auto'}
          </span>
        </td>
        <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: t.type === 'retrait' || t.type === 'remboursement' ? C.rouge : C.vert }}>
          {t.type === 'retrait' || t.type === 'remboursement' ? '-' : '+'}{formatMontant(t.montant)}
        </td>
        {t.commission > 0 && t.type === 'paiement_client' ? (
          <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: C.vert }}>+{formatMontant(t.commission)}</td>
        ) : (
          <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>—</td>
        )}
        <td style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
        </td>
        <td style={{ padding: '12px 14px', fontSize: 11, color: C.texteMuted }}>
          {new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td style={{ padding: '12px 14px' }}>
          {t.statut === 'en_attente' && t.type === 'retrait' && (
            <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => onAction(t.id, 'valider')} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: C.vert, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>✓</button>
              <button onClick={() => onAction(t.id, 'rejeter')} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#FEF2F2', color: C.rouge, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>✕</button>
            </div>
          )}
          {t.statut === 'en_attente' && t.type === 'remboursement' && (
            <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => onAction(t.id, 'valider')} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: C.bleu, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>↩</button>
            </div>
          )}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: C.surface }}>
          <td colSpan={9} style={{ padding: '12px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Référence', val: t.ref },
                { label: 'Expédition', val: t.expedition_id ? `#EXP-${t.expedition_id}` : '—' },
                { label: 'Client', val: t.client || '—' },
                { label: 'Chauffeur', val: t.chauffeur || '—' },
                { label: 'Montant brut', val: formatMontant(t.montant) },
                { label: 'Commission', val: t.commission > 0 ? formatMontant(t.commission) : '—' },
                { label: 'Net chauffeur', val: t.type === 'paiement_client' ? formatMontant(t.montant - t.commission) : '—' },
                { label: 'Date', val: new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              ].map((r, i) => (
                <div key={i} style={{ background: C.blanc, borderRadius: 8, padding: '8px 12px', border: `.5px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{r.val}</div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────
export default function PaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('toutes');
  const [periode, setPeriode] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiCall<any>(API.PAYMENTS)
      .then(data => {
        const liste = Array.isArray(data) ? data : data.results || data.transactions || data.payments || [];
        setTransactions(liste);
      })
      .catch(err => console.error('Payments error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Normaliser une transaction selon la structure Django
  function normalise(t: any) {
    return {
      ...t,
      id: t.id,
      type: t.type || t.transaction_type || 'paiement_client',
      ref: t.ref || t.reference || `TXN-${t.id}`,
      client: t.client || t.client_nom || t.sender_name || null,
      chauffeur: t.chauffeur || t.driver_nom || t.receiver_name || null,
      montant: t.montant || t.amount || 0,
      commission: t.commission || t.fee || 0,
      mode: t.mode || t.payment_method || t.mode_paiement || 'mobile_money',
      statut: t.statut || t.status || 'valide',
      date: t.date || t.created_at || t.date_transaction,
      description: t.description || t.motif || '',
      expedition_id: t.expedition_id || t.expedition || null,
    };
  }

  const txNorm = transactions.map(normalise);

  const ONGLETS = [
    { id: 'toutes', label: 'Toutes', icone: '💳' },
    { id: 'paiement_client', label: 'Paiements clients', icone: '💳' },
    { id: 'commission', label: 'Commissions', icone: '⚡' },
    { id: 'retrait', label: 'Retraits chauffeurs', icone: '↑' },
    { id: 'remboursement', label: 'Remboursements', icone: '↩' },
  ];

  const filtered = filterByPeriode(txNorm, periode)
    .filter(t => onglet === 'toutes' || t.type === onglet)
    .filter(t => !search || `${t.ref} ${t.client || ''} ${t.chauffeur || ''} ${t.description}`.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    volume_total: txNorm.filter(t => t.type === 'paiement_client' && t.statut === 'valide').reduce((s, t) => s + t.montant, 0),
    commissions: txNorm.filter(t => t.type === 'commission' && t.statut === 'valide').reduce((s, t) => s + t.montant, 0),
    retraits_attente: txNorm.filter(t => t.type === 'retrait' && t.statut === 'en_attente').reduce((s, t) => s + t.montant, 0),
    remboursements: txNorm.filter(t => t.type === 'remboursement').reduce((s, t) => s + t.montant, 0),
  };

  function handleAction(id: number, action: string) {
    // Appel API réel
    apiCall(API.PAYMENTS + `${id}/${action === 'valider' ? 'approve' : 'reject'}/`, 'POST')
      .then(() => {
        setTransactions(prev => prev.map((t: any) =>
          t.id === id ? { ...t, statut: action === 'valider' ? 'valide' : 'rejete' } : t
        ));
      })
      .catch(err => console.error('Action error:', err));
  }

  function exporterTransactions(liste, stats) {
  imprimerRapport({
    titre: 'Rapport Finance & Paiements',
    sousTitre: `${liste.length} transaction${liste.length > 1 ? 's' : ''} affichée${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '💳 Détail des transactions',
        colonnes: ['Référence', 'Type', 'Acteur', 'Montant', 'Commission', 'Mode', 'Statut', 'Date'],
        lignes: liste.map((t: any) => [
          t.ref,
          TYPE_CONFIG[t.type]?.label || t.type,
          t.client || t.chauffeur || '—',
          formatMontantExport(t.montant),
          t.commission > 0 ? formatMontantExport(t.commission) : '—',
          t.mode === 'mobile_money' ? 'Mobile Money' : t.mode === 'especes' ? 'Espèces' : 'Auto',
          STATUT_CONFIG[t.statut]?.label || t.statut,
          new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        ]),
      },
    ],
  });
}

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Chargement des transactions...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0 }}>Finance & Paiements</h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>{filtered.length} transaction{filtered.length > 1 ? 's' : ''} · Données réelles</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => exporterTransactions(filtered, stats)} style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>📥 Exporter CSV</button>          <button style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📄 Rapport PDF</button>
        </div>
      </div>

      {/* Alertes retraits */}
      {txNorm.filter(t => t.type === 'retrait' && t.statut === 'en_attente').length > 0 && (
        <div style={{ background: '#FFFBEB', border: `.5px solid #FDE68A`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ambre }}>
              {txNorm.filter(t => t.type === 'retrait' && t.statut === 'en_attente').length} retrait{txNorm.filter(t => t.type === 'retrait' && t.statut === 'en_attente').length > 1 ? 's' : ''} en attente
            </div>
            <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>Total : {formatMontant(stats.retraits_attente)}</div>
          </div>
          <button onClick={() => setOnglet('retrait')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.ambre, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Traiter →</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Volume total" valeur={formatMontant(stats.volume_total)} icone="💰" bg={C.vertClair} color={C.vert} sous="Paiements validés" />
        <StatCard label="Commissions COLIGO" valeur={formatMontant(stats.commissions)} icone="⚡" bg="#F0FDF4" color={C.vert} sous="10% du volume" />
        <StatCard label="Retraits en attente" valeur={formatMontant(stats.retraits_attente)} icone="⏳" bg={C.ambreClair} color={C.ambre} sous="À approuver" />
        <StatCard label="Remboursements" valeur={formatMontant(stats.remboursements)} icone="↩" bg={C.rougeClair} color={C.rouge} sous="Total émis" />
      </div>

      {/* Filtres */}
      <div style={{ background: C.blanc, borderRadius: 14, border: `.5px solid ${C.border}`, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surface, borderRadius: 10, padding: '8px 14px', border: `.5px solid ${C.border}`, flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une transaction..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: C.texte, outline: 'none', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.texteMuted }}>✕</button>}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODES.map(p => (
            <button key={p.id} onClick={() => setPeriode(p.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: periode === p.id ? C.vertFonce : C.surface, color: periode === p.id ? '#fff' : C.texteMuted }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {ONGLETS.map(o => {
          const count = filterByPeriode(txNorm, periode).filter(t => o.id === 'toutes' || t.type === o.id).length;
          const enAttente = txNorm.filter(t => t.type === o.id && t.statut === 'en_attente').length;
          return (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              {o.label}
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: onglet === o.id ? 'rgba(255,255,255,.25)' : C.surface, color: onglet === o.id ? '#fff' : C.texteMuted }}>{count}</span>
              {enAttente > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: C.ambre, color: '#fff' }}>{enAttente}</span>}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {['Référence', 'Acteur', 'Description', 'Mode', 'Montant', 'Commission', 'Statut', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
                <div style={{ fontSize: 14 }}>Aucune transaction trouvée</div>
              </td></tr>
            ) : filtered.map(t => (
              <TransactionRow key={t.id} t={t} onAction={handleAction} />
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', borderTop: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: C.texteMuted }}>
          <span>{filtered.length} transaction{filtered.length > 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Volume affiché : <strong style={{ color: C.vert }}>{formatMontant(filtered.filter(t => t.type === 'paiement_client').reduce((s, t) => s + t.montant, 0))}</strong></span>
            <span>Commissions : <strong style={{ color: C.vert }}>{formatMontant(filtered.filter(t => t.type === 'commission').reduce((s, t) => s + t.montant, 0))}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}