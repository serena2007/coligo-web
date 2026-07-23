// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
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
  dark: '#060d06',
};

// ── DONNÉES MOCK ──────────────────────────────────────────────

const CHAUFFEURS_LIVE = [
 
];

const REVENUS_DATA = [
  
];

const REVENUS_30J = [
 
];

const LIVRAISONS_DATA = [
  
];

const NOTIFS = [
  // { id: 1, type: 'critique', icone: '🚨', texte: 'T-033 — Signal GPS perdu · Zone Bonaberi', heure: '14:52', lue: false },
  // { id: 2, type: 'alerte', icone: '⏰', texte: 'EXP-004 en retard de 18 min · Client alerté', heure: '14:38', lue: false },
  // { id: 3, type: 'fraude', icone: '🛡️', texte: 'Détour suspect détecté — T-033 (+8.3 km)', heure: '14:42', lue: false },
  // { id: 4, type: 'succes', icone: '✅', texte: 'EXP-001 livrée avec succès — Paul Nguema', heure: '14:05', lue: true },
  // { id: 5, type: 'info', icone: '💰', texte: 'Retrait RET-002 approuvé — 25 000 F', heure: '13:50', lue: true },
];

const IA_INSIGHTS = [
  // { icone: '📈', titre: 'Hausse prévue +18%', texte: 'Demande en hausse prévue ce week-end dans la zone Akwa. Activer 4 chauffeurs supplémentaires recommandé.', color: C.vert, tag: 'Prévision' },
  // { icone: '⏱️', titre: 'Retards prévisibles', texte: 'Congestion détectée axe Ndokotti-Bassa 17h-19h. Rerouter T-027 et T-041 via Bonaberi.', color: C.ambre, tag: 'Trafic' },
  // { icone: '⚡', titre: 'Optimisation flotte', texte: 'T-011 disponible depuis 42 min zone haute demande. Affecter aux 3 expéditions en attente.', color: C.bleu, tag: 'Flotte' },
  // { icone: '🛡️', titre: 'Risque fraude élevé', texte: 'T-033 présente comportement GPS anormal (3ème occurrence). Suspension préventive recommandée.', color: C.rouge, tag: 'Sécurité' },
];

const ZONES_ACTIVES = [
  
];

const ROLES_DASHBOARD = {
  
};

// ── COMPOSANTS ────────────────────────────────────────────────

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <div style={{ fontSize: 11, color: C.texteMuted, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000 ? `${(p.value/1000).toFixed(0)}K F` : p.value}
        </div>
      ))}
    </div>
  );
}

function KPICard({ label, valeur, icone, bg, color, tendance, sous, blink }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', boxShadow: hov ? '0 8px 24px rgba(0,0,0,.09)' : '0 2px 8px rgba(0,0,0,.04)', transition: 'all 220ms ease', transform: hov ? 'translateY(-2px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icone}</div>
        {tendance !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: tendance >= 0 ? '#DCFCE7' : '#FEE2E2', color: tendance >= 0 ? '#15803D' : '#B91C1C' }}>
            {tendance >= 0 ? '↑' : '↓'}{Math.abs(tendance)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.texte, lineHeight: 1, animation: blink ? 'pulse 2s infinite' : 'none' }}>{valeur}</div>
      <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      {sous && <div style={{ fontSize: 10, color: C.vert, marginTop: 2 }}>{sous}</div>}
    </div>
  );
}

// ── CARTE GPS PRINCIPALE ──────────────────────────────────────

