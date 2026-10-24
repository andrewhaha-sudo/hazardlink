/**
 * HAZARDLINK — Shared TypeScript types
 * Used by both the client (Next.js) and server (Express).
 * All sample/live data is clearly labeled.
 */

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMINISTRATOR' | 'EMERGENCY_RESPONDER' | 'PARENT';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  studentId?: string;
  profilePhotoUrl?: string;
  classGrade?: string;
  department?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  schoolId: string;
  isLocationSharingEnabled: boolean;
  locationSharingMode?: 'OFF' | 'TEMPORARY_EMERGENCY' | 'CONTINUOUS';
  locationSharingExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

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

export type HazardType =
  | 'earthquake' | 'flood' | 'landslide' | 'fire' | 'volcanic' | 'severe_weather' | 'other';

export type HazardSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type ReportStatus = 'Pending Verification' | 'Verified' | 'Resolved' | 'Rejected';
export type DataSource = 'OFFICIAL' | 'COMMUNITY_REPORT' | 'AUTOMATED_ESTIMATE' | 'OFFICIAL';

export interface HazardZone {
  id: string;
  name: string;
  type: HazardType;
  severity: HazardSeverity;
  source: DataSource;
  sourceName: string;
  sourceDate?: string;
  geometry: { type: 'Point' | 'Polygon'; coordinates: number[][] | number[] };
  description?: string;
  riskLevel: number;
  precautions: string[];
  isActive: boolean;
  reportedAt: string;
  updatedAt: string;
  verifiedBy?: string;
  exposedBuildings?: string[];
  affectedSchoolId?: string;
}

export interface HazardReport {
  id: string;
  reporterId?: string;
  reporterName?: string;
  type: HazardType;
  description: string;
  severity: HazardSeverity;
  status: ReportStatus;
  location: { lat: number; lng: number; address?: string };
  photoUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  source: DataSource;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  type: HazardType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: DataSource;
  sourceName: string;
  isOfficial: boolean;
  affectedLocations: string[];
  region?: string;
  magnitude?: number;
  depth?: number;
  epicenter?: { lat: number; lng: number; name: string };
  intensityByLocation?: Record<string, number>;
  distanceFromSchoolKm?: number;
  impactSummary?: string;
  protectiveActions: string[];
  officialAdvisoryUrl?: string;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'suspension' | 'resumption' | 'closure' | 'warning' | 'evacuation' | 'schedule' | 'reminder';
  issuingAuthority: string;
  affectedLocations: string[];
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  isExternalAdvisory: boolean;
  externalSource?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationShare {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  lat: number;
  lng: number;
  accuracy: number;
  lastUpdate: string;
  isActive: boolean;
  sharingMode: 'TEMPORARY_EMERGENCY' | 'CONTINUOUS';
  schoolId: string;
}

export type EmergencyStatus = 'Safe' | 'Needs Assistance' | 'Missing/Unaccounted For' | 'Status Unknown';

export interface EmergencyProfile {
  id: string;
  userId: string;
  name: string;
  studentId?: string;
  classGrade?: string;
  department?: string;
  role: UserRole;
  profilePhotoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: EmergencyStatus;
  currentLocation?: { lat: number; lng: number; accuracy: number; lastUpdate: string };
  lastKnownLocation?: { lat: number; lng: number; accuracy: number; lastUpdate: string };
  isLocationSharing: boolean;
  schoolId: string;
  updatedAt: string;
}

export type SosCategory = 'injury' | 'trapped' | 'mobility_assistance' | 'other';
export type SosStatus = 'pending' | 'acknowledged' | 'responded' | 'resolved' | 'cancelled';

export interface SosRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: SosCategory;
  description?: string;
  lat: number;
  lng: number;
  accuracy: number;
  status: SosStatus;
  priorityScore: number;
  requestedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  responderId?: string;
  responderName?: string;
  schoolId: string;
}

export interface EvacuationHeadcount {
  id: string;
  classOrGroup: string;
  building?: string;
  assemblyPoint?: string;
  totalRegistered: number;
  totalSafe: number;
  totalNeedsHelp: number;
  totalUnaccounted: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface DrillScenario {
  id: string;
  name: string;
  type: HazardType;
  isActive: boolean;
  liveAlerts: EmergencyAlert[];
  liveHazardZones: HazardZone[];
  liveBlockedRoutes: string[];
  startedAt?: string;
  endedAt?: string;
}

export interface OfflineRecord {
  id: string;
  type: 'report' | 'sos' | 'headcount';
  payload: any;
  createdAt: string;
  synced: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}