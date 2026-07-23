// ============================================================
// COLIGO — Données simulées centralisées
// Toutes les pages utilisent ce fichier
// Les données sont cohérentes entre elles
// ============================================================

// ── UTILITAIRES ──────────────────────────────────────────────

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatMontant(n) {
  return n.toLocaleString('fr-FR') + ' F';
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── CONSTANTES ────────────────────────────────────────────────

export const VILLES = ['Douala', 'Brazzaville', 'Pointe-Noire', 'Yaoundé', 'Libreville'];

export const QUARTIERS_DOUALA = [
  'Akwa', 'Bonanjo', 'Bonapriso', 'Bassa', 'Ndokotti',
  'Makepe', 'Logbessou', 'Deido', 'New Bell', 'Bonaberi',
];

export const GABARITS = [
  { id: 'S', label: 'Petit', desc: '0–100 kg', prix: 500 },
  { id: 'M', label: 'Moyen', desc: '100–300 kg', prix: 1200 },
  { id: 'L', label: 'Grand', desc: '300–600 kg', prix: 2000 },
];

export const STATUTS_EXPEDITION = [
  'en_attente_chauffeur', 'chauffeur_assigne', 'en_cours', 'livree', 'annulee',
];

export const TYPES_PAIEMENT = ['mobile_money', 'especes'];

export const TYPES_FRAUDE = [
  'Faux GPS', 'Multi-compte', 'OTP partagé', 'Annulations abusives', 'Compte volé',
];

// ── CLIENTS ──────────────────────────────────────────────────

export const CLIENTS = [
  { id: 1, prenom: 'Serena', nom: 'Kameni', email: 'serena.kameni@gmail.com', ville: 'Douala', telephone: '+237 622 202 461', nb_expeditions: 14, depenses_total: 38500, note_donnee: 4.8, statut: 'actif', date_inscription: '2026-01-15', avatar: 'SK' },
  { id: 2, prenom: 'Jean', nom: 'Mbemba', email: 'jean.mbemba@yahoo.fr', ville: 'Brazzaville', telephone: '+242 064 123 456', nb_expeditions: 8, depenses_total: 22000, note_donnee: 4.5, statut: 'actif', date_inscription: '2026-02-03', avatar: 'JM' },
  { id: 3, prenom: 'Marie', nom: 'Obiang', email: 'marie.obiang@gmail.com', ville: 'Douala', telephone: '+237 699 345 678', nb_expeditions: 21, depenses_total: 67000, note_donnee: 5.0, statut: 'actif', date_inscription: '2025-11-20', avatar: 'MO' },
  { id: 4, prenom: 'Paul', nom: 'Nkeng', email: 'paul.nkeng@outlook.com', ville: 'Yaoundé', telephone: '+237 677 890 123', nb_expeditions: 3, depenses_total: 8500, note_donnee: 4.2, statut: 'actif', date_inscription: '2026-03-10', avatar: 'PN' },
  { id: 5, prenom: 'Amina', nom: 'Diallo', email: 'amina.diallo@gmail.com', ville: 'Douala', telephone: '+237 655 234 567', nb_expeditions: 0, depenses_total: 0, note_donnee: null, statut: 'inactif', date_inscription: '2026-04-01', avatar: 'AD' },
  { id: 6, prenom: 'Eric', nom: 'Bouka', email: 'eric.bouka@gmail.com', ville: 'Pointe-Noire', telephone: '+242 055 678 901', nb_expeditions: 35, depenses_total: 112000, note_donnee: 4.9, statut: 'actif', date_inscription: '2025-09-05', avatar: 'EB' },
  { id: 7, prenom: 'Fatou', nom: 'Sow', email: 'fatou.sow@gmail.com', ville: 'Douala', telephone: '+237 670 456 789', nb_expeditions: 7, depenses_total: 19500, note_donnee: 4.6, statut: 'actif', date_inscription: '2026-01-28', avatar: 'FS' },
  { id: 8, prenom: 'Samuel', nom: 'Kotto', email: 'samuel.kotto@yahoo.fr', ville: 'Douala', telephone: '+237 688 012 345', nb_expeditions: 12, depenses_total: 31000, note_donnee: 4.7, statut: 'suspendu', date_inscription: '2025-12-14', avatar: 'SK' },
  { id: 9, prenom: 'Laure', nom: 'Eto', email: 'laure.eto@gmail.com', ville: 'Yaoundé', telephone: '+237 691 567 890', nb_expeditions: 19, depenses_total: 58000, note_donnee: 4.8, statut: 'actif', date_inscription: '2025-10-30', avatar: 'LE' },
  { id: 10, prenom: 'David', nom: 'Monga', email: 'david.monga@gmail.com', ville: 'Brazzaville', telephone: '+242 066 234 567', nb_expeditions: 5, depenses_total: 14000, note_donnee: 4.3, statut: 'actif', date_inscription: '2026-02-19', avatar: 'DM' },
];

// ── CHAUFFEURS ────────────────────────────────────────────────

export const CHAUFFEURS = [
  { id: 1, driver_id: 'T-014', prenom: 'Paul', nom: 'Nguema', email: 'paul.nguema@coligo.app', telephone: '+237 677 111 222', ville: 'Douala', note_moyenne: 4.9, nb_courses: 142, wallet: 185000, disponible: true, statut: 'actif', gabarit: 'Fourgonnette compacte', plaque: 'LT-4521-A', date_validation: '2025-08-15', photo_vehicule: null, lat: 4.0511, lng: 9.7679, avatar: 'PN' },
  { id: 2, driver_id: 'T-027', prenom: 'Jean', nom: 'Tamba', email: 'jean.tamba@coligo.app', telephone: '+237 699 333 444', ville: 'Douala', note_moyenne: 4.6, nb_courses: 89, wallet: 92000, disponible: false, statut: 'actif', gabarit: 'Petite voiture', plaque: 'CE-7823-B', date_validation: '2025-10-02', photo_vehicule: null, lat: 4.0612, lng: 9.7534, avatar: 'JT' },
  { id: 3, driver_id: 'T-033', prenom: 'Eric', nom: 'Bouka', email: 'eric.bouka@coligo.app', telephone: '+237 655 555 666', ville: 'Douala', note_moyenne: 4.7, nb_courses: 203, wallet: 267000, disponible: false, statut: 'suspendu', gabarit: 'Fourgon moyen', plaque: 'LT-9012-C', date_validation: '2025-07-20', photo_vehicule: null, lat: 4.0389, lng: 9.6921, avatar: 'EB' },
  { id: 4, driver_id: 'T-041', prenom: 'Samuel', nom: 'Kotto', email: 'samuel.kotto@coligo.app', telephone: '+237 688 777 888', ville: 'Douala', note_moyenne: 4.8, nb_courses: 76, wallet: 58000, disponible: true, statut: 'actif', gabarit: 'Petite voiture', plaque: 'CE-3456-D', date_validation: '2025-11-08', photo_vehicule: null, lat: 4.0711, lng: 9.7123, avatar: 'SK' },
  { id: 5, driver_id: 'T-052', prenom: 'Samuel', nom: 'Manga', email: 'samuel.manga@coligo.app', telephone: '+237 670 999 000', ville: 'Douala', note_moyenne: 4.5, nb_courses: 31, wallet: 24000, disponible: true, statut: 'actif', gabarit: 'Fourgonnette compacte', plaque: 'LT-6789-E', date_validation: '2026-01-14', photo_vehicule: null, lat: 4.0234, lng: 9.7890, avatar: 'SM' },
  { id: 6, driver_id: 'T-011', prenom: 'Claire', nom: 'Ndong', email: 'claire.ndong@coligo.app', telephone: '+237 691 111 333', ville: 'Douala', note_moyenne: 4.9, nb_courses: 187, wallet: 312000, disponible: true, statut: 'actif', gabarit: 'Grand fourgon', plaque: 'LT-1234-F', date_validation: '2025-06-10', photo_vehicule: null, lat: 4.0456, lng: 9.7234, avatar: 'CN' },
  // Candidats en attente
  { id: 7, driver_id: null, prenom: 'Alain', nom: 'Biya', email: 'alain.biya@gmail.com', telephone: '+237 677 222 444', ville: 'Douala', note_moyenne: null, nb_courses: 0, wallet: 0, disponible: false, statut: 'en_attente', gabarit: 'Petite voiture', plaque: 'CE-9999-G', date_validation: null, photo_vehicule: null, lat: null, lng: null, avatar: 'AB' },
  { id: 8, driver_id: null, prenom: 'Rose', nom: 'Eyenga', email: 'rose.eyenga@gmail.com', telephone: '+237 699 444 666', ville: 'Douala', note_moyenne: null, nb_courses: 0, wallet: 0, disponible: false, statut: 'en_attente', gabarit: 'Fourgonnette compacte', plaque: 'LT-8888-H', date_validation: null, photo_vehicule: null, lat: null, lng: null, avatar: 'RE' },
];

// ── AGENCES ───────────────────────────────────────────────────

export const AGENCES = [
  { id: 1, nom: 'Express Cargo Douala', responsable: 'Marcel Fotso', email: 'contact@expresscargo.cm', telephone: '+237 233 111 222', ville: 'Douala', nb_chauffeurs: 12, courses_mois: 340, ca_mois: 892000, objectif_ca: 1000000, taux_sla: 96.5, statut: 'actif', date_creation: '2025-06-01' },
  { id: 2, nom: 'TransLog Congo', responsable: 'Pierre Moukala', email: 'info@translogcongo.cg', telephone: '+242 022 333 444', ville: 'Brazzaville', nb_chauffeurs: 8, courses_mois: 198, ca_mois: 524000, objectif_ca: 600000, taux_sla: 94.2, statut: 'actif', date_creation: '2025-08-15' },
  { id: 3, nom: 'Rapid Livraison Yaoundé', responsable: 'Sophie Abena', email: 'rapid@livraisonyaounde.cm', telephone: '+237 222 555 666', ville: 'Yaoundé', nb_chauffeurs: 5, courses_mois: 87, ca_mois: 198000, objectif_ca: 300000, taux_sla: 91.8, statut: 'actif', date_creation: '2026-01-10' },
  { id: 4, nom: 'Gabon Express', responsable: 'Henri Nzamba', email: 'contact@gabonexpress.ga', telephone: '+241 077 777 888', ville: 'Libreville', nb_chauffeurs: 3, courses_mois: 42, ca_mois: 98000, objectif_ca: 200000, taux_sla: 88.5, statut: 'en_attente', date_creation: '2026-04-20' },
];

// ── EXPÉDITIONS ───────────────────────────────────────────────

export const EXPEDITIONS = [
  { id: 1, client_id: 1, chauffeur_id: 1, adresse_ramassage: 'Akwa, Douala', adresse_livraison: 'Bonanjo, Douala', distance_km: 3.2, format_colis: 'S', tarif: 500, mode_paiement: 'especes', statut: 'livree', otp_code: '1859', created_at: '2026-06-05T08:30:00', description: 'Documents administratifs' },
  { id: 2, client_id: 3, chauffeur_id: 2, adresse_ramassage: 'Bonapriso, Douala', adresse_livraison: 'Bassa, Douala', distance_km: 7.8, format_colis: 'M', tarif: 1200, mode_paiement: 'mobile_money', statut: 'en_cours', otp_code: '4521', created_at: '2026-06-06T07:15:00', description: 'Matériel informatique' },
  { id: 3, client_id: 6, chauffeur_id: 4, adresse_ramassage: 'Makepe, Douala', adresse_livraison: 'Deido, Douala', distance_km: 5.1, format_colis: 'L', tarif: 2000, mode_paiement: 'mobile_money', statut: 'chauffeur_assigne', otp_code: '7823', created_at: '2026-06-06T07:45:00', description: 'Mobilier de bureau' },
  { id: 4, client_id: 2, chauffeur_id: null, adresse_ramassage: 'New Bell, Douala', adresse_livraison: 'Akwa, Douala', distance_km: 4.3, format_colis: 'S', tarif: 500, mode_paiement: 'especes', statut: 'en_attente_chauffeur', otp_code: '3344', created_at: '2026-06-06T08:02:00', description: 'Colis alimentaire' },
  { id: 5, client_id: 9, chauffeur_id: 6, adresse_ramassage: 'Logbessou, Douala', adresse_livraison: 'Bonaberi, Douala', distance_km: 12.4, format_colis: 'L', tarif: 2000, mode_paiement: 'mobile_money', statut: 'livree', otp_code: '9912', created_at: '2026-06-05T14:20:00', description: 'Équipement ménager' },
  { id: 6, client_id: 4, chauffeur_id: null, adresse_ramassage: 'Ndokotti, Douala', adresse_livraison: 'Makepe, Douala', distance_km: 6.7, format_colis: 'M', tarif: 1200, mode_paiement: 'especes', statut: 'annulee', otp_code: '5566', created_at: '2026-06-04T11:30:00', description: 'Vêtements' },
  { id: 7, client_id: 7, chauffeur_id: 1, adresse_ramassage: 'Bonanjo, Douala', adresse_livraison: 'Akwa, Douala', distance_km: 2.9, format_colis: 'S', tarif: 500, mode_paiement: 'especes', statut: 'livree', otp_code: '2277', created_at: '2026-06-06T06:50:00', description: 'Courrier urgent' },
  { id: 8, client_id: 10, chauffeur_id: 5, adresse_ramassage: 'Akwa, Douala', adresse_livraison: 'Bassa, Douala', distance_km: 9.2, format_colis: 'M', tarif: 1200, mode_paiement: 'mobile_money', statut: 'en_cours', otp_code: '8834', created_at: '2026-06-06T08:10:00', description: 'Produits pharmaceutiques' },
];

// ── PAIEMENTS ─────────────────────────────────────────────────

export const PAIEMENTS = [
  { id: 1, expedition_id: 1, client: 'Serena Kameni', chauffeur: 'Paul Nguema', montant: 500, commission: 50, mode: 'especes', statut: 'valide', date: '2026-06-05T09:45:00' },
  { id: 2, expedition_id: 5, client: 'Laure Eto', chauffeur: 'Claire Ndong', montant: 2000, commission: 200, mode: 'mobile_money', statut: 'valide', date: '2026-06-05T16:30:00' },
  { id: 3, expedition_id: 7, client: 'Fatou Sow', chauffeur: 'Paul Nguema', montant: 500, commission: 50, mode: 'especes', statut: 'valide', date: '2026-06-06T07:40:00' },
  { id: 4, expedition_id: 2, client: 'Marie Obiang', chauffeur: 'Jean Tamba', montant: 1200, commission: 120, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T07:15:00' },
  { id: 5, expedition_id: 3, client: 'Eric Bouka', chauffeur: 'Samuel Kotto', montant: 2000, commission: 200, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T07:45:00' },
  { id: 6, expedition_id: 8, client: 'David Monga', chauffeur: 'Samuel Manga', montant: 1200, commission: 120, mode: 'mobile_money', statut: 'en_attente', date: '2026-06-06T08:10:00' },
];

// ── ALERTES FRAUDE ────────────────────────────────────────────

export const ALERTES_FRAUDE = [
  { id: 1, type: 'Faux GPS', score: 87, utilisateur: 'T-033 · Eric Bouka', role: 'chauffeur', description: 'Position GPS incohérente — téléportation détectée sur 12 km en 30 secondes', anciennete: '4 min', severite: 'critique', statut: 'non_traite' },
  { id: 2, type: 'Multi-compte', score: 72, utilisateur: 'Samuel Kotto · Client #8', role: 'client', description: '3 comptes différents créés depuis le même appareil (IMEI identique)', anciennete: '18 min', severite: 'haute', statut: 'non_traite' },
  { id: 3, type: 'Annulations abusives', score: 61, utilisateur: 'Amina Diallo · Client #5', role: 'client', description: '7 annulations consécutives après assignation chauffeur en 2 jours', anciennete: '1h 12min', severite: 'moyenne', statut: 'en_cours' },
  { id: 4, type: 'OTP partagé', score: 45, utilisateur: 'T-041 · Samuel Kotto', role: 'chauffeur', description: 'Code OTP utilisé depuis une IP différente de celle du chauffeur assigné', anciennete: '3h 40min', severite: 'moyenne', statut: 'non_traite' },
];

// ── ACTIVITÉ TEMPS RÉEL ───────────────────────────────────────

export const ACTIVITE_INITIALE = [
  { id: 1, type: 'livraison', icone: '📦', titre: 'Livraison terminée', detail: 'EXP-007 · Fatou Sow → Paul Nguema · 500 F', temps: 'il y a 2 min', couleur: '#22C55E', bg: '#F0FDF4' },
  { id: 2, type: 'paiement', icone: '💳', titre: 'Paiement reçu', detail: 'Mobile Money · Marie Obiang · 1 200 F', temps: 'il y a 5 min', couleur: '#3B82F6', bg: '#EFF6FF' },
  { id: 3, type: 'mission', icone: '✅', titre: 'Mission acceptée', detail: 'T-041 Samuel K. → EXP-003 · Makepe→Deido', temps: 'il y a 8 min', couleur: '#22C55E', bg: '#F0FDF4' },
  { id: 4, type: 'chauffeur', icone: '🔔', titre: 'Chauffeur validé', detail: 'T-052 Samuel Manga · Fourgonnette compacte', temps: 'il y a 14 min', couleur: '#84CC16', bg: '#F7FEE7' },
  { id: 5, type: 'alerte', icone: '🚨', titre: 'Alerte fraude', detail: 'Score 87 · Faux GPS · T-033 Eric Bouka', temps: 'il y a 22 min', couleur: '#EF4444', bg: '#FEF2F2' },
  { id: 6, type: 'client', icone: '👤', titre: 'Nouveau client', detail: 'David Monga · Brazzaville · inscrit', temps: 'il y a 35 min', couleur: '#3B82F6', bg: '#EFF6FF' },
  { id: 7, type: 'livraison', icone: '📦', titre: 'Livraison terminée', detail: 'EXP-005 · Laure Eto → Claire Ndong · 2 000 F', temps: 'il y a 48 min', couleur: '#22C55E', bg: '#F0FDF4' },
];

export const NOUVEAUX_EVENEMENTS = [
  { type: 'livraison', icone: '📦', titre: 'Livraison terminée', detail: 'EXP-001 · Serena K. → Paul N. · 500 F', couleur: '#22C55E', bg: '#F0FDF4' },
  { type: 'paiement', icone: '💳', titre: 'Paiement reçu', detail: 'Espèces · Jean Mbemba · 500 F', couleur: '#3B82F6', bg: '#EFF6FF' },
  { type: 'mission', icone: '✅', titre: 'Mission acceptée', detail: 'T-027 Jean T. → EXP-008 · Akwa→Bassa', couleur: '#22C55E', bg: '#F0FDF4' },
  { type: 'client', icone: '👤', titre: 'Nouveau client', detail: 'Aminata Bah · Douala · inscrit', couleur: '#3B82F6', bg: '#EFF6FF' },
  { type: 'attente', icone: '⏳', titre: 'Course en attente', detail: 'EXP-004 · New Bell→Akwa · +8 min sans chauffeur', couleur: '#F59E0B', bg: '#FFFBEB' },
  { type: 'chauffeur', icone: '🔔', titre: 'Chauffeur connecté', detail: 'T-014 Paul Nguema · Disponible · Akwa', couleur: '#84CC16', bg: '#F7FEE7' },
  { type: 'alerte', icone: '🚨', titre: 'Alerte fraude', detail: 'Score 72 · Multi-compte · Client #8', couleur: '#EF4444', bg: '#FEF2F2' },
];

// ── KPIs DASHBOARD ────────────────────────────────────────────

export const KPI_DASHBOARD = {
  clients_actifs: { valeur: 1284, tendance: +5.2, label: 'Clients actifs', icone: '👥', couleur_bg: '#EFF6FF', couleur: '#3B82F6' },
  chauffeurs_actifs: { valeur: 47, tendance: +3, label: 'Chauffeurs actifs', icone: '🚕', couleur_bg: '#F0FDF4', couleur: '#22C55E' },
  livraisons_jour: { valeur: 248, tendance: +12.4, label: 'Livraisons du jour', icone: '📦', couleur_bg: '#F7FEE7', couleur: '#84CC16' },
  revenus_jour: { valeur: 1240000, tendance: +8.1, label: 'Revenus du jour', icone: '💰', couleur_bg: '#FFFBEB', couleur: '#F59E0B' },
  revenus_mois: { valeur: 38500000, tendance: +18.4, label: 'Revenus du mois', icone: '📈', couleur_bg: '#EDE9FE', couleur: '#8B5CF6' },
  taux_reussite: { valeur: 96.8, tendance: +0.3, label: 'Taux de réussite', icone: '✓', couleur_bg: '#F0FDF4', couleur: '#22C55E' },
};

// ── GRAPHIQUES — REVENUS 30 JOURS ─────────────────────────────

export function genererRevenus30Jours() {
  const data = [];
  const base = 1100000;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = randomBetween(-150000, 250000);
    const weekend = date.getDay() === 5 || date.getDay() === 6 ? 180000 : 0;
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      revenus: Math.max(800000, base + variation + weekend),
      livraisons: randomBetween(180, 320),
      clients_nouveaux: randomBetween(8, 35),
      clients_churned: randomBetween(1, 8),
    });
  }
  return data;
}

