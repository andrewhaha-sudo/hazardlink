# HAZARDLINK

**Smart School Hazard Mapping and Disaster Response System**

HAZARDLINK is a comprehensive full-stack web application for school safety management, hazard mapping, disaster preparedness, and emergency response coordination.

## Features

### Core Functionality
- **Interactive Campus Map** - Leaflet-based mapping with building/floor/room navigation, hazard markers, evacuation routes
- **Room-by-Room Hazard Scanning** - Photo capture, AI-assisted hazard detection with human verification
- **Hazard Reporting & Verification** - Community reporting with inspector verification workflow
- **Disaster Alerts & Monitoring** - Configurable alerts for earthquakes, typhoons, floods, etc.
- **Emergency SOS** - One-tap emergency assistance with location sharing
- **Digital Roll Call** - Evacuation accountability with headcounts
- **People & Location Tracking** - Consent-based location sharing during emergencies
- **Announcements** - School-wide alerts and notifications
- **Admin Dashboard** - Complete administrative controls

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Leaflet, Lucide React
- **Backend**: Node.js, Express, WebSocket
- **Data**: In-memory store (prototype) with ready structure for PostgreSQL/Prisma
- **Maps**: Leaflet with OpenStreetMap
- **Real-time**: WebSocket for live updates

## Demo Credentials

All passwords are accepted in this prototype. Use these accounts:

| Role | Email | Access Level |
|------|-------|--------------|
| Administrator | admin@sanrafael.edu.ph | Full system access |
| Teacher | teacher1@sanrafael.edu.ph | Class management, roll call, verification |
| Student | student1@sanrafael.edu.ph | Reports, SOS, view maps/alerts |
| Emergency Responder | responder1@ndrrmc.gov.ph | Incident response, SOS dashboard |

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Server Setup
```bash
cd server
npm install
npm start
```
Server runs on http://localhost:5000

### Client Setup
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:3000

## Important Notes

- **Not a real emergency system**: This is a prototype. Always follow official emergency procedures and contact real emergency services
- **Official Sources**: Refer to [PHIVOLCS](https://phivolcs.dost.gov.ph), [PAGASA](https://pagasa.dost.gov.ph), and [NDRRMC](https://ndrrmc.gov.ph) for real alerts
- **AI Limitations**: AI hazard detection provides suggestions only - requires human verification
- **Privacy**: Student data access is restricted based on roles

## Project Structure

```
hazardlink/
├── client/          # Next.js frontend
│   ├── src/
│   │   ├── app/     # App router pages
│   │   ├── components/
│   │   └── lib/     # API client, utils
├── server/          # Express backend
│   └── src/
│       └── server.js
└── shared/          # Shared types and sample data
    ├── types.ts
    └── sampleData.ts
```

## API Endpoints

Key endpoints available:
- `GET /health` - Health check
- `POST /auth/login` - Authentication
- `GET /schools` - School information
- `GET /hazards/zones` - Hazard zones
- `GET /hazards/reports` - Hazard reports
- `GET /alerts` - Disaster alerts
- `GET /announcements` - Announcements
- `POST /sos` - Submit SOS request
- `GET /emergency/profiles` - Emergency profiles
- `GET /evacuation/headcounts` - Evacuation counts
- `GET /admin/dashboard` - Admin statistics
- `GET /adapters/status` - Data source status

## Deployment (Vercel)

This repository is configured for one-click deployment to Vercel.

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Vercel will use `vercel.json` to build the Next.js client from `client/` and deploy the Express API as a serverless function under `/api`.

Environment variables (optional):
- `NEXT_PUBLIC_API_BASE` — API base URL (defaults to `/api`)
- `NEXT_PUBLIC_WS_BASE` — WebSocket URL for live updates (optional; not supported on Vercel serverless)

Local development:
```bash
# Terminal 1 - backend
cd server && npm install && npm start

# Terminal 2 - frontend
cd client && npm install && npm run dev
```

## License

This is a demonstration prototype.
