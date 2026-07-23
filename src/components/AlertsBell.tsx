import { Bell, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { useAlerts } from '../contexts/AlertsContext';

export function AlertsBell() {
  const { alerts, unreadCount, markAllRead, dismissAlert } = useAlerts();
  const [open, setOpen] = useState(false);

  function toggleOpen() {
    setOpen(!open);
    if (!open) markAllRead();
  }

  return (
    <div className="relative">
      <button onClick={toggleOpen} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[500px] overflow-y-auto">
          <div className="p-3 border-b font-semibold text-gray-800">Alertes GPS</div>
          {alerts.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Aucune alerte pour le moment.</div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-3 border-b bg-red-50 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-red-700 text-sm">
                    ⚠️ GPS {alert.reason === 'desactive_manuellement' ? 'désactivé' : 'connexion perdue'}
                  </span>
                  <button onClick={() => dismissAlert(alert.id)}>
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <span className="text-sm text-gray-800">
                  {alert.driver_prenom} {alert.driver_nom} — Course #{alert.expedition_id}
                </span>
                <span className="text-xs text-gray-500">{alert.adresse_livraison}</span>
                
                <a href={`tel:${alert.driver_telephone}`}
                  className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Phone size={14} /> {alert.driver_telephone}
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}