// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import { apiCall } from '../../hooks/useApiClient';
import { API } from '../../api';

function formatMontant(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' F';
}

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

const PERIODES = ["Aujourd'hui", 'Cette semaine', 'Ce mois', 'Ce trimestre', 'Cette année'];

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

function KPICard({ label, valeur, icone, bg, color, tendance, sous }) {
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,.04)', transition: 'all 200ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icone}</div>
        {tendance !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: tendance >= 0 ? '#DCFCE7' : '#FEE2E2', color: tendance >= 0 ? '#15803D' : '#B91C1C' }}>
            {tendance >= 0 ? '↑' : '↓'} {Math.abs(tendance)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.texte, lineHeight: 1 }}>{valeur}</div>
      <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      {sous && <div style={{ fontSize: 11, color: C.vert, marginTop: 3 }}>{sous}</div>}
    </div>
  );
}

function SectionHeader({ titre, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>{titre}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function ExportMenu({ stats, periode, onglet }) {
  const [open, setOpen] = useState(false);

  function imprimerRapport() {
    setOpen(false);
    const titre = {
      operationnel: 'Rapport Opérationnel',
      financier: 'Rapport Financier',
      chauffeurs: 'Rapport Chauffeurs',
      clients: 'Rapport Clients',
      fraude: 'Rapport Candidatures',
    }[onglet] || 'Rapport COLIGO';

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const rev = stats?.revenus || {};
    const exp = stats?.expeditions || {};
    const cl = stats?.clients || {};
    const ch = stats?.chauffeurs || {};

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${titre} — COLIGO</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 40px; }
          .header { background: linear-gradient(135deg, #14532D, #22C55E); color: #fff; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
          .header h1 { font-size: 26px; font-weight: 900; margin-bottom: 6px; }
          .header p { font-size: 13px; opacity: .8; }
          .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
          .kpi .val { font-size: 22px; font-weight: 800; color: #14532D; }
          .kpi .lbl { font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: .04em; }
          .section { margin-bottom: 24px; }
          .section h2 { font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #22C55E; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f0fdf4; padding: 10px 12px; font-size: 11px; font-weight: 600; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: .04em; }
          td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .badge-vert { background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
          .badge-bleu { background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
          .badge-ambre { background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>COLIGO ⚡ — ${titre}</h1>
          <p>Période : ${periode} · Généré le ${dateStr} · Données réelles</p>
        </div>

        <div class="kpis">
          <div class="kpi">
            <div class="val">${(exp.livrees || 0) + (exp.en_cours || 0) + (exp.en_attente || 0)}</div>
            <div class="lbl">Expéditions totales</div>
          </div>
          <div class="kpi">
            <div class="val">${exp.livrees || 0}</div>
            <div class="lbl">Livrées</div>
          </div>
          <div class="kpi">
            <div class="val">${cl.total || 0}</div>
            <div class="lbl">Clients</div>
          </div>
          <div class="kpi">
            <div class="val">${ch.actifs || 0} / ${ch.total || 0}</div>
            <div class="lbl">Chauffeurs actifs</div>
          </div>
          <div class="kpi">
            <div class="val">${new Intl.NumberFormat('fr-FR').format(Math.round(rev.total || 0))} F</div>
            <div class="lbl">Revenus totaux</div>
          </div>
          <div class="kpi">
            <div class="val">${new Intl.NumberFormat('fr-FR').format(Math.round(rev.commissions_total || 0))} F</div>
            <div class="lbl">Commissions</div>
          </div>
          <div class="kpi">
            <div class="val">${exp.en_attente || 0}</div>
            <div class="lbl">En attente</div>
          </div>
          <div class="kpi">
            <div class="val">${exp.en_cours || 0}</div>
            <div class="lbl">En cours</div>
          </div>
        </div>

        <div class="section">
          <h2>📦 Détail des expéditions</h2>
          <table>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Nombre</th>
                <th>Proportion</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { label: 'Livrées', val: exp.livrees || 0, badge: 'vert' },
                { label: 'En cours', val: exp.en_cours || 0, badge: 'bleu' },
                { label: 'En attente chauffeur', val: exp.en_attente || 0, badge: 'ambre' },
              ].map(r => {
                const total = (exp.livrees || 0) + (exp.en_cours || 0) + (exp.en_attente || 0);
                const pct = total > 0 ? Math.round(r.val / total * 100) : 0;
                return `<tr><td><span class="badge-${r.badge}">${r.label}</span></td><td>${r.val}</td><td>${pct}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>💰 Résumé financier</h2>
          <table>
            <thead>
              <tr><th>Indicateur</th><th>Montant</th></tr>
            </thead>
            <tbody>
              ${[
                { label: 'Revenus totaux plateforme', val: rev.total || 0 },
                { label: "Revenus aujourd'hui", val: rev.aujourd_hui || 0 },
                { label: 'Revenus cette période', val: rev.cette_periode || 0 },
                { label: 'Commissions COLIGO (10%)', val: rev.commissions_total || 0 },
              ].map(r => `<tr><td>${r.label}</td><td><strong>${new Intl.NumberFormat('fr-FR').format(Math.round(r.val))} F</strong></td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>👥 Clients & Chauffeurs</h2>
          <table>
            <thead>
              <tr><th>Indicateur</th><th>Valeur</th></tr>
            </thead>
            <tbody>
              <tr><td>Total clients</td><td>${cl.total || 0}</td></tr>
              <tr><td>Clients inscrits</td><td>${cl.total_inscrits || 0}</td></tr>
              <tr><td>Connectés aujourd'hui</td><td>${cl.connectes_aujourd_hui || 0}</td></tr>
              <tr><td>Total chauffeurs</td><td>${ch.total || 0}</td></tr>
              <tr><td>Chauffeurs actifs</td><td>${ch.actifs || 0}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          © ${now.getFullYear()} COLIGO · Rapport généré automatiquement le ${dateStr} · Confidentiel
        </div>

        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ padding: '7px 14px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        📥 Exporter <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 38, background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 100, minWidth: 200, overflow: 'hidden' }}>
          <div onClick={imprimerRapport} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: `.5px solid ${C.border}` }}
            onMouseEnter={e => e.currentTarget.style.background = C.surface}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18 }}>🖨️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>Imprimer / PDF</div>
              <div style={{ fontSize: 10, color: C.texteMuted }}>Rapport complet formaté</div>
            </div>
          </div>
          {[
            { icone: '📊', label: 'Export Excel', desc: 'Données brutes (.xlsx)' },
            { icone: '📋', label: 'Export CSV', desc: 'Format universel (.csv)' },
          ].map((item, i) => (
            <div key={i} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: i < 1 ? `.5px solid ${C.border}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = C.surface}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 18 }}>{item.icone}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.texte }}>{item.label}</div>
                <div style={{ fontSize: 10, color: C.texteMuted }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ONGLETS ───────────────────────────────────────────────────

function OngletOperationnel({ stats }) {
  const exp = stats?.expeditions || {};
  const graph = stats?.expeditions_graph || [];

  const livraisons_mois = graph.map(g => ({
    mois: g.date,
    terminees: g.livrees || 0,
    annulees: 0,
    retard: 0,
    creees: g.total || 0,
  }));

  const statuts_repartition = [
    { name: 'Livrées', value: exp.livrees || 0, color: C.vert },
    { name: 'En cours', value: exp.en_cours || 0, color: C.bleu },
    { name: 'En attente', value: exp.en_attente || 0, color: C.ambre },
  ];

  const total = statuts_repartition.reduce((s, v) => s + v.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[
          { label: "Aujourd'hui", val: exp.aujourd_hui ?? 0, icone: '📅', bg: C.violetClair, color: C.violet },
          { label: 'Livrées', val: exp.livrees ?? 0, icone: '✅', bg: C.vertClair, color: C.vert },
          { label: 'En cours', val: exp.en_cours ?? 0, icone: '🔄', bg: C.bleuClair, color: C.bleu },
          { label: 'En attente', val: exp.en_attente ?? 0, icone: '⏳', bg: C.ambreClair, color: C.ambre },
          { label: 'Cette période', val: exp.cette_periode ?? 0, icone: '📦', bg: C.cyanClair, color: C.cyan },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
          <SectionHeader titre="📦 Évolution des expéditions — 7 jours" />
          {livraisons_mois.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={livraisons_mois} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.texteMuted }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="terminees" name="Livrées" fill={C.vert} radius={[4, 4, 0, 0]} />
                <Bar dataKey="creees" name="Total créées" fill={C.bleu} radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.texteMuted, fontSize: 13 }}>
              Aucune donnée disponible pour cette période
            </div>
          )}
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
          <SectionHeader titre="Répartition statuts" />
          {total > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statuts_repartition} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {statuts_repartition.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 8 }}>
                {statuts_repartition.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.texte, flex: 1 }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.texteMuted, fontSize: 13 }}>
              Aucune expédition
            </div>
          )}
        </div>
      </div>

      {/* Évolution inscriptions */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
        <SectionHeader titre="📈 Inscriptions clients & chauffeurs — 7 jours" />
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={stats?.inscriptions_graph || []}>
            <defs>
              <linearGradient id="gCli" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.bleu} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.bleu} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gChauf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.vert} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.vert} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.texteMuted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipCustom />} />
            <Area type="monotone" dataKey="clients" name="Clients" stroke={C.bleu} strokeWidth={2} fill="url(#gCli)" />
            <Area type="monotone" dataKey="chauffeurs" name="Chauffeurs" stroke={C.vert} strokeWidth={2} fill="url(#gChauf)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OngletFinancier({ stats }) {
  const rev = stats?.revenus || {};

  const revenus_graph = (stats?.expeditions_graph || []).map(g => ({
    mois: g.date,
    revenus: 0,
    commissions: 0,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Revenus totaux', val: formatMontant(rev.total), icone: '💰', bg: C.vertClair, color: C.vert },
          { label: "Revenus aujourd'hui", val: formatMontant(rev.aujourd_hui), icone: '📈', bg: C.bleuClair, color: C.bleu },
          { label: 'Revenus période', val: formatMontant(rev.cette_periode), icone: '📊', bg: C.limeClair, color: C.lime },
          { label: 'Commissions totales', val: formatMontant(rev.commissions_total), icone: '⚡', bg: C.ambreClair, color: C.ambre },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
        <SectionHeader titre="💰 Évolution des revenus — 7 jours" />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenus_graph}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.vert} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.vert} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.texteMuted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipCustom />} />
            <Area type="monotone" dataKey="revenus" name="Revenus" stroke={C.vert} strokeWidth={2} fill="url(#gRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>⚡ Résumé financier réel</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Total revenus', val: formatMontant(rev.total), desc: 'Depuis le début' },
            { label: "Revenus aujourd'hui", val: formatMontant(rev.aujourd_hui), desc: 'Journée en cours' },
            { label: 'Commissions COLIGO', val: formatMontant(rev.commissions_total), desc: '10% du CA' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OngletChauffeurs({ stats, drivers }) {
  const ch = stats?.chauffeurs || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total chauffeurs', val: ch.total ?? 0, icone: '🚕', bg: C.vertClair, color: C.vert },
          { label: 'Actifs', val: ch.actifs ?? 0, icone: '✓', bg: C.bleuClair, color: C.bleu },
          { label: "Inscrits aujourd'hui", val: ch.aujourd_hui ?? 0, icone: '🆕', bg: C.violetClair, color: C.violet },
          { label: 'Cette période', val: ch.cette_periode ?? 0, icone: '📊', bg: C.ambreClair, color: C.ambre },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🏆 Chauffeurs enregistrés</span>
          <ExportMenu stats={stats} periode={periode} onglet={onglet} />
        </div>
        {drivers.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🚕</div>
            <div style={{ fontSize: 14 }}>Aucun chauffeur enregistré</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['Rang', 'Chauffeur', 'ID', 'Missions', 'Note', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.slice(0, 10).map((c, i) => (
                <tr key={i} style={{ borderBottom: `.5px solid ${C.border}`, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', fontSize: 14 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom || c.first_name}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{c.nom || `${c.first_name || ''} ${c.last_name || ''}`.trim()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontFamily: 'monospace', color: C.vert, fontWeight: 600 }}>{c.driver_id || c.driver_unique_id || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: C.texte, textAlign: 'center' }}>{c.nb_courses || c.missions || 0}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12 }}>⭐ {c.note_moyenne || c.note || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: c.statut === 'actif' ? C.vertClair : '#FEF2F2', color: c.statut === 'actif' ? C.vert : C.rouge }}>
                      {c.statut || 'actif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function OngletClients({ stats, clients }) {
  const cl = stats?.clients || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total clients', val: cl.total ?? 0, icone: '👥', bg: C.bleuClair, color: C.bleu },
          { label: 'Inscrits total', val: cl.total_inscrits ?? 0, icone: '📝', bg: C.vertClair, color: C.vert },
          { label: "Inscrits aujourd'hui", val: cl.aujourd_hui ?? 0, icone: '🆕', bg: C.violetClair, color: C.violet },
          { label: 'Connectés aujourd\'hui', val: cl.connectes_aujourd_hui ?? 0, icone: '🟢', bg: C.limeClair, color: C.lime },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.texte }}>🏆 Clients enregistrés</span>
          <ExportMenu stats={stats} periode={periode} onglet={onglet} />
        </div>
        {clients.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.texteMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
            <div style={{ fontSize: 14 }}>Aucun client enregistré</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['Rang', 'Client', 'Email', 'Ville', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: C.texteMuted, textAlign: 'left', borderBottom: `.5px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 10).map((c, i) => {
                const nom = c.nom || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email;
                return (
                  <tr key={i} style={{ borderBottom: `.5px solid ${C.border}`, transition: 'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontSize: 14 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${nom}&backgroundColor=1d4ed8&textColor=ffffff`} alt="avatar" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.texte }}>{nom}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texteMuted }}>{c.email || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: C.texte }}>{c.ville || c.city || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: C.vertClair, color: C.vert }}>Actif</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function OngletFraudeIA({ stats }) {
  const cand = stats?.candidatures || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Candidatures en attente', val: cand.en_attente ?? 0, icone: '⏳', bg: C.ambreClair, color: C.ambre },
          { label: 'En vérification', val: cand.en_verification ?? 0, icone: '🔍', bg: C.bleuClair, color: C.bleu },
          { label: 'Validées', val: cand.validees ?? 0, icone: '✅', bg: C.vertClair, color: C.vert },
          { label: 'Rejetées', val: cand.rejetees ?? 0, icone: '❌', bg: C.rougeClair, color: C.rouge },
        ].map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: 12, color: '#4ADE80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>⚡ Statut candidatures chauffeurs</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'En attente', val: cand.en_attente ?? 0, desc: 'À traiter' },
            { label: 'En vérification', val: cand.en_verification ?? 0, desc: 'En cours' },
            { label: 'Validées', val: cand.validees ?? 0, desc: 'Approuvées' },
            { label: 'Rejetées', val: cand.rejetees ?? 0, desc: 'Refusées' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique évolution expéditions */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
        <SectionHeader titre="📊 Évolution expéditions — 7 jours" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats?.expeditions_graph || []} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.texteMuted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipCustom />} />
            <Bar dataKey="total" name="Total" fill={C.bleu} radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="livrees" name="Livrées" fill={C.vert} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function ReportsPage() {
  const [onglet, setOnglet] = useState('operationnel');
  const [periode, setPeriode] = useState('Ce mois');
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall(API.STATS),
      apiCall(API.CLIENTS).catch(() => ({ results: [] })),
      apiCall(API.DRIVERS).catch(() => ({ results: [] })),
    ]).then(([statsData, clientsData, driversData]) => {
      setStats(statsData);
      const cl = Array.isArray(clientsData) ? clientsData : clientsData.results || clientsData.clients || [];
      const dr = Array.isArray(driversData) ? driversData : driversData.results || driversData.drivers || [];
      setClients(cl);
      setDrivers(dr);
    }).catch(err => console.error('Reports error:', err))
      .finally(() => setLoading(false));
  }, []);

  const ONGLETS = [
    { id: 'operationnel', label: '📦 Opérationnel' },
    { id: 'financier', label: '💰 Financier' },
    { id: 'chauffeurs', label: '🚕 Chauffeurs' },
    { id: 'clients', label: '👥 Clients' },
    { id: 'fraude', label: '🛡️ Candidatures' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 14, color: C.texteMuted }}>Chargement des rapports...</div>
    </div>
  );

  const exp = stats?.expeditions || {};
  const rev = stats?.revenus || {};
  const cl = stats?.clients || {};
  const ch = stats?.chauffeurs || {};

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.texte, margin: 0 }}>📋 Centre de Reporting</h1>
          <p style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>Business Intelligence · Analyse · Données réelles</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportMenu stats={stats} periode={periode} onglet={onglet} />
         <ExportMenu stats={stats} periode={periode} onglet={onglet} />
        </div>
      </div>

      {/* KPI GLOBAUX RÉELS */}
      <div style={{ background: C.ia, borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>TABLEAU DE BORD GLOBAL</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Vue d'ensemble — Données réelles</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['Ce mois', 'Ce trimestre', 'Cette année'].map(p => (
              <button key={p} onClick={() => setPeriode(p)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: periode === p ? 'rgba(255,255,255,.15)' : 'transparent', color: periode === p ? '#fff' : 'rgba(255,255,255,.5)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16 }}>
          {[
            { label: 'Rev. totaux', val: formatMontant(rev.total), color: '#4ADE80' },
            { label: "Rev. aujourd'hui", val: formatMontant(rev.aujourd_hui), color: '#4ADE80' },
            { label: 'Exp. total', val: (exp.livrees || 0) + (exp.en_cours || 0) + (exp.en_attente || 0), color: C.bleu },
            { label: 'Chauffeurs actifs', val: ch.actifs ?? 0, color: '#4ADE80' },
            { label: 'Clients total', val: cl.total ?? 0, color: C.cyan },
            { label: 'Exp. livrées', val: exp.livrees ?? 0, color: '#4ADE80' },
            { label: 'En cours', val: exp.en_cours ?? 0, color: C.violet },
            { label: 'En attente', val: exp.en_attente ?? 0, color: C.ambre },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.color, lineHeight: 1.2 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTRES */}
      <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.texteMuted }}>Période :</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODES.map(p => (
            <button key={p} onClick={() => setPeriode(p)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: periode === p ? C.vert : C.surface, color: periode === p ? '#fff' : C.texteMuted }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: onglet === o.id ? C.vert : C.blanc, color: onglet === o.id ? '#fff' : C.texteMuted, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all 150ms' }}>
            {o.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <ExportMenu stats={stats} periode={periode} onglet={onglet} />
        </div>
      </div>

      {/* CONTENU */}
      {onglet === 'operationnel' && <OngletOperationnel stats={stats} />}
      {onglet === 'financier' && <OngletFinancier stats={stats} />}
      {onglet === 'chauffeurs' && <OngletChauffeurs stats={stats} drivers={drivers} />}
      {onglet === 'clients' && <OngletClients stats={stats} clients={clients} />}
      {onglet === 'fraude' && <OngletFraudeIA stats={stats} />}
    </div>
  );
}