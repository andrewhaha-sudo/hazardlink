"use client";
/**
 * HAZARDLINK — Preparedness Drills
 * Drill mode for earthquake, flood, fire, typhoon drills (no real alerts sent).
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { GraduationCap, Play, Shield } from 'lucide-react';

const types = [
  { value: 'earthquake', label: 'Earthquake Drill' },
  { value: 'fire', label: 'Fire Drill' },
  { value: 'flood', label: 'Flood Drill' },
  { value: 'typhoon', label: 'Typhoon / Severe Weather Drill' },
];

export default function DrillsPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDrillScenarios().then(r => r.json()).then(d => { setScenarios(d.scenarios || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const startDrill = async (id: string) => {
    await api.startDrill(id);
    setActiveId(id);
    setScenarios(s => s.map(x => x.id === id ? { ...x, isActive: true, startedAt: new Date().toISOString() } : x));
  };

  const stopDrill = async (id: string) => {
    await api.stopDrill(id);
    setActiveId(null);
    setScenarios(s => s.map(x => x.id === id ? { ...x, isActive: false, endedAt: new Date().toISOString() } : x));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="text-indigo-600" /> Preparedness Drills
        </h1>
        <p className="text-slate-600">Drill mode for earthquake, flood, fire, and typhoon drills. No real emergency notifications are sent.</p>
      </div>
        <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Available Drill Scenarios</h3>
        <div className="space-y-3">
          {types.map((t) => {
            const scenario = scenarios.find(s => s.type === t.value);
            const isActive = scenario?.isActive || activeId === t.value;
            return (
              <div key={t.value} className="p-4 rounded border bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{t.label}</div>
                  <div className="text-xs text-slate-500">Generate alerts, blocked routes, and evacuation scenarios.</div>
                </div>
                <div className="flex gap-2">
                  {!isActive ? (
                    <button
                      onClick={() => startDrill(t.value)}
                      className="flex items-center gap-2 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700"
                    >
                      <Play size={14} /> Start Drill
                    </button>
                  ) : (
                    <button
                      onClick={() => stopDrill(t.value)}
                      className="flex items-center gap-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
                    >
                      <span className="text-xs">⏹</span> Stop Drill
                    </button>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {isActive ? 'ACTIVE' : 'Idle'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Drill Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded bg-blue-50 border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 uppercase">official Alerts</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{scenarios.reduce((a, s) => a + (s.officialAlerts?.length || 0), 0)}</div>
          </div>
          <div className="p-4 rounded bg-amber-50 border border-amber-100">
            <div className="text-xs font-semibold text-amber-700 uppercase">Blocked Routes</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{scenarios.reduce((a, s) => a + (s.officialBlockedRoutes?.length || 0), 0)}</div>
          </div>
          <div className="p-4 rounded bg-violet-50 border border-violet-100">
            <div className="text-xs font-semibold text-violet-700 uppercase">Hazard Zones</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{scenarios.reduce((a, s) => a + (s.officialHazardZones?.length || 0), 0)}</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        <Shield size={14} className="mr-1" /> Drill mode generates alerts and scenarios without sending real emergency notifications or contacting actual emergency responders.
      </div>
    </div>
  );
}
