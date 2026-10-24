/**
 * HAZARDLINK — API Client
 * Calls the Express backend (proxied via /api in Next.js dev).
 * All data from the backend is marked with a `source` field (OFFICIAL / COMMUNITY_REPORT / AUTOMATED_ESTIMATE / OFFICIAL).
 */

import { getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export function setAuthToken(t: string | null) {
  if (typeof window === 'undefined') return;
  if (t) localStorage.setItem('hazardlink_token', t);
  else localStorage.removeItem('hazardlink_token');
}

export function getAuthToken(): string | null {
  return getToken();
}

async function request(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  return res;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  // Schools
  getSchools: () => request('/schools'),
  getSchool: (id: string) => request(`/schools/${id}`),

  // Hazard Zones
  getHazardZones: (params?: { type?: string; severity?: string; schoolId?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request(`/hazards/zones${qs}`);
  },

  // Hazard Reports
  getHazardReports: (params?: { status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request(`/hazards/reports${qs}`);
  },
  createHazardReport: (body: any) =>
    request('/hazards/reports', { method: 'POST', body: JSON.stringify(body) }),

  // Alerts
  getAlerts: (params?: { region?: string; schoolId?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request(`/alerts${qs}`);
  },
  getAlert: (id: string) => request(`/alerts/${id}`),

  // Announcements
  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (body: any) =>
    request('/announcements', { method: 'POST', body: JSON.stringify(body) }),

  // Locations
  getLocations: () => request('/locations'),
  shareLocation: (body: any) => request('/locations/share', { method: 'POST', body: JSON.stringify(body) }),
  stopLocation: () => request('/locations/stop', { method: 'POST' }),

  // Emergency Profiles
  getEmergencyProfiles: () => request('/emergency/profiles'),
  updateProfileStatus: (id: string, status: string) =>
    request(`/emergency/profiles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // SOS
  getSosRequests: (params?: { status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request(`/sos${qs}`);
  },
  createSos: (body: any) => request('/sos', { method: 'POST', body: JSON.stringify(body) }),
  updateSos: (id: string, body: any) =>
    request(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Evacuation
  getHeadcounts: () => request('/evacuation/headcounts'),
  getEvacuationSummary: () => request('/evacuation/summary'),
  updateHeadcount: (body: any) =>
    request('/evacuation/headcounts', { method: 'POST', body: JSON.stringify(body) }),

  // Drills
  getDrillScenarios: () => request('/drill/scenarios'),
  startDrill: (id: string) => request(`/drill/scenarios/${id}/start`, { method: 'POST' }),
  stopDrill: (id: string) => request(`/drill/scenarios/${id}/stop`, { method: 'POST' }),

  // Offline
  getOfflineRecords: () => request('/offline/records'),
  createOfflineRecord: (body: any) =>
    request('/offline/records', { method: 'POST', body: JSON.stringify(body) }),
  syncOffline: () => request('/offline/sync', { method: 'POST' }),
  // Inspections (room scans)
  getInspections: (params?: { roomId?: string; buildingId?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request(`/inspections${qs}`);
  },
  createInspection: (body: any) =>
    request('/inspections', { method: 'POST', body: JSON.stringify(body) }),

  // Hazard Report Verification
  updateHazardReportStatus: (id: string, status: string, rejectionReason?: string) =>
    request(`/hazards/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) }),
};
