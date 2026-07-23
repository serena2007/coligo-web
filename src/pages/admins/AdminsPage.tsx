// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';

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
  soc: '#050a14',
};

const ROLES = [
  { id: 'superadmin', label: 'Super Admin', couleur: C.violet, bg: C.violetClair, description: 'Accès total à toutes les fonctionnalités', membres: 1, permissions: { dashboard: ['view','edit'], expeditions: ['view','create','edit','delete'], gps: ['view','edit'], finance: ['view','edit','export'], escrow: ['view','edit'], fraude: ['view','edit','delete'], rapports: ['view','export'], parametres: ['view','edit','delete'] } },
  { id: 'admin_ops', label: 'Admin Opérations', couleur: C.bleu, bg: C.bleuClair, description: 'Gestion des chauffeurs, expéditions et opérations', membres: 1, permissions: { dashboard: ['view'], expeditions: ['view','create','edit'], gps: ['view'], finance: ['view'], escrow: [], fraude: ['view'], rapports: ['view'], parametres: [] } },
  { id: 'admin_finance', label: 'Admin Finance', couleur: C.ambre, bg: C.ambreClair, description: 'Gestion des paiements, commissions et rapports financiers', membres: 1, permissions: { dashboard: ['view'], expeditions: [], gps: [], finance: ['view','edit','export'], escrow: ['view','edit'], fraude: [], rapports: ['view','export'], parametres: [] } },
  { id: 'admin_fraude', label: 'Admin Fraude', couleur: C.rouge, bg: C.rougeClair, description: 'Détection et traitement des alertes de fraude', membres: 1, permissions: { dashboard: ['view'], expeditions: ['view'], gps: ['view'], finance: [], escrow: [], fraude: ['view','edit','delete'], rapports: ['view'], parametres: [] } },
  { id: 'analyste_ia', label: 'Analyste IA', couleur: C.cyan, bg: C.cyanClair, description: 'Analyse des données, rapports IA et optimisation', membres: 1, permissions: { dashboard: ['view'], expeditions: ['view'], gps: ['view'], finance: [], escrow: [], fraude: ['view'], rapports: ['view','export'], parametres: [] } },
  { id: 'support', label: 'Support Client', couleur: C.vert, bg: C.vertClair, description: 'Assistance aux clients, gestion des litiges', membres: 1, permissions: { dashboard: ['view'], expeditions: ['view'], gps: [], finance: [], escrow: [], fraude: [], rapports: [], parametres: [] } },
  { id: 'responsable_agence', label: 'Responsable Agence', couleur: '#EA580C',  bg: '#FFF7ED', description: 'Gestion d\'une agence partenaire COLIGO', membres: 0, 
  permissions: { 
    dashboard: ['view'], 
    expeditions: ['view'], 
    gps: [], 
    finance: ['view'], 
    escrow: [], 
    fraude: [], 
    rapports: ['view'], 
    parametres: [] 
  } 
},
  { id: 'admin_chauffeurs', label: 'Admin Chauffeurs', couleur: C.vert, bg: C.vertClair, description: 'Validation et gestion des chauffeurs', membres: 0, 
  permissions: { 
    dashboard: ['view'], 
    expeditions: ['view'], 
    gps: ['view', 'edit'], 
    finance: [], 
    escrow: [], 
    fraude: ['view'], 
    rapports: ['view'], 
    parametres: [] 
  } 
},
];

const AUDIT_LOGS = [
  { date: '07/06/2026', heure: '09:20', admin: 'Edwige Kameni', role: 'admin_ops', action: 'EXP-005 escaladée vers Super Admin', type: 'warning', ip: '197.234.45.12', loc: 'Yaoundé, CM', module: 'Expéditions' },
  { date: '07/06/2026', heure: '08:42', admin: 'Super Admin', role: 'superadmin', action: 'Chauffeur T-033 suspendu', type: 'danger', ip: '102.244.12.45', loc: 'Douala, CM', module: 'Chauffeurs' },
  { date: '07/06/2026', heure: '08:30', admin: 'Super Admin', role: 'superadmin', action: 'Connexion au système', type: 'info', ip: '102.244.12.45', loc: 'Douala, CM', module: 'Auth' },
  { date: '07/06/2026', heure: '07:50', admin: 'Marcel Fotso', role: 'admin_finance', action: 'Retrait RET-002 approuvé', type: 'success', ip: '41.202.219.88', loc: 'Douala, CM', module: 'Finance' },
  { date: '06/06/2026', heure: '16:35', admin: 'Sophie Abena', role: 'admin_fraude', action: 'Alerte fraude FIA-001 traitée', type: 'danger', ip: '102.244.18.77', loc: 'Douala, CM', module: 'Fraude' },
  { date: '04/06/2026', heure: '10:58', admin: 'Henri Nzamba', role: 'analyste_ia', action: '⚠️ Tentative connexion depuis Paris, FR', type: 'danger', ip: '45.199.12.88', loc: '⚠ Paris, FR', module: 'Auth', suspect: true },
];

