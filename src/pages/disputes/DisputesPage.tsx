// @ts-nocheck
import React, { useState, useEffect } from 'react';
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
};
// ── DONNÉES MOCK ──────────────────────────────────────────────
const LITIGES = [
  {
    // id: 'LIT-001', expedition_id: 3, priorite: 'critique', statut: 'en_cours',
    // montant: 2000, montant_rembourse: 0,
    // date_ouverture: '2026-06-06T07:45:00',
    // sla_heures: 24, sla_restant_minutes: 180,
    // client: { nom: 'Eric Bouka', avatar: 'EB', telephone: '+237 655 555 666', email: 'eric.bouka@gmail.com' },
    // chauffeur: { nom: 'Samuel Kotto', avatar: 'SK', driver_id: 'T-041', telephone: '+237 688 777 888' },
    // objet: 'Colis endommagé à la livraison',
    // version_client: 'J\'ai reçu mon mobilier de bureau complètement endommagé. Le carton était ouvert et les pieds de bureau sont cassés. Le chauffeur a refusé de reconnaître les dégâts et a exigé le paiement immédiatement.',
    // version_chauffeur: 'Le colis était déjà en mauvais état au moment du ramassage. J\'ai signalé cela au client expéditeur mais il a insisté pour que je parte. Je ne peux pas être tenu responsable d\'un emballage défectueux.',
    // historique_conversation: [
    //   { auteur: 'Eric Bouka', role: 'client', message: 'Mon colis est arrivé cassé ! Je veux un remboursement immédiat.', heure: '07:50', date: '06/06/2026' },
    //   { auteur: 'Support COLIGO', role: 'admin', message: 'Nous avons ouvert un litige #LIT-001. Notre équipe va examiner votre dossier sous 24h.', heure: '08:00', date: '06/06/2026' },
    //   { auteur: 'Samuel Kotto', role: 'chauffeur', message: 'Le colis était déjà abîmé avant que je le prenne. J\'ai des photos.', heure: '08:15', date: '06/06/2026' },
    //   { auteur: 'Admin COLIGO', role: 'admin', message: 'Nous avons demandé les photos aux deux parties. Merci de votre coopération.', heure: '08:30', date: '06/06/2026' },
    // ],
    // pieces_jointes: [
    //   { nom: 'photo_colis_endommage.jpg', type: 'image', taille: '2.4 MB', soumis_par: 'Client', icone: '📷' },
    //   { nom: 'bon_ramassage.pdf', type: 'document', taille: '456 KB', soumis_par: 'Chauffeur', icone: '📄' },
    //   { nom: 'photo_colis_depart.jpg', type: 'image', taille: '1.8 MB', soumis_par: 'Chauffeur', icone: '📷' },
    // ],
    // timeline: [
    //   { heure: '07:45', date: '06/06', event: 'Litige ouvert par Eric Bouka', type: 'ouverture' },
    //   { heure: '07:50', date: '06/06', event: 'Notification envoyée au chauffeur T-041', type: 'notification' },
    //   { heure: '08:00', date: '06/06', event: 'Dossier assigné — Admin COLIGO', type: 'assignation' },
    //   { heure: '08:15', date: '06/06', event: 'Réponse du chauffeur reçue', type: 'reponse' },
    //   { heure: '08:30', date: '06/06', event: 'Demande de preuves envoyée aux deux parties', type: 'action' },
    // ],
    // journal_admin: [
    //   { action: 'Dossier ouvert et assigné', admin: 'Système', heure: '07:45', motif: 'Automatique' },
    //   { action: 'Demande de preuves', admin: 'Admin COLIGO', heure: '08:30', motif: 'Versions contradictoires — nécessite preuves visuelles' },
    // ],
    // responsable: 'Admin COLIGO',
    // decision: null,
    // satisfaction: null,
  },
  {
    // id: 'LIT-002', expedition_id: 2, priorite: 'haute', statut: 'en_cours',
    // montant: 1200, montant_rembourse: 0,
    // date_ouverture: '2026-06-06T06:00:00',
    // sla_heures: 24, sla_restant_minutes: 45,
    // client: { nom: 'Marie Obiang', avatar: 'MO', telephone: '+237 699 345 678', email: 'marie.obiang@gmail.com' },
    // chauffeur: { nom: 'Jean Tamba', avatar: 'JT', driver_id: 'T-027', telephone: '+237 699 333 444' },
    // objet: 'Chauffeur en retard de 2h — livraison urgente manquée',
    // version_client: 'J\'avais une livraison urgente de matériel informatique pour une réunion à 10h. Le chauffeur est arrivé 2h en retard sans prévenir. La réunion a été annulée et j\'ai perdu un contrat important.',
    // version_chauffeur: 'J\'ai eu un problème de circulation exceptionnel sur l\'axe Bonapriso-Bassa. J\'ai essayé d\'appeler le client mais il ne répondait pas. Je ne pouvais pas contrôler les embouteillages.',
    // historique_conversation: [
    //   { auteur: 'Marie Obiang', role: 'client', message: 'Le chauffeur est en retard de 2h ! Où est-il ?', heure: '10:15', date: '06/06/2026' },
    //   { auteur: 'Jean Tamba', role: 'chauffeur', message: 'Je suis bloqué dans les embouteillages à Bassa, désolé.', heure: '10:20', date: '06/06/2026' },
    //   { auteur: 'Support COLIGO', role: 'admin', message: 'Litige #LIT-002 ouvert. Nous examinons la situation.', heure: '10:30', date: '06/06/2026' },
    // ],
    // pieces_jointes: [
    //   { nom: 'capture_trafic.jpg', type: 'image', taille: '1.2 MB', soumis_par: 'Chauffeur', icone: '📷' },
    //   { nom: 'confirmation_reunion.pdf', type: 'document', taille: '234 KB', soumis_par: 'Client', icone: '📄' },
    // ],
    // timeline: [
    //   { heure: '06:00', date: '06/06', event: 'Litige ouvert — retard chauffeur signalé', type: 'ouverture' },
    //   { heure: '06:10', date: '06/06', event: 'Notification chauffeur envoyée', type: 'notification' },
    //   { heure: '06:30', date: '06/06', event: 'Dossier assigné — Admin COLIGO', type: 'assignation' },
    //   { heure: '07:00', date: '06/06', event: '⚠ SLA critique — moins d\'1h restante', type: 'alerte' },
    // ],
    // journal_admin: [
    //   { action: 'Dossier ouvert', admin: 'Système', heure: '06:00', motif: 'Automatique' },
    // ],
    // responsable: 'Admin COLIGO',
    // decision: null,
    // satisfaction: null,
  },
  {
    // id: 'LIT-003', expedition_id: 1, priorite: 'normale', statut: 'resolu',
    // montant: 500, montant_rembourse: 500,
    // date_ouverture: '2026-06-05T09:00:00',
    // date_cloture: '2026-06-05T14:30:00',
    // sla_heures: 24, sla_restant_minutes: null,
    // client: { nom: 'Serena Kameni', avatar: 'SK', telephone: '+237 622 202 461', email: 'serena.kameni@gmail.com' },
    // chauffeur: { nom: 'Paul Nguema', avatar: 'PN', driver_id: 'T-014', telephone: '+237 677 111 222' },
    // objet: 'Paiement en espèces contesté — montant incorrect',
    // version_client: 'Le chauffeur m\'a demandé 1000F au lieu de 500F. J\'ai payé sous pression mais je veux être remboursée de la différence.',
    // version_chauffeur: 'J\'ai demandé 500F comme indiqué. Je pense qu\'il y a une confusion avec une autre course.',
    // historique_conversation: [
    //   { auteur: 'Serena Kameni', role: 'client', message: 'Le chauffeur m\'a surfacturé ! 1000F au lieu de 500F.', heure: '09:05', date: '05/06/2026' },
    //   { auteur: 'Paul Nguema', role: 'chauffeur', message: 'J\'ai demandé exactement 500F. Je ne comprends pas.', heure: '09:20', date: '05/06/2026' },
    //   { auteur: 'Admin COLIGO', role: 'admin', message: 'Après vérification du tarif de la course, le montant correct est 500F. Nous remboursons la différence.', heure: '14:00', date: '05/06/2026' },
    // ],
    // pieces_jointes: [
    //   { nom: 'recu_paiement.jpg', type: 'image', taille: '890 KB', soumis_par: 'Client', icone: '📷' },
    // ],
    // timeline: [
    //   { heure: '09:00', date: '05/06', event: 'Litige ouvert par Serena Kameni', type: 'ouverture' },
    //   { heure: '09:20', date: '05/06', event: 'Réponse chauffeur reçue', type: 'reponse' },
    //   { heure: '14:00', date: '05/06', event: 'Décision rendue — remboursement 500F', type: 'decision' },
    //   { heure: '14:30', date: '05/06', event: 'Litige clôturé avec succès', type: 'cloture' },
    // ],
    // journal_admin: [
    //   { action: 'Dossier ouvert', admin: 'Système', heure: '09:00', motif: 'Automatique' },
    //   { action: 'Vérification tarif', admin: 'Admin COLIGO', heure: '13:45', motif: 'Consultation historique courses' },
    //   { action: 'Remboursement 500F émis', admin: 'Admin COLIGO', heure: '14:00', motif: 'Surfacturation confirmée' },
    //   { action: 'Litige clôturé', admin: 'Admin COLIGO', heure: '14:30', motif: 'Résolu en faveur du client' },
    // ],
    // responsable: 'Admin COLIGO',
    // decision: 'Remboursement client — surfacturation confirmée',
    // satisfaction: 4.5,
    // duree_resolution: '5h 30min',
  },
  {
    // id: 'LIT-004', expedition_id: 5, priorite: 'critique', statut: 'escalade',
    // montant: 2000, montant_rembourse: 0,
    // date_ouverture: '2026-06-05T14:00:00',
    // sla_heures: 12, sla_restant_minutes: -60,
    // client: { nom: 'Laure Eto', avatar: 'LE', telephone: '+237 691 567 890', email: 'laure.eto@gmail.com' },
    // chauffeur: { nom: 'Claire Ndong', avatar: 'CN', driver_id: 'T-011', telephone: '+237 691 111 333' },
    // objet: 'Accusation de vol — objets de valeur manquants',
    // version_client: 'Ma livraison d\'équipement ménager est arrivée mais il manque une tablette et des bijoux qui étaient dans le colis. Je suis certaine qu\'ils y étaient au moment de l\'emballage.',
    // version_chauffeur: 'J\'ai livré le colis tel que je l\'ai récupéré, sans l\'ouvrir. Je ne suis pas responsable du contenu. Le colis m\'a été remis déjà emballé.',
    // historique_conversation: [
    //   { auteur: 'Laure Eto', role: 'client', message: 'Il manque ma tablette et mes bijoux dans le colis !', heure: '16:20', date: '05/06/2026' },
    //   { auteur: 'Claire Ndong', role: 'chauffeur', message: 'J\'ai livré le colis tel quel. Je n\'ai rien touché.', heure: '16:35', date: '05/06/2026' },
    //   { auteur: 'Admin COLIGO', role: 'admin', message: 'Ce cas dépasse notre niveau. Escalade vers Admin Senior.', heure: '20:00', date: '05/06/2026' },
    // ],
    // pieces_jointes: [
    //   { nom: 'inventaire_colis.pdf', type: 'document', taille: '678 KB', soumis_par: 'Client', icone: '📄' },
    //   { nom: 'video_livraison.mp4', type: 'video', taille: '45 MB', soumis_par: 'Système', icone: '🎥' },
    // ],
    // timeline: [
    //   { heure: '14:00', date: '05/06', event: 'Litige ouvert — accusation de vol', type: 'ouverture' },
    //   { heure: '14:30', date: '05/06', event: 'Notification urgente — chauffeur T-011', type: 'notification' },
    //   { heure: '20:00', date: '05/06', event: '🚨 SLA dépassé — escalade automatique', type: 'alerte' },
    //   { heure: '20:05', date: '05/06', event: 'Escalade vers Super Admin', type: 'escalade' },
    // ],
    // journal_admin: [
    //   { action: 'Dossier ouvert', admin: 'Système', heure: '14:00', motif: 'Automatique' },
    //   { action: 'Escalade déclenchée', admin: 'Admin COLIGO', heure: '20:00', motif: 'SLA dépassé + accusation grave' },
    // ],
    // responsable: 'Super Admin',
    // niveau_escalade: 2,
    // urgence: 'critique',
    // decision: null,
    // satisfaction: null,
  },
];

