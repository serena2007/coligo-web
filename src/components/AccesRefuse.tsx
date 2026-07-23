// src/components/AccesRefuse.tsx
import React from 'react';

export default function AccesRefuse({ module = 'ce module' }: { module?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: 400, gap: 12, textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Accès refusé</div>
      <div style={{ fontSize: 13, color: '#94A3B8', maxWidth: 360 }}>
        Vous n'avez pas les permissions nécessaires pour accéder à {module}. Contactez un Super Admin si vous pensez que c'est une erreur.
      </div>
    </div>
  );
}