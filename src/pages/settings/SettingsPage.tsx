// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const C = {
  vert: '#22C55E', vertFonce: '#14532D', vertClair: '#F0FDF4',
  vertPrimary: '#16A34A',
  lime: '#84CC16', limeClair: '#F7FEE7',
  rouge: '#EF4444', rougeClair: '#FEF2F2',
  ambre: '#F59E0B', ambreClair: '#FFFBEB',
  bleu: '#3B82F6', bleuClair: '#EFF6FF',
  violet: '#8B5CF6', violetClair: '#EDE9FE',
  cyan: '#06B6D4', cyanClair: '#ECFEFF',
  texte: '#111827', texteSec: '#6B7280',
  border: '#E5E7EB', surface: '#F8FAF8', blanc: '#FFFFFF',
  ia: '#052E16', iaBord: '#166534',
};

// ── DONNÉES ───────────────────────────────────────────────────

const NOTIF_DATA = [
  { jour: 'Lun', email: 42, sms: 28, push: 65 },
  { jour: 'Mar', email: 38, sms: 31, push: 71 },
  { jour: 'Mer', email: 55, sms: 22, push: 58 },
  { jour: 'Jeu', email: 47, sms: 35, push: 84 },
  { jour: 'Ven', email: 62, sms: 41, push: 92 },
  { jour: 'Sam', email: 29, sms: 18, push: 44 },
  { jour: 'Dim', email: 21, sms: 14, push: 38 },
];

const FINANCE_DATA = [
  { mois: 'Jan', transactions: 1240, montant: 28500000 },
  { mois: 'Fév', transactions: 1380, montant: 31200000 },
  { mois: 'Mar', transactions: 1290, montant: 29800000 },
  { mois: 'Avr', transactions: 1560, montant: 34500000 },
  { mois: 'Mai', transactions: 1680, montant: 36800000 },
  { mois: 'Juin', transactions: 1820, montant: 38500000 },
];

const GPS_DATA = [
  { jour: 'Lun', alertes: 4, incidents: 1 },
  { jour: 'Mar', alertes: 7, incidents: 2 },
  { jour: 'Mer', alertes: 3, incidents: 0 },
  { jour: 'Jeu', alertes: 9, incidents: 3 },
  { jour: 'Ven', alertes: 5, incidents: 1 },
  { jour: 'Sam', alertes: 2, incidents: 0 },
  { jour: 'Dim', alertes: 1, incidents: 0 },
];

const SECURITE_LOGS = [
  { date: '07/06/2026', heure: '09:20', user: 'admin@coligo.app', action: 'Connexion', ip: '102.244.12.45', result: 'succes' },
  { date: '07/06/2026', heure: '08:42', user: 'manager@coligo.app', action: 'Modification permissions', ip: '197.234.45.12', result: 'succes' },
  { date: '07/06/2026', heure: '07:55', user: 'finance@coligo.app', action: 'Export rapport', ip: '41.202.219.88', result: 'succes' },
  { date: '06/06/2026', heure: '23:15', user: 'inconnu', action: 'Tentative connexion', ip: '45.199.12.88', result: 'bloque' },
  { date: '06/06/2026', heure: '16:30', user: 'fraude@coligo.app', action: 'Connexion', ip: '102.244.18.77', result: 'succes' },
  { date: '04/06/2026', heure: '10:58', user: 'analyste@coligo.app', action: 'Connexion', ip: '45.199.12.88', result: 'echec' },
];

const SAUVEGARDES = [
  { date: '07/06/2026', heure: '18:42', user: 'Super Admin', taille: '2.4 GB', statut: 'succes' },
  { date: '06/06/2026', heure: '18:42', user: 'Auto', taille: '2.3 GB', statut: 'succes' },
  { date: '05/06/2026', heure: '18:42', user: 'Auto', taille: '2.2 GB', statut: 'succes' },
  { date: '04/06/2026', heure: '18:42', user: 'Auto', taille: '2.1 GB', statut: 'succes' },
  { date: '03/06/2026', heure: '18:42', user: 'Auto', taille: '2.0 GB', statut: 'erreur' },
];

const ACTIVITE_RECENTE = [
  { user: 'Super Admin', action: 'Commission chauffeur modifiée 10% → 12%', heure: '18:42', icone: '💰' },
  { user: 'Edwige Kameni', action: 'Fréquence GPS mise à jour : 5s', heure: '17:15', icone: '🗺️' },
  { user: 'Super Admin', action: 'Module IA Fraude activé', heure: '16:30', icone: '🤖' },
  { user: 'Marcel Fotso', action: 'MTN Mobile Money activé', heure: '15:12', icone: '💳' },
  { user: 'Super Admin', action: 'Notification WhatsApp activée', heure: '14:00', icone: '📱' },
  { user: 'Edwige Kameni', action: 'Cameroun ajouté zone d\'exploitation', heure: '13:30', icone: '🌍' },
];