function CarteGPSPrincipal({ chauffeurs, selectedChauffeur, onSelect, vueMode, controlRoom }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(chauffeurs.map(c => ({ ...c })));
  const tick = useRef(0);

  const colorFor = s => ({ disponible: C.vert, en_mission: C.bleu, retard: C.ambre, incident: C.rouge }[s] || C.vert);

  useEffect(() => {
    const iv = setInterval(() => {
      posRef.current = posRef.current.map(c => {
        if (c.statut === 'en_mission') {
          const a = (c.cap * Math.PI) / 180;
          return { ...c, lat: Math.max(.05, Math.min(.93, c.lat + Math.cos(a) * .0012)), lng: Math.max(.05, Math.min(.93, c.lng + Math.sin(a) * .0012)) };
        }
        return c;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const t = tick.current;

      // Fond
      ctx.fillStyle = vueMode === 'heatmap' ? '#0a1a0a' : '#0a0f0a';
      ctx.fillRect(0, 0, W, H);

      // Grille
      ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 55) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 55) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Routes
      const roads = [
        { pts:[[.05,.50],[.25,.42],[.45,.45],[.65,.48],[.85,.42],[.95,.45]], w:3.5, a:.18 },
        { pts:[[.50,.05],[.45,.25],[.48,.45],[.52,.65],[.48,.85],[.50,.95]], w:3, a:.15 },
        { pts:[[.10,.20],[.30,.30],[.50,.25],[.70,.28],[.88,.20]], w:2, a:.10 },
        { pts:[[.15,.80],[.35,.72],[.55,.75],[.72,.68],[.88,.72]], w:2, a:.10 },
        { pts:[[.05,.50],[.15,.65],[.25,.70],[.35,.72]], w:1.5, a:.07 },
        { pts:[[.65,.48],[.72,.55],[.76,.23]], w:1.5, a:.07 },
      ];
      roads.forEach(r => {
        ctx.strokeStyle = `rgba(255,255,255,${r.a})`; ctx.lineWidth = r.w;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); r.pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(x*W,y*H) : ctx.lineTo(x*W,y*H)); ctx.stroke();
      });

      // Heatmap zones actives
      if (vueMode === 'heatmap' || vueMode === 'normal') {
        ZONES_ACTIVES.forEach(z => {
          const grad = ctx.createRadialGradient(z.x*W, z.y*H, 0, z.x*W, z.y*H, z.r * (vueMode === 'heatmap' ? 1.4 : 1));
          grad.addColorStop(0, `rgba(34,197,94,${z.intensite * (vueMode === 'heatmap' ? .35 : .15)})`);
          grad.addColorStop(1, 'rgba(34,197,94,0)');
          ctx.beginPath(); ctx.arc(z.x*W, z.y*H, z.r * (vueMode === 'heatmap' ? 1.4 : 1), 0, Math.PI*2);
          ctx.fillStyle = grad; ctx.fill();
        });
      }

      // Zone incident
      const pulse = .3 + .3 * Math.sin(t * .06);
      ctx.strokeStyle = `rgba(239,68,68,${.2 + pulse*.3})`; ctx.lineWidth = 1.5;
      ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.arc(.76*W, .23*H, 32 + pulse*8, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);

      // Trails
      posRef.current.forEach(c => {
        if (c.trail?.length > 1) {
          ctx.strokeStyle = colorFor(c.statut) + '35'; ctx.lineWidth = 2; ctx.setLineDash([3,4]);
          ctx.beginPath(); c.trail.forEach(([x,y],i) => i===0 ? ctx.moveTo(x*W,y*H) : ctx.lineTo(x*W,y*H));
          ctx.lineTo(c.lat*W, c.lng*H); ctx.stroke(); ctx.setLineDash([]);
        }
      });

      // Marqueurs chauffeurs
      posRef.current.forEach(c => {
        const x = c.lat*W, y = c.lng*H;
        const col = colorFor(c.statut);
        const isSel = selectedChauffeur?.id === c.id;
        const p = .4 + .6 * Math.abs(Math.sin(t*.035 + c.id*1.2));

        // Glow
        const ggrad = ctx.createRadialGradient(x,y,0,x,y,isSel?30:20);
        ggrad.addColorStop(0, col+'28'); ggrad.addColorStop(1, col+'00');
        ctx.beginPath(); ctx.arc(x,y,isSel?30:20,0,Math.PI*2); ctx.fillStyle=ggrad; ctx.fill();

        // Sélection ring
        if (isSel) { ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); }

        // Pulse
        if (c.statut!=='disponible') {
          ctx.beginPath(); ctx.arc(x,y,11+p*5,0,Math.PI*2);
          ctx.strokeStyle=col+(Math.floor(p*60+30)).toString(16).padStart(2,'0'); ctx.lineWidth=1; ctx.stroke();
        }

        // Marqueur principal
        ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
        ctx.fillStyle='#fff'; ctx.font='bold 8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(c.statut==='en_mission'?'▶':c.statut==='incident'?'!':'●', x, y);

        // Label
        const lw = 52;
        ctx.fillStyle='rgba(0,0,0,.82)';
        if (ctx.roundRect) ctx.roundRect(x-lw/2, y+12, lw, 13, 3); else ctx.rect(x-lw/2,y+12,lw,13);
        ctx.fill(); ctx.fillStyle=col; ctx.font='bold 7px Inter';
        ctx.fillText(c.driver_id, x, y+18.5);

        // Flèche cap si en mouvement
        if (c.statut==='en_mission' && c.vitesse>0) {
          const a=(c.cap*Math.PI)/180, len=20;
          ctx.strokeStyle=col+'CC'; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*len, y+Math.sin(a)*len); ctx.stroke();
          ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x+Math.cos(a)*len, y+Math.sin(a)*len, 2.5,0,Math.PI*2); ctx.fill();
        }
      });

      // Labels zones
      if (vueMode === 'heatmap') {
        ZONES_ACTIVES.forEach(z => {
          ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
          ctx.fillText(z.nom, z.x*W, z.y*H - z.r - 5);
        });
      }

      tick.current++;
    };

    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [chauffeurs, selectedChauffeur, vueMode]);

  const handleClick = useCallback(e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const W = canvas.width, H = canvas.height;
    let hit = null;
    posRef.current.forEach(c => {
      if (Math.sqrt((mx - c.lat*W)**2 + (my - c.lng*H)**2) < 18) hit = chauffeurs.find(ch => ch.id===c.id);
    });
    onSelect(hit);
  }, [chauffeurs, onSelect]);

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:C.dark }}>
      <canvas ref={canvasRef} width={1200} height={800} onClick={handleClick}
        style={{ width:'100%', height:'100%', display:'block', cursor:'crosshair' }} />

      {/* Badge LIVE */}
      <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,.72)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'5px 12px', backdropFilter:'blur(8px)' }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:C.vert, animation:'blink 2s infinite', boxShadow:`0 0 6px ${C.vert}` }} />
        <span style={{ fontSize:11, color:'#fff', fontWeight:600 }}>GPS LIVE · Douala</span>
      </div>

      {/* Légende */}
      <div style={{ position:'absolute', bottom:12, left:12, display:'flex', gap:6, flexWrap:'wrap' }}>
        {[{s:'disponible',l:'Disponible'},{s:'en_mission',l:'En mission'},{s:'retard',l:'Retard'},{s:'incident',l:'Incident'}].map(i => {
          const col = ({disponible:C.vert,en_mission:C.bleu,retard:C.ambre,incident:C.rouge})[i.s];
          return <div key={i.s} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(0,0,0,.7)', padding:'4px 10px', borderRadius:20, backdropFilter:'blur(8px)' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:col }} />
            <span style={{ fontSize:10, color:'#fff', fontWeight:500 }}>{i.l}</span>
          </div>;
        })}
      </div>

      {/* Zoom */}
      <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:5 }}>
        {['+','−'].map((b,i) => (
          <button key={i} style={{ width:32, height:32, borderRadius:8, background:'rgba(0,0,0,.7)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', fontSize:18, cursor:'pointer', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{b}</button>
        ))}
      </div>
    </div>
  );
}

