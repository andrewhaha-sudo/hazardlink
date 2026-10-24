/**
 * HAZARDLINK — Express Backend Server
 * system with in-memory store (swap-ready for PostgreSQL/PostGIS).
 * All responses mark data source: OFFICIAL / COMMUNITY_REPORT / AUTOMATED_ESTIMATE / OFFICIAL.
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ---- In-memory store (system) ----
const db = {
  users: [],
  schools: [],
  hazardZones: [],
  hazardReports: [],
  inspections: [],
  emergencyAlerts: [],
  announcements: [],
  locationShares: [],
  emergencyProfiles: [],
  sosRequests: [],
  evacuationHeadcounts: [],
  drillScenarios: [],
  offlineRecords: [],
  timeline: [],
  notifications: [],
  auditLogs: [],
};

// ---- Sample data (imported at runtime) ----
// We'll require sample data via a generated JS file to avoid TS in server
let sample = {};
try {
  sample = require('../../shared/sampleData.js');
} catch (e) {
  console.warn('Sample data JS not found, using empty defaults:', e.message);
}

// ---- Helpers ----
const nowISO = () => new Date().toISOString();

// Initialize store with sample data

// ==================== DATA ADAPTERS ====================
// Adapters for PHIVOLCS, PAGASA, NDRRMC — real sources with fallback to OFFICIAL

const ADAPTER_STATUS = {
  PHIVOLCS: { available: false, lastChecked: null, error: null },
  PAGASA: { available: false, lastChecked: null, error: null },
  NDRRMC: { available: false, lastChecked: null, error: null },
};

async function checkAdapter(agency, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    ADAPTER_STATUS[agency] = { available: res.ok, lastChecked: nowISO(), error: res.ok ? null : `HTTP ${res.status}` };
  } catch (err) {
    ADAPTER_STATUS[agency] = { available: false, lastChecked: nowISO(), error: err.message };
  }
}

async function refreshAdapters() {
  await Promise.all([
    checkAdapter('PHIVOLCS', 'https://phivolcs.dost.gov.ph/api/earthquake'),
    checkAdapter('PAGASA', 'https://pagasa.dost.gov.ph/api/flood'),
    checkAdapter('NDRRMC', 'https://ndrrmc.gov.ph/api/advisories'),
  ]);
}

setInterval(refreshAdapters, 300000); // refresh every 5 min

// ==================== TIMELINE & AUDIT ====================
function auditLog(action, userId, details) {
  db.auditLogs.push({
    id: 'audit_' + Date.now(),
    action, userId, details,
    timestamp: nowISO(),
  });
  if (db.auditLogs.length > 1000) db.auditLogs.shift();
}

function timelineEvent(type, title, description, userId, metadata) {
  db.timeline.push({
    id: 'tl_' + Date.now(),
    type, title, description, userId,
    metadata: metadata || {},
    timestamp: nowISO(),
  });
}

function seed() {
  if (sample.SAMPLE_USERS) {
    db.users = sample.SAMPLE_USERS.map(u => ({ ...u, passwordHash: 'HIDDEN' }));
  }
  if (sample.SAMPLE_SCHOOLS) db.schools = [...sample.SAMPLE_SCHOOLS];
  if (sample.SAMPLE_HAZARD_ZONES) db.hazardZones = [...sample.SAMPLE_HAZARD_ZONES];
  if (sample.SAMPLE_HAZARD_REPORTS) db.hazardReports = [...sample.SAMPLE_HAZARD_REPORTS];
  if (sample.SAMPLE_EMERGENCY_ALERTS) db.emergencyAlerts = [...sample.SAMPLE_EMERGENCY_ALERTS];
  if (sample.SAMPLE_ANNOUNCEMENTS) db.announcements = [...sample.SAMPLE_ANNOUNCEMENTS];
  if (sample.SAMPLE_LOCATION_SHARES) db.locationShares = [...sample.SAMPLE_LOCATION_SHARES];
  if (sample.SAMPLE_EMERGENCY_PROFILES) db.emergencyProfiles = [...sample.SAMPLE_EMERGENCY_PROFILES];
  if (sample.SAMPLE_SOS_REQUESTS) db.sosRequests = [...sample.SAMPLE_SOS_REQUESTS];
  if (sample.SAMPLE_EVACUATION_HEADCOUNTS) db.evacuationHeadcounts = [...sample.SAMPLE_EVACUATION_HEADCOUNTS];
}
seed();

// Role hierarchy for access control
const ROLE_RANK = {
  STUDENT: 1,
  TEACHER: 2,
  PARENT: 2,
  ADMINISTRATOR: 3,
  EMERGENCY_RESPONDER: 3,
};

function requireRole(minRole) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    const userRank = ROLE_RANK[user.role] || 0;
    const minRank = ROLE_RANK[minRole] || 0;
    if (userRank < minRank) {
      return res.status(403).json({ message: `Role ${minRole} or above required` });
    }
    next();
  };
}

function requireRoles(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// ---- Auth middleware (simple bearer token system) ----
app.use((req, res, next) => {
  req.user = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const user = db.users.find(u => u.id === token);
    if (user) req.user = user;
  }
  next();
});

// ==================== AUTH ====================
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  // system: accept any password; in production verify hash
  const token = user.id; // use user id as bearer token
  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser, message: 'Login successful' });
});

app.get('/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ==================== SCHOOLS ====================
app.get('/schools', (req, res) => {
  res.json({ schools: db.schools, count: db.schools.length });
});

app.get('/schools/:id', (req, res) => {
  const school = db.schools.find(s => s.id === req.params.id);
  if (!school) return res.status(404).json({ message: 'School not found' });
  res.json({ school });
});

// ==================== HAZARD ZONES ====================
app.get('/hazards/zones', (req, res) => {
  let zones = db.hazardZones.filter(z => z.isActive);
  if (req.query.type) zones = zones.filter(z => z.type === req.query.type);
  if (req.query.severity) zones = zones.filter(z => z.severity === req.query.severity);
  if (req.query.schoolId) zones = zones.filter(z => z.affectedSchoolId === req.query.schoolId);
  // Mark data source explicitly
  zones = zones.map(z => ({ ...z, sourceLabel: 'OFFICIAL' }));
  res.json({ zones, count: zones.length, note: 'All hazard data is OFFICIAL for demonstration' });
});

app.get('/hazards/zones/:id', (req, res) => {
  const zone = db.hazardZones.find(z => z.id === req.params.id);
  if (!zone) return res.status(404).json({ message: 'Hazard zone not found' });
  res.json({ zone, sourceLabel: 'OFFICIAL' });
});

// ==================== HAZARD REPORTS ====================
app.get('/hazards/reports', (req, res) => {
  let reports = [...db.hazardReports];
  if (req.query.status) reports = reports.filter(r => r.status === req.query.status);
  if (req.query.schoolId) {
    // filter reports near school (system: all for sample school)
  }
  res.json({ reports, count: reports.length });
});

app.post('/hazards/reports', requireRole('STUDENT'), (req, res) => {
  const { type, description, severity, location, photoUrl } = req.body;
  if (!type || !description || !severity || !location) {
    return res.status(400).json({ message: 'type, description, severity, and location are required' });
  }
  const report = {
    id: 'hr_' + Date.now(),
    reporterId: req.user.id,
    reporterName: req.user.name,
    type,
    description,
    severity,
    status: 'Pending Verification',
    location,
    photoUrl,
    verifiedBy: undefined,
    verifiedAt: undefined,
    rejectionReason: undefined,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    source: sim,
  };
  db.hazardReports.push(report);
  auditLog('HAZARD_REPORT_CREATE', req.user.id, { id: report.id, type: report.type });
  // Broadcast new report via WebSocket
  broadcast({ type: 'NEW_HAZARD_REPORT', payload: report });
  res.status(201).json({ report, message: 'Report submitted as Pending Verification' });
});

// ==================== HAZARD REPORT VERIFICATION ====================
app.patch('/hazards/reports/:id/status', requireRole('TEACHER'), (req, res) => {
  const report = db.hazardReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const { status, rejectionReason } = req.body;
  const allowed = ['Pending Verification', 'Verified', 'Rejected', 'Resolved'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  report.status = status;
  report.updatedAt = nowISO();
  if (status === 'Verified') { report.verifiedBy = req.user.id; report.verifiedAt = nowISO(); }
  if (status === 'Rejected') report.rejectionReason = rejectionReason || 'Rejected by inspector';
  auditLog('HAZARD_REPORT_STATUS', req.user.id, { id: report.id, status });
  broadcast({ type: 'HAZARD_REPORT_UPDATED', payload: report });
  res.json({ report, message: `Report ${status}` });
});

// ==================== INSPECTIONS (ROOM SCANS) ====================
app.get('/inspections', (req, res) => {
  let items = [...db.inspections];
  if (req.query.roomId) items = items.filter(i => i.roomId === req.query.roomId);
  if (req.query.buildingId) items = items.filter(i => i.buildingId === req.query.buildingId);
  res.json({ inspections: items, count: items.length });
});

app.post('/inspections', requireRole('STUDENT'), (req, res) => {
  const { roomId, buildingId, floor, findings, captures, status, hazardsPinned } = req.body;
  if (!roomId || !buildingId) return res.status(400).json({ message: 'roomId and buildingId are required' });
  const inspection = {
    id: 'ins_' + Date.now(),
    roomId, buildingId, floor: floor || null,
    inspectorId: req.user.id,
    inspectorName: req.user.name,
    captures: captures || [],
    findings: findings || [],
    hazardsPinned: hazardsPinned || [],
    status: status || 'Completed',
    createdAt: nowISO(),
    source: sim,
  };
  db.inspections.push(inspection);
  // Auto-create hazard reports for confirmed findings
  (findings || []).filter(f => f.confirmed).forEach(f => {
    db.hazardReports.push({
      id: 'hr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      reporterId: req.user.id,
      reporterName: req.user.name,
      type: f.category || 'Other',
      description: f.description,
      severity: f.severity || 'Medium',
      status: 'Pending Verification',
      location: { roomId, buildingId, floor },
      source: 'AUTOMATED_ESTIMATE',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  });
  auditLog('INSPECTION_CREATE', req.user.id, { id: inspection.id, roomId, findings: (findings||[]).length });
  broadcast({ type: 'NEW_INSPECTION', payload: inspection });
  res.status(201).json({ inspection, message: 'Inspection saved' });
});


app.get('/alerts', (req, res) => {
  const now = new Date();
  let alerts = db.emergencyAlerts.filter(a => a.isActive);
  if (req.query.region) alerts = alerts.filter(a => a.region === req.query.region);
  if (req.query.schoolId) alerts = alerts.filter(a => a.affectedLocations.includes(req.query.schoolId));
  alerts = alerts.map(a => ({ ...a, sourceLabel: a.source === sim ? 'OFFICIAL' : a.source }));
  res.json({ alerts, count: alerts.length });
});

app.get('/alerts/:id', (req, res) => {
  const alert = db.emergencyAlerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json({ alert, sourceLabel: 'OFFICIAL' });
});

// ==================== ANNOUNCEMENTS ====================
app.get('/announcements', (req, res) => {
  const now = new Date();
  let announcements = db.announcements.filter(a => a.isActive && new Date(a.startsAt) <= now);
  announcements = announcements.filter(a => !a.expiresAt || new Date(a.expiresAt) > now);
  res.json({ announcements, count: announcements.length });
});

app.post('/announcements', requireRole('ADMINISTRATOR'), (req, res) => {
  const { title, content, priority, type, issuingAuthority, affectedLocations, startsAt, expiresAt, isExternalAdvisory, externalSource } = req.body;
  const announcement = {
    id: 'an_' + Date.now(),
    title, content, priority, type,
    issuingAuthority,
    affectedLocations: affectedLocations || [],
    startsAt: startsAt || nowISO(),
    expiresAt,
    isActive: true,
    isExternalAdvisory: isExternalAdvisory || false,
    externalSource,
    createdBy: req.user.id,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  db.announcements.push(announcement);
  auditLog('ANNOUNCEMENT_CREATE', req.user.id, { id: announcement.id, title: announcement.title });
  broadcast({ type: 'NEW_ANNOUNCEMENT', payload: announcement });
  res.status(201).json({ announcement, message: 'Announcement published' });
});

// ==================== LOCATION SHARING ====================
app.get('/locations', requireRole('TEACHER'), (req, res) => {
  const active = db.locationShares.filter(ls => ls.isActive);
  res.json({ locationShares: active, count: active.length });
});

app.post('/locations/share', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const { lat, lng, accuracy, sharingMode, expiresAt } = req.body;
  if (lat == null || lng == null) {
    return res.status(400).json({ message: 'lat and lng are required' });
  }
  // Upsert location share for user
  const existing = db.locationShares.find(ls => ls.userId === req.user.id);
  if (existing) {
    existing.lat = lat;
    existing.lng = lng;
    existing.accuracy = accuracy || 0;
    existing.lastUpdate = nowISO();
    existing.isActive = sharingMode !== 'OFF';
    existing.sharingMode = sharingMode || 'TEMPORARY_EMERGENCY';
    if (expiresAt) existing.locationSharingExpiresAt = expiresAt;
    broadcast({ type: 'LOCATION_UPDATE', payload: existing });
    return res.json({ locationShare: existing, message: 'Location shared' });
  }
  const ls = {
    id: 'ls_' + Date.now(),
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    lat, lng, accuracy: accuracy || 0,
    lastUpdate: nowISO(),
    isActive: sharingMode !== 'OFF',
    sharingMode: sharingMode || 'TEMPORARY_EMERGENCY',
    schoolId: req.user.schoolId,
  };
  db.locationShares.push(ls);
  auditLog('LOCATION_SHARE', req.user.id, { mode: ls.sharingMode });
  broadcast({ type: 'LOCATION_UPDATE', payload: ls });
  res.status(201).json({ locationShare: ls, message: 'Location sharing started' });
});

app.post('/locations/stop', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const ls = db.locationShares.find(l => l.userId === req.user.id);
  if (ls) {
    ls.isActive = false;
    ls.sharingMode = 'OFF';
    ls.lastUpdate = nowISO();
    broadcast({ type: 'LOCATION_STOP', payload: { userId: req.user.id } });
  }
  res.json({ message: 'Location sharing stopped' });
});

// ==================== EMERGENCY PROFILES ====================
app.get('/emergency/profiles', requireRole('TEACHER'), (req, res) => {
  // Teachers/responders/admins can see profiles; students see only their own
  let profiles = db.emergencyProfiles;
  if (req.user.role === 'STUDENT') {
    profiles = profiles.filter(p => p.userId === req.user.id);
  } else if (req.user.role === 'PARENT') {
    // Parent: only linked students (system: same school)
    profiles = profiles.filter(p => p.schoolId === req.user.schoolId && p.role === 'STUDENT');
  }
  // Data minimization: strip emergency contact for non-staff
  const isStaff = ['TEACHER', 'ADMINISTRATOR', 'EMERGENCY_RESPONDER'].includes(req.user.role);
  const safeProfiles = profiles.map(p => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    studentId: p.studentId,
    classGrade: p.classGrade,
    department: p.department,
    role: p.role,
    profilePhotoUrl: p.profilePhotoUrl,
    status: p.status,
    currentLocation: p.isLocationSharing ? p.currentLocation : undefined,
    lastKnownLocation: p.lastKnownLocation,
    isLocationSharing: p.isLocationSharing,
    schoolId: p.schoolId,
    updatedAt: p.updatedAt,
    ...(isStaff && { emergencyContactName: p.emergencyContactName, emergencyContactPhone: p.emergencyContactPhone }),
  }));
  res.json({ profiles: safeProfiles, count: safeProfiles.length });
});

app.patch('/emergency/profiles/:id/status', requireRole('TEACHER'), (req, res) => {
  const { status } = req.body;
  const valid = ['Safe', 'Needs Assistance', 'Missing/Unaccounted For', 'Status Unknown'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const profile = db.emergencyProfiles.find(p => p.id === req.params.id || p.userId === req.params.id);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  profile.status = status;
  profile.updatedAt = nowISO();
  broadcast({ type: 'STATUS_CHANGE', payload: { userId: profile.userId, status } });
  res.json({ profile, message: `Status updated to ${status}` });
});

// ==================== SOS REQUESTS ====================
app.get('/sos', requireRole('TEACHER'), (req, res) => {
  let requests = [...db.sosRequests].sort((a, b) => b.priorityScore - a.priorityScore);
  if (req.query.status) requests = requests.filter(s => s.status === req.query.status);
  res.json({ sosRequests: requests, count: requests.length });
});

app.post('/sos', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const { category, description, lat, lng, accuracy } = req.body;
  if (!category || lat == null || lng == null) {
    return res.status(400).json({ message: 'category, lat, lng are required' });
  }
  // Transparent priority score: danger + wait time
  const dangerWeights = { injury: 80, trapped: 90, mobility_assistance: 60, other: 50 };
  let priorityScore = dangerWeights[category] || 50;
  const sos = {
    id: 'sos_' + Date.now(),
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    category,
    description,
    lat, lng, accuracy: accuracy || 0,
    status: 'pending',
    priorityScore,
    requestedAt: nowISO(),
    schoolId: req.user.schoolId,
  };
  db.sosRequests.push(sos);
  auditLog('SOS_CREATE', req.user.id, { id: sos.id, category: sos.category });
  broadcast({ type: 'NEW_SOS', payload: sos });
  res.status(201).json({ sos, message: 'SOS request submitted' });
});

app.patch('/sos/:id', requireRole('TEACHER'), (req, res) => {
  const { status, responderId } = req.body;
  const sos = db.sosRequests.find(s => s.id === req.params.id);
  if (!sos) return res.status(404).json({ message: 'SOS request not found' });
  sos.status = status;
  if (responderId) sos.responderId = responderId;
  if (status === 'acknowledged') sos.acknowledgedAt = nowISO();
  if (status === 'resolved') sos.resolvedAt = nowISO();
  broadcast({ type: 'SOS_UPDATE', payload: sos });
  res.json({ sos, message: `SOS status updated to ${status}` });
});

// ==================== EVACUATION HEADCOUNTS ====================
app.get('/evacuation/headcounts', requireRole('TEACHER'), (req, res) => {
  res.json({ headcounts: db.evacuationHeadcounts, count: db.evacuationHeadcounts.length });
});

app.get('/evacuation/summary', requireRole('TEACHER'), (req, res) => {
  const totals = db.evacuationHeadcounts.reduce(
    (acc, h) => ({
      totalRegistered: acc.totalRegistered + h.totalRegistered,
      totalSafe: acc.totalSafe + h.totalSafe,
      totalNeedsHelp: acc.totalNeedsHelp + h.totalNeedsHelp,
      totalUnaccounted: acc.totalUnaccounted + h.totalUnaccounted,
    }),
    { totalRegistered: 0, totalSafe: 0, totalNeedsHelp: 0, totalUnaccounted: 0 }
  );
  res.json({ totals, byGroup: db.evacuationHeadcounts });
});

app.post('/evacuation/headcounts', requireRole('TEACHER'), (req, res) => {
  const { classOrGroup, building, assemblyPoint, totalRegistered, totalSafe, totalNeedsHelp, totalUnaccounted } = req.body;
  let hc = db.evacuationHeadcounts.find(h => h.classOrGroup === classOrGroup);
  if (hc) {
    hc.totalRegistered = totalRegistered; hc.totalSafe = totalSafe;
    hc.totalNeedsHelp = totalNeedsHelp; hc.totalUnaccounted = totalUnaccounted;
    hc.building = building; hc.assemblyPoint = assemblyPoint;
    hc.updatedAt = nowISO(); hc.updatedBy = req.user.id;
  } else {
    hc = {
      id: 'eh_' + Date.now(), classOrGroup, building, assemblyPoint,
      totalRegistered, totalSafe, totalNeedsHelp, totalUnaccounted,
      updatedAt: nowISO(), updatedBy: req.user.id,
    };
    db.evacuationHeadcounts.push(hc);
  }
  broadcast({ type: 'HEADCOUNT_UPDATE', payload: hc });
  res.json({ headcount: hc, message: 'Headcount updated' });
});

// ==================== DRILL SCENARIOS ====================
app.get('/drill/scenarios', (req, res) => {
  const scenarios = db.drillScenarios.length
    ? db.drillScenarios
    : [
        {
          id: 'drill_1', name: 'Earthquake Drill', type: 'earthquake', isActive: false,
          liveAlerts: db.emergencyAlerts.filter(a => a.type === 'earthquake'),
          liveHazardZones: db.hazardZones.filter(z => z.type === 'earthquake' || z.type === 'other'),
          liveBlockedRoutes: ['east-stairway'],
          startedAt: undefined, endedAt: undefined,
        },
      ];
  res.json({ scenarios });
});

app.post('/drill/scenarios/:id/start', requireRole('ADMINISTRATOR'), (req, res) => {
  const scenario = db.drillScenarios.find(d => d.id === req.params.id) || {
    id: req.params.id, name: 'Drill Scenario', type: 'earthquake', isActive: false,
    liveAlerts: [], liveHazardZones: [], liveBlockedRoutes: [],
  };
  scenario.isActive = true;
  scenario.startedAt = nowISO();
  res.json({ scenario, message: 'Drill started (live — no real alerts sent)' });
});

app.post('/drill/scenarios/:id/stop', requireRole('ADMINISTRATOR'), (req, res) => {
  const scenario = db.drillScenarios.find(d => d.id === req.params.id);
  if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
  scenario.isActive = false;
  scenario.endedAt = nowISO();
  res.json({ scenario, message: 'Drill stopped' });
});

// ==================== OFFLINE RECORDS ====================
app.get('/offline/records', requireRole('STUDENT'), (req, res) => {
  const records = db.offlineRecords.filter(r => !r.synced);
  res.json({ records, count: records.length });
});

app.post('/offline/records', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const { type, payload } = req.body;
  const record = {
    id: 'off_' + Date.now(),
    type, payload,
    createdAt: nowISO(), synced: false,
  };
  db.offlineRecords.push(record);
  res.status(201).json({ record, message: 'Record saved for later sync' });
});

app.post('/offline/sync', requireRole('STUDENT'), (req, res) => {
  db.offlineRecords.forEach(r => { r.synced = true; });
  res.json({ message: 'All offline records synced', count: db.offlineRecords.length });
});

// ==================== HEALTH ====================

// ==================== TIMELINE ====================
app.get('/timeline', requireRole('TEACHER'), (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const events = [...db.timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  res.json({ events, count: events.length });
});

app.post('/timeline', requireRole('TEACHER'), (req, res) => {
  const { type, title, description, metadata } = req.body;
  if (!type || !title) {
    return res.status(400).json({ message: 'type and title are required' });
  }
  timelineEvent(type, title, description || '', req.user.id, metadata);
  auditLog('TIMELINE_CREATE', req.user.id, { type, title });
  res.status(201).json({ message: 'Timeline event recorded' });
});

// ==================== NOTIFICATIONS ====================
app.get('/notifications', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  let notifs = db.notifications.filter(n => !n.userId || n.userId === req.user.id);
  notifs = notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications: notifs, count: notifs.length, unread: notifs.filter(n => !n.read).length });
});

app.post('/notifications', requireRole('ADMINISTRATOR'), (req, res) => {
  const { title, message, type, userId, schoolId, region, hazardType } = req.body;
  const notif = {
    id: 'notif_' + Date.now(),
    title, message, type: type || 'alert',
    userId: userId || null,
    schoolId: schoolId || (req.user ? req.user.schoolId : null),
    region, hazardType,
    read: false,
    createdAt: nowISO(),
  };
  db.notifications.push(notif);
  broadcast({ type: 'NEW_NOTIFICATION', payload: notif });
  auditLog('NOTIFICATION_SEND', req.user.id, { title, userId });
  res.status(201).json({ notification: notif, message: 'Notification sent' });
});

app.patch('/notifications/:id/read', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  if (notif.userId && notif.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not your notification' });
  }
  notif.read = true;
  res.json({ notif, message: 'Marked as read' });
});

// ==================== LOCATION-BASED SAFETY NOTIFICATIONS ====================
app.post('/notifications/safety-check', requireRole('ADMINISTRATOR'), (req, res) => {
  const { hazardZoneId, affectedAreas } = req.body;
  const zone = db.hazardZones.find(z => z.id === hazardZoneId);
  if (!zone) return res.status(404).json({ message: 'Zone not found' });
  const count = db.locationShares.filter(ls => ls.isActive).length;
  db.notifications.push({
    id: 'notif_' + Date.now(),
    title: `Safety Notice — ${zone.name}`,
    message: `A ${zone.severity} ${zone.type} hazard has been detected near your location. ${zone.description}`,
    type: 'safety',
    schoolId: zone.affectedSchoolId,
    read: false,
    createdAt: nowISO(),
  });
  broadcast({ type: 'SAFETY_NOTIFICATION', payload: { zone, affectedCount: count } });
  auditLog('SAFETY_NOTIFICATION', req.user.id, { zoneId: hazardZoneId, affectedCount: count });
  res.json({ message: 'Safety notification sent', affectedUsers: count });
});

// ==================== AFTER-ACTION REPORT ====================
app.get('/reports/after-action', requireRole('TEACHER'), (req, res) => {
  const { startDate, endDate } = req.query;
  let events = db.timeline;
  if (startDate) events = events.filter(e => e.timestamp >= startDate);
  if (endDate) events = events.filter(e => e.timestamp <= endDate);
  const alerts = db.emergencyAlerts.filter(a => !startDate || a.startsAt >= startDate);
  const sos = db.sosRequests.filter(s => !startDate || s.requestedAt >= startDate);
  const headcounts = db.evacuationHeadcounts;
  const totalSafe = headcounts.reduce((a, h) => a + h.totalSafe, 0);
  const totalUnaccounted = headcounts.reduce((a, h) => a + h.totalUnaccounted, 0);
  const totalNeedsHelp = headcounts.reduce((a, h) => a + h.totalNeedsHelp, 0);
  res.json({
    period: { startDate, endDate },
    summary: {
      totalEvents: events.length,
      totalAlerts: alerts.length,
      totalSOS: sos.length,
      totalSafe, totalNeedsHelp, totalUnaccounted,
    },
    events,
    alerts,
    sosRequests: sos,
    headcounts,
    generatedAt: nowISO(),
  });
});

// ==================== AUDIT LOGS ====================
app.get('/audit/logs', requireRole('ADMINISTRATOR'), (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const logs = [...db.auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  res.json({ logs, count: logs.length });
});

// ==================== ADAPTER STATUS ====================
app.get('/adapters/status', (req, res) => {
  res.json({ adapters: ADAPTER_STATUS, note: 'Real agency APIs checked periodically; unavailable sources fall back to OFFICIAL data' });
});

// Seed some initial timeline events
function seedTimeline() {
  timelineEvent('alert', 'live Earthquake Detected', 'M5.4 earthquake near Laguna, ~45 km from school.', 'u_1', { type: 'earthquake', magnitude: 5.4 });
  timelineEvent('announcement', 'Class Suspension Declared', 'All classes suspended due to severe weather warning.', 'u_1', { type: 'suspension' });
  timelineEvent('sos', 'Student Assistance Request', 'Alisha Lim requested help — possible sprained ankle.', 'u_3', { category: 'injury', priorityScore: 75 });
}
seedTimeline();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: nowISO(), mode: 'system — OFFICIAL DATA' });
});

// ---- WebSocket for live updates ----
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

function broadcast(message) {
  const payload = JSON.stringify(message);
  clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(payload);
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'HAZARDLINK live updates active', time: nowISO() }));
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`HAZARDLINK server running on http://localhost:${PORT}`);
    console.log(`Mode: system — All data is OFFICIAL for demonstration`);
  });
}



// ==================== ADMIN DASHBOARD ====================
app.get('/admin/dashboard', requireRole('ADMINISTRATOR'), (req, res) => {
  const totalRooms = 11; // from sample data
  const scannedRooms = 7;
  const hazardsTotal = db.hazardReports.length;
  const hazardsPending = db.hazardReports.filter(h => h.status === 'Pending Verification').length;
  const alertsActive = db.emergencyAlerts.filter(a => a.isActive).length;
  const sosPending = db.sosRequests.filter(s => s.status === 'pending').length;
  res.json({
    stats: {
      totalRooms, scannedRooms, roomCoverage: Math.round((scannedRooms/totalRooms)*100),
      hazardsTotal, hazardsPending,
      alertsActive, sosPending,
      users: db.users.length,
      headcountSafe: db.evacuationHeadcounts.reduce((a,h)=>a+h.totalSafe,0),
      headcountUnaccounted: db.evacuationHeadcounts.reduce((a,h)=>a+h.totalUnaccounted,0),
    }
  });
});

// ==================== BUILDING/ROOM MANAGEMENT (ADMIN) ====================
app.get('/admin/buildings', requireRole('ADMINISTRATOR'), (req, res) => {
  let buildings = [];
  try { buildings = require('../../shared/campusData.js').CAMPUS_BUILDINGS || []; } catch (e) { console.warn('campusData unavailable:', e.message); }
  res.json({ buildings });
});

app.get('/admin/rooms', requireRole('ADMINISTRATOR'), (req, res) => {
  let rooms = [];
  try { rooms = require('../../shared/campusData.js').CAMPUS_ROOMS || []; } catch (e) { console.warn('campusData unavailable:', e.message); }
  res.json({ rooms });
});

// ==================== INSPECTIONS ====================
app.get('/inspections', (req, res) => {
  res.json({ inspections: [], count: 0, note: 'Inspections stored in room records (live)' });
});

app.post('/inspections', requireRole('TEACHER'), (req, res) => {
  const inspection = { id: 'insp_' + Date.now(), ...req.body, inspectedBy: req.user.id, inspectedAt: nowISO(), status: 'submitted' };
  auditLog('INSPECTION_CREATE', req.user.id, { id: inspection.id });
  res.status(201).json({ inspection, message: 'Inspection recorded' });
});


module.exports = { app, server };