const PAYS_ZONES = [
  { nom: 'Cameroun', code: 'CM', flag: '🇨🇲', chauffeurs: 47, agences: 3, livraisons: 1301, actif: true },
  { nom: 'Congo', code: 'CG', flag: '🇨🇬', chauffeurs: 12, agences: 1, livraisons: 248, actif: true },
  { nom: 'Gabon', code: 'GA', flag: '🇬🇦', chauffeurs: 3, agences: 1, livraisons: 42, actif: false },
  { nom: 'Tchad', code: 'TD', flag: '🇹🇩', chauffeurs: 0, agences: 0, livraisons: 0, actif: false },
  { nom: 'RCA', code: 'CF', flag: '🇨🇫', chauffeurs: 0, agences: 0, livraisons: 0, actif: false },
  { nom: 'Guinée Éq.', code: 'GQ', flag: '🇬🇶', chauffeurs: 0, agences: 0, livraisons: 0, actif: false },
];

// ── COMPOSANTS ────────────────────────────────────────────────

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <div style={{ fontSize: 11, color: C.texteSec, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.name} : {p.value}</div>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label, sublabel, color = C.vert }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `.5px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: C.texteSec, marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, background: value ? color : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 300ms ease', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left 300ms ease' }} />
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, unit, sublabel }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: `.5px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.texte }}>{label}</div>
          {sublabel && <div style={{ fontSize: 11, color: C.texteSec, marginTop: 1 }}>{sublabel}</div>}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.vertPrimary }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: C.vertPrimary, cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.texteSec, marginTop: 2 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.blanc, borderRadius: 16, border: `.5px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,.06)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ titre, subtitle, action }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>{titre}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.texteSec, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function CardBody({ children, style = {} }) {
  return <div style={{ padding: '16px 20px', ...style }}>{children}</div>;
}

function HealthRing({ score, label, color, size = 56 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col = color || (score >= 95 ? C.vert : score >= 80 ? C.ambre : C.rouge);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: col }}>{score}%</div>
      </div>
      <div style={{ fontSize: 10, color: C.texteSec, textAlign: 'center', maxWidth: size }}>{label}</div>
    </div>
  );
}

function MiniKPI({ label, val, color, icone }) {
  return (
    <div style={{ background: C.surface, borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
      {icone && <div style={{ fontSize: 18, marginBottom: 4 }}>{icone}</div>}
      <div style={{ fontSize: 18, fontWeight: 800, color: color || C.texte }}>{val}</div>
      <div style={{ fontSize: 10, color: C.texteSec, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.texteSec, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', height: 40, borderRadius: 10, border: `.5px solid ${C.border}`, padding: '0 14px', fontSize: 13, outline: 'none', background: C.surface, color: C.texte, boxSizing: 'border-box', transition: 'border-color 200ms' }}
        onFocus={e => e.target.style.borderColor = C.vertPrimary}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function ResultBadge({ result }) {
  const cfg = {
    succes: { label: '✓ Succès', bg: '#DCFCE7', color: '#15803D' },
    echec: { label: '✕ Échec', bg: '#FEE2E2', color: '#B91C1C' },
    bloque: { label: '🚫 Bloqué', bg: '#FEF3C7', color: '#B45309' },
  }[result] || { label: result, bg: C.surface, color: C.texteSec };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

// ── ONGLETS ───────────────────────────────────────────────────

function OngletGeneral({ settings, setSettings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <Card>
        <CardHeader titre="🏢 Informations société" subtitle="Données de la plateforme COLIGO" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ paddingRight: 16 }}>
              <InputField label="Nom plateforme" value={settings.nom_plateforme} onChange={v => setSettings({ ...settings, nom_plateforme: v })} placeholder="COLIGO" />
              <InputField label="Email support" value={settings.email_support} onChange={v => setSettings({ ...settings, email_support: v })} type="email" placeholder="support@coligo.app" />
              <InputField label="Téléphone" value={settings.telephone} onChange={v => setSettings({ ...settings, telephone: v })} placeholder="+237 233 111 222" />
              <InputField label="Site web" value={settings.site_web} onChange={v => setSettings({ ...settings, site_web: v })} placeholder="https://coligo.app" />
            </div>
            <div style={{ paddingLeft: 16, borderLeft: `.5px solid ${C.border}` }}>
              <InputField label="Adresse" value={settings.adresse} onChange={v => setSettings({ ...settings, adresse: v })} placeholder="Douala, Cameroun" />
              <InputField label="Pays" value={settings.pays} onChange={v => setSettings({ ...settings, pays: v })} placeholder="Cameroun" />
              <InputField label="Ville" value={settings.ville} onChange={v => setSettings({ ...settings, ville: v })} placeholder="Douala" />
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.texteSec, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 8 }}>Logo plateforme</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${C.vertFonce}, ${C.vert})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontStyle: 'italic', fontWeight: 900, color: '#fff' }}>C⚡</div>
                  <button style={{ padding: '8px 14px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📷 Modifier logo</button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader titre="🌍 Zones d'exploitation" subtitle="Pays et marchés actifs" action={
          <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: C.vertPrimary, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Ajouter pays</button>
        } />
        <CardBody style={{ padding: 0 }}>
          {PAYS_ZONES.map((pays, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < PAYS_ZONES.length - 1 ? `.5px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{pays.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{pays.nom} <span style={{ fontSize: 10, color: C.texteSec }}>({pays.code})</span></div>
                {pays.actif && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 11, color: C.texteSec }}>
                    <span>🚕 {pays.chauffeurs} chauffeurs</span>
                    <span>🏢 {pays.agences} agences</span>
                    <span>📦 {pays.livraisons} livraisons</span>
                  </div>
                )}
              </div>
              <div onClick={() => {}} style={{ width: 42, height: 24, borderRadius: 12, background: pays.actif ? C.vert : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 300ms' }}>
                <div style={{ position: 'absolute', top: 2, left: pays.actif ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left 300ms' }} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader titre="📊 Statistiques globales" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <MiniKPI label="Clients" val="1 284" icone="👥" color={C.bleu} />
            <MiniKPI label="Chauffeurs" val="62" icone="🚕" color={C.vert} />
            <MiniKPI label="Agences" val="4" icone="🏢" color={C.violet} />
            <MiniKPI label="Livraisons" val="1 591" icone="📦" color={C.ambre} />
            <MiniKPI label="Revenus" val="199M F" icone="💰" color={C.vert} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function OngletSecurite({ settings, setSettings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card>
          <CardHeader titre="🔐 Authentification" />
          <CardBody>
            {[
              { key: 'deux_fa', label: 'Double authentification (2FA)', sub: 'Obligatoire pour tous les admins' },
              { key: 'biometrie', label: 'Connexion biométrique', sub: 'Empreinte digitale & Face ID' },
              { key: 'expiration_session', label: 'Expiration automatique session', sub: 'Après 30 min d\'inactivité' },
              { key: 'deconnexion_auto', label: 'Déconnexion automatique', sub: 'En cas d\'activité suspecte' },
              { key: 'protection_brute', label: 'Protection brute force', sub: 'Blocage après 5 tentatives' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key]} onChange={v => setSettings({ ...settings, [item.key]: v })} label={item.label} sublabel={item.sub} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="🔑 Politique mot de passe" />
          <CardBody>
            <SliderInput label="Longueur minimum" value={settings.mdp_longueur} onChange={v => setSettings({ ...settings, mdp_longueur: v })} min={6} max={20} unit=" caractères" />
            <SliderInput label="Expiration mot de passe" value={settings.mdp_expiration} onChange={v => setSettings({ ...settings, mdp_expiration: v })} min={30} max={365} unit=" jours" sublabel="0 = jamais" />
            <SliderInput label="Historique mots de passe" value={settings.mdp_historique} onChange={v => setSettings({ ...settings, mdp_historique: v })} min={1} max={10} unit=" derniers" />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 8 }}>Complexité requise</div>
              {[
                { label: 'Majuscules obligatoires', val: true },
                { label: 'Chiffres obligatoires', val: true },
                { label: 'Caractères spéciaux', val: settings.mdp_special },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `.5px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.texteSec }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.val ? C.vert : C.rouge }}>{r.val ? '✓ Requis' : '✕ Optionnel'}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader titre="⚠️ Menaces détectées" subtitle="30 derniers jours" />
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Connexions suspectes', val: 3, color: C.rouge },
                { label: 'IPs bloquées', val: 7, color: C.ambre },
                { label: 'Comptes verrouillés', val: 1, color: C.rouge },
                { label: 'Tentatives fraude', val: 12, color: C.ambre },
              ].map((s, i) => (
                <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px', border: `.5px solid ${C.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.texteSec, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { j: '1', v: 2 }, { j: '5', v: 5 }, { j: '10', v: 3 }, { j: '15', v: 8 },
                  { j: '20', v: 4 }, { j: '25', v: 6 }, { j: '30', v: 3 },
                ]}>
                  <defs>
                    <linearGradient id="gSecurite" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.rouge} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.rouge} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={C.rouge} strokeWidth={2} fill="url(#gSecurite)" />
                  <Tooltip content={<TooltipCustom />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="📋 Journal sécurité" />
          <div style={{ overflow: 'auto', maxHeight: 280 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {['Heure', 'Utilisateur', 'Action', 'Résultat'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: C.texteSec, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECURITE_LOGS.map((log, i) => (
                  <tr key={i} style={{ borderBottom: `.5px solid ${C.border}`, background: log.result === 'bloque' || log.result === 'echec' ? C.rougeClair : 'transparent' }}>
                    <td style={{ padding: '7px 12px', fontSize: 10, fontFamily: 'monospace', color: C.texteSec, whiteSpace: 'nowrap' }}>{log.heure}</td>
                    <td style={{ padding: '7px 12px', fontSize: 11, color: C.texte }}>{log.user}</td>
                    <td style={{ padding: '7px 12px', fontSize: 11, color: C.texteSec }}>{log.action}</td>
                    <td style={{ padding: '7px 12px' }}><ResultBadge result={log.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OngletNotifications({ settings, setSettings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card>
          <CardHeader titre="📱 Canaux de notification" />
          <CardBody>
            {[
              { key: 'notif_email', label: 'Email', sub: 'Via SMTP · support@coligo.app', icone: '✉️' },
              { key: 'notif_sms', label: 'SMS', sub: 'Via Orange SMS API', icone: '💬' },
              { key: 'notif_whatsapp', label: 'WhatsApp Business', sub: 'Via Meta Cloud API', icone: '📱' },
              { key: 'notif_push', label: 'Push Notifications', sub: 'Web & Mobile app', icone: '🔔' },
              { key: 'notif_telegram', label: 'Telegram Bot', sub: '@COLIGO_AlertBot', icone: '✈️' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key]} onChange={v => setSettings({ ...settings, [item.key]: v })} label={`${item.icone} ${item.label}`} sublabel={item.sub} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="⚡ Événements critiques" subtitle="Notifications automatiques" />
          <CardBody>
            {[
              { key: 'notif_fraude', label: '🛡️ Fraude détectée', sub: 'Alerte immédiate' },
              { key: 'notif_litige', label: '⚖️ Nouveau litige', sub: 'Notification email + SMS' },
              { key: 'notif_paiement', label: '💰 Paiement reçu', sub: 'Confirmation automatique' },
              { key: 'notif_gps', label: '🗺️ Alerte GPS', sub: 'Détour ou arrêt suspect' },
              { key: 'notif_erreur', label: '❌ Erreur système', sub: 'Notification admin' },
              { key: 'notif_maintenance', label: '🔧 Maintenance', sub: '1h avant planifiée' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key] !== false} onChange={v => setSettings({ ...settings, [item.key]: v })} label={item.label} sublabel={item.sub} />
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader titre="📊 Volume de notifications — 7 derniers jours" />
        <CardBody>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={NOTIF_DATA} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: C.texteSec }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.texteSec }} tickLine={false} axisLine={false} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="email" name="Email" fill={C.bleu} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sms" name="SMS" fill={C.ambre} radius={[4, 4, 0, 0]} />
              <Bar dataKey="push" name="Push" fill={C.vert} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {[{ c: C.bleu, l: 'Email' }, { c: C.ambre, l: 'SMS' }, { c: C.vert, l: 'Push' }].map(i => (
              <span key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.texteSec }}>
                <span style={{ width: 10, height: 3, background: i.c, display: 'inline-block', borderRadius: 2 }} />{i.l}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function OngletFinance({ settings, setSettings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card>
          <CardHeader titre="💰 Commissions plateforme" subtitle="Taux appliqués automatiquement" />
          <CardBody>
            {[
              { key: 'comm_chauffeur', label: 'Commission chauffeur', max: 30 },
              { key: 'comm_agence', label: 'Commission agence', max: 20 },
              { key: 'comm_transaction', label: 'Commission transaction', max: 10 },
              { key: 'comm_escrow', label: 'Frais escrow', max: 5 },
            ].map((item, i) => (
              <SliderInput key={i} label={item.label} value={settings[item.key]} onChange={v => setSettings({ ...settings, [item.key]: v })} min={0} max={item.max} unit="%" />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="🔒 Paramètres Escrow" />
          <CardBody>
            {[
              { key: 'escrow_blocage', label: 'Blocage fonds automatique', sub: 'Dès confirmation commande' },
              { key: 'escrow_liberation', label: 'Libération automatique', sub: 'Après validation OTP client' },
              { key: 'escrow_remboursement', label: 'Remboursement auto annulation', sub: 'Sous 24h' },
              { key: 'escrow_validation', label: 'Validation livraison requise', sub: 'Avant libération fonds' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key] !== false} onChange={v => setSettings({ ...settings, [item.key]: v })} label={item.label} sublabel={item.sub} />
            ))}
            <SliderInput label="Délai libération automatique" value={settings.escrow_delai || 24} onChange={v => setSettings({ ...settings, escrow_delai: v })} min={1} max={72} unit="h" sublabel="Si non confirmé" />
          </CardBody>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader titre="💳 Moyens de paiement" />
          <CardBody>
            {[
              { key: 'pay_mtn', label: 'MTN Mobile Money', sub: 'API MTN MoMo', icone: '📱' },
              { key: 'pay_orange', label: 'Orange Money', sub: 'API Orange API', icone: '📱' },
              { key: 'pay_carte', label: 'Carte bancaire', sub: 'Via Stripe', icone: '💳' },
              { key: 'pay_virement', label: 'Virement bancaire', sub: 'BEAC / COBAC', icone: '🏦' },
              { key: 'pay_paypal', label: 'PayPal', sub: 'Paiements internationaux', icone: '🌐' },
              { key: 'pay_especes', label: 'Espèces', sub: 'Paiement à la livraison', icone: '💵' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key] !== false} onChange={v => setSettings({ ...settings, [item.key]: v })} label={`${item.icone} ${item.label}`} sublabel={item.sub} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="📈 Indicateurs financiers" subtitle="6 derniers mois" />
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <MiniKPI label="Transactions/jour" val="1 820" color={C.bleu} icone="📊" />
              <MiniKPI label="Montants bloqués" val="12.4M F" color={C.ambre} icone="🔒" />
              <MiniKPI label="Montants libérés" val="38.5M F" color={C.vert} icone="✓" />
              <MiniKPI label="Remboursements" val="1.2M F" color={C.rouge} icone="↩" />
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={FINANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: C.texteSec }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip content={<TooltipCustom />} />
                <Line type="monotone" dataKey="transactions" name="Transactions" stroke={C.vert} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function OngletGPS({ settings, setSettings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card>
          <CardHeader titre="🛰️ Paramètres GPS" />
          <CardBody>
            <SliderInput label="Fréquence actualisation" value={settings.gps_freq} onChange={v => setSettings({ ...settings, gps_freq: v })} min={1} max={60} unit="s" sublabel="Intervalle entre chaque position" />
            <SliderInput label="Précision minimale" value={settings.gps_precision} onChange={v => setSettings({ ...settings, gps_precision: v })} min={5} max={100} unit="m" sublabel="Rayon d'erreur GPS acceptable" />
            <SliderInput label="Tolérance géofence" value={settings.gps_geofence} onChange={v => setSettings({ ...settings, gps_geofence: v })} min={50} max={500} unit="m" sublabel="Marge autour de la zone" />
            <SliderInput label="Rayon sécurité" value={settings.gps_rayon} onChange={v => setSettings({ ...settings, gps_rayon: v })} min={100} max={2000} unit="m" sublabel="Alerte si sortie zone" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="🔍 Détection automatique" />
          <CardBody>
            {[
              { key: 'gps_detour', label: 'Détours suspects', sub: `Alert si > ${settings.gps_detour_seuil || 2} km supplémentaires` },
              { key: 'gps_arret', label: 'Arrêts prolongés', sub: `Alerte si > ${settings.gps_arret_min || 15} min immobilisé` },
              { key: 'gps_perte', label: 'Perte signal GPS', sub: 'Alerte immédiate' },
              { key: 'gps_vitesse', label: 'Excès de vitesse', sub: `Alerte si > ${settings.gps_vitesse_max || 80} km/h` },
              { key: 'gps_sortie', label: 'Sortie d\'itinéraire', sub: 'Recalcul automatique' },
              { key: 'gps_teleportation', label: 'Téléportation GPS', sub: 'Détection faux GPS' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key] !== false} onChange={v => setSettings({ ...settings, [item.key]: v })} label={item.label} sublabel={item.sub} />
            ))}
          </CardBody>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader titre="🗺️ Configuration cartes" />
          <CardBody>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.texte, marginBottom: 10 }}>Mode d'affichage par défaut</div>
            {['Standard', 'Satellite', 'Hybride', 'Trafic', 'Heatmap'].map((mode, i) => (
              <div key={i} onClick={() => setSettings({ ...settings, carte_mode: mode })} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: settings.carte_mode === mode ? C.vertClair : C.surface, border: `.5px solid ${settings.carte_mode === mode ? C.vertPrimary : C.border}`, transition: 'all 150ms' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${settings.carte_mode === mode ? C.vertPrimary : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {settings.carte_mode === mode && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.vertPrimary }} />}
                </div>
                <span style={{ fontSize: 13, color: C.texte }}>{mode}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="📊 Statistiques GPS" subtitle="7 derniers jours" />
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <MiniKPI label="Distance suivie" val="4 820 km" icone="📏" color={C.bleu} />
              <MiniKPI label="Incidents" val="7" icone="🚨" color={C.rouge} />
              <MiniKPI label="Alertes totales" val="31" icone="⚠️" color={C.ambre} />
              <MiniKPI label="Précision moy." val="94%" icone="🎯" color={C.vert} />
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={GPS_DATA} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 10, fill: C.texteSec }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="alertes" name="Alertes" fill={C.ambre} radius={[3, 3, 0, 0]} />
                <Bar dataKey="incidents" name="Incidents" fill={C.rouge} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function OngletIA({ settings, setSettings }) {
  const scoreIA = 95;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        <Card>
          <CardHeader titre="🤖 Modules IA actifs" subtitle="Intelligence opérationnelle COLIGO" />
          <CardBody>
            {[
              { key: 'ia_prix', label: 'Estimation prix automatique', sub: 'Tarification dynamique par zone et période', icone: '💰' },
              { key: 'ia_eta', label: 'ETA prédictive', sub: 'Prédiction temps d\'arrivée avec 94% de précision', icone: '⏱️' },
              { key: 'ia_fraude', label: 'Détection fraude IA', sub: 'Analyse comportementale en temps réel', icone: '🛡️' },
              { key: 'ia_route', label: 'Optimisation d\'itinéraire', sub: 'Réduction 15% temps moyen livraison', icone: '🗺️' },
              { key: 'ia_chauffeur', label: 'Analyse comportement chauffeur', sub: 'Score performance et risque automatique', icone: '🚕' },
              { key: 'ia_congestion', label: 'Prédiction congestion', sub: 'Anticipation trafic 2h à l\'avance', icone: '🚦' },
            ].map((item, i) => (
              <Toggle key={i} value={settings[item.key] !== false} onChange={v => setSettings({ ...settings, [item.key]: v })} label={`${item.icone} ${item.label}`} sublabel={item.sub} color={C.lime} />
            ))}
          </CardBody>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <CardHeader titre="🧠 Santé IA globale" />
            <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <HealthRing score={scoreIA} label="Score IA Global" size={90} color={C.lime} />
              <div style={{ background: C.ia, borderRadius: 10, padding: '10px 14px', width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#4ADE80', fontWeight: 600, marginBottom: 4 }}>Modèle v2.4</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>Dernière mise à jour il y a 2 min</div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader titre="⚡ Niveau intelligence" />
            <CardBody>
              {['Basique', 'Avancé', 'Expert'].map((niveau, i) => (
                <div key={i} onClick={() => setSettings({ ...settings, ia_niveau: niveau })} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: settings.ia_niveau === niveau ? C.vertClair : C.surface, border: `.5px solid ${settings.ia_niveau === niveau ? C.vertPrimary : C.border}`, transition: 'all 150ms' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${settings.ia_niveau === niveau ? C.vertPrimary : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {settings.ia_niveau === niveau && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.vertPrimary }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{niveau}</div>
                    <div style={{ fontSize: 10, color: C.texteSec }}>{['Fonctions de base', 'Prédictions avancées', 'IA complète temps réel'][i]}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader titre="📊 Performance IA — Aujourd'hui" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <MiniKPI label="Prédictions" val="3 241" icone="🔮" color={C.violet} />
            <MiniKPI label="Précision" val="94.2%" icone="🎯" color={C.lime} />
            <MiniKPI label="Anomalies" val="127" icone="⚠️" color={C.rouge} />
            <MiniKPI label="Coût économisé" val="2.4M F" icone="💰" color={C.vert} />
            <MiniKPI label="Temps gagné" val="486h" icone="⏱️" color={C.bleu} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function OngletApparence({ settings, setSettings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card>
          <CardHeader titre="🌓 Mode visuel" />
          <CardBody>
            {['Clair', 'Sombre', 'Automatique'].map((mode, i) => (
              <div key={i} onClick={() => setSettings({ ...settings, theme: mode })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 8, background: settings.theme === mode ? C.vertClair : C.surface, border: `.5px solid ${settings.theme === mode ? C.vertPrimary : C.border}`, transition: 'all 150ms' }}>
                <span style={{ fontSize: 22 }}>{['☀️', '🌙', '⚙️'][i]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{mode}</div>
                  <div style={{ fontSize: 11, color: C.texteSec }}>{['Interface claire premium', 'Interface sombre SOC', 'Selon préférences système'][i]}</div>
                </div>
                {settings.theme === mode && <span style={{ fontSize: 14, color: C.vert }}>✓</span>}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="📐 Disposition" />
          <CardBody>
            {['Compact', 'Standard', 'Confort'].map((layout, i) => (
              <div key={i} onClick={() => setSettings({ ...settings, layout })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 8, background: settings.layout === layout ? C.vertClair : C.surface, border: `.5px solid ${settings.layout === layout ? C.vertPrimary : C.border}`, transition: 'all 150ms' }}>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  {Array.from({ length: [3, 2, 1][i] }).map((_, j) => (
                    <div key={j} style={{ width: [6, 8, 12][i], height: 24, borderRadius: 3, background: settings.layout === layout ? C.vert : C.border }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{layout}</div>
                  <div style={{ fontSize: 11, color: C.texteSec }}>{['Maximum d\'informations', 'Équilibré et lisible', 'Aéré et confortable'][i]}</div>
                </div>
                {settings.layout === layout && <span style={{ fontSize: 14, color: C.vert, marginLeft: 'auto' }}>✓</span>}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader titre="🎨 Personnalisation des couleurs" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Couleur principale', key: 'color_primary', val: C.vertPrimary },
              { label: 'Couleur secondaire', key: 'color_secondary', val: C.vertFonce },
              { label: 'Couleur alertes', key: 'color_warning', val: C.ambre },
              { label: 'Couleur succès', key: 'color_success', val: C.vert },
            ].map((c, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '100%', height: 48, borderRadius: 10, background: c.val, marginBottom: 8, cursor: 'pointer', border: `.5px solid ${C.border}`, boxShadow: '0 2px 6px rgba(0,0,0,.1)' }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: C.texte, marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: C.texteSec }}>{c.val}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader titre="👁️ Prévisualisation Dashboard" subtitle="Aperçu en temps réel" />
        <CardBody>
          <div style={{ background: '#0F172A', borderRadius: 12, padding: '16px', display: 'flex', gap: 12, overflow: 'hidden' }}>
            {/* Mini sidebar */}
            <div style={{ width: 48, background: `linear-gradient(180deg, ${C.vertFonce}, ${C.vertPrimary})`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              {['📊', '📦', '🗺️', '👥', '🚕', '💰'].map((icon, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i === 0 ? 'rgba(255,255,255,.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
              ))}
            </div>
            {/* Mini content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                {[C.vert, C.bleu, C.ambre, C.violet].map((color, i) => (
                  <div key={i} style={{ background: `${color}20`, borderRadius: 6, padding: '6px 8px', border: `.5px solid ${color}30` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color }}>{['248', '47', '1.2M', '97%'][i]}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{['Livraisons', 'Chauffeurs', 'Revenus', 'Succès'][i]}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1E293B', borderRadius: 6, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>🗺️ Carte GPS simulée</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function OngletSauvegardes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <Card>
        <CardHeader titre="💾 Dernière sauvegarde" action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📥 Télécharger</button>
            <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: C.vertPrimary, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>💾 Créer maintenant</button>
          </div>
        } />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Date', val: '07/06/2026', icone: '📅' },
              { label: 'Heure', val: '18:42', icone: '⏰' },
              { label: 'Taille', val: '2.4 GB', icone: '💽' },
              { label: 'Par', val: 'Super Admin', icone: '👤' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.vertClair, borderRadius: 10, padding: '12px', border: `.5px solid #BBF7D0`, textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icone}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.texte }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.texteSec }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '9px 16px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📅 Programmer sauvegarde</button>
            <button style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#FFFBEB', color: C.ambre, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↩ Restaurer cette sauvegarde</button>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader titre="📅 Planification automatique" />
          <CardBody>
            {['Tous les jours à 18:42', 'Toutes les semaines (Dimanche)', 'Tous les mois (1er du mois)'].map((p, i) => (
              <div key={i} onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: i === 0 ? C.vertClair : C.surface, border: `.5px solid ${i === 0 ? C.vertPrimary : C.border}`, transition: 'all 150ms' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${i === 0 ? C.vertPrimary : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i === 0 && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.vertPrimary }} />}
                </div>
                <span style={{ fontSize: 13, color: C.texte }}>{p}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader titre="📋 Historique des sauvegardes" />
          <div style={{ overflow: 'auto', maxHeight: 220 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {['Date', 'Par', 'Taille', 'Statut', ''].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: C.texteSec, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAUVEGARDES.map((s, i) => (
                  <tr key={i} style={{ borderBottom: `.5px solid ${C.border}` }}>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: C.texte }}>{s.date}</td>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: C.texteSec }}>{s.user}</td>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: C.texte }}>{s.taille}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: s.statut === 'succes' ? '#DCFCE7' : '#FEE2E2', color: s.statut === 'succes' ? '#15803D' : C.rouge }}>
                        {s.statut === 'succes' ? '✓ OK' : '✕ Erreur'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button style={{ padding: '3px 8px', borderRadius: 6, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 10, cursor: 'pointer' }}>📥</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function SettingsPage() {
  const [onglet, setOnglet] = useState('general');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    // Général
    nom_plateforme: 'COLIGO', email_support: 'support@coligo.app',
    telephone: '+237 233 111 222', site_web: 'https://coligo.app',
    adresse: 'Douala, Cameroun', pays: 'Cameroun', ville: 'Douala',
    // Sécurité
    deux_fa: true, biometrie: false, expiration_session: true,
    deconnexion_auto: true, protection_brute: true,
    mdp_longueur: 8, mdp_expiration: 90, mdp_historique: 5, mdp_special: true,
    // Notifs
    notif_email: true, notif_sms: true, notif_whatsapp: true,
    notif_push: true, notif_telegram: false,
    // Finance
    comm_chauffeur: 10, comm_agence: 8, comm_transaction: 2, comm_escrow: 1,
    escrow_blocage: true, escrow_liberation: true,
    pay_mtn: true, pay_orange: true, pay_carte: false,
    pay_virement: true, pay_paypal: false, pay_especes: true,
    // GPS
    gps_freq: 8, gps_precision: 10, gps_geofence: 150, gps_rayon: 500,
    gps_detour: true, gps_arret: true, gps_perte: true,
    gps_vitesse: true, gps_sortie: true, gps_teleportation: true,
    gps_detour_seuil: 2, gps_arret_min: 15, gps_vitesse_max: 80,
    carte_mode: 'Standard',
    // IA
    ia_prix: true, ia_eta: true, ia_fraude: true,
    ia_route: true, ia_chauffeur: true, ia_congestion: true,
    ia_niveau: 'Expert',
    // Apparence
    theme: 'Clair', layout: 'Standard',
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const ONGLETS = [
    { id: 'general', label: '⚙️ Général' },
    { id: 'securite', label: '🔐 Sécurité' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'finance', label: '💰 Finance' },
    { id: 'gps', label: '🗺️ GPS & Tracking' },
    { id: 'ia', label: '🤖 IA & Analyse' },
    { id: 'apparence', label: '🎨 Apparence' },
    { id: 'sauvegardes', label: '💾 Sauvegardes' },
  ];

  const SERVICES_SANTE = [
    { label: 'API Backend', score: 99.9, color: C.vert },
    { label: 'Base données', score: 100, color: C.vert },
    { label: 'GPS', score: 98.2, color: C.vert },
    { label: 'Paiements', score: 100, color: C.vert },
    { label: 'IA', score: 97.1, color: C.lime },
    { label: 'WebSocket', score: 99.4, color: C.vert },
  ];

  return (
    <div style={{ display: 'flex', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      <style>{`@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {/* Colonne principale */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0 }}>⚙️ Paramètres de la Plateforme</h1>
            <p style={{ fontSize: 12, color: C.texteSec, marginTop: 3 }}>Configuration globale du système COLIGO</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, color: C.texteSec, background: C.surface, padding: '5px 10px', borderRadius: 8, border: `.5px solid ${C.border}` }}>
              💾 Dernière sauvegarde : Aujourd'hui · 18:42
            </div>
            <button style={{ padding: '8px 14px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>📤 Exporter config</button>
            <button style={{ padding: '8px 14px', borderRadius: 10, border: `.5px solid ${C.ambre}`, background: C.ambreClair, color: C.ambre, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↩ Restaurer</button>
            <button onClick={handleSave} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: saved ? C.vert : C.vertPrimary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 300ms', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(22,163,74,.3)' }}>
              {saved ? '✓ Sauvegardé !' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Toast succès */}
        {saved && (
          <div style={{ background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown 300ms ease' }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.vertFonce }}>Configuration sauvegardée avec succès !</span>
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', background: C.surface, borderRadius: 12, padding: 4, border: `.5px solid ${C.border}` }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: onglet === o.id ? 600 : 400, background: onglet === o.id ? C.blanc : 'transparent', color: onglet === o.id ? C.texte : C.texteSec, boxShadow: onglet === o.id ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all 200ms', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu onglets */}
        {onglet === 'general' && <OngletGeneral settings={settings} setSettings={setSettings} />}
        {onglet === 'securite' && <OngletSecurite settings={settings} setSettings={setSettings} />}
        {onglet === 'notifications' && <OngletNotifications settings={settings} setSettings={setSettings} />}
        {onglet === 'finance' && <OngletFinance settings={settings} setSettings={setSettings} />}
        {onglet === 'gps' && <OngletGPS settings={settings} setSettings={setSettings} />}
        {onglet === 'ia' && <OngletIA settings={settings} setSettings={setSettings} />}
        {onglet === 'apparence' && <OngletApparence settings={settings} setSettings={setSettings} />}
        {onglet === 'sauvegardes' && <OngletSauvegardes />}
      </div>

      {/* Panneau latéral droit */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Santé plateforme */}
        <Card>
          <CardHeader titre="💚 Santé plateforme" />
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              {SERVICES_SANTE.map((s, i) => (
                <HealthRing key={i} score={Math.round(s.score)} label={s.label} color={s.color} size={52} />
              ))}
            </div>
            <div style={{ background: C.vertClair, borderRadius: 8, padding: '8px 12px', textAlign: 'center', border: `.5px solid #BBF7D0`, marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.vertFonce }}>✓ Tous les services opérationnels</div>
              <div style={{ fontSize: 10, color: C.texteSec, marginTop: 2 }}>Uptime global : 99.7%</div>
            </div>
          </CardBody>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader titre="📋 Activité récente" />
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {ACTIVITE_RECENTE.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: i < ACTIVITE_RECENTE.length - 1 ? `.5px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icone}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: C.texte, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.action}</div>
                  <div style={{ fontSize: 10, color: C.texteSec, marginTop: 2 }}>{a.user} · {a.heure}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Centre d'aide */}
        <Card>
          <CardHeader titre="❓ Centre d'aide" />
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: '📚 Documentation', desc: 'Guides complets', color: C.bleu, bg: C.bleuClair },
              { label: '🎧 Support', desc: 'Ticket ou chat live', color: C.violet, bg: C.violetClair },
              { label: '🎬 Tutoriels', desc: 'Vidéos pas à pas', color: C.ambre, bg: C.ambreClair },
              { label: '📞 Contact admin', desc: 'admin@coligo.app', color: C.vert, bg: C.vertClair },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: item.bg, border: `.5px solid ${item.color}20`, cursor: 'pointer', transition: 'all 150ms' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: C.texteSec }}>{item.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: item.color }}>→</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Version */}
        <div style={{ background: C.ia, borderRadius: 14, padding: '14px 16px', border: `.5px solid ${C.iaBord}`, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 900, color: '#fff', marginBottom: 4 }}>COLI<span style={{ color: '#4ADE80' }}>GO</span><span style={{ color: C.lime }}>⚡</span></div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>Version 2.4.1 · Build 20260607</div>
          <div style={{ display: 'flex', justify: 'center', gap: 6, justifyContent: 'center' }}>
            {['✓ Stable', '🔐 Sécurisé', '⚡ IA Active'].map((tag, i) => (
              <span key={i} style={{ fontSize: 9, background: 'rgba(74,222,128,.15)', color: '#4ADE80', padding: '2px 7px', borderRadius: 20 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}