// ── PANNEAU CHAUFFEUR SÉLECTIONNÉ ─────────────────────────────

function PanneauChauffeur({ c, onClose }) {
  if (!c) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:C.texteMuted, padding:20, textAlign:'center' }}>
      <div style={{ fontSize:36 }}>🗺️</div>
      <div style={{ fontSize:13, fontWeight:500 }}>Cliquez sur un véhicule</div>
      <div style={{ fontSize:11 }}>pour voir les informations</div>
    </div>
  );

  const statCol = ({disponible:C.vert,en_mission:C.bleu,retard:C.ambre,incident:C.rouge})[c.statut]||C.vert;
  const statLbl = ({disponible:'Disponible',en_mission:'En mission',retard:'Retard',incident:'Incident'})[c.statut]||c.statut;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <div style={{ padding:'14px 16px', borderBottom:`.5px solid ${C.border}`, background:c.statut==='incident'?'#FEF2F2':c.statut==='retard'?'#FFFBEB':C.blanc, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar"
              style={{ width:40, height:40, borderRadius:'50%', border:`2px solid ${statCol}` }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.texte }}>{c.nom}</div>
              <div style={{ fontSize:11, color:C.vert, fontFamily:'monospace', fontWeight:600 }}>{c.driver_id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.surface, border:`.5px solid ${C.border}`, borderRadius:7, padding:'4px 8px', cursor:'pointer', fontSize:14, color:C.texteMuted }}>✕</button>
        </div>
        <span style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, background:`${statCol}20`, color:statCol, display:'inline-flex', alignItems:'center', gap:5 }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:statCol }} />{statLbl}
        </span>
      </div>

      <div style={{ padding:'12px 16px', flex:1 }}>
        {[
          { l:'Plaque', v:c.plaque },
          { l:'Vitesse', v:c.vitesse>0?`${c.vitesse} km/h`:'À l\'arrêt' },
          { l:'Mission', v:c.mission||'—' },
          { l:'ETA', v:c.eta||'—', highlight:c.statut==='retard' },
          { l:'Note', v:`⭐ ${c.note}` },
        ].map((r,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`.5px solid ${C.border}` }}>
            <span style={{ fontSize:11, color:C.texteMuted }}>{r.l}</span>
            <span style={{ fontSize:11, fontWeight:600, color:r.highlight?C.rouge:C.texte }}>{r.v}</span>
          </div>
        ))}

        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
          <button style={{ padding:'8px', borderRadius:9, border:'none', background:C.bleuClair, color:C.bleu, fontWeight:600, cursor:'pointer', fontSize:11 }}>📞 Appeler</button>
          <button style={{ padding:'8px', borderRadius:9, border:'none', background:C.vertClair, color:C.vertFonce, fontWeight:600, cursor:'pointer', fontSize:11 }}>💬 Message</button>
          {c.statut==='incident'&&<button style={{ padding:'8px', borderRadius:9, border:'none', background:'#FEF2F2', color:C.rouge, fontWeight:700, cursor:'pointer', fontSize:11 }}>🚨 Signaler</button>}
        </div>
      </div>
    </div>
  );
}

