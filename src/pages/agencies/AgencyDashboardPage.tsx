
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '../../hooks/useApiClient';
import { API } from '../../api';

// ============ COULEURS ============
const C = {
  bleu: '#1a56db', bleuClair: '#EBF5FF', bleuFonce: '#1e40af',
  vert: '#057a55', vertClair: '#F3FAF7', vertFonce: '#03543f',
  rouge: '#e02424', rougeClair: '#FDF2F2',
  orange: '#d03801', orangeClair: '#FFF8F1',
  texte: 'var(--color-text-primary)',
  texteMuted: 'var(--color-text-secondary)',
  surface: 'var(--color-background-secondary)',
  blanc: 'var(--color-background-primary)',
  border: 'var(--color-border-tertiary)',
  sidebar: '#15803D',
};

// ============ SIDEBAR ============
function Sidebar({ active, setActive, agenceNom }) {
  const items = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '▦' },
    { id: 'chauffeurs', label: 'Mes chauffeurs', icon: '🚗' },
    { id: 'courses', label: 'Courses', icon: '📦' },
    { id: 'performances', label: 'Performances', icon: '📈' },
    { id: 'factures', label: 'Factures', icon: '🧾' },
  ];

  return (
    <div style={{ width: 220, background: C.sidebar, height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', padding: '0 0 20px' }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>COLIGO</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Espace Agence</div>
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{agenceNom || 'Mon Agence'}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2, background: active === item.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: active === item.id ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: active === item.id ? 600 : 400, textAlign: 'left' }}>
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        style={{ margin: '0 8px', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'left' }}>
        🚪 Déconnexion
      </button>
    </div>
  );
}

// ============ STAT CARD ============
function StatCard({ label, value, icon, color = C.bleu, bg = C.bleuClair }) {
  return (
    <div style={{ background: C.blanc, borderRadius: 12, padding: '18px 20px', border: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.texte }}>{value}</div>
        <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ============ PAGE DASHBOARD ============
function DashboardTab({ data }) {
  if (!data) return <div style={{ color: C.texteMuted, padding: 40 }}>Chargement...</div>;
  const { agence, stats } = data;
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.texte }}>{agence.nom}</div>
        <div style={{ fontSize: 13, color: C.texteMuted, marginTop: 4 }}>{agence.adresse} · {agence.telephone}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Chauffeurs actifs" value={stats.total_chauffeurs} icon="🚗" color={C.bleu} bg={C.bleuClair} />
        <StatCard label="Disponibles maintenant" value={stats.chauffeurs_disponibles} icon="✅" color={C.vert} bg={C.vertClair} />
        <StatCard label="Total courses livrées" value={stats.total_courses} icon="📦" color={C.orange} bg={C.orangeClair} />
        <StatCard label="Gains nets totaux" value={`${Number(stats.total_revenus).toLocaleString('fr-FR')} F`} icon="💰" color={C.vert} bg={C.vertClair} />
        <StatCard label="Note moyenne" value={`${stats.note_moyenne} ⭐`} icon="🏆" color={C.bleu} bg={C.bleuClair} />
      </div>
    </div>
  );
}

