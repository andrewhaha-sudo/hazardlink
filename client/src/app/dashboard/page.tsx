"use client";
/**
 * HAZARDLINK — Home Dashboard
 * Shows hazard status, active warnings, assembly points, accountability, announcements, SOS/report buttons.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { setAuthToken } from '../../lib/auth';
import { SourceBadge } from '../../components/SourceBadge';
import { SeverityBadge } from '../../components/SeverityBadge';

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('hazardlink_token');
    if (t) setAuthToken(t);
    Promise.all([api.getAlerts(), api.getAnnouncements(), api.getHazardZones()])
      .then(([a, b, c]) => Promise.all([a.json(), b.json(), c.json()]))
      .then(([alertsRes, annRes, zonesRes]) => {
        setAlerts(alertsRes.alerts || []);
        setAnnouncements(annRes.announcements || []);
        setZones(zonesRes.zones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Home Dashboard</h1>
        <p className="text-slate-600">San Rafael National High School — Quezon City, NCR</p>
      </div>
        {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Hazard Status</h3>
          <p className="mt-1 text-lg font-bold">{zones.length} active hazard zone(s)</p>
          {zones.map((z) => (
            <div key={z.id} className="mt-2 flex items-center gap-2 text-sm">
              <SeverityBadge severity={z.severity} />
              <span className="truncate">{z.name}</span>
            </div>
          ))}
          {zones.length === 0 && <p className="mt-2 text-sm text-green-600">No active hazard zones.</p>}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Official Warnings</h3>
          {alerts.length > 0 ? (
            alerts.map((a) => (
              <div key={a.id} className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-3 rounded-r">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-amber-800 uppercase">{a.title}</div>
                    <p className="text-xs text-amber-700 mt-1">{a.message}</p>
                  </div>
                  <SourceBadge source={a.source} />
                </div>
              </div>
            ))
          ) : (
            <p className="mt-2 text-sm text-green-600">No active warnings.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Assembly Points</h3>
          <p className="mt-1 text-lg font-bold">1 designated</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Covered Court (safe)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">1.2 km from main building</div>
        </div>
      </div>

      {/* Recent announcements */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Announcements</h3>
          <Link href="/announcements" className="text-xs text-slate-600 hover:underline">View all</Link>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{a.title}</div>
                  <p className="text-sm text-slate-600">{a.content}</p>
                  <div className="mt-1 flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{a.type}</span>
                    <span className="text-xs text-slate-500">{a.issuingAuthority}</span>
                  </div>
                </div>
                <SourceBadge source={a.source} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No announcements.</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/sos" className="btn-sos w-full flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Emergency SOS
        </Link>
        <Link href="/report" className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full flex items-center justify-center">
          Report a Hazard
        </Link>
      </div>
    </div>
  );
}
