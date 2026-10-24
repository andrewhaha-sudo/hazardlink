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
    <div className="space-y-8 p-6">
      {/* Header with gradient */}
      <div className="glass-panel">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
              Home Dashboard
            </h1>
            <p className="text-slate-600 mt-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              San Rafael National High School — Quezon City, NCR
            </p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg">
            Status: Active
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="interactive-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"></div>
              Current Hazard Status
            </h3>
            <div className="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full text-xs font-bold text-slate-700">
              {zones.length} Active
            </div>
          </div>
          <p className="mt-2 text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {zones.length} zone(s)
          </p>
          <div className="mt-4 space-y-2">
            {zones.map((z) => (
              <div key={z.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50/50 to-transparent rounded-xl hover:from-slate-100/50 transition-all">
                <SeverityBadge severity={z.severity} />
                <span className="truncate text-sm font-medium text-slate-700">{z.name}</span>
              </div>
            ))}
            {zones.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-green-700">No active hazard zones</p>
              </div>
            )}
          </div>
        </div>

        <div className="interactive-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Official Warnings
            </h3>
            <div className="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full text-xs font-bold text-amber-800">
              {alerts.length} Active
            </div>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-4 rounded-r-xl hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-amber-900">{a.title}</div>
                      <p className="text-xs text-amber-700 mt-1">{a.message}</p>
                    </div>
                    <SourceBadge source={a.source} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-green-700">No active warnings</p>
            </div>
          )}
        </div>

        <div className="interactive-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Assembly Points
            </h3>
          </div>
          <p className="mt-2 text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            1 designated
          </p>
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-700">Covered Court</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              1.2 km from main building
            </div>
          </div>
        </div>
      </div>

      {/* Recent announcements */}
      <div className="glass-panel">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Recent Announcements
          </h3>
          <Link href="/announcements" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="interactive-card flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-lg">{a.title}</div>
                  <p className="text-sm text-slate-600 mt-1">{a.content}</p>
                  <div className="mt-3 flex gap-2 items-center flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 font-semibold">
                      {a.type}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {a.issuingAuthority}
                    </span>
                  </div>
                </div>
                <SourceBadge source={a.source} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm text-slate-500 mt-3">No announcements at this time</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/sos" className="btn-sos w-full flex items-center justify-center gap-3 relative overflow-hidden group">
          <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="relative z-10 text-base">Emergency SOS</span>
        </Link>
        <Link href="/report" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-base font-bold px-6 py-3 rounded-2xl shadow-2xl transition-all hover:shadow-3xl hover:scale-105 active:scale-95 w-full flex items-center justify-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report a Hazard
        </Link>
      </div>
    </div>
  );
}
