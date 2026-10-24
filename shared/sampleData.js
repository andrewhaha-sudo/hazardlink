/**
 * HAZARDLINK — Sample data (JS version for server)
 * School hazard data for demonstration.
 */

const NOW = new Date().toISOString();
const SAMPLE_SCHOOL = {
  id: 'sch_001',
  name: 'San Rafael National High School',
  address: '123 Mabini St., Brgy. San Rafael, Quezon City, Metro Manila',
  region: 'NCR',
  province: 'Metro Manila',
  cityMunicipality: 'Quezon City',
  lat: 14.6394,
  lng: 121.0462,
  totalOccupants: 1240,
  createdAt: NOW,
};

const SAMPLE_USERS = [
  { id: 'u_1', email: 'admin@sanrafael.edu.ph', name: 'Maria Santos', role: 'ADMINISTRATOR', studentId: 'ADM-001', classGrade: undefined, department: 'Administration', emergencyContactName: 'Jose Santos', emergencyContactPhone: '+63 917 000 0001', schoolId: 'sch_001', isLocationSharingEnabled: true, locationSharingMode: 'CONTINUOUS', locationSharingExpiresAt: undefined, createdAt: NOW, updatedAt: NOW },
  { id: 'u_2', email: 'teacher1@sanrafael.edu.ph', name: 'John Reyes', role: 'TEACHER', studentId: 'TCH-101', classGrade: 'Grade 10 - Section A', department: 'Science', emergencyContactName: 'Ana Reyes', emergencyContactPhone: '+63 917 000 0002', schoolId: 'sch_001', isLocationSharingEnabled: true, locationSharingMode: 'OFF', createdAt: NOW, updatedAt: NOW },
  { id: 'u_3', email: 'student1@sanrafael.edu.ph', name: 'Alisha Lim', role: 'STUDENT', studentId: 'STU-2024-001', classGrade: 'Grade 10 - Section A', department: undefined, emergencyContactName: 'Linda Lim', emergencyContactPhone: '+63 917 000 0003', schoolId: 'sch_001', isLocationSharingEnabled: false, locationSharingMode: 'OFF', createdAt: NOW, updatedAt: NOW },
  { id: 'u_4', email: 'responder1@ndrrmc.gov.ph', name: 'Robert dela Cruz', role: 'EMERGENCY_RESPONDER', studentId: 'RESP-001', department: 'NDRRMC - NCR', emergencyContactName: 'Grace dela Cruz', emergencyContactPhone: '+63 917 000 0004', schoolId: 'sch_001', isLocationSharingEnabled: true, locationSharingMode: 'CONTINUOUS', createdAt: NOW, updatedAt: NOW },
  { id: 'u_5', email: 'parent1@gmail.com', name: 'Linda Lim (Parent)', role: 'PARENT', studentId: undefined, schoolId: 'sch_001', isLocationSharingEnabled: false, locationSharingMode: 'OFF', createdAt: NOW, updatedAt: NOW },
];

const SAMPLE_SCHOOLS = [SAMPLE_SCHOOL];

const SAMPLE_HAZARD_ZONES = [
  { id: 'hz_1', name: 'Flood-prone area — Mabini St. (near Gate 1)', type: 'flood', severity: 'high', source: 'COMMUNITY_REPORT', sourceName: 'School Safety Team', sourceDate: new Date(Date.now() - 86400000).toISOString(), geometry: { type: 'Point', coordinates: [121.0460, 14.6390] }, description: 'Floodwater reported near Gate 1 during heavy rainfall.', riskLevel: 4, precautions: ['Avoid Gate 1', 'Use Gate 2 as alternate exit', 'Do not walk through floodwater'], isActive: true, reportedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: NOW, verifiedBy: 'u_1', exposedBuildings: ['Main Gate'], affectedSchoolId: 'sch_001' },
  { id: 'hz_2', name: 'Cracked wall — Science Laboratory (Room 203)', type: 'other', severity: 'moderate', source: 'COMMUNITY_REPORT', sourceName: 'School Safety Team', sourceDate: NOW, geometry: { type: 'Point', coordinates: [121.0465, 14.6396] }, description: 'Visible crack on north wall of Science Laboratory after recent tremor.', riskLevel: 3, precautions: ['Avoid entering Room 203', 'Report to administrator', 'Use alternate lab'], isActive: true, reportedAt: NOW, updatedAt: NOW, verifiedBy: undefined, exposedBuildings: ['Science Building'], affectedSchoolId: 'sch_001' },
  { id: 'hz_3', name: 'Blocked evacuation path — East Stairway', type: 'other', severity: 'critical', source: 'COMMUNITY_REPORT', sourceName: 'School Safety Team', sourceDate: NOW, geometry: { type: 'Point', coordinates: [121.0468, 14.6398] }, description: 'Fallen ceiling debris blocks East Stairway evacuation path.', riskLevel: 5, precautions: ['Do not use East Stairway', 'Use West Stairway instead', 'Report to floor warden'], isActive: true, reportedAt: NOW, updatedAt: NOW, verifiedBy: 'u_1', exposedBuildings: ['Main Building'], affectedSchoolId: 'sch_001' },
  { id: 'hz_4', name: 'Assembly Area — Covered Court', type: 'other', severity: 'low', source: 'COMMUNITY_REPORT', sourceName: 'School Safety Team', sourceDate: NOW, geometry: { type: 'Point', coordinates: [121.0470, 14.6401] }, description: 'Designated safe assembly point — Covered Court.', riskLevel: 1, precautions: ['Gather here during evacuation', 'Follow teacher instructions'], isActive: true, reportedAt: NOW, updatedAt: NOW, verifiedBy: 'u_1', exposedBuildings: [], affectedSchoolId: 'sch_001' },
];

