// @ts-nocheck
import React, { useState } from 'react';
import { ESCROW, EXPEDITIONS, CHAUFFEURS, CLIENTS, formatMontant } from '../../data/mockData';
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
const ESCROW_ENRICHI = [
  // {
  //   id: 1, expedition_id: 2, montant: 1200, commission: 120,
  //   raison: 'Livraison en cours', duree: '45 min',
  //   statut: 'bloque', client: 'Marie Obiang', chauffeur: 'Jean Tamba',
  //   date: '2026-06-06T07:15:00', mode_paiement: 'mobile_money',
  // },
  // {
  //   id: 2, expedition_id: 3, montant: 2000, commission: 200,
  //   raison: 'Litige signalé', duree: '2h 15min',
  //   statut: 'litige', client: 'Eric Bouka', chauffeur: 'Samuel Kotto',
  //   date: '2026-06-06T07:45:00', mode_paiement: 'mobile_money',
  // },
  // {
  //   id: 3, expedition_id: 8, montant: 1200, commission: 120,
  //   raison: 'Livraison en cours', duree: '22 min',
  //   statut: 'bloque', client: 'David Monga', chauffeur: 'Samuel Manga',
  //   date: '2026-06-06T08:10:00', mode_paiement: 'mobile_money',
  // },
  // {
  //   id: 4, expedition_id: 5, montant: 2000, commission: 200,
  //   raison: 'Livraison terminée — en attente validation', duree: '1h 02min',
  //   statut: 'en_attente_liberation', client: 'Laure Eto', chauffeur: 'Claire Ndong',
  //   date: '2026-06-05T14:20:00', mode_paiement: 'mobile_money',
  // },
];

const RETRAITS = [
  // { id: 1, chauffeur: 'Paul Nguema', driver_id: 'T-014', montant: 50000, date: '2026-06-06T09:00:00', statut: 'en_attente', mode: 'Orange Money', telephone: '+237 677 111 222' },
  // { id: 2, chauffeur: 'Claire Ndong', driver_id: 'T-011', montant: 120000, date: '2026-06-06T08:30:00', statut: 'en_attente', mode: 'MTN Mobile Money', telephone: '+237 691 111 333' },
  // { id: 3, chauffeur: 'Jean Tamba', driver_id: 'T-027', montant: 35000, date: '2026-06-05T16:00:00', statut: 'approuve', mode: 'Orange Money', telephone: '+237 699 333 444' },
  // { id: 4, chauffeur: 'Samuel Kotto', driver_id: 'T-041', montant: 28000, date: '2026-06-05T14:00:00', statut: 'rejete', mode: 'MTN Mobile Money', telephone: '+237 688 777 888' },
];

const REMBOURSEMENTS = [
  // { id: 1, client: 'Amina Diallo', expedition_id: 6, montant: 1200, raison: 'Course annulée par chauffeur', date: '2026-06-04T11:30:00', statut: 'traite' },
  // { id: 2, client: 'Paul Nkeng', expedition_id: 4, montant: 500, raison: 'Litige résolu en faveur du client', date: '2026-06-06T07:00:00', statut: 'en_attente' },
];

const HISTORIQUE = [
  // { id: 1, type: 'liberation', description: 'Fonds libérés — EXP-007', montant: 500, date: 'Aujourd\'hui 07:40', couleur: C.vert },
  // { id: 2, type: 'retrait', description: 'Retrait approuvé — T-027 Jean Tamba', montant: -35000, date: 'Hier 16:00', couleur: C.bleu },
  // { id: 3, type: 'remboursement', description: 'Remboursement — Amina Diallo', montant: -1200, date: '04 juin 2026', couleur: C.ambre },
  // { id: 4, type: 'blocage', description: 'Fonds bloqués — EXP-002', montant: 1200, date: '06 juin 2026', couleur: C.violet },
  // { id: 5, type: 'liberation', description: 'Fonds libérés — EXP-005', montant: 2000, date: '05 juin 2026', couleur: C.vert },
];

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

