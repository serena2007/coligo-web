// @ts-nocheck
import { useAuth } from '../hooks/useAuth';
import { Module, Action } from './permissions';

/**
 * Hook utilitaire pour vérifier les permissions dans n'importe quel composant.
 *
 * Exemple d'usage :
 *   const { can, canView, isAdmin } = usePermission();
 *   if (can('chauffeurs', 'suspend')) { ... }
 *   if (canView('finance')) { ... }
 */
export function usePermission() {
  const { can, canAccess, isRole, role, permissions, allowedModules } = useAuth();

  return {
    // Vérifie une permission spécifique
    can: (module: Module, action: Action) => can(module, action),

    // Vérifie si le module est visible
    canView: (module: Module) => canAccess(module),

    // Vérifie le rôle
    isRole,

    // Raccourcis pratiques
    isSuperAdmin:      () => isRole('superadmin'),
    isAdminOps:        () => isRole('admin_operations'),
    isAdminChauffeurs: () => isRole('admin_chauffeurs'),
    isAdminFinance:    () => isRole('admin_finance'),
    isAdminFraude:     () => isRole('admin_fraude'),
    isSupport:         () => isRole('support_client'),
    isAnalyste:        () => isRole('analyste_ia'),

    // Données brutes
    role,
    permissions,
    allowedModules,
  };
}