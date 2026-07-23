// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// npm install leaflet react-leaflet
// Aucune clé API, aucune carte bancaire nécessaire — les tuiles viennent d'OpenStreetMap (gratuit).

const C = {
  vert: '#22C55E', bleu: '#3B82F6', ambre: '#F59E0B', rouge: '#EF4444',
  texteMuted: '#94A3B8',
};

// ⚠️ À AJUSTER : URL du backend WebSocket (adapter host/port en prod, ex: wss://votre-domaine.com)
const WS_BASE_URL = 'ws://127.0.0.1:8000';
// ⚠️ À AJUSTER : même host que WS_BASE_URL, mais en HTTP pour les appels REST
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const DOUALA_CENTER = [4.0511, 9.7679];

const STATUT_LIVRAISON_COLOR = {
  en_cours: C.ambre,   // livraison active — couleur bien visible
  livre: C.vert,       // livraison terminée
};

// Icône de livraison : pastille colorée + petit badge avec l'identifiant du chauffeur
// (contrairement à coloredIcon utilisé pour les chauffeurs, celle-ci porte un texte)
function livraisonIcon(statutLivraison, driverLabel) {
  const color = STATUT_LIVRAISON_COLOR[statutLivraison] || C.texteMuted;
  const badge = driverLabel
    ? `<div style="
        position: absolute; top: -8px; left: 16px;
        background: #111; color: #fff; font-size: 9px; font-weight: 700;
        padding: 1px 5px; border-radius: 8px; white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,.5);
      ">${driverLabel}</div>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="position: relative;">
      <div style="
        width: 16px; height: 16px; border-radius: 50%;
        background: ${color}; border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,.4);
      "></div>
      ${badge}
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function statutColor(pos) {
  // Simplification : "en mission" si le chauffeur bouge, "disponible" sinon.
  // À terme on peut enrichir le payload backend (get_active_expedition) pour
  // renvoyer un vrai statut (en_mission / retard / incident) et remplacer cette heuristique.
  if (!pos.is_online) return C.texteMuted;
  if (pos.speed && pos.speed > 3) return C.bleu;
  return C.vert;
}

// Icône de marqueur colorée (cercle SVG inline, pas besoin d'image externe)
function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px; height: 18px; border-radius: 50%;
      background: ${color}; border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
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

// Recentre/déplace la carte en douceur quand un chauffeur est sélectionné depuis la liste
function FlyToSelected({ selectedId, positions }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId && positions[selectedId]) {
      map.flyTo([positions[selectedId].latitude, positions[selectedId].longitude], Math.max(map.getZoom(), 13), { duration: 0.6 });
    }
  }, [selectedId, positions, map]);
  return null;
}

// Props identiques à l'ancien CarteGPS pour ne rien casser dans TrackingPage.jsx :
// chauffeurs, selectedChauffeur, onSelectChauffeur, vueMode
export default function CarteGPSLeaflet({ chauffeurs, selectedChauffeur, onSelectChauffeur, vueMode }) {
  const [positions, setPositions] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  // Livraisons en cours / livrées à afficher sur la carte (points colorés + indice du chauffeur)
  const [livraisons, setLivraisons] = useState([]);

  const fetchLivraisons = useCallback(async () => {
    try {
      const token = localStorage.getItem('coligo_token');
      const res = await fetch(`${API_BASE_URL}/expeditions/admin/livraisons-carte/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLivraisons(data);
    } catch (err) {
      console.log('Erreur chargement livraisons carte:', err);
    }
  }, []);

  useEffect(() => {
    fetchLivraisons();
    const interval = setInterval(fetchLivraisons, 20000); // rafraîchi toutes les 20s
    return () => clearInterval(interval);
  }, [fetchLivraisons]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('coligo_token');
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

  const entries = Object.entries(positions);
  const selectedId = selectedChauffeur ? String(selectedChauffeur.driver_id ?? selectedChauffeur.id) : null;

  // Fond de carte sombre en mode "heatmap"/"satellite" (esthétique proche de l'ancien canvas),
  // fond clair classique en mode "normal". Tuiles gratuites CARTO + OpenStreetMap.
  const tileUrl = (vueMode === 'satellite' || vueMode === 'heatmap' || vueMode === 'trafic')
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={DOUALA_CENTER}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        <FlyToSelected selectedId={selectedId} positions={positions} />

        {entries.map(([driverId, pos]) => (
          <Marker
            key={driverId}
            position={[pos.latitude, pos.longitude]}
            icon={coloredIcon(statutColor(pos))}
            eventHandlers={{
              click: () => onSelectChauffeur?.(buildChauffeurObject(driverId, pos, chauffeurs)),
            }}
          >
            <Popup>
              <div style={{ fontSize: 12 }}>
                <strong>Chauffeur #{driverId}</strong>
                <div>Vitesse : {pos.speed ?? '—'} km/h</div>
                <div>{pos.is_online ? 'En ligne' : 'Hors ligne'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {livraisons.map((l) => {
          // Indice court du chauffeur affiché sur le badge (initiales ou "—" si pas encore assigné)
          const driverLabel = l.driver_nom
            ? l.driver_nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
            : null;
          return (
            <Marker
              key={`livraison-${l.id}`}
              position={[l.lat_livraison, l.lng_livraison]}
              icon={livraisonIcon(l.statut, driverLabel)}
            >
              <Popup>
                <div style={{ fontSize: 12 }}>
                  <strong>Expédition #{l.id}</strong>
                  <div>{l.statut === 'en_cours' ? '🚚 En cours de livraison' : '✅ Livrée'}</div>
                  <div>Chauffeur : {l.driver_nom || 'Non assigné'}</div>
                  <div>Destination : {l.adresse_livraison}</div>
                  <div>Tarif : {parseFloat(l.tarif).toLocaleString()} F</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Indicateur de connexion WebSocket */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 1000, background: 'rgba(0,0,0,.75)', color: '#fff',
        fontSize: 11, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: connected ? C.vert : C.rouge,
        }} />
        {connected ? `${entries.filter(([, p]) => p.is_online).length} chauffeur(s) en ligne` : 'Connexion...'}
      </div>

      {/* Légende des livraisons */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000, background: 'rgba(0,0,0,.75)', color: '#fff',
        fontSize: 11, padding: '6px 10px', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.ambre }} />
          En cours ({livraisons.filter(l => l.statut === 'en_cours').length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.vert }} />
          Livrées ({livraisons.filter(l => l.statut === 'livre').length})
        </div>
      </div>
    </div>
  );
}
