// @ts-nocheck

export type Role =
  | 'superadmin'
  | 'admin_operations'
  | 'admin_chauffeurs'
  | 'admin_finance'
  | 'admin_fraude'
  | 'support_client'
  | 'analyste_ia';

export type Module =
  | 'dashboard' | 'expeditions' | 'tracking' | 'clients'
  | 'chauffeurs' | 'agences' | 'payments' | 'escrow'
  | 'fraude' | 'litiges' | 'analytics' | 'reports'
  | 'admins' | 'settings';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export'
  | 'suspend' | 'validate' | 'investigate' | 'resolve' | 'approve';

export type PermissionMap = Partial<Record<Module, Action[]>>;

// ── MATRICE DES PERMISSIONS PAR RÔLE ────────────────────────

export const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {

  superadmin: {
    dashboard:   ['view', 'edit'],
    expeditions: ['view', 'create', 'edit', 'delete', 'export'],
    tracking:    ['view', 'edit'],
    clients:     ['view', 'create', 'edit', 'delete', 'export'],
    chauffeurs:  ['view', 'create', 'edit', 'delete', 'suspend', 'validate'],
    agences:     ['view', 'create', 'edit', 'delete', 'export'],
    payments:    ['view', 'edit', 'approve', 'export'],
    escrow:      ['view', 'edit', 'approve'],
    fraude:      ['view', 'investigate', 'edit', 'delete'],
    litiges:     ['view', 'resolve', 'edit', 'delete'],
    analytics:   ['view', 'export'],
    reports:     ['view', 'export'],
    admins:      ['view', 'create', 'edit', 'delete'],
    settings:    ['view', 'edit', 'delete'],
  },

  admin_operations: {
    dashboard:   ['view'],
    expeditions: ['view', 'create', 'edit', 'export'],
    tracking:    ['view'],
    clients:     ['view', 'edit'],
    chauffeurs:  ['view', 'edit'],
    agences:     ['view', 'edit'],
    payments:    ['view'],
    escrow:      ['view'],
    fraude:      ['view'],
    litiges:     ['view', 'edit'],
    analytics:   ['view'],
    reports:     ['view', 'export'],
    admins:      [],
    settings:    [],
  },

  admin_chauffeurs: {
    dashboard:   ['view'],
    expeditions: ['view'],
    tracking:    ['view', 'edit'],
    clients:     ['view'],
    chauffeurs:  ['view', 'create', 'edit', 'suspend', 'validate', 'export'],
    agences:     ['view', 'edit'],
    payments:    ['view'],
    escrow:      [],
    fraude:      ['view'],
    litiges:     ['view'],
    analytics:   ['view'],
    reports:     ['view'],
    admins:      [],
    settings:    [],
  },

  admin_finance: {
    dashboard:   ['view'],
    expeditions: ['view'],
    tracking:    [],
    clients:     ['view'],
    chauffeurs:  ['view'],
    agences:     ['view'],
    payments:    ['view', 'edit', 'approve', 'export'],
    escrow:      ['view', 'edit', 'approve'],
    fraude:      ['view'],
    litiges:     ['view'],
    analytics:   ['view'],
    reports:     ['view', 'export'],
    admins:      [],
    settings:    [],
  },

  admin_fraude: {
    dashboard:   ['view'],
    expeditions: ['view'],
    tracking:    ['view'],
    clients:     ['view'],
    chauffeurs:  [],
    agences:     ['view'],
    payments:    ['view'],
    escrow:      ['view'],
    fraude:      ['view', 'investigate', 'edit', 'export'],
    litiges:     ['view', 'resolve'],
    analytics:   ['view'],
    reports:     ['view', 'export'],
    admins:      [],
    settings:    [],
  },

  support_client: {
    dashboard:   ['view'],
    expeditions: ['view'],
    tracking:    [],
    clients:     ['view', 'edit'],
    chauffeurs:  [],
    agences:     [],
    payments:    ['view'],
    escrow:      [],
    fraude:      [],
    litiges:     ['view', 'resolve', 'edit'],
    analytics:   [],
    reports:     [],
    admins:      [],
    settings:    [],
  },

  analyste_ia: {
    dashboard:   ['view'],
    expeditions: ['view'],
    tracking:    ['view'],
    clients:     ['view'],
    chauffeurs:  ['view'],
    agences:     ['view'],
    payments:    ['view'],
    escrow:      [],
    fraude:      ['view'],
    litiges:     ['view'],
    analytics:   ['view', 'export'],
    reports:     ['view', 'export'],
    admins:      [],
    settings:    [],
  },
};

// ── MODULES AUTORISÉS PAR RÔLE ───────────────────────────────

export const ROLE_ALLOWED_MODULES: Record<Role, Module[]> = Object.fromEntries(
  Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => [
    role,
    (Object.entries(perms) as [Module, Action[]][])
      .filter(([, actions]) => actions.includes('view'))
      .map(([mod]) => mod),
  ])
) as Record<Role, Module[]>;

// ── HELPERS ──────────────────────────────────────────────────

export function hasPermission(
  permissions: PermissionMap,
  module: Module,
  action: Action
): boolean {
  return permissions[module]?.includes(action) ?? false;
}

export function canView(permissions: PermissionMap, module: Module): boolean {
  return hasPermission(permissions, module, 'view');
}

export function getPermissionsForRole(role: Role): PermissionMap {
  return ROLE_PERMISSIONS[role] ?? {};
}

export function getAllowedModulesForRole(role: Role): Module[] {
  return ROLE_ALLOWED_MODULES[role] ?? [];
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin:        '⭐ Super Admin',
  admin_operations:  '📦 Admin Opérations',
  admin_chauffeurs:  '🚕 Admin Chauffeurs',
  admin_finance:     '💰 Admin Finance',
  admin_fraude:      '🛡️ Admin Fraude',
  support_client:    '🎧 Support Client',
  analyste_ia:       '🤖 Analyste IA',
};

export const ROLE_COLORS: Record<Role, string> = {
  superadmin:        '#8B5CF6',
  admin_operations:  '#3B82F6',
  admin_chauffeurs:  '#22C55E',
  admin_finance:     '#F59E0B',
  admin_fraude:      '#EF4444',
  support_client:    '#06B6D4',
  analyste_ia:       '#84CC16',
};