// ── TOP CHAUFFEURS DU JOUR ────────────────────────────────────

export const TOP_CHAUFFEURS = [
  { rang: 1, driver_id: 'T-014', nom: 'Paul Nguema', courses: 32, revenus: 86400, note: 4.9, statut: 'en_cours', avatar: 'PN', medaille: '🥇' },
  { rang: 2, driver_id: 'T-011', nom: 'Claire Ndong', courses: 28, revenus: 74000, note: 4.9, statut: 'disponible', avatar: 'CN', medaille: '🥈' },
  { rang: 3, driver_id: 'T-033', nom: 'Eric Bouka', courses: 24, revenus: 63200, note: 4.7, statut: 'suspendu', avatar: 'EB', medaille: '🥉' },
  { rang: 4, driver_id: 'T-041', nom: 'Samuel Kotto', courses: 19, revenus: 48500, note: 4.8, statut: 'disponible', avatar: 'SK', medaille: '4' },
  { rang: 5, driver_id: 'T-027', nom: 'Jean Tamba', courses: 15, revenus: 38000, note: 4.6, statut: 'en_cours', avatar: 'JT', medaille: '5' },
];

// ── QUARTIERS ACTIFS ──────────────────────────────────────────

export const QUARTIERS_ACTIFS = [
  { nom: 'Akwa', courses: 88, pct: 88 },
  { nom: 'Bonanjo', pct: 72, courses: 72 },
  { nom: 'Bonapriso', pct: 65, courses: 65 },
  { nom: 'Bassa', pct: 54, courses: 54 },
  { nom: 'Makepe', pct: 41, courses: 41 },
  { nom: 'Ndokotti', pct: 33, courses: 33 },
];

