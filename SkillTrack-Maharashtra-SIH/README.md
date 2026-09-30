# SkillTrack Maharashtra — SIH 2026 Prototype

A polished prototype aligned with the technical stack shown in the SIH architecture slide:

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express.js + TypeScript
- Database: PostgreSQL
- Real-time/cache: Redis-ready configuration
- Authentication: JWT-ready
- Analytics: API-ready for Python/Pandas/scikit-learn
- Integrations: AWS S3 / Government APIs / Google Maps / notifications are represented as service-ready modules

## Quick demo

The frontend contains realistic demonstration data so it can be opened immediately after `npm install`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite.

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend default: `http://localhost:5000`

Health check:
`http://localhost:5000/api/health`

## PostgreSQL
Import `database/schema.sql` into PostgreSQL. Then copy `backend/.env.example` to `backend/.env`.

## Important
The numbers shown in the UI are prototype/demo data, not official Maharashtra Government statistics.
External government APIs, Aadhaar consent, AWS S3, WhatsApp/SMS and Redis require real credentials and authorized integrations before production use.
