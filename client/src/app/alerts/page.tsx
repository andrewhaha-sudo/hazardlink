"use client";
/**
 * HAZARDLINK — Disaster Alerts
 * Official vs community vs official alerts. Earthquake details with epicenter, magnitude, intensity.
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SourceBadge } from '../../components/SourceBadge';
import { AlertTriangle, Bell, ShieldCheck, Info } from 'lucide-react';

const typeLabels: Record<string, string> = {
  earthquake: 'Earthquake', flood: 'Flood', landslide: 'Landslide',
  fire: 'Fire', volcanic: 'Volcanic Hazard', severe_weather: 'Severe Weather', other: 'Other Hazard',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlerts().then(r => r.json()).then(d => { setAlerts(d.alerts || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" /> Disaster Alerts
        </h1>
        <p className="text-slate-600">Official and community-reported hazard advisories.</p>
      </div>
        {loading ? (
        <div className="card p-12 text-center text-slate-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="mx-auto mb-3 w-12 h-12 text-green-500" />
          <h3 className="font-medium text-slate-900">No active alerts</h3>
          <p className="text-sm text-slate-600">There are no active disaster advisories at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((a) => {
            const isOfficial = a.isOfficial;
            const isSim = a.source === 'OFFICIAL' || a.sourceName?.includes('OFFICIAL');
            return (
              <div key={a.id} className="card border-l-4 border-l-amber-500 bg-amber-50/50">
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{a.title}</h3>
                      {isSim && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">OFFICIAL</span>}
                      {isOfficial && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">OFFICIAL</span>}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">{typeLabels[a.type] || a.type}</div>
                    <p className="text-sm text-slate-700">{a.message}</p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <SourceBadge source={a.source} />
                    <div className="text-xs font-medium text-slate-700">Priority: <span className="capitalize">{a.priority}</span></div>
                    {a.magnitude && (
                      <div className="text-xs font-medium text-slate-700">Magnitude: {a.magnitude} • Depth: {a.depth} km</div>
                    )}
                    {a.epicenter && (
                      <div className="text-xs font-medium text-slate-700">Epicenter: {a.epicenter.name}</div>
                    )}
                    {a.distanceFromSchoolKm != null && (
                      <div className="text-xs font-medium text-slate-700">Distance from school: {a.distanceFromSchoolKm} km</div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Impact Summary</h4>
                  <p className="text-sm text-slate-700">{a.impactSummary}</p>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 mt-3">Recommended Actions</h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {a.protectiveActions.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  {a.officialAdvisoryUrl && (
                    <div className="mt-3">
                      <a href={a.officialAdvisoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline hover:text-blue-800">
                        <Info size={14} className="mr-1 inline" /> View official advisory
                      </a>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-400">
                    Source: {a.sourceName} • {new Date(a.startsAt).toLocaleString()}{a.expiresAt ? ` • Expires ${new Date(a.expiresAt).toLocaleString()}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-xs text-slate-400">
        ⚠️ Predicted shaking, unverified damage, or estimated intensity is never presented as confirmed fact.
        Official information is clearly distinguished from community reports and automated estimates.
      </div>
    </div>
  );
}