// ── ANALYSE IA ────────────────────────────────────────────────

export const ANALYSE_IA = {
  prevision_revenus: {
    demain: 1380000,
    intervalle: 8,
    precision_modele: 94.2,
    facteurs: ['Vendredi', 'Météo favorable', '+3 chauffeurs actifs'],
  },
  eta_moyen: {
    minutes: 23,
    vs_hier: -15,
    heures_pointe: ['07h–09h', '12h–13h', '17h–19h'],
    recommandation: 'Positionner 8 chauffeurs à Akwa entre 17h–19h',
  },
  risque_fraude: {
    score_global: 24,
    niveau: 'FAIBLE',
    comptes_surveilles: 3,
    derniere_anomalie: 'il y a 2h · Faux GPS T-033',
    recommandation: 'Aucune action immédiate requise',
  },
};

// ── STATUS BAR ────────────────────────────────────────────────

export const STATUS_BAR = {
  api: { label: 'API Backend', statut: 'ok', detail: 'Latence 42ms' },
  gps: { label: 'GPS Tracking', statut: 'ok', detail: '47 satellites actifs' },
  paiements: { label: 'Paiements', statut: 'ok', detail: 'Mobile Money opérationnel' },
  alertes: { label: 'Alertes critiques', statut: 'warn', count: 4 },
  chauffeurs: { label: 'Chauffeurs connectés', statut: 'ok', count: 47 },
};
// ── POSITIONS GPS ANIMÉES ─────────────────────────────────────