const SAMPLE_HAZARD_REPORTS = [
  { id: 'hr_1', reporterId: 'u_2', reporterName: 'John Reyes', type: 'flood', description: 'Knee-deep floodwater near Gate 1, not passable.', severity: 'high', status: 'Verified', location: { lat: 14.6390, lng: 121.0460, address: 'Mabini St., near Gate 1' }, photoUrl: undefined, verifiedBy: 'u_1', verifiedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString(), source: 'COMMUNITY_REPORT' },
  { id: 'hr_2', reporterId: 'u_3', reporterName: 'Alisha Lim', type: 'fire', description: 'Smell of smoke near canteen, possible electrical fire.', severity: 'critical', status: 'Pending Verification', location: { lat: 14.6397, lng: 121.0466, address: 'School Canteen' }, photoUrl: undefined, verifiedBy: undefined, verifiedAt: undefined, createdAt: new Date(Date.now() - 1800000).toISOString(), updatedAt: new Date(Date.now() - 1800000).toISOString(), source: 'COMMUNITY_REPORT' },
];

const SAMPLE_EMERGENCY_ALERTS = [
  { id: 'ea_1', title: 'Earthquake — Magnitude 5.4', message: 'Earthquake detected near Laguna, ~45 km from school. Intensity III (weak) reported.', type: 'earthquake', priority: 'medium', source: 'COMMUNITY_REPORT', sourceName: 'PHIVOLCS-style', isOfficial: false, affectedLocations: ['sch_001'], region: 'NCR', magnitude: 5.4, depth: 12, epicenter: { lat: 14.3, lng: 121.2, name: 'Near Laguna, Philippines' }, intensityByLocation: { 'Quezon City': 3 }, distanceFromSchoolKm: 45, impactSummary: 'Light shaking felt. No immediate structural damage reported. Follow drop-cover-hold-on procedures.', protectiveActions: ['Drop, Cover, and Hold On', 'Stay away from windows and glass', 'Evacuate to open area after shaking stops'], officialAdvisoryUrl: 'https://phivolcs.dost.gov.ph', startsAt: new Date(Date.now() - 1800000).toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 1800000).toISOString(), updatedAt: NOW },
  { id: 'ea_2', title: 'Flood Warning — NCR', message: 'Moderate flooding reported in low-lying areas of Quezon City.', type: 'flood', priority: 'high', source: 'COMMUNITY_REPORT', sourceName: 'PAGASA-style', isOfficial: false, affectedLocations: ['sch_001'], region: 'NCR', impactSummary: 'Floodwater may affect Gate 1 and nearby walkways. Avoid flooded areas.', protectiveActions: ['Avoid Gate 1', 'Use Gate 2', 'Monitor PAGASA advisories'], officialAdvisoryUrl: 'https://pagasa.dost.gov.ph', startsAt: new Date(Date.now() - 3600000).toISOString(), expiresAt: new Date(Date.now() + 7200000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: NOW },
];