// ── COMPOSANTS UTILITAIRES ────────────────────────────────────

function SLATimer({ minutes, heures_total }) {
  const pct = minutes !== null ? Math.max(0, Math.min(100, (minutes / (heures_total * 60)) * 100)) : 0;
  const color = minutes === null ? C.texteMuted : minutes < 0 ? C.rouge : minutes < 60 ? C.rouge : minutes < 180 ? C.ambre : C.vert;
  const bg = minutes === null ? C.surface : minutes < 0 ? '#FEF2F2' : minutes < 60 ? '#FEF2F2' : minutes < 180 ? '#FFFBEB' : '#F0FDF4';
  const label = minutes === null ? '—' : minutes < 0 ? `Dépassé de ${Math.abs(minutes)}min` : minutes < 60 ? `${minutes} min restantes` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;

  return (
    <div style={{ background: bg, borderRadius: 10, padding: '8px 12px', border: `.5px solid ${color}40` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>SLA</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(0,0,0,.08)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 600ms ease' }} />
      </div>
    </div>
  );
}

function PrioriteBadge({ priorite }) {
  const cfg = {
    critique: { label: '🔴 Critique', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
    haute: { label: '🟠 Haute', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    normale: { label: '🟡 Normale', bg: '#FEFCE8', color: '#854D0E', border: '#FEF08A' },
    faible: { label: '🟢 Faible', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  }[priorite] || { label: priorite, bg: C.surface, color: C.texteMuted, border: C.border };
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `.5px solid ${cfg.border}` }}>{cfg.label}</span>;
}

function StatutBadge({ statut }) {
  const cfg = {
    en_cours: { label: '🔄 En cours', bg: '#EFF6FF', color: C.bleu },
    resolu: { label: '✓ Résolu', bg: '#F0FDF4', color: C.vert },
    escalade: { label: '↑ Escaladé', bg: '#EDE9FE', color: C.violet },
    cloture: { label: '🔒 Clôturé', bg: '#F1F5F9', color: '#64748B' },
  }[statut] || { label: statut, bg: C.surface, color: C.texteMuted };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function Timeline({ events }) {
  const typeConfig = {
    ouverture: { color: C.bleu, bg: C.bleuClair, icone: '📂' },
    notification: { color: C.ambre, bg: C.ambreClair, icone: '🔔' },
    assignation: { color: C.violet, bg: C.violetClair, icone: '👤' },
    reponse: { color: C.vert, bg: C.vertClair, icone: '💬' },
    action: { color: C.texte, bg: C.surface, icone: '⚡' },
    decision: { color: C.vert, bg: C.vertClair, icone: '✓' },
    cloture: { color: C.vert, bg: C.vertClair, icone: '🔒' },
    alerte: { color: C.rouge, bg: C.rougeClair, icone: '🚨' },
    escalade: { color: C.violet, bg: C.violetClair, icone: '↑' },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((e, i) => {
        const tc = typeConfig[e.type] || typeConfig.action;
        return (
          <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: tc.bg, border: `.5px solid ${tc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 8 }}>
                {tc.icone}
              </div>
              {i < events.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.border, minHeight: 16 }} />}
            </div>
            <div style={{ padding: '8px 0 8px', flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: C.texteMuted, fontFamily: 'monospace' }}>{e.date} {e.heure}</span>
              </div>
              <div style={{ fontSize: 12, color: e.type === 'alerte' || e.type === 'escalade' ? tc.color : C.texte, fontWeight: e.type === 'alerte' || e.type === 'escalade' ? 600 : 400 }}>
                {e.event}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isAdmin = msg.role === 'admin';
  const isClient = msg.role === 'client';
  const bg = isAdmin ? '#F0FDF4' : isClient ? '#EFF6FF' : '#FFFBEB';
  const color = isAdmin ? C.vertFonce : isClient ? '#1D4ED8' : '#B45309';
  const align = isAdmin ? 'center' : isClient ? 'flex-start' : 'flex-end';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>{msg.auteur} · {msg.heure}</div>
      <div style={{ maxWidth: '80%', background: bg, border: `.5px solid ${color}20`, borderRadius: isClient ? '4px 12px 12px 12px' : isAdmin ? '12px' : '12px 4px 12px 12px', padding: '8px 12px' }}>
        <div style={{ fontSize: 12, color: C.texte, lineHeight: 1.5 }}>{msg.message}</div>
      </div>
      <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 500 }}>
        {msg.role === 'client' ? '👤 Client' : msg.role === 'chauffeur' ? '🚕 Chauffeur' : '⚡ Admin'}
      </div>
    </div>
  );
}

// ── DRAWER LITIGE ─────────────────────────────────────────────
function DrawerLitige({ litige, onClose, onAction }) {
  const [onglet, setOnglet] = useState('infos');
  const [actionActive, setActionActive] = useState(null);
  const [motif, setMotif] = useState('');
  if (!litige) return null;

  const ONGLETS = [
    { id: 'infos', label: '📋 Informations' },
    { id: 'client', label: '👤 Version client' },
    { id: 'chauffeur', label: '🚕 Version chauffeur' },
    { id: 'conversation', label: '💬 Historique' },
    { id: 'timeline', label: '🕐 Timeline' },
    { id: 'pieces', label: `📎 Pièces (${litige.pieces_jointes.length})` },
    { id: 'actions', label: '⚡ Actions' },
  ];

  const ACTIONS = [
    { id: 'contacter_client', label: 'Contacter le client', icone: '📞', color: C.bleu, bg: C.bleuClair },
    { id: 'contacter_chauffeur', label: 'Contacter le chauffeur', icone: '📞', color: C.vert, bg: C.vertClair },
    { id: 'demander_preuves', label: 'Demander des preuves', icone: '📎', color: C.ambre, bg: C.ambreClair },
    { id: 'ouvrir_enquete', label: 'Ouvrir une enquête', icone: '🔍', color: C.violet, bg: C.violetClair },
    { id: 'rembourser', label: 'Rembourser le client', icone: '↩', color: C.vert, bg: C.vertClair },
    { id: 'cloturer', label: 'Clôturer le dossier', icone: '🔒', color: '#64748B', bg: '#F1F5F9' },
    { id: 'escalader', label: 'Escalader à un responsable', icone: '↑', color: C.rouge, bg: C.rougeClair },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 560, background: C.blanc, zIndex: 201, boxShadow: '-20px 0 60px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `.5px solid ${C.border}`, background: litige.priorite === 'critique' ? '#FEF2F2' : litige.priorite === 'haute' ? '#FFFBEB' : C.blanc, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: C.texte, fontFamily: 'monospace' }}>{litige.id}</span>
              <PrioriteBadge priorite={litige.priorite} />
              <StatutBadge statut={litige.statut} />
            </div>
            <button onClick={onClose} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.texte, marginBottom: 8 }}>{litige.objet}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ background: C.blanc, borderRadius: 8, padding: '8px 10px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.rouge }}>{formatMontant(litige.montant)}</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>Montant litige</div>
            </div>
            <div style={{ background: C.blanc, borderRadius: 8, padding: '8px 10px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{litige.responsable}</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>Responsable</div>
            </div>
            <div style={{ background: C.blanc, borderRadius: 8, padding: '8px 10px', border: `.5px solid ${C.border}` }}>
              <SLATimer minutes={litige.sla_restant_minutes} heures_total={litige.sla_heures} />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', borderBottom: `.5px solid ${C.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: onglet === o.id ? 600 : 400, color: onglet === o.id ? C.vert : C.texteMuted, borderBottom: onglet === o.id ? `2px solid ${C.vert}` : '2px solid transparent', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* INFORMATIONS */}
          {onglet === 'infos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                  <div style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Client expéditeur</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{litige.client.nom}</div>
                      <div style={{ fontSize: 11, color: C.texteMuted }}>{litige.client.telephone}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 14 }}>
                  <div style={{ fontSize: 10, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Chauffeur assigné</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{litige.chauffeur.nom}</div>
                      <div style={{ fontSize: 11, color: C.vert, fontFamily: 'monospace' }}>{litige.chauffeur.driver_id}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Détails du litige</div>
                {[
                  { label: 'ID Litige', val: litige.id },
                  { label: 'Expédition concernée', val: `#EXP-${litige.expedition_id}` },
                  { label: 'Date d\'ouverture', val: new Date(litige.date_ouverture).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                  { label: 'Montant en litige', val: formatMontant(litige.montant) },
                  { label: 'Montant remboursé', val: litige.montant_rembourse > 0 ? formatMontant(litige.montant_rembourse) : '—' },
                  { label: 'Responsable dossier', val: litige.responsable },
                  { label: 'Délai SLA', val: `${litige.sla_heures}h` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `.5px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {litige.decision && (
                <div style={{ background: '#F0FDF4', border: `.5px solid #BBF7D0`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.vert, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Décision finale</div>
                  <div style={{ fontSize: 13, color: C.texte }}>{litige.decision}</div>
                  {litige.satisfaction && (
                    <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 6 }}>Satisfaction client : ⭐ {litige.satisfaction}/5</div>
                  )}
                </div>
              )}

              {litige.statut === 'escalade' && (
                <div style={{ background: '#EDE9FE', border: `.5px solid #C4B5FD`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.violet, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Informations escalade</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><span style={{ fontSize: 11, color: C.texteMuted }}>Niveau : </span><span style={{ fontSize: 12, fontWeight: 600, color: C.violet }}>Niveau {litige.niveau_escalade}</span></div>
                    <div><span style={{ fontSize: 11, color: C.texteMuted }}>Urgence : </span><span style={{ fontSize: 12, fontWeight: 600, color: C.rouge }}>🔴 {litige.urgence}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VERSION CLIENT */}
          {onglet === 'client' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: '#EFF6FF', borderRadius: 12, border: `.5px solid #BFDBFE` }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.bleu }}>{litige.client.nom}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>👤 Client · {litige.client.telephone}</div>
                </div>
              </div>
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Déclaration du client</div>
                <div style={{ fontSize: 13, color: C.texte, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `3px solid ${C.bleu}`, paddingLeft: 12 }}>
                  "{litige.version_client}"
                </div>
              </div>
              <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '10px 14px', border: `.5px solid #BFDBFE` }}>
                <div style={{ fontSize: 11, color: C.bleu, fontWeight: 500 }}>ℹ️ Cette déclaration a été enregistrée le {new Date(litige.date_ouverture).toLocaleDateString('fr-FR')} lors de l'ouverture du litige.</div>
              </div>
            </div>
          )}

          {/* VERSION CHAUFFEUR */}
          {onglet === 'chauffeur' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: C.vertClair, borderRadius: 12, border: `.5px solid #BBF7D0` }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.vertFonce }}>{litige.chauffeur.nom}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>🚕 {litige.chauffeur.driver_id} · {litige.chauffeur.telephone}</div>
                </div>
              </div>
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Déclaration du chauffeur</div>
                <div style={{ fontSize: 13, color: C.texte, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `3px solid ${C.vert}`, paddingLeft: 12 }}>
                  "{litige.version_chauffeur}"
                </div>
              </div>
              <div style={{ background: C.vertClair, borderRadius: 10, padding: '10px 14px', border: `.5px solid #BBF7D0` }}>
                <div style={{ fontSize: 11, color: C.vert, fontWeight: 500 }}>ℹ️ Déclaration enregistrée après notification du chauffeur.</div>
              </div>
            </div>
          )}

          {/* HISTORIQUE CONVERSATION */}
          {onglet === 'conversation' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 11 }}>
                {[{ color: C.bleu, bg: '#EFF6FF', label: 'Client' }, { color: C.ambre, bg: '#FFFBEB', label: 'Chauffeur' }, { color: C.vert, bg: C.vertClair, label: 'Admin' }].map(i => (
                  <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: i.bg, padding: '3px 8px', borderRadius: 20, border: `.5px solid ${i.color}20` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: i.color }} />
                    <span style={{ color: i.color, fontWeight: 500 }}>{i.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {litige.historique_conversation.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <input placeholder="Envoyer un message aux parties..." style={{ flex: 1, height: 38, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none', background: C.surface }} />
                <button style={{ padding: '0 14px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Envoyer</button>
              </div>
            </div>
          )}

          {/* TIMELINE */}
          {onglet === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Chronologie des événements</div>
                <Timeline events={litige.timeline} />
              </div>
              <div style={{ background: C.surface, borderRadius: 12, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Journal des actions admin</div>
                {litige.journal_admin.map((j, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: i < litige.journal_admin.length - 1 ? `.5px solid ${C.border}` : 'none', alignItems: 'flex-start' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.vert, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{j.action}</div>
                      <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>par {j.admin} · {j.heure} · {j.motif}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PIÈCES JOINTES */}
          {onglet === 'pieces' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#FFFBEB', border: `.5px solid #FDE68A`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B45309' }}>
                ⚠️ Les pièces jointes sont stockées de manière sécurisée. En production, elles seront accessibles via lien signé temporaire.
              </div>
              {litige.pieces_jointes.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blanc, border: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.icone}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{p.nom}</div>
                    <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 2 }}>Soumis par : {p.soumis_par} · {p.taille}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '5px 10px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer' }}>👁 Voir</button>
                    <button style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: C.bleuClair, color: C.bleu, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📥</button>
                  </div>
                </div>
              ))}
              <button style={{ padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + Demander des pièces supplémentaires
              </button>
            </div>
          )}

          {/* ACTIONS */}
          {onglet === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#FFFBEB', border: `.5px solid #FDE68A`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B45309' }}>
                ⚠️ Chaque action est enregistrée dans le journal d'audit et notifiée aux parties concernées.
              </div>
              {ACTIONS.map(a => (
                <div key={a.id}>
                  <button onClick={() => setActionActive(actionActive === a.id ? null : a.id)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `.5px solid ${actionActive === a.id ? a.color : C.border}`, background: actionActive === a.id ? a.bg : C.blanc, color: a.color, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'all 150ms' }}>
                    <span style={{ fontSize: 16 }}>{a.icone}</span>
                    <span style={{ flex: 1 }}>{a.label}</span>
                    <span style={{ fontSize: 12 }}>{actionActive === a.id ? '▲' : '▼'}</span>
                  </button>
                  {actionActive === a.id && (
                    <div style={{ padding: '12px', background: a.bg, borderRadius: '0 0 10px 10px', border: `.5px solid ${a.color}30`, borderTop: 'none' }}>
                      <textarea value={motif} onChange={e => setMotif(e.target.value)} placeholder="Motif ou message (optionnel)..."
                        style={{ width: '100%', height: 70, borderRadius: 8, border: `.5px solid ${C.border}`, padding: '8px 10px', fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'inherit', background: C.blanc, boxSizing: 'border-box' }} />
                      <button onClick={() => { onAction(litige.id, a.id, motif); setActionActive(null); setMotif(''); }}
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
export default function DisputesPage() {
  const [onglet, setOnglet] = useState('en_cours');
  const [litiges, setLitiges] = useState(LITIGES);
  const [selectedLitige, setSelectedLitige] = useState(null);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const enCours = litiges.filter(l => l.statut === 'en_cours');
  const resolus = litiges.filter(l => l.statut === 'resolu');
  const escalades = litiges.filter(l => l.statut === 'escalade');
  const montantBloque = litiges.filter(l => l.statut !== 'resolu').reduce((s, l) => s + l.montant, 0);
  const tempsMoyenResolution = '5h 30min';
  const satisfactionMoyenne = 4.5;
  const scoreGlobal = Math.round((resolus.length / litiges.length) * 100);

  const ONGLETS = [
    { id: 'en_cours', label: '🔄 En cours', count: enCours.length },
    { id: 'resolus', label: '✓ Résolus', count: resolus.length },
    { id: 'escalades', label: '↑ Escaladés', count: escalades.length },
  ];

  function handleAction(litigeId, action, motif) {
    setLitiges(prev => prev.map(l => l.id === litigeId ? {
      ...l,
      statut: action === 'cloturer' ? 'resolu' : action === 'escalader' ? 'escalade' : l.statut,
      decision: action === 'cloturer' ? (motif || 'Clôturé par admin') : l.decision,
    } : l));
    setSelectedLitige(null);
  }

  const litigesAffiches = onglet === 'en_cours' ? enCours : onglet === 'resolus' ? resolus : escalades;

  function exporterLitiges(liste) {
  imprimerRapport({
    titre: 'Rapport Litiges',
    sousTitre: `${liste.length} litige${liste.length > 1 ? 's' : ''} affiché${liste.length > 1 ? 's' : ''}`,
    sections: [
      {
        titre: '⚖️ Détail des litiges',
        colonnes: ['ID', 'Objet', 'Client', 'Chauffeur', 'Montant', 'Priorité', 'Statut', 'Responsable'],
        lignes: liste.map(l => [
          l.id,
          l.objet,
          l.client.nom,
          l.chauffeur.nom,
          formatMontantExport(l.montant),
          l.priorite,
          l.statut,
          l.responsable,
        ]),
      },
    ],
  });
}
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} } @keyframes pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.8);opacity:0} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            ⚖️ Centre de Gestion des Litiges
            {escalades.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, background: C.violet, color: '#fff', padding: '3px 10px', borderRadius: 20, animation: 'blink 2s infinite' }}>
                {escalades.length} ESCALADÉ{escalades.length > 1 ? 'S' : ''}
              </span>
            )}
            {enCours.some(l => l.sla_restant_minutes < 60 && l.sla_restant_minutes >= 0) && (
              <span style={{ fontSize: 12, fontWeight: 700, background: C.rouge, color: '#fff', padding: '3px 10px', borderRadius: 20, animation: 'blink 1.5s infinite' }}>
                SLA CRITIQUE
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>Arbitrage · Médiation · Résolution · Données simulées</p>
        </div>
        <button onClick={() => exporterLitiges(litigesAffiches)} style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>📥 Rapport litiges</button>      </div>

      {/* KPI Section IA style */}
      <div style={{ background: '#052E16', borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6" />
              <circle cx={40} cy={40} r={32} fill="none" stroke={scoreGlobal >= 70 ? '#4ADE80' : scoreGlobal >= 40 ? C.ambre : C.rouge} strokeWidth="6"
                strokeDasharray={`${scoreGlobal * 2.01} 201`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{scoreGlobal}%</span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,.5)' }}>résolution</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Taux de résolution global</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{resolus.length}/{litiges.length} litiges</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Temps moyen : {tempsMoyenResolution}</div>
          </div>
        </div>

        <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,.1)', flexShrink: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, flex: 1 }}>
          {[
            { label: 'En cours', val: enCours.length, color: C.bleu, animate: false },
            { label: 'Résolus', val: resolus.length, color: '#4ADE80', animate: false },
            { label: 'Escaladés', val: escalades.length, color: C.violet, animate: escalades.length > 0 },
            { label: 'Tps moyen', val: tempsMoyenResolution, color: '#4ADE80', animate: false },
            { label: 'Satisfaction', val: `⭐ ${satisfactionMoyenne}`, color: C.ambre, animate: false },
            { label: 'Bloqué', val: formatMontant(montantBloque), color: C.rouge, animate: false },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: i >= 3 ? 14 : 24, fontWeight: 800, color: s.color, animation: s.animate ? 'blink 1.5s infinite' : 'none', lineHeight: 1.2 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes SLA */}
      {enCours.some(l => l.sla_restant_minutes < 60) && (
        <div style={{ background: '#FEF2F2', border: `.5px solid #FECACA`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.rouge }}>
              {enCours.filter(l => l.sla_restant_minutes < 60).length} litige{enCours.filter(l => l.sla_restant_minutes < 60).length > 1 ? 's' : ''} en dépassement SLA imminent
            </div>
            <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>
              {enCours.filter(l => l.sla_restant_minutes < 60).map(l => l.id).join(', ')} — intervention requise immédiatement
            </div>
          </div>
          <button onClick={() => setOnglet('en_cours')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.rouge, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            Traiter →
          </button>
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all 150ms' }}>
            {o.label}
            {o.count > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: onglet === o.id ? 'rgba(255,255,255,.25)' : (o.id === 'escalades' ? C.violet : o.id === 'en_cours' ? C.bleu : C.vert), color: '#fff' }}>
                {o.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── EN COURS ── */}
      {onglet === 'en_cours' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {enCours.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: C.vertClair, borderRadius: 16, border: `.5px solid #BBF7D0` }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚖️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.vert }}>Aucun litige en cours</div>
            </div>
          ) : enCours.map(litige => (
            <div key={litige.id}
              onClick={() => setSelectedLitige(litige)}
              style={{ background: C.blanc, border: `.5px solid ${litige.sla_restant_minutes < 60 ? '#FECACA' : litige.priorite === 'critique' ? '#FDE68A' : C.border}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', transition: 'all 150ms', borderLeft: `4px solid ${litige.sla_restant_minutes < 60 ? C.rouge : litige.priorite === 'critique' ? C.ambre : C.bleu}`, boxShadow: litige.sla_restant_minutes < 60 ? '0 2px 12px rgba(239,68,68,.1)' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = litige.sla_restant_minutes < 60 ? '0 2px 12px rgba(239,68,68,.1)' : 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: C.texte, fontFamily: 'monospace' }}>{litige.id}</span>
                    <PrioriteBadge priorite={litige.priorite} />
                    <StatutBadge statut={litige.statut} />
                    <span style={{ fontSize: 11, color: C.texteMuted, marginLeft: 'auto' }}>Ouvert {new Date(litige.date_ouverture).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.texte, marginBottom: 8 }}>{litige.objet}</div>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                      <span style={{ fontSize: 12, color: C.texte }}>{litige.client.nom}</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>vs</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                      <span style={{ fontSize: 12, color: C.texte }}>{litige.chauffeur.nom}</span>
                      <span style={{ fontSize: 11, color: C.vert, fontFamily: 'monospace' }}>{litige.chauffeur.driver_id}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <SLATimer minutes={litige.sla_restant_minutes} heures_total={litige.sla_heures} />
                    <div style={{ background: C.surface, borderRadius: 10, padding: '8px 12px', border: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.texteMuted }}>Montant</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.rouge }}>{formatMontant(litige.montant)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedLitige(litige)} style={{ padding: '7px 14px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Ouvrir dossier →</button>
                  <button onClick={() => handleAction(litige.id, 'cloturer', 'Clôturé rapidement')} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: C.vertClair, color: C.vert, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✓ Clôturer</button>
                  <button onClick={() => handleAction(litige.id, 'escalader', 'Escalade manuelle')} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: C.violetClair, color: C.violet, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>↑ Escalader</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RÉSOLUS ── */}
      {onglet === 'resolus' && (
        <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['ID', 'Objet', 'Client', 'Chauffeur', 'Montant', 'Décision', 'Responsable', 'Clôturé le', 'Satisfaction', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolus.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: C.texteMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⚖️</div>
                  Aucun litige résolu pour le moment
                </td></tr>
              ) : resolus.map(l => (
                <tr key={l.id} style={{ borderBottom: `.5px solid ${C.border}`, cursor: 'pointer', transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setSelectedLitige(l)}
                >
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: C.texte }}>{l.id}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: C.texte, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.objet}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: C.texte }}>{l.client.nom}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: C.texte }}>{l.chauffeur.nom}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: l.montant_rembourse > 0 ? C.rouge : C.vert }}>{formatMontant(l.montant)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: C.vert, fontWeight: 500 }}>{l.decision}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: C.texteMuted }}>{l.responsable}</td>
                  <td style={{ padding: '11px 14px', fontSize: 11, color: C.texteMuted }}>
                    {l.date_cloture ? new Date(l.date_cloture).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>{l.satisfaction ? `⭐ ${l.satisfaction}` : '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={e => { e.stopPropagation(); setSelectedLitige(l); }} style={{ padding: '4px 10px', borderRadius: 6, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer' }}>Voir →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ESCALADÉS ── */}
      {onglet === 'escalades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {escalades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: C.vertClair, borderRadius: 16, border: `.5px solid #BBF7D0` }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.vert }}>Aucun litige escaladé</div>
            </div>
          ) : escalades.map(litige => (
            <div key={litige.id}
              onClick={() => setSelectedLitige(litige)}
              style={{ background: C.blanc, border: `.5px solid #C4B5FD`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', transition: 'all 150ms', borderLeft: `4px solid ${C.violet}`, boxShadow: '0 2px 12px rgba(139,92,246,.1)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,92,246,.1)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.violetClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `.5px solid #C4B5FD` }}>↑</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: C.texte, fontFamily: 'monospace' }}>{litige.id}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: C.violetClair, color: C.violet }}>Niveau {litige.niveau_escalade}</span>
                    <PrioriteBadge priorite={litige.priorite} />
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#FEF2F2', color: C.rouge }}>🔴 {litige.urgence}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.texte, marginBottom: 6 }}>{litige.objet}</div>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.client.nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                      <span style={{ fontSize: 12, color: C.texte }}>{litige.client.nom}</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.texteMuted }}>vs</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${litige.chauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                      <span style={{ fontSize: 12, color: C.texte }}>{litige.chauffeur.nom}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{ background: C.violetClair, borderRadius: 8, padding: '8px 12px', border: `.5px solid #C4B5FD` }}>
                      <div style={{ fontSize: 10, color: C.texteMuted }}>Responsable</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.violet }}>{litige.responsable}</div>
                    </div>
                    <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '8px 12px', border: `.5px solid #FECACA` }}>
                      <div style={{ fontSize: 10, color: C.texteMuted }}>Montant</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.rouge }}>{formatMontant(litige.montant)}</div>
                    </div>
                    <SLATimer minutes={litige.sla_restant_minutes} heures_total={litige.sla_heures} />
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setSelectedLitige(litige); }}
                  style={{ padding: '8px 14px', borderRadius: 8, border: `.5px solid #C4B5FD`, background: C.violetClair, color: C.violet, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                  Gérer →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <DrawerLitige litige={selectedLitige} onClose={() => setSelectedLitige(null)} onAction={handleAction} />
    </div>
  );
}