// ── MODE CONTROL CENTER ───────────────────────────────────────

function ControlCenter({ chauffeurs, onExit, selectedChauffeur, onSelect }) {
  const [time, setTime] = useState(new Date());
  const [vueMode, setVueMode] = useState('normal');
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const alertes = NOTIFS.filter(n => n.type==='critique'||n.type==='fraude');

  return (
    <div style={{ position:'fixed', inset:0, background:C.dark, zIndex:1000, display:'flex', flexDirection:'column', fontFamily:'Inter,sans-serif' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} } @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} } @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.05)} }`}</style>

      {/* Header CC */}
      <div style={{ height:56, background:'linear-gradient(90deg, rgba(5,46,22,.97), rgba(0,0,0,.92))', borderBottom:'1px solid rgba(74,222,128,.12)', display:'flex', alignItems:'center', padding:'0 22px', gap:20, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.vert, animation:'blink 1.5s infinite', boxShadow:`0 0 8px ${C.vert}` }} />
          <span style={{ fontSize:14, fontWeight:900, fontStyle:'italic', color:'#fff' }}>COLI<span style={{ color:'#4ADE80' }}>GO</span><span style={{ color:C.lime }}>⚡</span></span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.12em', marginLeft:6 }}>Control Center</span>
        </div>
        <div style={{ width:1, height:22, background:'rgba(255,255,255,.1)' }} />

        {/* KPIs header */}
        <div style={{ display:'flex', gap:24, flex:1 }}>
          {[
            { l:'Chauffeurs', v:chauffeurs.length, c:'#4ADE80' },
            { l:'En mission', v:chauffeurs.filter(c=>c.statut==='en_mission').length, c:C.bleu },
            { l:'Alertes', v:alertes.length, c:alertes.length>0?C.rouge:'#4ADE80', blink:alertes.length>0 },
            { l:'Livraisons/h', v:12, c:'#4ADE80' },
            { l:'Revenus today', v:'12.4M F', c:'#4ADE80' },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:900, color:s.c, lineHeight:1, animation:s.blink?'blink 1.2s infinite':'none' }}>{s.v}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.06em', marginTop:1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Vue modes */}
        <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,.06)', borderRadius:8, padding:3 }}>
          {[{id:'normal',l:'Normal'},{id:'heatmap',l:'Heatmap'}].map(v => (
            <button key={v.id} onClick={()=>setVueMode(v.id)} style={{ padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontSize:10, fontWeight:500, background:vueMode===v.id?'rgba(255,255,255,.15)':'transparent', color:vueMode===v.id?'#fff':'rgba(255,255,255,.4)', transition:'all 150ms' }}>{v.l}</button>
          ))}
        </div>

        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff', fontVariantNumeric:'tabular-nums' }}>{time.toLocaleTimeString('fr-FR')}</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', letterSpacing:'.04em' }}>{time.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase()}</div>
        </div>
        <button onClick={onExit} style={{ padding:'6px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.06)', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>✕ Quitter</button>
      </div>

      {/* Corps CC */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Panneau gauche */}
        <div style={{ width:260, background:'rgba(0,0,0,.7)', borderRight:'1px solid rgba(255,255,255,.05)', display:'flex', flexDirection:'column', overflow:'hidden', backdropFilter:'blur(10px)' }}>
          {/* Alertes */}
          <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.rouge, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>🚨 Alertes actives</div>
            {NOTIFS.filter(n=>!n.lue&&(n.type==='critique'||n.type==='fraude'||n.type==='alerte')).map((n,i) => (
              <div key={i} style={{ padding:'8px 10px', background:'rgba(239,68,68,.1)', borderRadius:7, marginBottom:5, borderLeft:`2px solid ${n.type==='critique'?C.rouge:C.ambre}`, animation:`fadeInUp 300ms ease ${i*60}ms both` }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#fff', marginBottom:2 }}>{n.icone} {n.type.charAt(0).toUpperCase()+n.type.slice(1)}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>{n.texte}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', marginTop:2 }}>{n.heure}</div>
              </div>
            ))}
          </div>

          {/* Liste chauffeurs */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 0' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#4ADE80', textTransform:'uppercase', letterSpacing:'.08em', padding:'0 14px', marginBottom:8 }}>🚖 Flotte ({chauffeurs.length})</div>
            {chauffeurs.map((c,i) => {
              const col = ({disponible:C.vert,en_mission:C.bleu,retard:C.ambre,incident:C.rouge})[c.statut]||C.vert;
              return (
                <div key={i} onClick={()=>onSelect(selectedChauffeur?.id===c.id?null:c)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', cursor:'pointer', background:selectedChauffeur?.id===c.id?'rgba(34,197,94,.08)':'transparent', borderLeft:`2px solid ${selectedChauffeur?.id===c.id?C.vert:'transparent'}`, transition:'all 150ms' }}>
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width:26, height:26, borderRadius:'50%', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nom}</div>
                    <div style={{ fontSize:9, color:col }}>{c.driver_id} · {c.vitesse>0?`${c.vitesse}km/h`:'Arrêté'}</div>
                  </div>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:col, flexShrink:0 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Carte plein écran */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <CarteGPSPrincipal chauffeurs={chauffeurs} selectedChauffeur={selectedChauffeur} onSelect={onSelect} vueMode={vueMode} controlRoom />
        </div>

        {/* Panneau droit */}
        <div style={{ width:260, background:'rgba(0,0,0,.7)', borderLeft:'1px solid rgba(255,255,255,.05)', display:'flex', flexDirection:'column', overflow:'hidden', backdropFilter:'blur(10px)' }}>
          {selectedChauffeur ? (
            <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,.05)', flex:'0 0 auto' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#4ADE80', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Véhicule sélectionné</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedChauffeur.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width:32, height:32, borderRadius:'50%' }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{selectedChauffeur.nom}</div>
                  <div style={{ fontSize:10, color:'#4ADE80', fontFamily:'monospace' }}>{selectedChauffeur.driver_id}</div>
                </div>
              </div>
              {selectedChauffeur.mission && <div style={{ marginTop:8, fontSize:10, color:'rgba(255,255,255,.6)' }}>📦 {selectedChauffeur.mission}</div>}
              {selectedChauffeur.eta && <div style={{ fontSize:10, color:selectedChauffeur.statut==='retard'?C.rouge:'#4ADE80', marginTop:3, fontWeight:600 }}>⏱ ETA: {selectedChauffeur.eta}</div>}
            </div>
          ) : null}

          {/* IA recommendations */}
          <div style={{ padding:'12px 14px', flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.lime, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>⚡ IA Recommandations</div>
            {IA_INSIGHTS.map((ins,i) => (
              <div key={i} style={{ padding:'8px 10px', background:ins.color===C.rouge?'rgba(239,68,68,.1)':ins.color===C.ambre?'rgba(245,158,11,.1)':'rgba(34,197,94,.08)', borderRadius:8, marginBottom:6, borderLeft:`2px solid ${ins.color}`, animation:`fadeInUp 300ms ease ${i*70}ms both` }}>
                <div style={{ fontSize:10, fontWeight:700, color:ins.color, marginBottom:2 }}>{ins.icone} {ins.tag}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,.65)', lineHeight:1.5 }}>{ins.texte}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre IA basse */}
      <div style={{ height:38, background:'rgba(5,46,22,.9)', borderTop:'1px solid rgba(74,222,128,.1)', display:'flex', alignItems:'center', padding:'0 20px', gap:16, flexShrink:0, overflow:'hidden' }}>
        <span style={{ fontSize:9, fontWeight:700, color:'#4ADE80', textTransform:'uppercase', letterSpacing:'.1em', flexShrink:0 }}>⚡ IA COLIGO</span>
        {IA_INSIGHTS.map((r,i) => (
          <span key={i} style={{ fontSize:10, color:'rgba(255,255,255,.55)', whiteSpace:'nowrap' }}>
            {r.icone} {r.titre}
            {i<IA_INSIGHTS.length-1&&<span style={{ color:'rgba(255,255,255,.15)', marginLeft:14 }}>·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────

export default function DashboardPage() {
  const [chauffeurs, setChauffeurs] = useState(CHAUFFEURS_LIVE);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [controlCenter, setControlCenter] = useState(false);
  const [vueMode, setVueMode] = useState('normal');
  const [notifPanel, setNotifPanel] = useState(false);
  const [time, setTime] = useState(new Date());
  const [activeInsight, setActiveInsight] = useState(0);

  // ── DONNÉES RÉELLES ──
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    apiCall<any>(API.STATS)
      .then(data => setStats(data))
      .catch(err => console.error('Stats error:', err))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000);
    const t2 = setInterval(() => setChauffeurs(prev => prev.map(c => {
      if (c.statut === 'en_mission') {
        const a = (c.cap * Math.PI) / 180;
        return { ...c, lat: Math.max(.05, Math.min(.93, c.lat + Math.cos(a) * .001)), lng: Math.max(.05, Math.min(.93, c.lng + Math.sin(a) * .001)) };
      }
      return c;
    })), 2500);
    const t3 = setInterval(() => setActiveInsight(i => (i + 1) % IA_INSIGHTS.length), 5000);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  if (controlCenter) return (
    <ControlCenter chauffeurs={chauffeurs} onExit={() => setControlCenter(false)} selectedChauffeur={selectedChauffeur} onSelect={setSelectedChauffeur} />
  );

  const unread = NOTIFS.filter(n => !n.lue).length;

  // Valeurs réelles ou fallback mock
  // Valeurs réelles depuis l'API
const kpiLivraisons = stats?.expeditions?.aujourd_hui ?? 0;
const kpiRevenusDay = stats?.revenus?.aujourd_hui
  ? `${(stats.revenus.aujourd_hui / 1000000).toFixed(1)}M F`
  : '0 F';
const kpiRevenusMois = stats?.revenus?.cette_periode
  ? `${(stats.revenus.cette_periode / 1000000).toFixed(1)}M F`
  : '0 F';
const kpiETA = '—';
const kpiRisque = stats?.candidatures?.en_attente ?? 0;
const kpiLitiges = stats?.expeditions?.en_attente ?? 0;
const kpiSuspendus = (stats?.chauffeurs?.total ?? 0) - (stats?.chauffeurs?.actifs ?? 0);
const kpiDispoFlotte = stats?.chauffeurs?.total > 0
  ? `${Math.round((stats.chauffeurs.actifs / stats.chauffeurs.total) * 100)}%`
  : '0%';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} } @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.texte, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            📊 Centre de Contrôle
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.vertClair, border: `.5px solid #BBF7D0`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: C.vert }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.vert, display: 'inline-block', animation: 'blink 2s infinite' }} />LIVE
            </span>
          </h1>
          <p style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>
            {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {time.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 3, background: C.surface, borderRadius: 10, padding: 3, border: `.5px solid ${C.border}` }}>
            {[{ id: 'normal', l: '🗺️' }].map(v => (
              <button key={v.id} onClick={() => setVueMode(v.id)} title={v.id} style={{ width: 32, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, background: vueMode === v.id ? C.blanc : 'transparent', boxShadow: vueMode === v.id ? '0 1px 3px rgba(0,0,0,.1)' : 'none', transition: 'all 150ms' }}>{v.l}</button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotifPanel(!notifPanel)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🔔
              {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: C.rouge, animation: 'blink 1.5s infinite' }} />}
            </button>
            {notifPanel && (
              <div style={{ position: 'absolute', right: 0, top: 42, width: 320, background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.15)', zIndex: 100, overflow: 'hidden', animation: 'slideIn 200ms ease' }}>
                <div style={{ padding: '12px 16px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.texte }}>Notifications</span>
                  <span style={{ fontSize: 10, background: C.rougeClair, color: C.rouge, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{unread} nouvelles</span>
                </div>
                {NOTIFS.map((n, i) => {
                  const col = ({ critique: C.rouge, alerte: C.ambre, fraude: C.rouge, succes: C.vert, info: C.bleu })[n.type] || C.texteMuted;
                  return (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: i < NOTIFS.length - 1 ? `.5px solid ${C.border}` : 'none', background: n.lue ? 'transparent' : '#F8FAFC', borderLeft: `2px solid ${n.lue ? 'transparent' : col}` }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{n.icone}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: C.texte, lineHeight: 1.4 }}>{n.texte}</div>
                          <div style={{ fontSize: 10, color: C.texteMuted, marginTop: 3 }}>{n.heure}</div>
                        </div>
                        {!n.lue && <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0, marginTop: 3 }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* <button onClick={() => setControlCenter(true)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.vertFonce},${C.vert})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(34,197,94,.35)', transition: 'all 150ms' }}>
            🖥️ Control Center
          </button> */}
        </div>
      </div>

      {/* KPI Cards — données réelles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10 }}>
        <KPICard label="Livraisons/jour" valeur={loadingStats ? '...' : kpiLivraisons} icone="📦" bg={C.bleuClair} color={C.bleu} />
<KPICard label="Revenus today" valeur={loadingStats ? '...' : kpiRevenusDay} icone="💰" bg={C.vertClair} color={C.vert} />
<KPICard label="Revenus mois" valeur={loadingStats ? '...' : kpiRevenusMois} icone="📈" bg={C.limeClair} color={C.lime} />
<KPICard label="ETA moyen" valeur={loadingStats ? '...' : kpiETA} icone="⏱" bg={C.violetClair} color={C.violet} />
<KPICard label="Candidatures" valeur={loadingStats ? '...' : kpiRisque} icone="⏳" bg={C.ambreClair} color={C.ambre} blink />
<KPICard label="Exp. en attente" valeur={loadingStats ? '...' : kpiLitiges} icone="📦" bg={C.rougeClair} color={C.rouge} />
<KPICard label="Clients total" valeur={loadingStats ? '...' : (stats?.clients?.total ?? 0)} icone="👥" bg={C.bleuClair} color={C.bleu} />
<KPICard label="Dispo flotte" valeur={loadingStats ? '...' : kpiDispoFlotte} icone="🚖" bg={C.vertClair} color={C.vert} />
      </div>

      {/* ZONE PRINCIPALE : Carte GPS + Panneau droit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, height: 480 }}>
        <div style={{ background: C.dark, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
          <CarteGPSPrincipal chauffeurs={chauffeurs} selectedChauffeur={selectedChauffeur} onSelect={setSelectedChauffeur} vueMode={vueMode} />
          <div style={{ position: 'absolute', top: 46, left: 12, display: 'flex', gap: 8 }}>
            {[
              { v: chauffeurs.filter(c => c.statut === 'en_mission').length, l: 'En mission', col: C.bleu },
              { v: chauffeurs.filter(c => c.statut === 'disponible').length, l: 'Disponibles', col: C.vert },
              { v: chauffeurs.filter(c => c.statut === 'retard').length, l: 'Retards', col: C.ambre },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,.72)', border: `1px solid ${s.col}40`, borderRadius: 10, padding: '5px 12px', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.col, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 14px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.texte }}>🚖 Flotte</span>
            <span style={{ fontSize: 10, background: C.bleuClair, color: C.bleu, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{chauffeurs.length} véhicules</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chauffeurs.map((c, i) => {
              const col = ({ disponible: C.vert, en_mission: C.bleu, retard: C.ambre, incident: C.rouge })[c.statut] || C.vert;
              const lbl = ({ disponible: 'Disponible', en_mission: 'En mission', retard: 'Retard', incident: 'Incident' })[c.statut] || c.statut;
              return (
                <div key={i} onClick={() => setSelectedChauffeur(selectedChauffeur?.id === c.id ? null : c)}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px', borderBottom: i < chauffeurs.length - 1 ? `.5px solid ${C.border}` : 'none', cursor: 'pointer', background: selectedChauffeur?.id === c.id ? C.vertClair : 'transparent', borderLeft: `2px solid ${selectedChauffeur?.id === c.id ? C.vert : 'transparent'}`, transition: 'all 150ms' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nom}&backgroundColor=14532d&textColor=ffffff`} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: col, border: '1.5px solid #fff' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nom}</div>
                    <div style={{ fontSize: 9, color: C.vert, fontFamily: 'monospace', fontWeight: 600 }}>{c.driver_id}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: col }}>{lbl}</div>
                    {c.eta && <div style={{ fontSize: 9, color: c.statut === 'retard' ? C.rouge : C.texteMuted }}>{c.eta}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedChauffeur && (
            <div style={{ borderTop: `.5px solid ${C.border}`, flexShrink: 0 }}>
              <PanneauChauffeur c={selectedChauffeur} onClose={() => setSelectedChauffeur(null)} />
            </div>
          )}
        </div>
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.texte, marginBottom: 12 }}>💰 Revenus aujourd'hui</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.vert, marginBottom: 10 }}>{kpiRevenusDay} <span style={{ fontSize: 11, fontWeight: 500, color: C.texteMuted }}>/ objectif 14M</span></div>
          <div style={{ height: 5, background: C.border, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ width: '88%', height: '100%', background: `linear-gradient(90deg,${C.vertFonce},${C.vert})`, borderRadius: 10 }} />
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={REVENUS_DATA}>
              <defs><linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.vert} stopOpacity={0.15} /><stop offset="95%" stopColor={C.vert} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip content={<TooltipCustom />} />
              <Area type="monotone" dataKey="rev" name="Revenus" stroke={C.vert} strokeWidth={2} fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.texte, marginBottom: 12 }}>📦 Livraisons — 7 jours</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={LIVRAISONS_DATA} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="j" tick={{ fontSize: 10, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="ok" name="Réussies" fill={C.vert} radius={[3, 3, 0, 0]} />
              <Bar dataKey="retard" name="Retards" fill={C.ambre} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.blanc, border: `.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.texte, marginBottom: 4 }}>📈 Tendance mensuelle</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <div><div style={{ fontSize: 18, fontWeight: 800, color: C.vert }}>{kpiRevenusMois}</div><div style={{ fontSize: 10, color: C.texteMuted }}>Ce mois</div></div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={REVENUS_30J}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="j" tick={{ fontSize: 9, fill: C.texteMuted }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip content={<TooltipCustom />} />
              <Line type="monotone" dataKey="v" name="M F" stroke={C.vert} strokeWidth={2.5} dot={{ fill: C.vert, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assistant IA */}
      <div style={{ background: C.ia, border: `.5px solid ${C.iaBord}`, borderRadius: 16, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>🧠 Assistant IA Décisionnel</span>
            <span style={{ fontSize: 10, background: C.lime, color: '#1a2e05', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {IA_INSIGHTS.map((ins, i) => (
            <div key={i} style={{ background: i === activeInsight ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.05)', borderRadius: 12, padding: '12px 14px', borderLeft: `2px solid ${ins.color}`, transition: 'all 400ms ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{ins.icone}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: ins.color, background: `${ins.color}25`, padding: '1px 7px', borderRadius: 20 }}>{ins.tag}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{ins.titre}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>{ins.texte}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}