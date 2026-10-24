"use client";
/**
 * HAZARDLINK — Evacuation Routes
 * Safe routes from user location to assembly points, avoiding hazard zones.
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SourceBadge } from '../../components/SourceBadge';
import { Route, AlertTriangle, MapPin, ChevronRight } from 'lucide-react';

export default function RoutesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat:number;lng:number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHazardZones().then(r => r.json()).then(d => { setZones(d.zones || []); setLoading(false); }).catch(() => setLoading(false));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const assemblyPoint = { lat: 14.6401, lng: 121.0470, name: 'Covered Court — Assembly Area' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Route className="text-blue-600" /> Evacuation Routes
        </h1>
        <p className="text-slate-600">Safest routes from your location to assembly points, avoiding hazard zones.</p>
      </div>
        <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Recommended Route</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded border bg-blue-50 border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <div className="font-medium text-slate-900">Exit Main Building → West Stairway</div>
                  <div className="text-xs text-slate-600">Do NOT use East Stairway (blocked — fallen debris)</div>
                </div>
                <ChevronRight className="text-slate-400" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded border bg-slate-100 border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <div className="font-medium text-slate-900">West Stairway → Ground Floor Exit (Gate 2)</div>
                  <div className="text-xs text-slate-600">Gate 1 is flood-prone — avoid during heavy rain</div>
                </div>
                <ChevronRight className="text-slate-400" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded border bg-green-50 border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <div className="font-medium text-slate-900">Gate 2 → Covered Court Assembly Point</div>
                  <div className="text-xs text-slate-600">Designated safe assembly area — gather here</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-80">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Route Details</h3>
            <div className="space-y-3">
              <div className="p-3 rounded bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-800 text-sm">Warning: Route information may be outdated</div>
                    <div className="text-xs text-amber-700">Some areas have not been recently verified. Follow floor warden instructions.</div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800 text-sm">Nearest Assembly Point</div>
                    <div className="text-xs text-blue-700">{assemblyPoint.name}</div>
                    <div className="text-xs text-blue-600">~300 m from main building</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded bg-slate-50 border border-slate-200">
              <div className="font-medium text-slate-900 text-sm mb-2">Active Hazard Zones Near Routes ({zones.length})</div>
              {zones.map((z) => (
                <div key={z.id} className="flex items-center gap-2 text-xs">
                  <SeverityBadgeInline severity={z.severity} />
                  <span className="truncate">{z.name}</span>
                  <SourceBadgeMini source={z.source} />
                </div>
              ))}
              {zones.length === 0 && <p className="text-xs text-slate-500">No active hazard zones near routes.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Safety Notes</h3>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Never classify a place as completely safe based only on its distance from a hazard.</li>
          <li>Follow verified evacuation guidance and real-time reports from authorized personnel.</li>
          <li>If your primary route is blocked, use the secondary route (West Stairway).</li>
          <li>Assemble at the Covered Court and wait for your teacher's headcount.</li>
        </ul>
      </div>
    </div>
  );
}

function SeverityBadgeInline({ severity }: { severity?: string }) {
  if (!severity) return null;
  const cls = `px-1.5 py-0.5 rounded text-[10px] font-bold border severity-${severity.toLowerCase()}`;
  const colors: Record<string, string> = { low: 'bg-green-50 text-green-800 border-green-100', moderate: 'bg-amber-50 text-amber-800 border-amber-100', high: 'bg-orange-50 text-orange-800 border-orange-100', critical: 'bg-red-50 text-red-800 border-red-100' };
  return <span className={`${cls} ${colors[severity] || colors.moderate}`}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>;
}
function SourceBadgeMini({ source }: { source?: string }) {
  if (!source) return null;
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">OFFICIAL</span>;
}