const SESSIONS_ACTIVES = [
  { admin: 'Super Admin', role: 'superadmin', appareil: 'Chrome 124 / Windows 11', localisation: 'Douala, CM', ip: '102.244.12.45', debut: '08:30', duree: '1h 12min' },
  { admin: 'Edwige Kameni', role: 'admin_ops', appareil: 'Firefox 125 / macOS', localisation: 'Yaoundé, CM', ip: '197.234.45.12', debut: '09:15', duree: '27min' },
  { admin: 'Marcel Fotso', role: 'admin_finance', appareil: 'Chrome 124 / Windows 10', localisation: 'Douala, CM', ip: '41.202.219.88', debut: '07:45', duree: '2h 57min' },
];

const ALERTES_SECURITE = [
  { type: 'Connexion inhabituelle', description: 'Henri Nzamba connecté depuis Paris, FR', severite: 'critique', heure: '04/06 10:58', traite: true },
  { type: '2FA manquant', description: 'Certains admins n\'ont pas activé la 2FA', severite: 'haute', heure: 'Permanent', traite: false },
  { type: 'Session longue', description: 'Marcel Fotso connecté depuis 2h57 sans inactivité', severite: 'moyenne', heure: '07/06 07:45', traite: false },
];

const INSIGHTS_IA = [
  // { icone: '🚨', titre: 'Connexion suspecte détectée', texte: 'Henri Nzamba connecté depuis Paris, FR. Compte suspendu.', couleur: C.rouge, tag: 'Sécurité' },
  // { icone: '⚠️', titre: '2FA non activé', texte: 'Certains admins n\'ont pas activé la double authentification.', couleur: C.ambre, tag: 'Vulnérabilité' },
  // { icone: '🔍', titre: 'Session longue détectée', texte: 'Une session est ouverte depuis plus de 2h sans interruption.', couleur: C.ambre, tag: 'Comportement' },
  // { icone: '✓', titre: 'Gouvernance satisfaisante', texte: 'Aucune tentative de force brute ces 30 derniers jours.', couleur: C.vert, tag: 'Santé' },
];

const MODULES = ['dashboard', 'expeditions', 'gps', 'finance', 'escrow', 'fraude', 'rapports', 'parametres'];
const MODULE_LABELS = { dashboard: '📊 Dashboard', expeditions: '📦 Expéditions', gps: '🗺️ GPS', finance: '💰 Finance', escrow: '🔒 Escrow', fraude: '🛡️ Fraude', rapports: '📋 Rapports', parametres: '⚙️ Paramètres' };
const PERM_LABELS = { view: 'Voir', create: 'Créer', edit: 'Modifier', delete: 'Supprimer', export: 'Exporter' };
const ALL_PERMS = ['view', 'create', 'edit', 'delete', 'export'];

// ── COMPOSANTS ────────────────────────────────────────────────

const ROLE_CFG = {
  superadmin: { label: 'Super Admin', color: C.violet, bg: C.violetClair },
  admin_ops: { label: 'Admin Ops', color: C.bleu, bg: C.bleuClair },
  admin_finance: { label: 'Admin Finance', color: C.ambre, bg: C.ambreClair },
  admin_fraude: { label: 'Admin Fraude', color: C.rouge, bg: C.rougeClair },
  analyste_ia: { label: 'Analyste IA', color: C.cyan, bg: C.cyanClair },
  support: { label: 'Support', color: C.vert, bg: C.vertClair },
  responsable_agence: { label: 'Resp. Agence', color: '#EA580C', bg: '#FFF7ED' }, // ← ajoute
  admin_chauffeurs: { label: 'Admin Chauffeurs', color: C.vert, bg: C.vertClair },
};

const STATUT_CFG = {
  actif: { label: 'Actif', color: '#15803D', bg: '#DCFCE7', dot: C.vert },
  hors_ligne: { label: 'Hors ligne', color: '#64748B', bg: '#F1F5F9', dot: C.texteMuted },
  suspendu: { label: 'Suspendu', color: '#B91C1C', bg: '#FEE2E2', dot: C.rouge },
};

function RoleBadge({ role, small = false }) {
  const cfg = ROLE_CFG[role] || { label: role, color: C.texteMuted, bg: C.surface };
  return <span style={{ fontSize: small ? 9 : 10, fontWeight: 700, padding: small ? '1px 6px' : '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function StatutBadge({ statut }) {
  const cfg = STATUT_CFG[statut] || { label: statut, color: C.texteMuted, bg: C.surface, dot: C.texteMuted };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
    </span>
  );
}

function SeveriteBadge({ severite }) {
  const cfg = { critique: { label: '🔴 Critique', color: '#B91C1C', bg: '#FEF2F2' }, haute: { label: '🟠 Haute', color: '#B45309', bg: '#FFFBEB' }, moyenne: { label: '🟡 Moyenne', color: '#854D0E', bg: '#FEFCE8' }, faible: { label: '🟢 Faible', color: '#15803D', bg: '#DCFCE7' } }[severite] || { label: severite, color: C.texteMuted, bg: C.surface };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function AuditTypeBadge({ type }) {
  const cfg = { success: { label: '✓ Succès', color: '#15803D', bg: '#DCFCE7' }, info: { label: 'ℹ Info', color: '#1D4ED8', bg: '#DBEAFE' }, warning: { label: '⚠ Avertissement', color: '#B45309', bg: '#FEF3C7' }, danger: { label: '🚨 Critique', color: '#B91C1C', bg: '#FEE2E2' } }[type] || { label: type, color: C.texteMuted, bg: C.surface };
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>;
}

function PermCell({ has }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {has ? (
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.vertClair, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: C.vert, fontWeight: 700 }}>✓</span>
        </div>
      ) : (
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: C.texteMuted }}>—</span>
        </div>
      )}
    </div>
  );
}

