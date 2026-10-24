"use client";
/**
 * HAZARDLINK — Report a Hazard
 * Submit flooded walkways, structural damage, fire, blocked exits, etc.
 */
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MapPin, AlertTriangle, Camera, Clock } from 'lucide-react';

const types = [
  { value: 'flood', label: 'Flooded Walkway / Floodwater' },
  { value: 'other', label: 'Cracked Wall / Structural Damage' },
  { value: 'fire', label: 'Fire, Smoke, or Fallen Electrical Wires' },
  { value: 'other', label: 'Blocked Exit / Damaged Road' },
  { value: 'landslide', label: 'Landslide-Prone Area' },
  { value: 'other', label: 'Other Observed Danger' },
];
const severities = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function ReportPage() {
  const [type, setType] = useState('other');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat:number;lng:number} | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocError('Location access denied. You can still submit a report without GPS.')
      );
    } else {
      setLocError('Geolocation not supported.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createHazardReport({
        type, description, severity,
        location: location || { lat: 0, lng: 0 },
        photoUrl: photo,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" /> Report a Hazard
        </h1>
        <p className="text-slate-600">Report dangerous conditions to help keep the school community safe.</p>
      </div>
        {submitted ? (
        <div className="card p-8 text-center border-green-200 bg-green-50">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Report Submitted</h3>
          <p className="text-sm text-slate-600">Your report has been saved with status <strong>Pending Verification</strong>. Authorized staff will review it.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type of Hazard</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                {severities.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
              placeholder="Describe what you observed (e.g., knee-deep floodwater near Gate 1)..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photo (optional)</label>
            <input
              type="file" accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhoto(URL.createObjectURL(file));
              }}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Camera size={14} /> Photo attached: {photo ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="p-3 rounded bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-slate-900">GPS Location</div>
                <p className="text-xs text-slate-600">
                  {location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : (locError || 'Detecting location...')}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3">Report statuses: Pending Verification → Verified / Resolved / Rejected. Unverified reports are shown distinctly.</p>
            <button type="submit" disabled={submitting} className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
