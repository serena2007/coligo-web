import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getToken } from '../hooks/useApiClient'; // ajuste le chemin si besoin
import { useAuth } from '../hooks/useAuth'; // ajuste selon l'emplacement réel de ce fichier

export interface GpsAlert {
  id: string;
  expedition_id: number;
  driver_nom: string;
  driver_prenom: string;
  driver_telephone: string;
  adresse_livraison: string;
  reason: 'desactive_manuellement' | 'connexion_perdue';
  receivedAt: string;
}

interface AlertsContextType {
  alerts: GpsAlert[];
  unreadCount: number;
  markAllRead: () => void;
  dismissAlert: (id: string) => void;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

const WS_BASE_URL = 'ws://127.0.0.1:8000';

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<GpsAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
  const token = getToken();
  if (!token) return;

  // Évite une double connexion si l'effet se redéclenche sans raison
  if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
    return;
  }

  const ws = new WebSocket(`${WS_BASE_URL}/ws/admin/alerts/?token=${token}`);
  wsRef.current = ws;

  ws.onopen = () => console.log('Connecté aux alertes admin');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const alert: GpsAlert = {
      id: `${data.expedition_id}-${Date.now()}`,
      expedition_id: data.expedition_id,
      driver_nom: data.driver_nom,
      driver_prenom: data.driver_prenom,
      driver_telephone: data.driver_telephone,
      adresse_livraison: data.adresse_livraison,
      reason: data.reason,
      receivedAt: new Date().toISOString(),
    };
    setAlerts((prev) => [alert, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  ws.onerror = (error) => console.log('Erreur WebSocket alertes:', error);
  ws.onclose = () => console.log('WebSocket alertes fermé');

  return () => {
    ws.close();
    wsRef.current = null;
  };
}, []); // ← dépendance vide : une seule connexion à la première montée

  function markAllRead() {
    setUnreadCount(0);
  }

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <AlertsContext.Provider value={{ alerts, unreadCount, markAllRead, dismissAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}