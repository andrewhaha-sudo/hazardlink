"use client";
/**
 * HAZARDLINK — Settings & Privacy
 * Location sharing toggle, permissions, privacy policy.
 */
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MapPin, Shield, Bell, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [sharing, setSharing] = useState(false);
  const [mode, setMode] = useState<'OFF' | 'TEMPORARY_EMERGENCY' | 'CONTINUOUS'>('OFF');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getLocations().then(r => r.json()).then(d => {
      const active = d.locationShares?.find((ls: any) => ls.isActive);
      setSharing(!!active);
      setMode(active?.sharingMode || 'OFF');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser.');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'OFF') {
        await api.stopLocation();
        setSharing(false);
        setSaving(false);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            api.shareLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              sharingMode: mode,
            }).then(() => {
              setSharing(true);
              setSaving(false);
            }).catch(() => setSaving(false));
          },
          () => {
            alert('Location access denied.');
            setSaving(false);
          }
        );
      }
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="text-indigo-600" /> Settings & Privacy
        </h1>
        <p className="text-slate-600">Control your location sharing and privacy preferences.</p>
      </div>
        {loading ? (
        <div className="card p-12 text-center text-slate-500">Loading settings...</div>
      ) : (
        <div className="max-w-xl">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Emergency Location Sharing</h3>
            <p className="text-sm text-slate-600 mb-4">
              Voluntarily share your real-time location during emergencies so authorized teachers and responders can locate you.
              Location tracking always requires your explicit permission.
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded border hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sharing}
                  onChange={(e) => setSharing(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <div className="font-medium text-slate-900">Enable emergency location sharing</div>
                  <div className="text-xs text-slate-500">Authorized staff can locate you when sharing is active</div>
                </div>
              </label>
              {sharing && (
                <div className="space-y-3 pl-9">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sharing Mode</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="mode" value="TEMPORARY_EMERGENCY" checked={mode === 'TEMPORARY_EMERGENCY'} onChange={(e) => setMode(e.target.value as 'OFF' | 'TEMPORARY_EMERGENCY' | 'CONTINUOUS')} className="rounded text-slate-900" />
                      <span>Temporary Emergency</span>
                      <span className="text-xs text-slate-500">Stops automatically after a configurable period</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="mode" value="CONTINUOUS" checked={mode === 'CONTINUOUS'} onChange={(e) => setMode(e.target.value as 'OFF' | 'TEMPORARY_EMERGENCY' | 'CONTINUOUS')} className="rounded text-slate-900" />
                      <span>Continuous</span>
                      <span className="text-xs text-slate-500">Shares location until you disable it</span>
                    </label>
                  </div>
                  <div className="pt-3">
                    <button disabled={saving} onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      {saving ? 'Saving...' : 'Save & Start Sharing'}
                    </button>
                  </div>
                </div>
              )}
              {!sharing && (
                <div className="pt-3">
                  <button onClick={handleSave} className="w-full text-sm font-semibold text-slate-600 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    Stop Sharing
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Privacy & Data</h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
              <li>Location tracking requires explicit permission — users are never tracked secretly.</li>
              <li>GPS is not assumed available merely because a phone is switched on.</li>
              <li>Temporary emergency sharing stops automatically or when you disable it.</li>
              <li>Only authorized teachers and emergency responders may locate users who have explicitly enabled sharing.</li>
              <li>Last-known location is shown if connectivity is lost.</li>
              <li>All identifiable records are access-controlled and audited.</li>
            </ul>
          </div>

          <div className="card mt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Official Data Sources</h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
              <li><a href="https://phivolcs.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PHIVOLCS</a> — Earthquake and volcanic hazard data</li>
              <li><a href="https://pagasa.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PAGASA</a> — Weather, flood, and typhoon advisories</li>
              <li><a href="https://ndrrmc.gov.ph" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">NDRRMC</a> — National disaster risk reduction advisories</li>
            </ul>
            <p className="text-xs text-slate-500 mt-3">If an agency's real-time API is unavailable, HAZARDLINK displays a data-unavailable message and links to official sources rather than inventing data.</p>
          </div>

          <button className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
