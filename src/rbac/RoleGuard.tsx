// @ts-nocheck
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Module, Role } from './permissions';

interface RoleGuardProps {
  // Exiger un ou plusieurs modules + action
  module?: Module;
  action?: string;
  // Exiger un ou plusieurs rôles spécifiques
  roles?: Role | Role[];
  // Ce qui s'affiche si accès refusé
  fallback?: React.ReactNode;
  // Si true, affiche rien (invisible) au lieu du fallback
  silent?: boolean;
  children: React.ReactNode;
}

/**
 * Protège n'importe quel élément React selon les permissions.
 *
 * Usages :
 *   <RoleGuard module="admins" action="delete">
 *     <button>Supprimer admin</button>
 *   </RoleGuard>
 *
 *   <RoleGuard roles="superadmin" fallback={<span>Non autorisé</span>}>
 *     <SectionConfidentielle />
 *   </RoleGuard>
 *
 *   <RoleGuard module="payments" action="approve" silent>
 *     <button>Approuver paiement</button>
 *   </RoleGuard>
 */
export default function RoleGuard({
  module,
  action = 'view',
  roles,
  fallback = null,
  silent = false,
  children,
}: RoleGuardProps) {
  const { can, isRole, user } = useAuth();

  if (!user) return silent ? null : <>{fallback}</>;

  // Vérification par rôle
  if (roles !== undefined && !isRole(roles)) {
    return silent ? null : <>{fallback}</>;
  }

  // Vérification par permission
  if (module !== undefined && !can(module, action)) {
    return silent ? null : <>{fallback}</>;
  }

  return <>{children}</>;
}

// ── Variantes raccourcies ────────────────────────────────────

/** Visible uniquement pour le superadmin */
export function SuperAdminOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles="superadmin" fallback={fallback} silent={!fallback}>
      {children}
    </RoleGuard>
  );
}

/** Masqué si l'utilisateur n'a pas l'action sur le module */
export function CanDo({ module, action, children }) {
  return (
    <RoleGuard module={module} action={action} silent>
      {children}
    </RoleGuard>
  );
}