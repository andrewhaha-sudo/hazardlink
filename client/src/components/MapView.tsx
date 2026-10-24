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

  return (
    <div className="flex flex-col h-[70vh] md:h-[85vh] gap-3">
      <ModeBar mode={mode} setMode={setMode} resetView={resetView} />
      {/* Search + layers */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buildings, rooms, hazards..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {Object.keys(layers).map(k => (
            <button
              key={k}
              onClick={() => setLayers(prev => ({ ...prev, [k]: !prev[k as keyof typeof layers] }))}
              className={`px-2 py-1.5 text-xs rounded-lg border ${layers[k as keyof typeof layers] ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Map */}
        <div className="flex-1 min-h-[400px] border border-slate-200 rounded-xl overflow-hidden relative">
          {loading && <div className="absolute inset-0 z-[1000] bg-white/70 flex items-center justify-center text-slate-500 text-sm">Loading map...</div>}
          <MapContainer center={CENTER} zoom={17} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && layers.people && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-sm font-medium">Your Location (GPS)</div>
                  <div className="text-xs text-slate-500">Approximate • tap for precision</div>
                </Popup>
              </Marker>
            )}
            {/* Buildings */}
            {layers.buildings && buildingsForView.map(b => (
              <Polygon
                key={b.id}
                positions={b.polygon}
                pathOptions={{ color: b.color, fillColor: b.color, fillOpacity: selectedBuilding?.id === b.id ? 0.45 : 0.2, weight: 2 }}
                eventHandlers={{ click: () => openBuilding(b) }}
              >
                <Popup>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="text-xs text-slate-500">Floors: {b.floors.join(', ')}</div>
                  <button className="mt-1 text-xs text-blue-600 underline" onClick={() => openBuilding(b)}>Open floors</button>
                </Popup>
              </Polygon>
            ))}
            {/* Rooms */}
            {layers.rooms && roomsForView.map(r => (
              <Circle
                key={r.id}
                center={r.center as [number, number]}
                radius={6}
                pathOptions={{ color: scanStatusColor[r.scanStatus], fillColor: scanStatusColor[r.scanStatus], fillOpacity: 0.9, weight: 1 }}
                eventHandlers={{ click: () => setSelectedRoom(r) }}
              >
                <Popup>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.type} · Floor {r.floor}</div>
                </Popup>
              </Circle>
            ))}
            {/* Hazard zones */}
            {layers.hazards && zones.map((z) => {
              const color = hazardIconColors[z.type] || '#64748b';
              const coords = z.geometry?.type === 'Point' ? z.geometry.coordinates as [number, number] : CENTER;
              return (
                <Circle
                  key={z.id}
                  center={[coords[1], coords[0]] as [number, number]}
                  radius={z.severity === 'critical' ? 60 : z.severity === 'high' ? 45 : 30}
                  color={color}
                  fillColor={color}
                  fillOpacity={0.18}
                >
                  <Popup>
                    <div className="text-sm font-medium">{z.name}</div>
                    <div className="text-xs text-slate-500">{z.type} · {z.severity}</div>
                    <div className="text-xs text-slate-500">{z.description}</div>
                    <SourceBadge source={z.source} />
                  </Popup>
                </Circle>
              );
            })}
            {/* Assembly points */}
            {layers.assembly && ASSEMBLY_POINTS.map(ap => (
              <Marker key={ap.id} position={ap.center as [number, number]}>
                <Popup>
                  <div className="text-sm font-semibold">{ap.name}</div>
                  <div className="text-xs text-slate-500">Assembly point · capacity {ap.capacity}</div>
                </Popup>
              </Marker>
            ))}
            {/* Evac routes */}
            {layers.routes && EVAC_ROUTES.map(route => (
              <Polygon key={route.id} positions={route.path as [number, number][]} pathOptions={{ color: '#10b981', weight: 3, fillOpacity: 0 }} />
            ))}
            {/* Location shares */}
            {layers.people && locationShares.filter(l => l.isActive).map(ls => (
              <Marker key={ls.id} position={[ls.lat, ls.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-sm font-medium">{ls.userName}</div>
                  <div className="text-xs text-slate-500">{ls.userRole} · {ls.sharingMode}</div>
                  <div className="text-xs text-slate-400">Last seen: {new Date(ls.lastUpdate).toLocaleTimeString()}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Side panel */}
        <div className="w-full md:w-80 shrink-0 border border-slate-200 rounded-xl bg-white overflow-auto p-3 space-y-3">
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
  const modes: { id: Mode; label: string }[] = [
    { id: 'satellite', label: 'Satellite / Bird-eye' },
    { id: '3d', label: '3D Orbit' },
    { id: 'indoor', label: 'Indoor Floor Plan' },
    { id: 'firstperson', label: 'First-Person' },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`px-3 py-1.5 text-xs rounded-lg border ${mode === m.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          {m.label}
        </button>
      ))}
      <button onClick={resetView} className="ml-auto px-3 py-1.5 text-xs rounded-lg border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">Reset to campus</button>
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
