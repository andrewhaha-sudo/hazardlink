"use client";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CloudLightning, AlertTriangle, Radio, Activity, CheckCircle2 } from 'lucide-react';

const AGENCIES = [
  { key:'PHIVOLCS', name:'PHIVOLCS', desc:'Earthquake & volcanic hazards (Philippines)', status:'unavailable', fallback:'OFFICIAL seismic data' },
  { key:'PAGASA', name:'PAGASA', desc:'Weather, rainfall, flood advisories', status:'unavailable', fallback:'OFFICIAL weather data' },
  { key:'NDRRMC', name:'NDRRMC', desc:'National disaster risk reduction & management', status:'unavailable', fallback:'OFFICIAL advisories' },
];

export default function DisastersPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [adapterStatus, setAdapterStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAlerts(), api.getHazardZones(), fetch('/api/adapters/status').then(r=>r.json()).catch(()=>null)])
      .then(([a,z,ad]) => Promise.all([a.json(), z.json(), Promise.resolve(ad)]))
      .then(([ar,zr,adr]) => { setAlerts(ar.alerts||[]); setZones(zr.zones||[]); setAdapterStatus(adr); setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CloudLightning className="text-blue-600"/> Disaster Monitoring</h1>
        <p className="text-slate-600">Official and community-sourced hazard feeds, normalized and overlaid on the school map.</p>
      </div>
        {/* Feed status */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Radio size={16}/> Official feed status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AGENCIES.map(ag => {
            const live = adapterStatus?.adapters?.[ag.key]?.available;
            return (
              <div key={ag.key} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 text-sm">{ag.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${live?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{live?'Live':'Fallback'}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ag.desc}</p>
                <p className="text-xs text-slate-400 mt-1">{live?'Connected to official API':ag.fallback}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">When official feeds are unavailable, the system falls back to OFFICIAL data clearly labeled as such.</p>
      </div>

      {/* Active alerts */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><AlertTriangle size={16}/> Active disaster alerts ({alerts.length})</h3>
        <div className="space-y-2">
          {alerts.map(a=>(
            <div key={a.id} className="p-3 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{a.title}</div>
                  <p className="text-xs text-slate-600 mt-1">{a.message}</p>
                  <div className="flex gap-2 mt-2 text-xs text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100">{a.type}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100">{a.priority}</span>
                    {a.magnitude && <span>M{a.magnitude}</span>}
                    {a.distanceFromSchoolKm && <span>{a.distanceFromSchoolKm} km away</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${a.isOfficial?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{a.isOfficial?'Official':'official'}</span>
              </div>
            </div>
          ))}
          {alerts.length===0 && <p className="text-sm text-slate-500">No active alerts.</p>}
        </div>
      </div>

      {/* Hazard zones */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Activity size={16}/> Hazard zones ({zones.length})</h3>
        <div className="space-y-2">
          {zones.map(z=>(
            <div key={z.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
              <div>
                <div className="text-sm font-medium text-slate-900">{z.name}</div>
                <div className="text-xs text-slate-500">{z.type} · {z.severity} · {z.description}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-700">{z.source}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preparedness tips */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><CheckCircle2 size={16}/> Preparedness guidance</h3>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Verify alerts against official sources before taking action.</li>
          <li>Follow localized evacuation routes avoiding blocked roads.</li>
          <li>Keep at least 3 days of emergency supplies.</li>
          <li>Participate in scheduled drills and review assembly points.</li>
        </ul>
      </div>
    </div>
  );
}