// ── MODAL ACTION ──────────────────────────────────────────────
function ActionModal({ titre, description, onConfirm, onClose, type }) {
  const [motif, setMotif] = useState('');
  const couleur = type === 'danger' ? C.rouge : type === 'warning' ? C.ambre : C.vert;
  const bgCouleur = type === 'danger' ? '#FEF2F2' : type === 'warning' ? '#FFFBEB' : C.vertClair;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 440, background: C.blanc, zIndex: 301, borderRadius: 20, boxShadow: '0 25px 80px rgba(0,0,0,.25)', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: bgCouleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>
            {type === 'danger' ? '⚠️' : type === 'warning' ? '🔒' : '✓'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.texte, marginBottom: 6 }}>{titre}</div>
          <div style={{ fontSize: 13, color: C.texteMuted }}>{description}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>Motif (optionnel)</label>
          <textarea value={motif} onChange={e => setMotif(e.target.value)} placeholder="Précisez la raison de cette action..."
            style={{ width: '100%', height: 80, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '10px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={() => onConfirm(motif)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: couleur, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Confirmer</button>
        </div>
      </div>
    </>
  );
}

// ── MODAL DÉTAIL ESCROW ───────────────────────────────────────
function EscrowDetailModal({ escrow, onClose, onDebloquer, onRembourser }) {
  if (!escrow) return null;
  const expedition = EXPEDITIONS.find(e => e.id === escrow.expedition_id);

  const statutConfig = {
    bloque: { label: 'Bloqué', bg: '#DBEAFE', color: '#1D4ED8' },
    litige: { label: 'En litige', bg: '#FEE2E2', color: '#B91C1C' },
    en_attente_liberation: { label: 'En attente libération', bg: '#FEF3C7', color: '#B45309' },
    libere: { label: 'Libéré', bg: '#DCFCE7', color: '#15803D' },
  };

  const sc = statutConfig[escrow.statut] || statutConfig.bloque;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '92%', maxWidth: 560, maxHeight: '88vh', background: C.blanc, zIndex: 201, borderRadius: 20, boxShadow: '0 30px 100px rgba(0,0,0,.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>🔒 Escrow #{escrow.id}</div>
            <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 3 }}>Expédition #EXP-{escrow.expedition_id}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Montant */}
          <div style={{ background: 'linear-gradient(135deg, #14532D, #22C55E)', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Montant bloqué</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{formatMontant(escrow.montant)}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#4ADE80' }}>{formatMontant(escrow.montant - escrow.commission)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>Net chauffeur</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#4ADE80' }}>{formatMontant(escrow.commission)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>Commission COLIGO</div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
              <div style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Client expéditeur</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.bleuClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{escrow.client}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>Expéditeur</div>
                </div>
              </div>
            </div>
            <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
              <div style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Chauffeur assigné</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.vertClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚕</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{escrow.chauffeur}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>Chauffeur</div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails expédition */}
          {expedition && (
            <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '10px 16px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Détails de l'expédition</div>
              {[
                { label: 'Adresse ramassage', val: expedition.adresse_ramassage },
                { label: 'Adresse livraison', val: expedition.adresse_livraison },
                { label: 'Distance', val: `${expedition.distance_km} km` },
                { label: 'Format colis', val: expedition.format_colis === 'S' ? 'Petit' : expedition.format_colis === 'M' ? 'Moyen' : 'Grand' },
                { label: 'Mode paiement', val: escrow.mode_paiement === 'mobile_money' ? '📱 Mobile Money' : '💵 Espèces' },
                { label: 'Durée blocage', val: escrow.duree },
                { label: 'Raison blocage', val: escrow.raison },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `.5px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.texteMuted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{row.val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Alerte litige */}
          {escrow.statut === 'litige' && (
            <div style={{ background: '#FEF2F2', border: `.5px solid #FECACA`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.rouge }}>Litige en cours</div>
                <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>Les fonds sont bloqués jusqu'à résolution du litige. Allez sur la page Litiges pour traiter ce cas.</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {escrow.statut !== 'litige' && (
              <button onClick={() => onDebloquer(escrow)} style={{ padding: '11px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                ✓ Débloquer et libérer
              </button>
            )}
            <button onClick={() => onRembourser(escrow)} style={{ padding: '11px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              ↩ Rembourser le client
            </button>
            {escrow.statut === 'litige' && (
              <button style={{ padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                ⚖️ Voir le litige
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────
export default function EscrowPage() {
  const [onglet, setOnglet] = useState('fonds');
  const [escrows, setEscrows] = useState(ESCROW_ENRICHI);
  const [retraits, setRetraits] = useState(RETRAITS);
  const [remboursements, setRemboursements] = useState(REMBOURSEMENTS);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const stats = {
    total_bloque: escrows.filter(e => ['bloque', 'en_attente_liberation'].includes(e.statut)).reduce((s, e) => s + e.montant, 0),
    en_litige: escrows.filter(e => e.statut === 'litige').reduce((s, e) => s + e.montant, 0),
    retraits_attente: retraits.filter(r => r.statut === 'en_attente').reduce((s, r) => s + r.montant, 0),
    remboursements_attente: remboursements.filter(r => r.statut === 'en_attente').reduce((s, r) => s + r.montant, 0),
  };

  const ONGLETS = [
    { id: 'fonds', label: '🔒 Fonds bloqués', count: escrows.filter(e => e.statut !== 'libere').length },
    { id: 'retraits', label: '💸 Retraits', count: retraits.filter(r => r.statut === 'en_attente').length },
    { id: 'remboursements', label: '↩ Remboursements', count: remboursements.filter(r => r.statut === 'en_attente').length },
    { id: 'historique', label: '📋 Historique', count: null },
  ];

  const statutEscrowConfig = {
    bloque: { label: 'Bloqué', bg: '#DBEAFE', color: '#1D4ED8' },
    litige: { label: 'En litige', bg: '#FEE2E2', color: '#B91C1C' },
    en_attente_liberation: { label: 'En attente', bg: '#FEF3C7', color: '#B45309' },
    libere: { label: 'Libéré', bg: '#DCFCE7', color: '#15803D' },
  };

  function debloquerEscrow(escrow, motif) {
    setEscrows(prev => prev.map(e => e.id === escrow.id ? { ...e, statut: 'libere' } : e));
    setSelectedEscrow(null);
    setActionModal(null);
  }

  function rembourserClient(escrow, motif) {
    setEscrows(prev => prev.filter(e => e.id !== escrow.id));
    setRemboursements(prev => [...prev, {
      id: prev.length + 1,
      client: escrow.client,
      expedition_id: escrow.expedition_id,
      montant: escrow.montant,
      raison: motif || 'Remboursement manuel admin',
      date: new Date().toISOString(),
      statut: 'traite',
    }]);
    setSelectedEscrow(null);
    setActionModal(null);
  }

  function approuverRetrait(id, motif) {
    setRetraits(prev => prev.map(r => r.id === id ? { ...r, statut: 'approuve' } : r));
    setActionModal(null);
  }

  function rejeterRetrait(id, motif) {
    setRetraits(prev => prev.map(r => r.id === id ? { ...r, statut: 'rejete' } : r));
    setActionModal(null);
  }

  function traiterRemboursement(id) {
    setRemboursements(prev => prev.map(r => r.id === id ? { ...r, statut: 'traite' } : r));
  }

  function exporterEscrow(escrows, retraits, remboursements, stats) {
  imprimerRapport({
    titre: 'Rapport Escrow & Wallets',
    sections: [
      {
        titre: '🔒 Fonds bloqués',
        colonnes: ['Expédition', 'Client', 'Chauffeur', 'Montant', 'Statut', 'Raison'],
        lignes: escrows.filter(e => e.statut !== 'libere').map(e => [
          `EXP-${e.expedition_id}`,
          e.client,
          e.chauffeur,
          formatMontantExport(e.montant),
          e.statut,
          e.raison,
        ]),
      },
      {
        titre: '💸 Retraits',
        colonnes: ['Chauffeur', 'Montant', 'Mode', 'Statut'],
        lignes: retraits.map(r => [
          r.chauffeur,
          formatMontantExport(r.montant),
          r.mode,
          r.statut,
        ]),
      },
      {
        titre: '↩ Remboursements',
        colonnes: ['Client', 'Expédition', 'Montant', 'Statut'],
        lignes: remboursements.map(r => [
          r.client,
          `EXP-${r.expedition_id}`,
          formatMontantExport(r.montant),
          r.statut,
        ]),
      },
    ],
  });
}

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0 }}>Escrow & Wallets</h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>Gestion des fonds bloqués et des retraits chauffeurs</p>
        </div>
       <button onClick={() => exporterEscrow(escrows, retraits, remboursements, stats)} style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
         📥 Exporter rapport
</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total bloqué" valeur={formatMontant(stats.total_bloque)} icone="🔒" bg={C.bleuClair} color={C.bleu} sous="Fonds en escrow actifs" />
        <StatCard label="En litige" valeur={formatMontant(stats.en_litige)} icone="⚖️" bg="#FEE2E2" color={C.rouge} sous="Arbitrage requis" />
        <StatCard label="Retraits en attente" valeur={formatMontant(stats.retraits_attente)} icone="💸" bg={C.ambreClair} color={C.ambre} sous={`${retraits.filter(r => r.statut === 'en_attente').length} demandes`} />
        <StatCard label="Remboursements" valeur={formatMontant(stats.remboursements_attente)} icone="↩" bg={C.vertClair} color={C.vert} sous={`${remboursements.filter(r => r.statut === 'en_attente').length} en attente`} />
      </div>

      {/* Alertes */}
      {escrows.some(e => e.statut === 'litige') && (
        <div style={{ background: '#FEF2F2', border: `.5px solid #FECACA`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.rouge }}>
            {escrows.filter(e => e.statut === 'litige').length} fonds en litige nécessitent une intervention manuelle
          </span>
          <button onClick={() => setOnglet('fonds')} style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 8, border: 'none', background: C.rouge, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Traiter →
          </button>
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{
            padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            background: onglet === o.id ? C.vert : C.blanc,
            color: onglet === o.id ? '#fff' : C.texteMuted,
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}>
            {o.label}
            {o.count > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: onglet === o.id ? 'rgba(255,255,255,.25)' : C.rouge, color: '#fff' }}>
                {o.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── FONDS BLOQUÉS ── */}
      {onglet === 'fonds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {escrows.filter(e => e.statut !== 'libere').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.texteMuted, background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Aucun fonds bloqué en ce moment</div>
            </div>
          ) : escrows.filter(e => e.statut !== 'libere').map(escrow => {
            const sc = statutEscrowConfig[escrow.statut];
            return (
              <div key={escrow.id} style={{ background: C.blanc, border: `.5px solid ${escrow.statut === 'litige' ? '#FECACA' : C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer', transition: 'all 150ms', borderLeft: `3px solid ${escrow.statut === 'litige' ? C.rouge : escrow.statut === 'en_attente_liberation' ? C.ambre : C.bleu}` }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                onClick={() => setSelectedEscrow(escrow)}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: escrow.statut === 'litige' ? '#FEE2E2' : C.bleuClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {escrow.statut === 'litige' ? '⚖️' : '🔒'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>EXP-{escrow.expedition_id}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.texteMuted }}>
                    👤 {escrow.client} → 🚕 {escrow.chauffeur} · {escrow.raison}
                  </div>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 3 }}>
                    Bloqué depuis {escrow.duree} · 📱 {escrow.mode_paiement === 'mobile_money' ? 'Mobile Money' : 'Espèces'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.texte }}>{formatMontant(escrow.montant)}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>Commission : {formatMontant(escrow.commission)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {escrow.statut !== 'litige' && (
                    <button onClick={e => { e.stopPropagation(); setActionModal({ type: 'debloquer', escrow }); }}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: C.vert, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      ✓ Débloquer
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); setActionModal({ type: 'rembourser', escrow }); }}
                    style={{ padding: '6px 12px', borderRadius: 8, border: `.5px solid #FECACA`, background: '#FEF2F2', color: C.rouge, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    ↩ Rembourser
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── RETRAITS ── */}
      {onglet === 'retraits' && (
        <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['Chauffeur', 'Montant', 'Mode', 'Téléphone', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retraits.map(r => {
                const sc = {
                  en_attente: { label: 'En attente', bg: '#FEF3C7', color: '#B45309' },
                  approuve: { label: 'Approuvé', bg: '#DCFCE7', color: '#15803D' },
                  rejete: { label: 'Rejeté', bg: '#FEE2E2', color: '#B91C1C' },
                }[r.statut];
                return (
                  <tr key={r.id} style={{ borderBottom: `.5px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${r.chauffeur}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{r.chauffeur}</div>
                          <div style={{ fontSize: 11, color: C.texteMuted }}>{r.driver_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: C.texte }}>{formatMontant(r.montant)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>{r.mode}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted, fontFamily: 'monospace' }}>{r.telephone}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>
                      {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {r.statut === 'en_attente' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setActionModal({ type: 'approuver_retrait', id: r.id, chauffeur: r.chauffeur, montant: r.montant })}
                            style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: C.vert, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ✓
                          </button>
                          <button onClick={() => setActionModal({ type: 'rejeter_retrait', id: r.id, chauffeur: r.chauffeur, montant: r.montant })}
                            style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#FEF2F2', color: C.rouge, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      )}
                      {r.statut !== 'en_attente' && <span style={{ fontSize: 12, color: C.texteMuted }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── REMBOURSEMENTS ── */}
      {onglet === 'remboursements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {remboursements.map(r => (
            <div key={r.id} style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: r.statut === 'traite' ? C.vertClair : C.ambreClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {r.statut === 'traite' ? '✓' : '↩'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>{r.client}</span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.texteMuted }}>EXP-{r.expedition_id}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: r.statut === 'traite' ? '#DCFCE7' : '#FEF3C7', color: r.statut === 'traite' ? '#15803D' : '#B45309' }}>
                    {r.statut === 'traite' ? 'Traité' : 'En attente'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.texteMuted }}>{r.raison}</div>
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>
                  {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.rouge }}>-{formatMontant(r.montant)}</div>
                {r.statut === 'en_attente' && (
                  <button onClick={() => traiterRemboursement(r.id)}
                    style={{ marginTop: 6, padding: '5px 12px', borderRadius: 8, border: 'none', background: C.vert, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    Traiter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORIQUE ── */}
      {onglet === 'historique' && (
        <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.texte }}>Historique des mouvements</span>
            <button style={{ fontSize: 11, color: C.vert, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>📥 Exporter CSV</button>
          </div>
          {HISTORIQUE.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < HISTORIQUE.length - 1 ? `.5px solid ${C.border}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${h.couleur}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {h.type === 'liberation' ? '✓' : h.type === 'retrait' ? '💸' : h.type === 'remboursement' ? '↩' : '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{h.description}</div>
                <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>{h.date}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: h.montant > 0 ? C.vert : C.rouge }}>
                {h.montant > 0 ? '+' : ''}{formatMontant(Math.abs(h.montant))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal détail escrow */}
      {selectedEscrow && (
        <EscrowDetailModal
          escrow={selectedEscrow}
          onClose={() => setSelectedEscrow(null)}
          onDebloquer={escrow => setActionModal({ type: 'debloquer', escrow })}
          onRembourser={escrow => setActionModal({ type: 'rembourser', escrow })}
        />
      )}

      {/* Modal action */}
      {actionModal && (
        <ActionModal
          titre={
            actionModal.type === 'debloquer' ? 'Débloquer les fonds ?' :
            actionModal.type === 'rembourser' ? 'Rembourser le client ?' :
            actionModal.type === 'approuver_retrait' ? `Approuver le retrait de ${formatMontant(actionModal.montant)} ?` :
            `Rejeter le retrait de ${formatMontant(actionModal.montant)} ?`
          }
          description={
            actionModal.type === 'debloquer' ? `Les fonds de ${formatMontant(actionModal.escrow?.montant)} seront libérés et versés au chauffeur.` :
            actionModal.type === 'rembourser' ? `${formatMontant(actionModal.escrow?.montant)} seront remboursés au client.` :
            actionModal.type === 'approuver_retrait' ? `${actionModal.chauffeur} recevra le paiement sur son compte Mobile Money.` :
            `La demande de retrait de ${actionModal.chauffeur} sera rejetée.`
          }
          type={actionModal.type === 'rejeter_retrait' || actionModal.type === 'rembourser' ? 'danger' : 'success'}
          onClose={() => setActionModal(null)}
          onConfirm={motif => {
            if (actionModal.type === 'debloquer') debloquerEscrow(actionModal.escrow, motif);
            else if (actionModal.type === 'rembourser') rembourserClient(actionModal.escrow, motif);
            else if (actionModal.type === 'approuver_retrait') approuverRetrait(actionModal.id, motif);
            else if (actionModal.type === 'rejeter_retrait') rejeterRetrait(actionModal.id, motif);
          }}
        />
      )}
    </div>
  );
}