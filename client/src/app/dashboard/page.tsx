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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header with gradient */}
      <div className="glass-panel animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-2 tracking-tight">
              Home Dashboard
            </h1>
            <p className="text-slate-600 text-sm sm:text-base flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-slate-900 font-semibold">San Rafael National High School</span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline">Quezon City, NCR</span>
            </p>
          </div>
          <div className="status-indicator px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all">
            <div className="status-dot bg-white"></div>
            <span>All Systems Active</span>
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="interactive-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <div className="status-dot bg-gradient-to-r from-red-500 to-orange-500"></div>
              Hazard Status
            </h3>
            <div className="enhanced-badge bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800">
              {zones.length} Active
            </div>
          </div>
          <p className="mt-2 text-4xl sm:text-5xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
            {zones.length}
          </p>
          <p className="text-sm text-slate-500 mt-1 font-medium">Active zone{zones.length !== 1 ? 's' : ''}</p>
          <div className="mt-5 space-y-2.5">
            {zones.map((z) => (
              <div key={z.id} className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-slate-50/80 to-transparent rounded-xl hover:from-slate-100/80 transition-all duration-300 border border-slate-100/50 hover:border-slate-200/80 group">
                <SeverityBadge severity={z.severity} />
                <span className="truncate text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{z.name}</span>
              </div>
            ))}
            {zones.length === 0 && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-green-700">No active hazard zones detected</p>
              </div>
            )}
          </div>
        </div>

        <div className="interactive-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Warnings</div>
                <div className="text-2xl font-black text-slate-900 leading-none">{alerts.length}</div>
              </div>
            </h3>
            <div className="enhanced-badge bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900">
              Active
            </div>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-2.5">
              {alerts.map((a) => (
                <div key={a.id} className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/80 to-transparent p-4 rounded-r-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-amber-900 group-hover:text-amber-950 transition-colors">{a.title}</div>
                      <p className="text-xs text-amber-700 mt-1.5 line-clamp-2">{a.message}</p>
                    </div>
                    <SourceBadge source={a.source} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-green-700">No active warnings</p>
            </div>
          )}
        </div>

        <div className="interactive-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Assembly</div>
                <div className="text-2xl font-black text-slate-900 leading-none">1</div>
              </div>
            </h3>
            <div className="enhanced-badge bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-900">
              Ready
            </div>
          </div>
          <div className="mt-5 p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-xl border border-blue-200/80 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="status-dot bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <span className="text-base font-bold text-slate-800">Covered Court</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold">1.2 km</span>
              <span className="text-slate-400">•</span>
              <span>from main building</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent announcements */}
      <div className="glass-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <span>Recent Announcements</span>
          </h3>
          <Link href="/announcements" className="text-sm text-blue-600 hover:text-blue-700 font-bold hover:gap-2 flex items-center gap-1 transition-all group">
            <span>View all</span>
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="interactive-card flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-lg mb-2">{a.title}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{a.content}</p>
                  <div className="mt-4 flex gap-2 items-center flex-wrap">
                    <span className="enhanced-badge bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200">
                      {a.type}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">No announcements at this time</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for updates</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Link href="/sos" className="btn-sos w-full flex items-center justify-center gap-3 relative overflow-hidden group py-5">
          <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="relative z-10 text-lg font-black tracking-tight">Emergency SOS</span>
        </Link>
        <Link href="/report" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-lg font-black px-6 py-5 rounded-2xl shadow-2xl transition-all hover:shadow-3xl hover:scale-105 active:scale-95 w-full flex items-center justify-center gap-3 tracking-tight">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report a Hazard
        </Link>
      </div>
    </div>
  );
}
