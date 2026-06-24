# URL Shortener with Analytics — 3-Tier Microservice App

A three-tier application built for DevOps / CI-CD practice:

- **Frontend** — React (create-react-app), talks to backend via REST
- **Backend** — Node.js + Express, exposes REST API, handles redirects, logs click analytics
- **Database** — MongoDB (via Mongoose), stores URLs + click events

No DevOps tooling (Docker, CI/CD configs, k8s manifests) is included here on purpose —
that part is left for you to build as practice.

## Project Structure

```
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/Url.js         # URL schema
│   │   ├── models/Click.js       # Click/analytics event schema
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # Express routes
│   │   └── server.js             # App entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ShortenForm.js
    │   │   ├── UrlList.js
    │   │   ├── AnalyticsDashboard.js
    │   │   └── UrlAnalyticsDetail.js
    │   ├── api.js
    │   ├── App.js
    │   └── index.js
    ├── public/index.html
    ├── package.json
    └── .env.example
```

## Running locally (manual, no Docker)

### 1. Database
Make sure MongoDB is running locally on `mongodb://localhost:27017`, or point `MONGO_URI` to your own instance (e.g. MongoDB Atlas).

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev      # nodemon, auto-restart
# or: npm start
```
Backend runs on `http://localhost:5000`.

Health check: `GET http://localhost:5000/health`

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```
Frontend runs on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| GET    | `/health`                     | Health check (good for probes)        |
| POST   | `/api/shorten`                 | Create a short URL                    |
| GET    | `/api/urls`                    | List all shortened URLs               |
| GET    | `/:shortCode`                  | Redirect to original URL + log click  |
| GET    | `/api/analytics`               | Overall stats (total urls/clicks)     |
| GET    | `/api/analytics/:shortCode`    | Per-URL analytics breakdown           |

### Example: Create short URL
```bash
curl -X POST http://localhost:5000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.anthropic.com"}'
```

## Why this app is good for CI/CD practice

- Two independently deployable services (frontend, backend) + a database tier
- Backend has a `/health` endpoint for liveness/readiness probes
- Clear separation of concerns (controllers/routes/models) to write unit/integration tests against
- Real read/write workload against the DB, so you can practice migrations, seeding, backups
- Stateless backend (state lives in Mongo) — easy to scale horizontally and demo rolling deploys
- Natural candidate for adding a caching layer (Redis) later as a 4th component

Suggested next steps once the app works locally: containerize each tier, add a docker-compose
file for local orchestration, write a CI pipeline (lint → test → build → push image), then a CD
pipeline (deploy to staging → smoke test → promote to prod).
