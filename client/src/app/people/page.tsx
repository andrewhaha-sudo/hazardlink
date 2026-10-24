"use client";
/**
 * HAZARDLINK — People & Accountability
 * Emergency directory, evacuation headcount dashboard, status updates.
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SourceBadge } from '../../components/SourceBadge';
import { Users, User, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function PeoplePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [headcounts, setHeadcounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getEmergencyProfiles(), api.getHeadcounts()])
      .then(([p, h]) => Promise.all([p.json(), h.json()]))
      .then(([profilesRes, headcountsRes]) => {
        setProfiles(profilesRes.profiles || []);
        setHeadcounts(headcountsRes.headcounts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="text-blue-600" /> People & Accountability
        </h1>
        <p className="text-slate-600">Emergency directory and evacuation accountability.</p>
      </div>
        {/* Accountability summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Registered" value={headcounts.reduce((a, h) => a + h.totalRegistered, 0)} color="blue" Icon={User} />
        <StatCard title="Safe" value={headcounts.reduce((a, h) => a + h.totalSafe, 0)} color="green" Icon={CheckCircle} />
        <StatCard title="Needs Help" value={headcounts.reduce((a, h) => a + h.totalNeedsHelp, 0)} color="amber" Icon={AlertCircle} />
        <StatCard title="Unaccounted" value={headcounts.reduce((a, h) => a + h.totalUnaccounted, 0)} color="red" Icon={Clock} />
      </div>

      {/* Headcount by group */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Evacuation Headcount by Class / Group</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left pb-2 text-xs font-semibold text-slate-500">Class / Group</th>
                <th className="text-left pb-2 text-xs font-semibold text-slate-500">Building</th>
                <th className="text-left pb-2 text-xs font-semibold text-slate-500">Assembly Point</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-500">Registered</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-500">Safe</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-500">Needs Help</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-500">Unaccounted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {headcounts.map((h) => (
                <tr key={h.id}>
                  <td className="py-3 text-slate-700">{h.classOrGroup}</td>
                  <td className="py-3 text-slate-700">{h.building}</td>
                  <td className="py-3 text-slate-700">{h.assemblyPoint}</td>
                  <td className="py-3 text-center text-slate-900 font-medium">{h.totalRegistered}</td>
                  <td className="py-3 text-center text-green-600 font-medium">{h.totalSafe}</td>
                  <td className="py-3 text-center text-amber-600 font-medium">{h.totalNeedsHelp}</td>
                  <td className="py-3 text-center text-red-600 font-medium">{h.totalUnaccounted}</td>
                </tr>
              ))}
              {headcounts.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-slate-500">No headcount data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency directory */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Emergency Directory</h3>
        <p className="text-xs text-slate-500 mb-4">Identifiable student information is restricted to authorized personnel.</p>
        <div className="space-y-3">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded border bg-slate-50/50">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-600">{p.studentId ? `ID: ${p.studentId}` : ''} • {p.classGrade || p.department || ''} • {p.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  p.status === 'Safe' ? 'bg-green-50 text-green-700 border border-green-100' :
                  p.status === 'Needs Assistance' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  p.status === 'Missing/Unaccounted For' ? 'bg-red-50 text-red-700 border border-red-100' :
                  'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>{p.status}</span>
                {p.isLocationSharing && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    <MapPin size={10} className="mr-0.5" /> Sharing location
                  </span>
                )}
              </div>
            </div>
          ))}
          {profiles.length === 0 && <p className="text-xs text-slate-500">No profiles available.</p>}
        </div>
      </div>

      <div className="text-xs text-slate-400">
        <AlertCircle size={14} className="mr-1" /> Only authorized teachers, administrators, and emergency responders may access identifiable student information.
      </div>
    </div>
  );
}

function StatCard({ title, value, color, Icon }: { title: string; value: number; color: string; Icon: any }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100', green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100', red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`card p-4 border ${colors[color]}`}>
      <div className="text-xs font-semibold text-slate-500 uppercase">{title}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      <div className="mt-2 flex items-center justify-end"><Icon size={14} className="opacity-50" /></div>
    </div>
  );
}
