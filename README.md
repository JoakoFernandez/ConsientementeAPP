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
├── docker-compose.yml   # PostgreSQL + API containers
└── tsconfig.base.json   # Shared TS config
```

## Docker (recommended)

Start PostgreSQL and the API server:

```bash
npm run docker:up
```

This starts:
- **PostgreSQL 16** on port `5432`
- **API server** on port `3001`

Stop with:

```bash
npm run docker:down
```

## Local Development

```bash
# Start dependencies
npm run docker:up

# Start API (hot-reload)
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
npm run api:dev          # Starts API with auto-reload
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run pending migrations
```