const SAMPLE_ANNOUNCEMENTS = [
  { id: 'an_1', title: 'Class Suspension — All Levels', content: 'All classes suspended today due to severe weather warning. Students and staff should remain at home.', type: 'suspension', priority: 'critical', issuingAuthority: 'School Administration ', affectedLocations: ['sch_001'], startsAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), isActive: true, isExternalAdvisory: false, externalSource: undefined, createdBy: 'u_1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'an_2', title: 'Evacuation Drill — Fire', content: 'Fire drill scheduled for Friday at 9:00 AM. Assemble at Covered Court.', type: 'evacuation', priority: 'medium', issuingAuthority: 'School Safety Officer ', affectedLocations: ['sch_001'], startsAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 172800000).toISOString(), isActive: true, isExternalAdvisory: false, externalSource: undefined, createdBy: 'u_1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SAMPLE_LOCATION_SHARES = [
  { id: 'ls_1', userId: 'u_3', userName: 'Alisha Lim', userRole: 'STUDENT', lat: 14.6393, lng: 121.0463, accuracy: 8, lastUpdate: new Date(Date.now() - 60000).toISOString(), isActive: true, sharingMode: 'TEMPORARY_EMERGENCY', schoolId: 'sch_001' },
  { id: 'ls_2', userId: 'u_2', userName: 'John Reyes', userRole: 'TEACHER', lat: 14.6396, lng: 121.0465, accuracy: 10, lastUpdate: new Date(Date.now() - 120000).toISOString(), isActive: true, sharingMode: 'CONTINUOUS', schoolId: 'sch_001' },
];

const SAMPLE_EMERGENCY_PROFILES = [
  { id: 'ep_1', userId: 'u_3', name: 'Alisha Lim', studentId: 'STU-2024-001', classGrade: 'Grade 10 - Section A', role: 'STUDENT', emergencyContactName: 'Linda Lim', emergencyContactPhone: '+63 917 000 0003', status: 'Safe', currentLocation: { lat: 14.6393, lng: 121.0463, accuracy: 8, lastUpdate: new Date(Date.now() - 60000).toISOString() }, isLocationSharing: true, schoolId: 'sch_001', updatedAt: NOW },
  { id: 'ep_2', userId: 'u_2', name: 'John Reyes', studentId: 'TCH-101', classGrade: 'Grade 10 - Section A', department: 'Science', role: 'TEACHER', emergencyContactName: 'Ana Reyes', emergencyContactPhone: '+63 917 000 0002', status: 'Safe', isLocationSharing: true, schoolId: 'sch_001', updatedAt: NOW },
  { id: 'ep_3', userId: 'u_4', name: 'Robert dela Cruz', studentId: 'RESP-001', department: 'NDRRMC - NCR', role: 'EMERGENCY_RESPONDER', emergencyContactName: 'Grace dela Cruz', emergencyContactPhone: '+63 917 000 0004', status: 'Safe', isLocationSharing: true, schoolId: 'sch_001', updatedAt: NOW },
];

const SAMPLE_SOS_REQUESTS = [
  { id: 'sos_1', userId: 'u_3', userName: 'Alisha Lim', userRole: 'STUDENT', category: 'injury', description: 'Possible sprained ankle during evacuation.', lat: 14.6393, lng: 121.0463, accuracy: 8, status: 'pending', priorityScore: 75, requestedAt: new Date(Date.now() - 300000).toISOString(), schoolId: 'sch_001' },
];

const SAMPLE_EVACUATION_HEADCOUNTS = [
  { id: 'eh_1', classOrGroup: 'Grade 10 - Section A', building: 'Main Building', assemblyPoint: 'Covered Court', totalRegistered: 45, totalSafe: 40, totalNeedsHelp: 2, totalUnaccounted: 3, updatedAt: NOW, updatedBy: 'u_2' },
  { id: 'eh_2', classOrGroup: 'Grade 10 - Section B', building: 'Main Building', assemblyPoint: 'Covered Court', totalRegistered: 44, totalSafe: 44, totalNeedsHelp: 0, totalUnaccounted: 0, updatedAt: NOW, updatedBy: 'u_2' },
];

module.exports = {
  SAMPLE_SCHOOL, SAMPLE_USERS, SAMPLE_SCHOOLS, SAMPLE_HAZARD_ZONES, SAMPLE_HAZARD_REPORTS,
  SAMPLE_EMERGENCY_ALERTS, SAMPLE_ANNOUNCEMENTS, SAMPLE_LOCATION_SHARES, SAMPLE_EMERGENCY_PROFILES,
  SAMPLE_SOS_REQUESTS, SAMPLE_EVACUATION_HEADCOUNTS,
};
