# Consientemente

## Tech Stack

- **Frontend:** Expo SDK 51 (React Native + React Native Web)
- **Backend:** Express + Prisma ORM
- **Database:** PostgreSQL 16
- **State:** Zustand
- **Language:** TypeScript

## Project Structure

```
├── packages/
│   ├── core/            # Shared types/logic (TypeScript, Vitest)
│   ├── app/             # Mobile/web app (Expo, React Native)
│   └── api-server/      # Backend API (Express, Prisma)
├── desktop/             # Desktop app
├── docker-compose.yml   # PostgreSQL + API + App containers
└── tsconfig.base.json   # Shared TS config
```

## Docker (no Node.js required)

Start everything (PostgreSQL, API, and the web app):

```bash
docker-compose up -d
```

| Service     | URL                          |
|-------------|------------------------------|
| Web App     | http://localhost:8081         |
| API Server  | http://localhost:3001         |
| PostgreSQL  | localhost:5432                |

Stop with:

```bash
docker-compose down
```

Rebuild after changes:

```bash
docker-compose up -d --build
```

## Local Development (requires Node.js)

```bash
# Start dependencies
npm run docker:up

# Start API with hot-reload
npm run api:dev

# Start Expo app
npm run app:dev

# Start Expo in browser
npm run app:web

# Build shared core
npm run core:build

# Run core tests
npm run core:test
```

## Prisma

```bash
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run pending migrations
```
