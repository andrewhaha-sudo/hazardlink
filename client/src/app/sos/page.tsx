"use client";
/**
 * HAZARDLINK — Emergency SOS
 * SOS button, responder dashboard with prioritized assistance requests.
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { HelpCircle, MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const categories = [
  { value: 'injury', label: 'Injury / Medical' },
  { value: 'trapped', label: 'Trapped' },
  { value: 'mobility_assistance', label: 'Mobility Assistance' },
  { value: 'other', label: 'Other Emergency' },
];

export default function SosPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [category, setCategory] = useState('injury');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{lat:number;lng:number} | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSosRequests().then(r => r.json()).then(d => { setRequests(d.sosRequests || []); setLoading(false); }).catch(() => setLoading(false));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.createSos({ category, description, lat: location?.lat || 0, lng: location?.lng || 0 });
      setSent(true);
      setSending(false);
      // refresh
      api.getSosRequests().then(r => r.json()).then(d => setRequests(d.sosRequests || []));
    } catch (err: any) {
      alert(err.message || 'Failed to send SOS');
      setSending(false);
    }
  };

  const priorityLabel = (score: number) => score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  const priorityColor = (score: number) => score >= 80 ? 'text-red-600' : score >= 50 ? 'text-amber-600' : 'text-green-600';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="text-red-600" /> Emergency SOS
        </h1>
        <p className="text-slate-600">Request help and share your location with authorized responders.</p>
      </div>
        {/* SOS Button (student view) */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Request Assistance</h3>
        {sent ? (
          <div className="p-4 text-center border-green-200 bg-green-50 rounded-xl">
            <CheckCircle className="mx-auto mb-3 w-10 h-10 text-green-600" />
            <h4 className="font-bold text-slate-900">SOS Sent</h4>
            <p className="text-sm text-slate-600">Your request has been submitted to authorized responders. Share your location to help them find you.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assistance Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white" placeholder="e.g. sprained ankle, trapped in room..." />
              </div>
            </div>
            <div className="p-3 rounded bg-blue-50 border border-blue-100">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Your Location</div>
                  <p className="text-xs text-slate-600">
                    {location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : 'Detecting...'}
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-3">
              <p className="text-xs text-slate-500 mb-2">Priority is calculated from category + wait time. This is not a medical assessment.</p>
              <button type="submit" disabled={sending} className="btn-sos w-full py-3">
                {sending ? 'Sending SOS...' : 'Send SOS Request'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Responder dashboard */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Responder Dashboard — Assistance Requests</h3>
          <span className="text-xs text-slate-500">Authorized personnel only</span>
        </div>
        {loading ? (
          <div className="text-center text-slate-500 py-4">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-slate-500 py-4">No active SOS requests.</div>
        ) : (
          <div className="space-y-3">
            {requests.sort((a, b) => b.priorityScore - a.priorityScore).map((sos) => (
              <div key={sos.id} className="p-3 rounded border bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-slate-900">{sos.userName}</div>
                    <div className="text-xs text-slate-600">{sos.userRole} • {sos.category.replace('_', ' ')}</div>
                  </div>
                  <div className={`text-xs font-bold ${priorityColor(sos.priorityScore)}`}>
                    Priority {sos.priorityScore} — {priorityLabel(sos.priorityScore)}
                  </div>
                </div>
                <div className="text-xs text-slate-600 mb-2">{sos.description || 'No description'}</div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{sos.status}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">±{sos.accuracy}m</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{new Date(sos.requestedAt).toLocaleTimeString()}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => api.updateSos(sos.id, { status: 'acknowledged' })} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Acknowledge</button>
                  <button onClick={() => api.updateSos(sos.id, { status: 'resolved' })} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Resolved</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400">
        <AlertTriangle size={14} className="mr-1" /> Automated priority scoring is transparent and configurable — it is never a confirmed medical assessment.
      </div>
    </div>
  );
}
