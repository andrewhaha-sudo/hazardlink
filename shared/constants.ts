/**
 * HAZARDLINK — Shared constants
 */

export const HAZARD_TYPE_LABELS: Record<string, string> = {
  earthquake: 'Earthquake',
  flood: 'Flood',
  landslide: 'Landslide',
  fire: 'Fire',
  volcanic: 'Volcanic Hazard',
  severe_weather: 'Severe Weather',
  other: 'Other Hazard',
};

export const HAZARD_TYPE_COLORS: Record<string, string> = {
  earthquake: '#ef4444',
  flood: '#3b82f6',
  landslide: '#7c3aed',
  fire: '#f97316',
  volcanic: '#dc2626',
  severe_weather: '#0ea5e9',
  other: '#64748b',
};

export const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#dc2626',
};

export const DATA_SOURCE_LABELS: Record<string, string> = {
  OFFICIAL: 'Official',
  COMMUNITY_REPORT: 'Community Report',
  AUTOMATED_ESTIMATE: 'Automated Estimate',
  OFFICIAL: 'OFFICIAL (Drill)',
};

export const DATA_SOURCE_BADGE_COLORS: Record<string, string> = {
  OFFICIAL: '#16a34a',
  COMMUNITY_REPORT: '#2563eb',
  AUTOMATED_ESTIMATE: '#ca8a04',
  OFFICIAL: '#9370db',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  ADMINISTRATOR: 'Administrator',
  EMERGENCY_RESPONDER: 'Emergency Responder',
  PARENT: 'Parent/Guardian',
};

export const EMERGENCY_STATUS_LABELS: Record<string, string> = {
  Safe: 'Safe',
  'Needs Assistance': 'Needs Assistance',
  'Missing/Unaccounted For': 'Missing / Unaccounted For',
  'Status Unknown': 'Status Unknown',
};

export const SOS_CATEGORY_LABELS: Record<string, string> = {
  injury: 'Injury / Medical',
  trapped: 'Trapped',
  mobility_assistance: 'Mobility Assistance',
  other: 'Other Emergency',
};

export const SAMPLE_SCHOOL: School = {
  id: 'sch_001',
  name: 'San Rafael National High School',
  address: '123 Mabini St., Brgy. San Rafael, Quezon City, Metro Manila',
  region: 'NCR',
  province: 'Metro Manila',
  cityMunicipality: 'Quezon City',
  lat: 14.6394,
  lng: 121.0462,
  totalOccupants: 1240,
  createdAt: new Date().toISOString(),
};

export interface School {
  id: string;
  name: string;
  address: string;
  region: string;
  province: string;
  cityMunicipality: string;
  lat: number;
  lng: number;
  totalOccupants: number;
  createdAt: string;
}