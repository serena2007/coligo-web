// src/utils/exportRapport.js
// Helper générique pour imprimer/exporter un rapport formaté dans une nouvelle fenêtre.

export function formatMontantExport(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' F';
}

/**
 * Ouvre une fenêtre d'impression avec un rapport formaté COLIGO.
 *
 * config = {
 *   titre: string,                  // ex: "Rapport Expéditions"
 *   sousTitre?: string,              // ex: "12 expéditions · Filtre: En cours"
 *   kpis: [{ label, val }],          // cartes résumé en haut
 *   sections: [
 *     {
 *       titre: string,               // ex: "📦 Détail des expéditions"
 *       colonnes: [string],          // en-têtes de colonnes
 *       lignes: [[cellule, cellule, ...]], // données ligne par ligne (déjà formatées en string/HTML)
 *     }
 *   ]
 * }
 */
export function imprimerRapport(config) {
  const { titre, sousTitre, kpis = [], sections = [] } = config;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const heureStr = now.toLocaleTimeString('fr-FR');

  const kpisHtml = kpis.map(k => `
    <div class="kpi">
      <div class="val">${k.val}</div>
      <div class="lbl">${k.label}</div>
    </div>
  `).join('');

  const sectionsHtml = sections.map(s => `
    <div class="section">
      <h2>${s.titre}</h2>
      <table>
        <thead>
          <tr>${s.colonnes.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${s.lignes.length === 0
            ? `<tr><td colspan="${s.colonnes.length}" style="text-align:center;color:#94a3b8;padding:20px;">Aucune donnée</td></tr>`
            : s.lignes.map(ligne => `<tr>${ligne.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')
          }
        </tbody>
      </table>
    </div>
  `).join('');

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
        .badge-rouge { background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
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
        <p>${sousTitre ? sousTitre + ' · ' : ''}Généré le ${dateStr} à ${heureStr} · Données réelles</p>
      </div>

      ${kpis.length > 0 ? `<div class="kpis">${kpisHtml}</div>` : ''}

      ${sectionsHtml}

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