export function animerPositionChauffeur(chauffeur) {
  const deltaLat = (Math.random() - 0.5) * 0.003;
  const deltaLng = (Math.random() - 0.5) * 0.003;
  return {
    ...chauffeur,
    lat: parseFloat((chauffeur.lat + deltaLat).toFixed(6)),
    lng: parseFloat((chauffeur.lng + deltaLng).toFixed(6)),
  };
}

// ── DONNÉES GRAPHIQUES STABLES (seed fixe) ───────────────────

export const REVENUS_30_JOURS = genererRevenus30Jours();

// ── ESCROW ────────────────────────────────────────────────────

export const ESCROW = [
  { id: 1, expedition_id: 2, client: 'Marie Obiang', chauffeur: 'Jean Tamba', montant: 1200, raison: 'Livraison en cours', duree: '45 min', statut: 'bloque' },
  { id: 2, expedition_id: 3, client: 'Eric Bouka', chauffeur: 'Samuel Kotto', montant: 2000, raison: 'Litige signalé', duree: '2h 15min', statut: 'litige' },
  { id: 3, expedition_id: 8, client: 'David Monga', chauffeur: 'Samuel Manga', montant: 1200, raison: 'Livraison en cours', duree: '22 min', statut: 'bloque' },
];

// ── ADMINS ────────────────────────────────────────────────────

export const ADMINS = [
  { id: 1, prenom: 'Super', nom: 'Admin', email: 'admin@coligo.app', role: 'superadmin', is_active: true, can_manage_clients: true, can_manage_drivers: true, can_manage_agencies: true },
  { id: 2, prenom: 'Manager', nom: 'COLIGO', email: 'manager@coligo.app', role: 'admin', is_active: true, can_manage_clients: true, can_manage_drivers: true, can_manage_agencies: false },
];