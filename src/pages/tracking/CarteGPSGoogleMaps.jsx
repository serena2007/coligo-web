// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

// npm install @react-google-maps/api

const C = {
  vert: '#22C55E', bleu: '#3B82F6', ambre: '#F59E0B', rouge: '#EF4444',
  texteMuted: '#94A3B8',
};

// ⚠️ À AJUSTER selon votre config :
// - clé API Google Maps (Google Cloud Console → Maps JavaScript API activée)
// - URL du backend WebSocket (adapter host/port en prod, ex: wss://votre-domaine.com)
const GOOGLE_MAPS_API_KEY = 'VOTRE_CLE_API_GOOGLE_MAPS';
const WS_BASE_URL = 'ws://127.0.0.1:8000';

const DOUALA_CENTER = { lat: 4.0511, lng: 9.7679 };

function markerIcon(color) {
  return {
    path: 'M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1,
  };
}

function statutColor(pos) {
  // Simplification : "en mission" si le chauffeur bouge, "disponible" sinon.
  // À terme on peut enrichir le payload backend (get_active_expedition) pour
  // renvoyer un vrai statut (en_mission / retard / incident) et remplacer cette heuristique.
  if (!pos.is_online) return C.texteMuted;
  if (pos.speed && pos.speed > 3) return C.bleu;
  return C.vert;
}

// Construit un objet "chauffeur" compatible avec ce qu'attendent DrawerChauffeur /
// ControlRoomMode plus loin dans TrackingPage.jsx (mêmes noms de champs que le mock),
// en essayant d'abord de retrouver un vrai profil dans le tableau `chauffeurs` reçu en props
// (utile quand vous brancherez un jour un endpoint qui renvoie nom/plaque/téléphone réels).
function buildChauffeurObject(driverId, pos, chauffeursProps) {
  const profil = chauffeursProps?.find(c => String(c.driver_id) === String(driverId));
  const statut = !pos.is_online ? 'hors_ligne' : (pos.speed && pos.speed > 3 ? 'en_mission' : 'disponible');

  return {
    id: driverId,
    driver_id: String(driverId),
    nom: profil?.nom || `Chauffeur #${driverId}`,
    statut: profil?.statut || statut,
    lat: pos.latitude,
    lng: pos.longitude,
    vitesse: pos.speed || 0,
    cap: pos.heading || 0,
    plaque: profil?.plaque || 'N/A',
    gabarit: profil?.gabarit || 'N/A',
    telephone: profil?.telephone || 'N/A',
    score_perf: profil?.score_perf ?? 0,
    score_fiab: profil?.score_fiab ?? 0,
    risque: profil?.risque ?? 0,
    mission_id: profil?.mission_id || null,
    destination: profil?.destination || null,
    eta: profil?.eta || null,
    distance_restante: profil?.distance_restante || null,
  };
}

// Props identiques à l'ancien CarteGPS pour ne rien casser dans TrackingPage.jsx :
// chauffeurs, selectedChauffeur, onSelectChauffeur, vueMode
export default function CarteGPSGoogleMaps({ chauffeurs, selectedChauffeur, onSelectChauffeur, vueMode }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // positions = { [driver_id]: { latitude, longitude, heading, speed, is_online } }
  const [positions, setPositions] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token'); // ⚠️ adapter selon où vous stockez le JWT admin
    const ws = new WebSocket(`${WS_BASE_URL}/ws/admin/tracking/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'initial_positions') {
        const snapshot = {};
        data.positions.forEach((p) => {
          snapshot[p.driver_id] = { ...p, is_online: true };
        });
        setPositions(snapshot);
      }

      if (data.type === 'location_broadcast') {
        setPositions((prev) => ({
          ...prev,
          [data.driver_id]: {
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading,
            speed: data.speed,
            is_online: true,
          },
        }));
      }

      if (data.type === 'driver_offline') {
        setPositions((prev) => {
          const next = { ...prev };
          if (next[data.driver_id]) {
            next[data.driver_id] = { ...next[data.driver_id], is_online: false };
          }
          return next;
        });
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnexion automatique après 3s (utile si le wifi de la salle est instable pendant la soutenance)
      setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  if (!isLoaded) {
    return <div style={{ padding: 24, color: C.texteMuted }}>Chargement de la carte...</div>;
  }

  const entries = Object.entries(positions);
  const selectedId = selectedChauffeur ? String(selectedChauffeur.driver_id ?? selectedChauffeur.id) : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={DOUALA_CENTER}
        zoom={12}
        mapTypeId={vueMode === 'satellite' ? 'satellite' : 'roadmap'}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {entries.map(([driverId, pos]) => (
          <Marker
            key={driverId}
            position={{ lat: pos.latitude, lng: pos.longitude }}
            icon={markerIcon(statutColor(pos))}
            onClick={() => onSelectChauffeur?.(buildChauffeurObject(driverId, pos, chauffeurs))}
          />
        ))}

        {selectedId && positions[selectedId] && (
          <InfoWindow
            position={{ lat: positions[selectedId].latitude, lng: positions[selectedId].longitude }}
            onCloseClick={() => onSelectChauffeur?.(null)}
          >
            <div style={{ fontSize: 12 }}>
              <strong>{selectedChauffeur?.nom || `Chauffeur #${selectedId}`}</strong>
              <div>Vitesse : {positions[selectedId].speed ?? '—'} km/h</div>
              <div>{positions[selectedId].is_online ? 'En ligne' : 'Hors ligne'}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Indicateur de connexion WebSocket */}
      <div style={{
        position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,.75)', color: '#fff',
        fontSize: 11, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: connected ? C.vert : C.rouge,
        }} />
        {connected ? `${entries.filter(([, p]) => p.is_online).length} chauffeur(s) en ligne` : 'Connexion...'}
      </div>
    </div>
  );
}
