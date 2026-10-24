"use client";
/**
 * HAZARDLINK — School Announcements
 * Class suspensions, closures, warnings, and evacuation instructions from authorized admins.
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SourceBadge } from '../../components/SourceBadge';
import { Bell, Shield, Clock } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnnouncements().then(r => r.json()).then(d => { setAnnouncements(d.announcements || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="text-indigo-600" /> School Announcements
        </h1>
        <p className="text-slate-600">Class suspensions, closures, warnings, and evacuation instructions from authorized administrators.</p>
      </div>
        {loading ? (
        <div className="card p-12 text-center text-slate-500">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <Shield className="mx-auto mb-3 w-12 h-12 text-slate-400" />
          <h3 className="font-medium text-slate-900">No active announcements</h3>
          <p className="text-sm text-slate-600">There are no active school announcements at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const isExt = a.isExternalAdvisory;
            return (
              <div key={a.id} className={`card border-l-4 ${
                a.priority === 'critical' ? 'border-l-red-500 bg-red-50/50' :
                a.priority === 'high' ? 'border-l-amber-500 bg-amber-50/50' :
                a.priority === 'medium' ? 'border-l-blue-500 bg-blue-50/50' :
                'border-l-slate-200 bg-slate-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{a.title}</h3>
                    {isExt && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">External Advisory</span>}
                    {a.source === 'OFFICIAL' && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">OFFICIAL</span>}
                  </div>
                  <SourceBadge source={a.source} />
                </div>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className={`px-2 py-0.5 rounded font-semibold ${
                    a.priority === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                    a.priority === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    a.priority === 'medium' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>{a.priority.toUpperCase()}</span>
                  <span className="text-slate-500">{a.type.replace('_', ' ')}</span>
                  <span className="text-slate-500">{a.issuingAuthority}</span>
                </div>
                <p className="text-sm text-slate-700 mb-3">{a.content}</p>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span><Clock size={12} className="mr-1" /> {new Date(a.startsAt).toLocaleString()}</span>
                  {a.expiresAt && <span>Expires {new Date(a.expiresAt).toLocaleString()}</span>}
                  {isExt && <span>External: {a.externalSource}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">How Announcements Work</h3>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Only authorized school administrators can issue official class suspension announcements.</li>
          <li>Advisories from external government agencies (PAGASA, PHIVOLCS, NDRRMC) are clearly labeled.</li>
          <li>Push notifications and in-app alerts are sent for active announcements.</li>
          <li>Each announcement includes priority, issuing authority, affected locations, timestamp, and expiration.</li>
        </ul>
      </div>
    </div>
  );
}