// ============ PAGE CHAUFFEURS ============
function ChauffeursTab() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [gabarits, setGabarits] = useState([]);

  useEffect(() => {
    loadDrivers();
    apiCall(API.GABARITS).then((d: any) => setGabarits(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);

  async function loadDrivers() {
    setLoading(true);
    try {
      const d: any = await apiCall(API.AGENCY_DRIVERS);
      setDrivers(d.drivers || []);
    } catch { } finally { setLoading(false); }
  }

  async function toggleActif(driver) {
    try {
      await apiCall(API.AGENCY_DRIVER_DETAIL(driver.id), 'PATCH', { is_active: !driver.is_active });
      loadDrivers();
    } catch (err: any) { alert(err.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.texte }}>Mes chauffeurs</div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: C.bleu, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Ajouter un chauffeur</button>
      </div>

      {loading ? <div style={{ color: C.texteMuted }}>Chargement...</div> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {drivers.length === 0 && <div style={{ color: C.texteMuted, padding: 40, textAlign: 'center' }}>Aucun chauffeur dans votre agence.</div>}
          {drivers.map(d => (
            <div key={d.id} onClick={() => setSelected(d)} style={{ background: C.blanc, borderRadius: 12, padding: '14px 18px', border: `.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: C.bleuClair, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🚗</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.texte, fontSize: 14 }}>{d.nom} {d.prenom}</div>
                <div style={{ fontSize: 12, color: C.texteMuted, marginTop: 2 }}>{d.telephone} · {d.gabarit}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: d.disponible ? C.vertClair : '#FEF3C7', color: d.disponible ? C.vertFonce : '#92400E' }}>{d.disponible ? 'Disponible' : 'Indisponible'}</span>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: d.is_active ? C.vertClair : C.rougeClair, color: d.is_active ? C.vertFonce : C.rouge }}>{d.is_active ? 'Actif' : 'Suspendu'}</span>
                <span style={{ fontSize: 12, color: C.texteMuted }}>⭐ {d.note_moyenne}</span>
                <span style={{ fontSize: 12, color: C.texteMuted }}>{d.nb_courses} courses</span>
                <button onClick={e => { e.stopPropagation(); toggleActif(d); }} style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer' }}>
                  {d.is_active ? 'Suspendre' : 'Réactiver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <ModalAjouterChauffeur gabarits={gabarits} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); loadDrivers(); }} />}
      {selected && <DrawerChauffeur driver={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ============ MODAL AJOUTER CHAUFFEUR ============
function ModalAjouterChauffeur({ onClose, onSuccess, gabarits }) {
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', plaque: '', gabarit_id: '' });
  const [cni, setCni] = useState(null);
  const [permis, setPermis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(k, v) { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); }

  async function handleSubmit() {
    const e: any = {};
    if (!form.nom) e.nom = 'Requis';
    if (!form.prenom) e.prenom = 'Requis';
    if (!form.telephone) e.telephone = 'Requis';
    if (!form.gabarit_id) e.gabarit_id = 'Requis';
    if (!cni) e.cni = 'Requis';
    if (!permis) e.permis = 'Requis';
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v as string));
      fd.append('cni', cni);
      fd.append('permis_conduire', permis);
      const res: any = await apiCall(API.AGENCY_DRIVERS, 'POST', fd, true);
      alert(`✅ Chauffeur ajouté !\n\nIdentifiant de connexion : ${res.driver_unique_id}\nCommuniquez-le au chauffeur.`);
      onSuccess();
    } catch (err: any) { alert('Erreur : ' + err.message); }
    finally { setLoading(false); }
  }

  const inp = (k) => ({ width: '100%', padding: '9px 12px', borderRadius: 9, border: `.5px solid ${errors[k] ? C.rouge : C.border}`, fontSize: 13, color: C.texte, outline: 'none', background: C.blanc, boxSizing: 'border-box' as const, fontFamily: 'inherit' });
  const lbl = { fontSize: 10, fontWeight: 700, color: C.texteMuted, textTransform: 'uppercase' as const, letterSpacing: '.04em', display: 'block', marginBottom: 5 };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 300 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 460, background: C.blanc, zIndex: 301, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,.15)' }}>
        <div style={{ padding: '18px 22px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.texte }}>Ajouter un chauffeur</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.texteMuted }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Nom *</label><input style={inp('nom')} value={form.nom} onChange={e => handleChange('nom', e.target.value)} placeholder="Nguema" />{errors['nom'] && <span style={{ fontSize: 10, color: C.rouge }}>{errors['nom']}</span>}</div>
            <div><label style={lbl}>Prénom *</label><input style={inp('prenom')} value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} placeholder="Paul" />{errors['prenom'] && <span style={{ fontSize: 10, color: C.rouge }}>{errors['prenom']}</span>}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Téléphone *</label><input style={inp('telephone')} value={form.telephone} onChange={e => handleChange('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" />{errors['telephone'] && <span style={{ fontSize: 10, color: C.rouge }}>{errors['telephone']}</span>}</div>
            <div><label style={lbl}>Plaque</label><input style={inp('plaque')} value={form.plaque} onChange={e => handleChange('plaque', e.target.value)} placeholder="LT-4521-A" /></div>
          </div>

          <div>
            <label style={lbl}>Type de véhicule *</label>
            <select style={inp('gabarit_id')} value={form.gabarit_id} onChange={e => handleChange('gabarit_id', e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {gabarits.map((g: any) => <option key={g.id} value={g.id}>{g.nom} ({g.charge_min}–{g.charge_max} T)</option>)}
            </select>
            {errors['gabarit_id'] && <span style={{ fontSize: 10, color: C.rouge }}>{errors['gabarit_id']}</span>}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: C.texte, textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 4 }}>Documents obligatoires</div>

          {[{ key: 'cni', label: '🪪 CNI', setter: setCni, val: cni }, { key: 'permis', label: '📋 Permis de conduire', setter: setPermis, val: permis }].map(doc => (
            <div key={doc.key}>
              <label style={lbl}>{doc.label} *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: doc.val ? C.vertClair : C.surface, borderRadius: 10, border: `.5px solid ${errors[doc.key] ? C.rouge : doc.val ? '#BBF7D0' : C.border}` }}>
                <span style={{ flex: 1, fontSize: 12, color: doc.val ? C.vertFonce : C.texteMuted }}>{doc.val ? `✓ ${(doc.val as any).name}` : 'Aucun fichier'}</span>
                <label style={{ padding: '5px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 11, cursor: 'pointer' }}>
                  Parcourir<input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => doc.setter(e.target.files[0])} />
                </label>
              </div>
              {errors[doc.key] && <span style={{ fontSize: 10, color: C.rouge }}>{errors[doc.key]}</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 22px', borderTop: `.5px solid ${C.border}`, display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: C.bleu, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            {loading ? '⏳ Ajout...' : '✓ Ajouter le chauffeur'}
          </button>
        </div>
      </div>
    </>
  );
}

// ============ DRAWER DETAIL CHAUFFEUR ============
function DrawerChauffeur({ driver, onClose }) {
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    apiCall(API.AGENCY_DRIVER_DETAIL(driver.id))
      .then((d: any) => setDetail(d))
      .catch(() => {});
  }, [driver.id]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 300 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 480, background: C.blanc, zIndex: 301, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,.15)' }}>
        <div style={{ padding: '18px 22px', borderBottom: `.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.texte }}>{driver.nom} {driver.prenom}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.texteMuted }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {!detail ? <div style={{ color: C.texteMuted }}>Chargement...</div> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Téléphone', value: detail.telephone },
                  { label: 'Plaque', value: detail.plaque || '-' },
                  { label: 'Gabarit', value: detail.gabarit || '-' },
                  { label: 'ID unique', value: detail.driver_unique_id || '-' },
                  { label: 'Note moyenne', value: `⭐ ${detail.note_moyenne}` },
                  { label: 'Nb courses', value: detail.nb_courses },
                ].map(item => (
                  <div key={item.label} style={{ background: C.surface, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.texteMuted, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.texte }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: C.texte, marginBottom: 12 }}>Dernières courses</div>
              {(!detail.courses || detail.courses.length === 0) ? (
                <div style={{ color: C.texteMuted, textAlign: 'center', padding: 24 }}>Aucune course livrée.</div>
              ) : detail.courses.map((c: any) => (
                <div key={c.id} style={{ background: C.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.texte }}>#EXP-{c.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.vert }}>+{Number(c.gain_net).toLocaleString('fr-FR')} F</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>📍 {c.adresse_ramassage}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>🏁 {c.adresse_livraison}</div>
                  <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 4 }}>{c.date} · {c.distance_km} km</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ============ PAGE COURSES ============
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const url = filtre ? `${API.AGENCY_COURSES}?statut=${filtre}` : API.AGENCY_COURSES;
      const d: any = await apiCall(url);
      setCourses(d.courses || []);
    } catch { } finally { setLoading(false); }
  }

  const STATUTS = { en_attente_chauffeur: '⏳ En attente', chauffeur_assigne: '🚗 Assigné', en_cours: '📦 En cours', livre: '✅ Livré', annule: '❌ Annulé' };
  const COLORS = { en_attente_chauffeur: '#FEF3C7', chauffeur_assigne: '#DBEAFE', en_cours: '#D1FAE5', livre: '#D1FAE5', annule: '#FEE2E2' };
  const TEXT_COLORS = { en_attente_chauffeur: '#92400E', chauffeur_assigne: '#1E40AF', en_cours: '#065F46', livre: '#065F46', annule: '#991B1B' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.texte }}>Courses de mon agence</div>
        <select value={filtre} onChange={e => { setFiltre(e.target.value); setTimeout(loadCourses, 50); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: `.5px solid ${C.border}`, background: C.blanc, color: C.texte, fontSize: 13, cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <div style={{ color: C.texteMuted }}>Chargement...</div> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {courses.length === 0 && <div style={{ color: C.texteMuted, textAlign: 'center', padding: 40 }}>Aucune course trouvée.</div>}
          {courses.map((c: any) => (
            <div key={c.id} style={{ background: C.blanc, borderRadius: 12, padding: '14px 18px', border: `.5px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.texte }}>#EXP-{c.id}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: COLORS[c.statut] || '#F3F4F6', color: TEXT_COLORS[c.statut] || '#374151' }}>{STATUTS[c.statut] || c.statut}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.vert }}>+{Number(c.gain_net).toLocaleString('fr-FR')} F</div>
                  <div style={{ fontSize: 11, color: C.texteMuted }}>Tarif : {Number(c.tarif).toLocaleString('fr-FR')} F</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.texteMuted, marginBottom: 4 }}>🚗 {c.chauffeur}</div>
              <div style={{ fontSize: 12, color: C.texteMuted }}>📍 {c.adresse_ramassage}</div>
              <div style={{ fontSize: 12, color: C.texteMuted }}>🏁 {c.adresse_livraison}</div>
              <div style={{ fontSize: 11, color: C.texteMuted, marginTop: 6 }}>{c.date} · {c.distance_km} km · {c.mode_paiement}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PAGE PERFORMANCES ============
function PerformancesTab() {
  const [perfs, setPerfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(API.AGENCY_PERFORMANCES)
      .then((d: any) => setPerfs(d.performances || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.texte, marginBottom: 20 }}>Performances des chauffeurs</div>
      {loading ? <div style={{ color: C.texteMuted }}>Chargement...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['Chauffeur', 'Gabarit', 'Courses', 'Note', 'Gain net total', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.texteMuted, fontSize: 11, textTransform: 'uppercase', borderBottom: `.5px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perfs.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.texteMuted }}>Aucune donnée.</td></tr>}
              {perfs.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: `.5px solid ${C.border}` }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: C.texte }}>{p.nom}</td>
                  <td style={{ padding: '12px 14px', color: C.texteMuted }}>{p.gabarit}</td>
                  <td style={{ padding: '12px 14px', color: C.texte }}>{p.nb_courses}</td>
                  <td style={{ padding: '12px 14px', color: C.texte }}>⭐ {p.note_moyenne}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: C.vert }}>{Number(p.total_gain_net).toLocaleString('fr-FR')} F</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: p.is_active ? C.vertClair : C.rougeClair, color: p.is_active ? C.vertFonce : C.rouge }}>{p.is_active ? 'Actif' : 'Suspendu'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ PAGE FACTURES ============
function FacturesTab() {
  const [factures, setFactures] = useState([]);
  const [totaux, setTotaux] = useState({ total_montant: '0', total_gain_net: '0', total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(API.AGENCY_FACTURES)
      .then((d: any) => {
        setFactures(d.factures || []);
        setTotaux({ total_montant: d.total_montant, total_gain_net: d.total_gain_net, total: d.total });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.texte, marginBottom: 16 }}>Factures</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total livraisons" value={totaux.total} icon="📦" />
        <StatCard label="Chiffre d'affaires" value={`${Number(totaux.total_montant).toLocaleString('fr-FR')} F`} icon="💵" color={C.bleu} bg={C.bleuClair} />
        <StatCard label="Gains nets" value={`${Number(totaux.total_gain_net).toLocaleString('fr-FR')} F`} icon="💰" color={C.vert} bg={C.vertClair} />
      </div>

      {loading ? <div style={{ color: C.texteMuted }}>Chargement...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {['#', 'Chauffeur', 'Ramassage', 'Livraison', 'Distance', 'Tarif', 'Commission', 'Gain net', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: C.texteMuted, fontSize: 11, textTransform: 'uppercase', borderBottom: `.5px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factures.length === 0 && <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: C.texteMuted }}>Aucune facture.</td></tr>}
              {factures.map((f: any) => (
                <tr key={f.id} style={{ borderBottom: `.5px solid ${C.border}` }}>
                  <td style={{ padding: '10px 12px', color: C.texteMuted, whiteSpace: 'nowrap' }}>#{f.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: C.texte, whiteSpace: 'nowrap' }}>{f.chauffeur}</td>
                  <td style={{ padding: '10px 12px', color: C.texteMuted, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.adresse_ramassage}</td>
                  <td style={{ padding: '10px 12px', color: C.texteMuted, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.adresse_livraison}</td>
                  <td style={{ padding: '10px 12px', color: C.texteMuted, whiteSpace: 'nowrap' }}>{f.distance_km} km</td>
                  <td style={{ padding: '10px 12px', color: C.texte, whiteSpace: 'nowrap' }}>{Number(f.tarif).toLocaleString('fr-FR')} F</td>
                  <td style={{ padding: '10px 12px', color: C.rouge, whiteSpace: 'nowrap' }}>-{Number(f.commission).toLocaleString('fr-FR')} F</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: C.vert, whiteSpace: 'nowrap' }}>{Number(f.gain_net).toLocaleString('fr-FR')} F</td>
                  <td style={{ padding: '10px 12px', color: C.texteMuted, whiteSpace: 'nowrap' }}>{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ PAGE PRINCIPALE ============
export default function AgencyDashboardPage() {
  const [active, setActive] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [agenceNom, setAgenceNom] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('coligo_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'responsable_agence') {
        window.location.href = '/dashboard';
        return;
      }
    }
    apiCall(API.AGENCY_DASHBOARD)
      .then((d: any) => {
        setDashData(d);
        setAgenceNom(d.agence?.nom || '');
      })
      .catch(() => {});
  }, []);

  const tabs: any = { dashboard: <DashboardTab data={dashData} />, chauffeurs: <ChauffeursTab />, courses: <CoursesTab />, performances: <PerformancesTab />, factures: <FacturesTab /> };

  return (
    <div style={{ display: 'flex', background: C.surface, minHeight: '100vh' }}>
      <Sidebar active={active} setActive={setActive} agenceNom={agenceNom} />
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', minHeight: '100vh' }}>
        {tabs[active]}
      </main>
    </div>
  );
}