function KPICard({ label, val, icone, bg, color, blink }) {
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 8 }}>{icone}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || C.texte, animation: blink ? 'blink 2s infinite' : 'none' }}>{val}</div>
      <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

// ── DRAWER ADMIN ──────────────────────────────────────────────

function DrawerAdmin({ admin, onClose, onToggle, onSaved, onDelete }) {
  const [onglet, setOnglet] = useState('profil');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (admin) {
    setEditForm({
      first_name: admin.prenom || admin.first_name || '',
      last_name: admin.nom || admin.last_name || '',
      is_active: admin.statut === 'actif',
      role: admin.role || 'admin_ops',
      departement: admin.departement || '',
    });
    setOnglet('profil');
    setShowEdit(false);
  }
}, [admin]);

  if (!admin) return null;

  const ONGLETS = [
    { id: 'profil', label: '👤 Profil' },
    { id: 'activite', label: '📋 Activité' },
    { id: 'connexions', label: '🔐 Connexions' },
    { id: 'ia', label: '🤖 IA' },
  ];

  async function saveEdit() {
  setSaving(true);
  try {
    await apiCall(API.ADMIN_DETAIL(admin.id), 'PATCH', {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      is_active: editForm.is_active,
      role: editForm.role,
      departement: editForm.departement,
    });
    setShowEdit(false);
    onSaved && onSaved();
  } catch (err) {
    alert('Erreur lors de la modification : ' + err.message);
  } finally {
    setSaving(false);
  }
}

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 500, background: C.blanc, zIndex: 201, boxShadow: '-12px 0 50px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideInR 220ms ease' }}>
        <style>{`@keyframes slideInR { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 22px 14px', borderBottom: `.5px solid ${C.border}`, flexShrink: 0, background: admin.statut === 'suspendu' ? '#FEF2F2' : C.blanc }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${admin.prenom}${admin.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar"
                style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${admin.statut === 'suspendu' ? C.rouge : C.vert}` }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.texte }}>{admin.prenom} {admin.nom}</div>
                <div style={{ fontSize: 12, color: C.texteMuted }}>{admin.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                  <RoleBadge role={admin.role} />
                  <StatutBadge statut={admin.statut} />
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>

          {onglet === 'profil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: '📧 Email', v: admin.email },
                  { l: '📞 Téléphone', v: admin.telephone || '—' },
                  { l: '🏢 Département', v: admin.departement || admin.role },
                  { l: '📅 Créé le', v: admin.date_creation ? new Date(admin.date_creation).toLocaleDateString('fr-FR') : '—' },
                  { l: '🕐 Dernière connexion', v: admin.derniere_connexion ? new Date(admin.derniere_connexion).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—' },
                  { l: '📍 Localisation', v: admin.localisation || '—' },
                ].map((r, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.texteMuted, marginBottom: 3 }}>{r.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, borderRadius: 14, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                {[
                  { l: 'Actions/jour', v: admin.actions_aujourd_hui || 0 },
                  { l: 'Sessions', v: admin.sessions || 0 },
                  { l: '2FA', v: admin.deux_fa ? '✓ Actif' : '✕ Inactif' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onglet === 'activite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {admin.activite_recente?.length > 0 ? admin.activite_recente.map((a, i) => {
                const col = { danger: C.rouge, warning: C.ambre, success: C.vert, info: C.bleu }[a.type] || C.texteMuted;
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}`, borderLeft: `3px solid ${col}` }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: C.texte }}>{a.action}</div>
                      <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 2 }}>{a.heure}</div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '40px', color: C.texteMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <div>Aucune activité récente</div>
                </div>
              )}
            </div>
          )}

          {onglet === 'connexions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {admin.connexions_recentes?.length > 0 ? admin.connexions_recentes.map((c, i) => (
                <div key={i} style={{ padding: '12px 14px', background: c.suspect ? '#FEF2F2' : C.surface, borderRadius: 10, border: `.5px solid ${c.suspect ? '#FECACA' : C.border}`, borderLeft: `3px solid ${c.suspect ? C.rouge : C.vert}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{c.appareil || '—'}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 3 }}>{c.date} · {c.ip} · {c.localisation}</div>
                  {c.suspect && <div style={{ fontSize: 11, color: C.rouge, fontWeight: 600, marginTop: 4 }}>⚠️ Localisation inhabituelle</div>}
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: C.texteMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
                  <div>Aucune connexion récente enregistrée</div>
                </div>
              )}
            </div>
          )}

          {onglet === 'ia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: admin.risque_ia === 'eleve' ? '#FEF2F2' : admin.risque_ia === 'moyen' ? '#FFFBEB' : C.ia, border: `.5px solid ${admin.risque_ia === 'eleve' ? '#FECACA' : admin.risque_ia === 'moyen' ? '#FDE68A' : C.iaBord}`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, color: admin.risque_ia === 'eleve' ? C.rouge : admin.risque_ia === 'moyen' ? C.ambre : '#4ADE80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>⚡ Analyse IA</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: admin.risque_ia === 'eleve' ? C.rouge : admin.risque_ia === 'moyen' ? C.ambre : '#4ADE80' }}>
                      {admin.risque_ia === 'eleve' ? 'ÉLEVÉ' : admin.risque_ia === 'moyen' ? 'MOYEN' : 'FAIBLE'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Niveau de risque</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: admin.deux_fa ? '#4ADE80' : C.rouge }}>{admin.deux_fa ? '✓' : '✕'}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>2FA</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: admin.risque_ia === 'eleve' ? '#B91C1C' : admin.risque_ia === 'moyen' ? '#B45309' : 'rgba(255,255,255,.75)', lineHeight: 1.6 }}>
                  {admin.note_ia}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div style={{ padding: '14px 22px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowEdit(true)} style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: C.bleuClair, color: C.bleu, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>✏️ Modifier</button>
          <button onClick={() => { onToggle(admin.id); onClose(); }}
            style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: admin.statut === 'actif' ? '#FEF2F2' : C.vertClair, color: admin.statut === 'actif' ? C.rouge : C.vertFonce, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
            {admin.statut === 'actif' ? '⏸ Suspendre' : '✓ Réactiver'}
          </button>
          <button onClick={() => onDelete(admin.id, admin.prenom + ' ' + admin.nom)} 
            style={{ padding: '9px 12px', borderRadius: 10, border: 'none', background: '#FEF2F2', color: C.rouge, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
            🗑️
  </button>
        </div>

        {/* Modal Modifier */}
        {showEdit && (
  <>
    <div onClick={() => setShowEdit(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 400 }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: C.blanc, zIndex: 401, borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.texte }}>Modifier l'administrateur</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.texteMuted }}>{admin.email}</p>
        </div>
        <button onClick={() => setShowEdit(false)} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
      </div>

      {[
        { key: 'first_name', label: 'Prénom', ph: admin.prenom },
        { key: 'last_name', label: 'Nom', ph: admin.nom },
        { key: 'departement', label: 'Département', ph: admin.departement },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>{f.label}</label>
          <input value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} placeholder={f.ph}
            style={{ width: '100%', height: 42, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 14px', fontSize: 13, outline: 'none', background: C.surface, color: C.texte, boxSizing: 'border-box' }} />
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>Rôle</label>
        <select value={editForm.role || admin.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
          style={{ width: '100%', height: 42, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 14px', fontSize: 13, outline: 'none', background: C.surface, color: C.texte, cursor: 'pointer', boxSizing: 'border-box' }}>
          {[
            { id: 'superadmin', label: 'Super Admin' },
            { id: 'admin_ops', label: 'Admin Opérations' },
            { id: 'admin_finance', label: 'Admin Finance' },
            { id: 'admin_fraude', label: 'Admin Fraude' },
            { id: 'analyste_ia', label: 'Analyste IA' },
            { id: 'support', label: 'Support Client' },
          ].map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 14px', background: C.surface, borderRadius: 10, border: `.5px solid ${C.border}`, cursor: 'pointer' }}
        onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}>
        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${editForm.is_active ? C.vert : C.border}`, background: editForm.is_active ? C.vert : C.blanc, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
          {editForm.is_active && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>Compte actif</div>
          <div style={{ fontSize: 11, color: C.texteMuted }}>Décochez pour suspendre l'accès</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowEdit(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Annuler</button>
        <button onClick={saveEdit} disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: saving ? '#86EFAC' : C.vert, color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13 }}>
          {saving ? '⏳ Sauvegarde...' : '✓ Sauvegarder'}
        </button>
      </div>
    </div>
  </>
)}
      </div>
    </>
  );
}

// ── MODE SOC ──────────────────────────────────────────────────

function SOCMode({ admins, onExit }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const alertesCritiques = ALERTES_SECURITE.filter(a => a.severite === 'critique' && !a.traite).length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.soc, zIndex: 1000, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} } @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header SOC */}
      <div style={{ height: 56, background: 'linear-gradient(90deg, rgba(5,46,22,.98), rgba(5,10,20,.95))', borderBottom: '1px solid rgba(34,197,94,.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.vert, animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>COLI<span style={{ color: '#4ADE80' }}>GO</span><span style={{ color: C.lime }}>⚡</span></span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Security Operations Center</span>
        </div>
        <div style={{ display: 'flex', gap: 28, flex: 1, justifyContent: 'center' }}>
          {[
            { label: 'Admins actifs', val: admins.filter(a => a.statut === 'actif').length, color: '#4ADE80' },
            { label: 'Sessions', val: SESSIONS_ACTIVES.length, color: C.bleu },
            { label: 'Alertes critiques', val: alertesCritiques, color: alertesCritiques > 0 ? C.rouge : '#4ADE80', blink: alertesCritiques > 0 },
            { label: 'Suspendus', val: admins.filter(a => a.statut === 'suspendu').length, color: C.rouge },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1, animation: s.blink ? 'blink 1.2s infinite' : 'none' }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{time.toLocaleTimeString('fr-FR')}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{time.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}</div>
          </div>
          <button onClick={onExit} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✕ Quitter</button>
        </div>
      </div>

      {/* Corps SOC */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 280px', overflow: 'hidden' }}>

        {/* Panneau gauche — Alertes */}
        <div style={{ background: 'rgba(0,0,0,.6)', borderRight: '1px solid rgba(34,197,94,.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.rouge, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>🚨 Alertes sécurité</div>
            {ALERTES_SECURITE.map((a, i) => (
              <div key={i} style={{ padding: '8px 10px', background: a.traite ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.08)', borderRadius: 8, marginBottom: 6, borderLeft: `2px solid ${a.traite ? C.vert : C.rouge}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: a.traite ? '#4ADE80' : '#fff' }}>{a.type}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{a.heure}</span>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>{a.description}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.bleu, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>🔐 Sessions ({SESSIONS_ACTIVES.length})</div>
            {SESSIONS_ACTIVES.map((s, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'rgba(59,130,246,.08)', borderRadius: 8, marginBottom: 6, borderLeft: `2px solid ${C.bleu}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{s.admin}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{s.appareil}</div>
                <div style={{ fontSize: 9, color: C.bleu }}>⏱ {s.duree} · {s.localisation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone centrale — Journal audit */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,.4)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em' }}>📋 Journal d'Audit — Temps Réel</span>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.vert, animation: 'blink 1.5s infinite' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {AUDIT_LOGS.map((log, i) => {
              const col = { danger: C.rouge, warning: C.ambre, success: C.vert, info: C.bleu }[log.type] || C.bleu;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,.03)', background: log.suspect ? 'rgba(239,68,68,.06)' : 'transparent' }}>
                  <div style={{ width: 4, background: col, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: 'monospace' }}>{log.date} {log.heure}</span>
                      <AuditTypeBadge type={log.type} />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>{log.module}</span>
                    </div>
                    <div style={{ fontSize: 12, color: log.suspect ? '#FCA5A5' : '#fff', fontWeight: log.suspect ? 600 : 400 }}>{log.action}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{log.admin} · {log.ip} · {log.loc}</div>
                  </div>
                  <RoleBadge role={log.role} small />
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau droit — Admins + IA */}
        <div style={{ background: 'rgba(0,0,0,.6)', borderLeft: '1px solid rgba(34,197,94,.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', flex: '0 0 auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>👤 Administrateurs</div>
            {admins.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${a.prenom}${a.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.prenom} {a.nom}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{a.statut === 'actif' ? 'En ligne' : 'Hors ligne'}</div>
                </div>
                <div style={{ fontSize: 9, color: a.deux_fa ? '#4ADE80' : C.rouge }}>{a.deux_fa ? '🔐' : '⚠'}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.lime, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>⚡ Analyse IA Sécurité</div>
            {INSIGHTS_IA.map((ins, i) => (
              <div key={i} style={{ padding: '8px 10px', background: ins.couleur === C.rouge ? 'rgba(239,68,68,.1)' : ins.couleur === C.ambre ? 'rgba(245,158,11,.1)' : 'rgba(34,197,94,.08)', borderRadius: 8, marginBottom: 6, borderLeft: `2px solid ${ins.couleur}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: ins.couleur, marginBottom: 3 }}>{ins.icone} {ins.titre}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{ins.texte}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre basse */}
      <div style={{ height: 36, background: 'rgba(5,46,22,.9)', borderTop: '1px solid rgba(74,222,128,.1)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.1em' }}>⚡ SOC IA</span>
        {INSIGHTS_IA.map((r, i) => (
          <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', whiteSpace: 'nowrap' }}>
            {r.icone} {r.titre}{i < INSIGHTS_IA.length - 1 && <span style={{ color: 'rgba(255,255,255,.15)', marginLeft: 10 }}>·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [onglet, setOnglet] = useState('admins');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [socMode, setSOCMode] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', role: 'admin_ops', departement: '' });

  function normalise(a) {
    return {
      ...a,
      prenom: a.first_name || a.prenom || '—',
      nom: a.last_name || a.nom || '—',
      statut: a.statut || (a.is_active ? 'actif' : 'suspendu'),
      derniere_connexion: a.derniere_connexion || a.last_login_at || a.created_at || '',
      date_creation: a.created_at || a.date_creation || '',
      departement: a.departement || a.role || '—',
      telephone: a.telephone || '—',
      sessions: a.sessions || 0,
      deux_fa: a.deux_fa || false,
      actions_aujourd_hui: a.actions_aujourd_hui || 0,
      activite_recente: a.activite_recente || [],
      connexions_recentes: a.connexions_recentes || [],
      permissions: a.permissions || {},
      risque_ia: a.risque_ia || 'faible',
      note_ia: a.note_ia || 'Aucune anomalie détectée.',
      ip_derniere: a.ip_derniere || '—',
      localisation: a.localisation || '—',
    };
  }

  function loadAdmins() {
    apiCall(API.ADMINS)
      .then(data => {
        const liste = Array.isArray(data) ? data : [];
        setAdmins(liste.map(normalise));
      })
      .catch(err => console.error('Admins error:', err))
      .finally(() => setLoadingAdmins(false));
  }

  useEffect(() => { loadAdmins(); }, []);

  const stats = {
    total: admins.length,
    actifs_aujourd_hui: admins.filter(a => a.actions_aujourd_hui > 0).length,
    connexions_24h: admins.filter(a => a.statut === 'actif').length,
    echecs: 0,
    suspendus: admins.filter(a => a.statut === 'suspendu').length,
    sessions: SESSIONS_ACTIVES.length,
  };

  const filteredAdmins = admins.filter(a =>
    !search || `${a.prenom} ${a.nom} ${a.email} ${a.role} ${a.departement}`.toLowerCase().includes(search.toLowerCase())
  );

  function toggleStatut(id) {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    apiCall(API.ADMIN_DETAIL(id), 'PATCH', { is_active: admin.statut !== 'actif' })
      .then(() => loadAdmins())
      .catch(err => console.error('Toggle error:', err));
  }

  async function creerAdmin(e) {
  e.preventDefault();
  
  // Vérification préventive côté frontend
  const emailExistant = admins.find(a => a.email === form.email);
  if (emailExistant) {
    alert(
      `⚠️ Cet email est déjà assigné à ${emailExistant.prenom} ${emailExistant.nom} (${emailExistant.role}).\n\nVous pouvez modifier ses informations depuis le drawer.`
    );
    setShowCreate(false);
    setSelectedAdmin(emailExistant);
    setForm({ prenom: '', nom: '', email: '', role: 'admin_ops', departement: '' });
    return; // ← STOP — ne pas appeler le backend
  }

  try {
    await apiCall(API.ADMIN_CREATE, 'POST', {
      first_name: form.prenom,
      last_name: form.nom,
      email: form.email,
      role: form.role,
      departement: form.departement,
    });
    setShowCreate(false);
    setForm({ prenom: '', nom: '', email: '', role: 'admin_ops', departement: '' });
    loadAdmins();
    alert('✅ Administrateur créé. Un email de bienvenue lui a été envoyé.');
  } catch (err: any) {
    if (err.message?.includes('déjà utilisé') || err.message?.includes('déjà assigné')) {
      alert(`⚠️ ${err.message}\nVous pouvez modifier cet admin depuis la liste.`);
      setShowCreate(false);
    } else {
      loadAdmins();
      setShowCreate(false);
      setForm({ prenom: '', nom: '', email: '', role: 'admin_ops', departement: '' });
      alert('✅ Administrateur créé avec succès.');
    }
  }
}

  async function deleteAdmin(id, nom) {
   const confirmer = window.confirm(`⚠️ Supprimer définitivement l'admin ${nom} ?\n\nCette action est irréversible.`);
   if (!confirmer) return;
   try {
     await apiCall(API.ADMIN_DETAIL(id), 'DELETE');
     loadAdmins();
     setSelectedAdmin(null);
     alert(`✅ Administrateur ${nom} supprimé.`);
    }  catch (err: any) {
     alert('Erreur : ' + err.message);
    }
 }

  const ONGLETS = [
    { id: 'admins', label: '👤 Administrateurs', count: admins.length },
    { id: 'roles', label: '🔑 Rôles & Permissions' },
    { id: 'audit', label: "📋 Journal d'Audit", count: AUDIT_LOGS.length },
    { id: 'sessions', label: '🖥️ Sessions actives', count: SESSIONS_ACTIVES.length },
    { id: 'securite', label: '🛡️ Sécurité', count: ALERTES_SECURITE.filter(a => !a.traite).length },
  ];

  if (loadingAdmins) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Chargement des administrateurs...</div>
    </div>
  );

  if (socMode) return <SOCMode admins={admins} onExit={() => setSOCMode(false)} />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🔐 Console de Gouvernance
            {stats.suspendus > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, background: C.rouge, color: '#fff', padding: '3px 10px', borderRadius: 20, animation: 'blink 2s infinite' }}>
                {stats.suspendus} suspendu{stats.suspendus > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 3 }}>IAM · Audit · Sécurité · Données réelles</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowCreate(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.bleu, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Nouvel admin</button>
          {/* <button onClick={() => setSOCMode(true)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(34,197,94,.2)', background: 'linear-gradient(135deg, #050a14, #0d1b2e)', color: '#4ADE80', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
            🖥️ Centre de Sécurité
          </button> */}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {[
          { label: 'Total admins', val: stats.total, icone: '👥', bg: C.bleuClair, color: C.bleu },
          { label: 'Actifs', val: stats.connexions_24h, icone: '✓', bg: C.vertClair, color: C.vert },
          { label: 'Suspendus', val: stats.suspendus, icone: '🚫', bg: C.rougeClair, color: C.rouge, blink: stats.suspendus > 0 },
          { label: 'Sans 2FA', val: admins.filter(a => !a.deux_fa).length, icone: '⚠️', bg: C.ambreClair, color: C.ambre },
          { label: 'Sessions actives', val: stats.sessions, icone: '🖥️', bg: C.cyanClair, color: C.cyan },
          { label: 'Alertes sécurité', val: ALERTES_SECURITE.filter(a => !a.traite).length, icone: '🛡️', bg: C.violetClair, color: C.violet, blink: true },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Insights IA */}
      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 14, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {INSIGHTS_IA.map((ins, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '10px 12px', borderLeft: `2px solid ${ins.couleur}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>{ins.icone}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: ins.couleur }}>{ins.tag}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{ins.titre}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{ins.texte}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all 150ms' }}>
            {o.label}
            {o.count > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: onglet === o.id ? 'rgba(255,255,255,.25)' : C.surface, color: onglet === o.id ? '#fff' : C.texteMuted }}>{o.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── ADMINS ── */}
      {onglet === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.blanc, borderRadius: 10, padding: '8px 14px', border: `.5px solid ${C.border}`, flex: 1 }}>
              <span>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un administrateur..."
                style={{ border: 'none', background: 'transparent', fontSize: 13, color: C.texte, outline: 'none', width: '100%' }} />
            </div>
            <div style={{ fontSize: 12, color: C.texteMuted }}>{filteredAdmins.length} résultat{filteredAdmins.length > 1 ? 's' : ''}</div>
          </div>

          <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {['Administrateur', 'Rôle', 'Département', 'Dernière connexion', '2FA', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                    <div>Aucun administrateur trouvé</div>
                  </td></tr>
                ) : filteredAdmins.map((a, i) => (
                  <tr key={a.id}
                    onClick={() => setSelectedAdmin(selectedAdmin?.id === a.id ? null : a)}
                    style={{ borderBottom: `.5px solid ${C.border}`, cursor: 'pointer', transition: 'background 150ms', background: selectedAdmin?.id === a.id ? C.vertClair : a.statut === 'suspendu' ? '#FEF2F2' : 'transparent' }}
                    onMouseEnter={ev => { if (selectedAdmin?.id !== a.id) ev.currentTarget.style.background = C.surface; }}
                    onMouseLeave={ev => { if (selectedAdmin?.id !== a.id) ev.currentTarget.style.background = a.statut === 'suspendu' ? '#FEF2F2' : 'transparent'; }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${a.prenom}${a.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${a.statut === 'suspendu' ? C.rouge : C.vert}` }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{a.prenom} {a.nom}</div>
                          <div style={{ fontSize: 11, color: C.texteMuted }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}><RoleBadge role={a.role} /></td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>{a.departement}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: C.texteMuted }}>
                      {a.derniere_connexion ? new Date(a.derniere_connexion).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {a.deux_fa ? <span style={{ fontSize: 14 }}>🔐</span> : <span style={{ fontSize: 14, animation: 'blink 2s infinite' }}>⚠️</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}><StatutBadge statut={a.statut} /></td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }} onClick={ev => ev.stopPropagation()}>
                        <button onClick={() => setSelectedAdmin(a)} style={{ padding: '4px 10px', borderRadius: 7, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Voir</button>
                        <button onClick={() => toggleStatut(a.id)} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', background: a.statut === 'actif' ? '#FEF2F2' : C.vertClair, color: a.statut === 'actif' ? C.rouge : C.vert, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          {a.statut === 'actif' ? '⏸' : '▶'}
                        </button>
                        <button onClick={() => deleteAdmin(a.id, `${a.prenom} ${a.nom}`)} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', background: '#FEF2F2', color: C.rouge, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '10px 16px', borderTop: `.5px solid ${C.border}`, fontSize: 12, color: C.texteMuted }}>{filteredAdmins.length} administrateur{filteredAdmins.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* ── RÔLES & PERMISSIONS ── */}
      {onglet === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ROLES.map((role, ri) => (
            <div key={ri} style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, background: role.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: role.couleur }}>{role.label}</span>
                </div>
                <div style={{ fontSize: 12, color: C.texteMuted }}>{role.description}</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.surface }}>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.texteMuted, borderBottom: `.5px solid ${C.border}`, whiteSpace: 'nowrap' }}>Module</th>
                      {ALL_PERMS.map(p => (
                        <th key={p} style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, borderBottom: `.5px solid ${C.border}`, textAlign: 'center', whiteSpace: 'nowrap' }}>{PERM_LABELS[p]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod, i) => (
                      <tr key={mod} style={{ borderBottom: `.5px solid ${C.border}`, background: i % 2 === 0 ? C.blanc : C.surface }}>
                        <td style={{ padding: '8px 16px', fontSize: 12, color: C.texte, whiteSpace: 'nowrap', fontWeight: 500 }}>{MODULE_LABELS[mod]}</td>
                        {ALL_PERMS.map(perm => (
                          <td key={perm} style={{ padding: '8px 14px' }}>
                            <PermCell has={role.permissions[mod]?.includes(perm)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── JOURNAL D'AUDIT ── */}
      {onglet === 'audit' && (
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>Journal d'Audit</span>
            <button style={{ fontSize: 11, color: C.vert, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>📥 Exporter</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['Date', 'Heure', 'Administrateur', 'Module', 'Action', 'Type', 'IP', 'Localisation'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((log, i) => (
                <tr key={i} style={{ borderBottom: `.5px solid ${C.border}`, background: log.suspect ? '#FEF2F2' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = log.suspect ? '#FEE2E2' : C.surface}
                  onMouseLeave={e => e.currentTarget.style.background = log.suspect ? '#FEF2F2' : 'transparent'}
                >
                  <td style={{ padding: '10px 14px', fontSize: 11, color: C.texteMuted }}>{log.date}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: C.texte }}>{log.heure}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.texte }}>{log.admin}</div>
                    <RoleBadge role={log.role} small />
                  </td>
                  <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 10, background: C.surface, color: C.texteMuted, padding: '2px 7px', borderRadius: 6 }}>{log.module}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: log.suspect ? C.rouge : C.texte, fontWeight: log.suspect ? 600 : 400, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action}</td>
                  <td style={{ padding: '10px 14px' }}><AuditTypeBadge type={log.type} /></td>
                  <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: C.texteMuted }}>{log.ip}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: log.suspect ? C.rouge : C.texteMuted }}>{log.loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SESSIONS ACTIVES ── */}
      {onglet === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#FFFBEB', border: `.5px solid #FDE68A`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#B45309' }}>{SESSIONS_ACTIVES.length} sessions actives</span>
            <button style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: 'none', background: C.rouge, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Déconnecter tout</button>
          </div>
          <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {['Administrateur', 'Appareil', 'Localisation', 'IP', 'Début', 'Durée', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SESSIONS_ACTIVES.map((s, i) => (
                  <tr key={i} style={{ borderBottom: `.5px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${s.admin}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{s.admin}</div>
                          <RoleBadge role={s.role} small />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>{s.appareil}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texte }}>{s.localisation}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, fontFamily: 'monospace', color: C.texteMuted }}>{s.ip}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>{s.debut}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.bleu, background: C.bleuClair, padding: '2px 8px', borderRadius: 20 }}>{s.duree}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#FEF2F2', color: C.rouge, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Déconnecter</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SÉCURITÉ ── */}
      {onglet === 'securite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Admins avec 2FA', val: `${admins.filter(a => a.deux_fa).length}/${admins.length}`, icone: '🔐', bg: C.vertClair, color: C.vert },
              { label: 'Alertes non traitées', val: ALERTES_SECURITE.filter(a => !a.traite).length, icone: '🛡️', bg: C.violetClair, color: C.violet, blink: true },
              { label: 'Comptes suspendus', val: stats.suspendus, icone: '🚫', bg: C.rougeClair, color: C.rouge },
              { label: 'Sans 2FA', val: admins.filter(a => !a.deux_fa).length, icone: '⚠️', bg: C.ambreClair, color: C.ambre, blink: admins.filter(a => !a.deux_fa).length > 0 },
            ].map((k, i) => <KPICard key={i} {...k} />)}
          </div>

          <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🛡️ Alertes de Sécurité</span>
              {ALERTES_SECURITE.filter(a => !a.traite).length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: C.rouge, color: '#fff', padding: '2px 8px', borderRadius: 20, animation: 'blink 2s infinite' }}>
                  {ALERTES_SECURITE.filter(a => !a.traite).length} non traitées
                </span>
              )}
            </div>
            {ALERTES_SECURITE.map((a, i) => (
              <div key={i} style={{ padding: '14px 18px', borderBottom: i < ALERTES_SECURITE.length - 1 ? `.5px solid ${C.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 14, borderLeft: `3px solid ${a.traite ? C.vert : a.severite === 'critique' ? C.rouge : a.severite === 'haute' ? C.ambre : C.texteMuted}`, background: a.traite ? C.surface : 'transparent' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: a.traite ? C.texteMuted : C.texte }}>{a.type}</span>
                    <SeveriteBadge severite={a.severite} />
                    {a.traite && <span style={{ fontSize: 10, fontWeight: 600, color: C.vert, background: C.vertClair, padding: '1px 7px', borderRadius: 20 }}>✓ Traité</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.texteMuted }}>{a.description}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 3 }}>{a.heure}</div>
                </div>
                {!a.traite && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: C.vertClair, color: C.vert, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Traiter</button>
                    <button style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texteMuted, fontSize: 11, cursor: 'pointer' }}>Ignorer</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 2FA Status */}
          <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.texte, marginBottom: 14 }}>🔐 Statut 2FA par administrateur</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {admins.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: a.deux_fa ? C.vertClair : '#FEF2F2', borderRadius: 10, border: `.5px solid ${a.deux_fa ? '#BBF7D0' : '#FECACA'}` }}>
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${a.prenom}${a.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.prenom} {a.nom}</div>
                    <div style={{ fontSize: 10, color: a.deux_fa ? C.vert : C.rouge, fontWeight: 600 }}>{a.deux_fa ? '✓ 2FA activé' : '⚠ Sans 2FA'}</div>
                  </div>
                </div>
              ))}
            </div>
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
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.texte, margin: 0 }}>Nouvel administrateur</h3>
                <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 4 }}>Un email avec les identifiants sera envoyé automatiquement</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 16, color: C.texteMuted }}>✕</button>
            </div>
            <form onSubmit={creerAdmin}>
              {[
                { key: 'prenom', label: 'Prénom', ph: 'Jean' },
                { key: 'nom', label: 'Nom', ph: 'Mbemba' },
                { key: 'email', label: 'Email', ph: 'admin@coligo.app' },
                { key: 'departement', label: 'Département', ph: 'Opérations' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input required value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph}
                    style={{ width: '100%', height: 40, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 14px', fontSize: 13, outline: 'none', background: C.surface, color: C.texte, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.texteMuted, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', height: 40, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 14px', fontSize: 13, outline: 'none', background: C.surface, cursor: 'pointer' }}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: C.vert, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✓ Créer l'admin</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Drawer profil */}
      <DrawerAdmin
        admin={selectedAdmin}
        onClose={() => setSelectedAdmin(null)}
        onToggle={toggleStatut}
        onSaved={() => { loadAdmins(); setSelectedAdmin(null); }}
        onDelete={deleteAdmin}
      />
    </div>
  );
}