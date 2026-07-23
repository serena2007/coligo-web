// src/api.ts
const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const API = {
  // AUTH
  LOGIN:              `${BASE_URL}/auth/admin/login/`,
  ME:                 `${BASE_URL}/auth/me/`,

  // DASHBOARD
  STATS:              `${BASE_URL}/admin-panel/stats/`,

  // CLIENTS
  CLIENTS:            `${BASE_URL}/admin-panel/clients/`,
  CLIENT_DETAIL:      (id: number) => `${BASE_URL}/admin-panel/clients/${id}/`,

  // CHAUFFEURS
  DRIVERS:            `${BASE_URL}/admin-panel/drivers/`,
  DRIVER_DETAIL:      (id: number) => `${BASE_URL}/drivers/admin/drivers/${id}/`,
  CANDIDATURES:       `${BASE_URL}/drivers/admin/candidatures/`,
  CANDIDATURE_DETAIL: (id: number) => `${BASE_URL}/drivers/admin/candidatures/${id}/`,
  CANDIDATURE_ACTION: (id: number) => `${BASE_URL}/drivers/admin/candidatures/${id}/action/`,
  VERIFY_DOCUMENT:    (id: number) => `${BASE_URL}/drivers/admin/candidatures/${id}/verify-document/`,
  GABARITS:           `${BASE_URL}/drivers/gabarits/`,

  // AGENCES
  AGENCIES:           `${BASE_URL}/admin-panel/agences/`,
  AGENCY_DETAIL:      (id: number) => `${BASE_URL}/admin-panel/agences/${id}/`,

  // EXPÉDITIONS
  EXPEDITIONS:        `${BASE_URL}/admin-panel/expeditions/`,
  EXPEDITION_DETAIL:  (id: number) => `${BASE_URL}/expeditions/${id}/track/`,

  // PAIEMENTS
  PAYMENTS:           `${BASE_URL}/admin-panel/payments/`,

  // ADMINS
  ADMINS:             `${BASE_URL}/admin-panel/admins/`,
  ADMIN_CREATE:       `${BASE_URL}/admin-panel/admins/create/`,
  ADMIN_DETAIL:       (id: number) => `${BASE_URL}/admin-panel/admins/${id}/`,

  CANDIDATURE_CREATE: `${BASE_URL}/drivers/candidatures/`,

  EXPEDITION_CREATE: `${BASE_URL}/expeditions/create/`,

  CHAUFFEURS_DISPONIBLES: `${BASE_URL}/expeditions/drivers-disponibles/`,

   // AGENCE DASHBOARD
  AGENCY_DASHBOARD:     `${BASE_URL}/agencies/dashboard/`,
  AGENCY_DRIVERS:       `${BASE_URL}/agencies/drivers/`,
  AGENCY_DRIVER_DETAIL: (id: number) => `${BASE_URL}/agencies/drivers/${id}/`,
  AGENCY_COURSES:       `${BASE_URL}/agencies/courses/`,
  AGENCY_FACTURES:      `${BASE_URL}/agencies/factures/`,
  AGENCY_PERFORMANCES:  `${BASE_URL}/agencies/performances/`,
  AGENCY_SUSPEND:       (id: number) => `${BASE_URL}/agencies/${id}/suspend/`,
};
