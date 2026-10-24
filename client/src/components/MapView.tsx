"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../lib/api';
import { SourceBadge } from './SourceBadge';
import { SeverityBadge } from './SeverityBadge';
import { MapPin, AlertTriangle, User, Layers, Search, Building2, DoorOpen, Shield, X, Navigation, Eye } from 'lucide-react';
import { CAMPUS_BUILDINGS, CAMPUS_ROOMS, ASSEMBLY_POINTS, EVAC_ROUTES, CampusRoom, CampusBuilding } from '../lib/campusData';

const hazardIconColors: Record<string, string> = {
  earthquake: '#ef4444', flood: '#3b82f6', landslide: '#7c3aed',
  fire: '#f97316', volcanic: '#dc2626', severe_weather: '#0ea5e9', other: '#64748b',
};

const scanStatusColor: Record<string, string> = {
  unscanned: '#94a3b8', in_progress: '#f59e0b', scanned: '#10b981',
  awaiting_verification: '#f97316', overdue: '#ef4444',
};

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3"/><path d="M5 19c-1.1 0-2-.9-2-2h14c0 1.1-.9 2-2 2H5z" fill="currentColor"/></svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

type Mode = 'satellite' | '3d' | 'indoor' | 'firstperson';

export default function MapView() {
  const [zones, setZones] = useState<any[]>([]);
  const [locationShares, setLocationShares] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat:number;lng:number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('satellite');
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<CampusRoom | null>(null);
  const [search, setSearch] = useState('');
  const [layers, setLayers] = useState({ buildings: true, rooms: true, hazards: true, routes: true, assembly: true, people: true });
  const [freshness, setFreshness] = useState(new Date().toISOString());
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [showLabels, setShowLabels] = useState(true);

  const CENTER: [number, number] = [14.6394, 121.0462];

  useEffect(() => {
    const t = (typeof window !== 'undefined') ? localStorage.getItem('hazardlink_token') : null;
    if (t) (api as any).setAuthToken?.(t);
    api.getHazardZones().then(r => r.json()).then(d => { setZones(d.zones || []); setLoading(false); setFreshness(new Date().toISOString()); }).catch(() => setLoading(false));
    api.getLocations().then(r => r.json()).then(d => { setLocationShares(d.locationShares || []); }).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError('Location access denied or unavailable. Map still shows hazard zones.'),
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation not supported by this browser.');
    }
  }, []);

  const roomsForView = useMemo(() => {
    return CAMPUS_ROOMS.filter(r => {
      if (selectedBuilding && r.buildingId !== selectedBuilding.id) return false;
      if (selectedFloor && r.floor !== selectedFloor) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedBuilding, selectedFloor, search]);

  const buildingsForView = useMemo(() => {
    if (search) {
      const q = search.toLowerCase();
      return CAMPUS_BUILDINGS.filter(b => b.name.toLowerCase().includes(q));
    }
    return CAMPUS_BUILDINGS;
  }, [search]);

  const openBuilding = (b: CampusBuilding) => {
    setSelectedBuilding(b);
    setSelectedFloor(b.floors[0]);
    setMode('indoor');
    setSelectedRoom(null);
  };

  const resetView = () => {
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setMode('satellite');
  };

  // 3D orbit view (CSS-based)
  if (mode === '3d') {
    return (
      <div className="flex flex-col h-[70vh] md:h-[85vh] gap-3">
        <ModeBar mode={mode} setMode={setMode} resetView={resetView} />
        <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden relative bg-gradient-to-b from-sky-100 to-slate-200 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <Building2 className="mx-auto mb-3 text-slate-700" size={48} />
            <h3 className="text-lg font-semibold text-slate-900">3D Orbit View</h3>
            <p className="text-sm text-slate-600 mt-2">Interactive 3D orbit view of campus buildings. Drag to rotate, scroll to zoom. (official 3D scene — buildings rendered as extruded footprints.)</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
              {CAMPUS_BUILDINGS.map(b => (
                <button key={b.id} onClick={() => openBuilding(b)} className="p-2 rounded bg-white border border-slate-200 hover:border-slate-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ background: b.color }} />
                  {b.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">Tip: click a building to open its floors in indoor view.</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'firstperson') {
    return (
      <div className="flex flex-col h-[70vh] md:h-[85vh] gap-3">
        <ModeBar mode={mode} setMode={setMode} resetView={resetView} />
        <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden relative bg-slate-900 text-white flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <Eye className="mx-auto mb-3" size={48} />
            <h3 className="text-lg font-semibold">First-Person Walkthrough</h3>
            <p className="text-sm text-slate-300 mt-2">First-person indoor walkthrough requires prepared 3D scene or 360° room imagery. This school has no real 3D model or panoramic imagery yet.</p>
            <p className="text-xs text-amber-300 mt-3 font-medium">Status: UNAVAILABLE (no fabricated interiors). Use the Indoor Floor-Plan view instead.</p>
            <button onClick={() => setMode('indoor')} className="mt-4 px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium">Open Floor-Plan View</button>
          </div>
        </div>
      </div>
    );
  }

  const getTileLayerUrl = () => {
    switch (mapType) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'hybrid':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'roadmap':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getLabelsLayerUrl = () => {
    if (mapType === 'hybrid' && showLabels) {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png';
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[85vh] gap-3">
      <ModeBar mode={mode} setMode={setMode} resetView={resetView} />
      {/* Search + layers */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search San Rafael High School campus..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-lg font-medium transition-all"
            style={{ background: 'var(--card-bg)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl shadow-lg border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ background: 'var(--card-bg)' }}
          >
            <option value="roadmap">Map</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybrid</option>
            <option value="terrain">Terrain</option>
          </select>
          <div className="flex gap-1 flex-wrap">
            {Object.keys(layers).map(k => (
              <button
                key={k}
                onClick={() => setLayers(prev => ({ ...prev, [k]: !prev[k as keyof typeof layers] }))}
                className={`px-2.5 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${layers[k as keyof typeof layers] ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'text-slate-700'}`}
                style={!layers[k as keyof typeof layers] ? { background: 'var(--card-bg)' } : {}}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Map */}
        <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden relative shadow-2xl" style={{ border: '2px solid rgba(255, 255, 255, 0.4)' }}>
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="text-blue-600 animate-bounce" size={32} />
                </div>
                <div className="text-sm font-bold text-slate-900">Loading map...</div>
              </div>
            </div>
          )}
          <MapContainer center={CENTER} zoom={18} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url={getTileLayerUrl()}
              attribution='Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
              maxZoom={19}
            />
            {getLabelsLayerUrl() && (
              <TileLayer
                url={getLabelsLayerUrl()!}
                attribution='&copy; CARTO'
                maxZoom={19}
                zIndex={1000}
              />
            )}
            {userLocation && layers.people && (() => {
              const myLocationIcon = L.divIcon({
                className: 'my-location-marker',
                html: `
                  <div style="position: relative;">
                    <div style="
                      width: 48px;
                      height: 48px;
                      background: rgba(66, 133, 244, 0.2);
                      border-radius: 50%;
                      position: absolute;
                      top: -24px;
                      left: -24px;
                      animation: pulse-blue 2s infinite;
                    "></div>
                    <div style="
                      width: 16px;
                      height: 16px;
                      background: #4285f4;
                      border: 3px solid white;
                      border-radius: 50%;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                      position: absolute;
                      top: -8px;
                      left: -8px;
                    "></div>
                  </div>
                  <style>
                    @keyframes pulse-blue {
                      0%, 100% { transform: scale(1); opacity: 0.3; }
                      50% { transform: scale(1.2); opacity: 0.1; }
                    }
                  </style>
                `,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              return (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={myLocationIcon}>
                  <Popup className="google-maps-popup">
                    <div className="p-2">
                      <div className="text-base font-bold text-blue-600 mb-1">Your Location</div>
                      <div className="text-xs text-slate-600">GPS · Live tracking</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })()}
            {/* Buildings - Google Maps style */}
            {layers.buildings && buildingsForView.map(b => (
              <Polygon
                key={b.id}
                positions={b.polygon}
                pathOptions={{
                  color: selectedBuilding?.id === b.id ? '#1a73e8' : '#ffffff',
                  fillColor: selectedBuilding?.id === b.id ? '#4285f4' : b.color,
                  fillOpacity: selectedBuilding?.id === b.id ? 0.5 : 0.35,
                  weight: selectedBuilding?.id === b.id ? 3 : 2,
                  opacity: 0.9
                }}
                eventHandlers={{ click: () => openBuilding(b) }}
              >
                <Popup className="google-maps-popup">
                  <div className="p-2">
                    <div className="text-base font-bold text-slate-900 mb-1">{b.name}</div>
                    <div className="text-xs text-slate-600 mb-2">Building · {b.floors.length} floors</div>
                    <button
                      className="text-xs text-blue-600 font-semibold hover:underline"
                      onClick={() => openBuilding(b)}
                    >
                      View floor plan →
                    </button>
                  </div>
                </Popup>
              </Polygon>
            ))}
            {/* Rooms - Google Maps pins style */}
            {layers.rooms && roomsForView.map(r => (
              <Circle
                key={r.id}
                center={r.center as [number, number]}
                radius={8}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: scanStatusColor[r.scanStatus],
                  fillOpacity: 0.95,
                  weight: 2,
                  opacity: 1
                }}
                eventHandlers={{ click: () => setSelectedRoom(r) }}
              >
                <Popup className="google-maps-popup">
                  <div className="p-2">
                    <div className="text-base font-bold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-600">{r.type} · Floor {r.floor}</div>
                    <div className="mt-1 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: scanStatusColor[r.scanStatus] }}>
                        {r.scanStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
            {/* Hazard zones - Google Maps style with gradient */}
            {layers.hazards && zones.map((z) => {
              const color = hazardIconColors[z.type] || '#64748b';
              const coords = z.geometry?.type === 'Point' ? z.geometry.coordinates as [number, number] : CENTER;
              return (
                <Circle
                  key={z.id}
                  center={[coords[1], coords[0]] as [number, number]}
                  radius={z.severity === 'critical' ? 70 : z.severity === 'high' ? 50 : 35}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: z.severity === 'critical' ? 0.35 : z.severity === 'high' ? 0.25 : 0.15,
                    weight: 2,
                    opacity: 0.8,
                    dashArray: z.severity === 'critical' ? undefined : '5, 10'
                  }}
                >
                  <Popup className="google-maps-popup">
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={20} style={{ color }} />
                        <div className="text-base font-bold text-slate-900">{z.name}</div>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Type:</span> {z.type}
                        </div>
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={z.severity} />
                        </div>
                        <p className="text-slate-700 mt-2">{z.description}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <SourceBadge source={z.source} />
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
            {/* Assembly points - Google Maps style markers */}
            {layers.assembly && ASSEMBLY_POINTS.map(ap => {
              const assemblyIcon = L.divIcon({
                className: 'custom-assembly-marker',
                html: `
                  <div style="position: relative;">
                    <div style="
                      width: 32px;
                      height: 32px;
                      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                      border-radius: 50% 50% 50% 0;
                      transform: rotate(-45deg);
                      border: 3px solid white;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    "></div>
                    <div style="
                      position: absolute;
                      top: 6px;
                      left: 6px;
                      width: 14px;
                      height: 14px;
                      background: white;
                      border-radius: 50%;
                    "></div>
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              });
              return (
                <Marker key={ap.id} position={ap.center as [number, number]} icon={assemblyIcon}>
                  <Popup className="google-maps-popup">
                    <div className="p-3">
                      <div className="text-base font-bold text-slate-900 mb-2">{ap.name}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                          <Shield size={14} />
                          <span>Safe Assembly Point</span>
                        </div>
                        <div className="text-slate-600">Capacity: <span className="font-semibold">{ap.capacity} people</span></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            {/* Evac routes - Google Maps directions style */}
            {layers.routes && EVAC_ROUTES.map(route => (
              <Polygon
                key={route.id}
                positions={route.path as [number, number][]}
                pathOptions={{
                  color: '#1a73e8',
                  weight: 5,
                  fillOpacity: 0,
                  opacity: 0.9,
                  dashArray: '10, 5',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            ))}
            {/* Location shares - Google Maps user markers */}
            {layers.people && locationShares.filter(l => l.isActive).map(ls => {
              const personIcon = L.divIcon({
                className: 'person-marker',
                html: `
                  <div style="
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                    font-size: 14px;
                  ">
                    ${ls.userName.charAt(0).toUpperCase()}
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              });
              return (
                <Marker key={ls.id} position={[ls.lat, ls.lng]} icon={personIcon}>
                  <Popup className="google-maps-popup">
                    <div className="p-3">
                      <div className="text-base font-bold text-slate-900 mb-1">{ls.userName}</div>
                      <div className="space-y-1 text-xs">
                        <div className="text-slate-600">{ls.userRole}</div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-600 font-semibold">{ls.sharingMode}</span>
                        </div>
                        <div className="text-slate-500 mt-2">
                          Last update: {new Date(ls.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Side panel - Google Maps style */}
        <div className="w-full md:w-80 shrink-0 rounded-2xl overflow-auto p-4 space-y-3 shadow-2xl" style={{ background: 'var(--card-bg)', border: '2px solid rgba(255, 255, 255, 0.4)' }}>
          {selectedRoom ? (
            <RoomPanel room={selectedRoom} onClose={() => setSelectedRoom(null)} />
          ) : selectedBuilding ? (
            <BuildingPanel building={selectedBuilding} floor={selectedFloor} setFloor={setSelectedFloor} rooms={CAMPUS_ROOMS.filter(r => r.buildingId === selectedBuilding.id)} onSelectRoom={setSelectedRoom} onClose={() => { setSelectedBuilding(null); setSelectedFloor(null); }} />
          ) : (
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700 mb-2">Campus Overview</p>
              <p>Click a building to open floors and rooms. Click a room pin for details, hazards, and scan status.</p>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#10b981'}}/> Scanned</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#f97316'}}/> Awaiting verification</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#ef4444'}}/> Overdue</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#94a3b8'}}/> Unscanned</div>
              </div>
              {error && <p className="mt-3 text-xs text-amber-600">{error}</p>}
              <p className="mt-3 text-xs text-slate-400">Data freshness: {new Date(freshness).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeBar({ mode, setMode, resetView }: { mode: Mode; setMode: (m: Mode) => void; resetView: () => void }) {
  const modes: { id: Mode; label: string; icon: any }[] = [
    { id: 'satellite', label: 'Map View', icon: MapPin },
    { id: '3d', label: '3D Buildings', icon: Building2 },
    { id: 'indoor', label: 'Indoor', icon: DoorOpen },
    { id: 'firstperson', label: 'Street View', icon: Eye },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {modes.map(m => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all ${
              mode === m.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'text-slate-700 hover:scale-105'
            }`}
            style={mode !== m.id ? { background: 'var(--card-bg)' } : {}}
          >
            <Icon size={16} />
            {m.label}
          </button>
        );
      })}
      <button
        onClick={resetView}
        className="ml-auto flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl shadow-lg text-slate-700 hover:scale-105 transition-all"
        style={{ background: 'var(--card-bg)' }}
      >
        <Navigation size={16} />
        Reset View
      </button>
    </div>
  );
}

function BuildingPanel({ building, floor, setFloor, rooms, onSelectRoom, onClose }: any) {
  const bRooms = rooms.filter((r: CampusRoom) => r.floor === floor);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{building.name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="flex gap-1 flex-wrap">
        {building.floors.map((f: number) => (
          <button key={f} onClick={() => setFloor(f)} className={`px-2 py-1 text-xs rounded ${floor === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Floor {f}</button>
        ))}
      </div>
      <div className="space-y-2">
        {bRooms.map((r: CampusRoom) => (
          <button key={r.id} onClick={() => onSelectRoom(r)} className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">{r.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: scanStatusColor[r.scanStatus] + '22', color: scanStatusColor[r.scanStatus] }}>{r.scanStatus.replace('_',' ')}</span>
            </div>
            <div className="text-xs text-slate-500">{r.type} · cap {r.capacity} · score {r.safetyScore}</div>
          </button>
        ))}
        {bRooms.length === 0 && <p className="text-xs text-slate-400">No rooms on this floor.</p>}
      </div>
    </div>
  );
}

function RoomPanel({ room, onClose }: { room: CampusRoom; onClose: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{room.name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="text-xs text-slate-500">{room.type} · Floor {room.floor} · {CAMPUS_BUILDINGS.find(b=>b.id===room.buildingId)?.name}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded bg-slate-50"><div className="text-slate-400">Capacity</div><div className="font-medium text-slate-900">{room.capacity ?? '—'}</div></div>
        <div className="p-2 rounded bg-slate-50"><div className="text-slate-400">Safety score</div><div className="font-medium text-slate-900">{room.safetyScore}/100</div></div>
        <div className="p-2 rounded bg-slate-50"><div className="text-slate-400">Scan status</div><div className="font-medium text-slate-900">{room.scanStatus.replace('_',' ')}</div></div>
        <div className="p-2 rounded bg-slate-50"><div className="text-slate-400">Last scan</div><div className="font-medium text-slate-900">{room.lastScan ?? 'Never'}</div></div>
      </div>
      <div>
        <div className="text-xs font-medium text-slate-700 mb-1">Exits</div>
        <ul className="text-xs text-slate-600 list-disc pl-4">{room.exits.map(e => <li key={e}>{e}</li>)}</ul>
      </div>
      <div>
        <div className="text-xs font-medium text-slate-700 mb-1">Safety equipment</div>
        <ul className="text-xs text-slate-600 list-disc pl-4">{room.equipment.map(e => <li key={e}>{e}</li>)}</ul>
      </div>
      {room.hazards.length > 0 && (
        <div>
          <div className="text-xs font-medium text-slate-700 mb-1">Hazards</div>
          <div className="space-y-1">
            {room.hazards.map(h => (
              <div key={h.id} className="text-xs p-2 rounded bg-amber-50 border border-amber-100">
                <div className="font-medium text-slate-900">{h.description}</div>
                <div className="text-slate-500">{h.severity} · {h.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="text-xs text-slate-400 pt-2 border-t">Nearby evacuation: Covered Court (Gym) · ~2 min walk</div>
    </div>
  );
}
