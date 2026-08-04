# Consientemente

## Features

- **Dashboard:** today's sessions, pending payments, collected today, and quick actions
- **Calendar (day plan):** each day is a button; selecting a day shows the **patients of the day** — regular-schedule patients for that weekday plus any added ones. Each patient on a day has two confirmation statuses: **waiting for confirmation** / **confirmed**. You can add any patient to any day, remove them, and toggle their status
- **Holidays:** the calendar marks public holidays (Argentina, including moveable ones via Easter computation) and warns before adding a patient on a holiday; weekends are also shown
- **Patients:** register, search, view and edit patient records (DNI, age category, regular schedule, payment plan, account details)
- **Payments:** register payments, filter by today/week/month, mark pending as paid, overdue detection
- **Reports:** weekly/monthly summaries with CSV export
- **Settings:** language (`Español (AR)` / `English` / `Italiano`), currency (Guaraníes Gs. / Dólares $), practice data editor, sync status
- **Help:** built-in FAQ screen (translated per language)
- **First-run setup:** on first open the app asks for the practice name and professional's name before showing the dashboard
- **Navigation:** the dashboard offers action buttons to jump to any section (patients, calendar, payments, reports)
- **Theme:** warm pastel executive palette (`src/theme.ts`), aimed at non-technical users
- **i18n:** three languages — Spanish (Argentina, rioplatense/voseo), English, and Italian (`src/i18n/`); language switch applies instantly and is kept in memory

## Tech Stack

- **Frontend:** Expo SDK 51 (React Native + React Native Web)
- **Backend:** Express + Prisma ORM
- **Database:** PostgreSQL 16
- **State:** Zustand
- **Language:** TypeScript

## Project Structure

```
├── packages/
│   ├── core/            # Hexagonal core: domain entities, ports, use-cases (TypeScript, Vitest)
│   ├── app/             # Mobile/web app (Expo, React Native)
│   │   ├── app/         # Expo Router routes (drawer screens)
│   │   └── src/
│   │       ├── adapters/        # Storage adapters (localStorage / sqlite) + repository factory
│   │       ├── stores/          # Zustand stores (wire use-cases to adapters)
│   │       ├── i18n/            # es.ts / en.ts / it.ts dictionaries
│   │       ├── utils/           # date & currency formatters
│   │       └── theme.ts         # pastel palette + shared styles
│   └── api-server/      # Backend API (Express, Prisma)
├── desktop/             # Desktop app
├── docker-compose.yml   # PostgreSQL + API + App containers
└── tsconfig.base.json   # Shared TS config
```

## Architecture (Hexagonal / Ports & Adapters)

The domain logic lives in `@consientemente/core` and is fully framework-agnostic.
The app and API consume it through dependency injection. Layers, from inside out:

```
        DOMAIN ENTITIES          (core/src/domain/entities)   e.g. Patient, Session, Payment, ClinicProfile
                │
        REPOSITORY PORTS         (core/src/domain/ports)      interfaces: PatientRepository, ..., ClinicProfileRepository
                │
        USE-CASES                (core/src/application/*)     RegisterPatient, GetPaymentsPeriod, SaveClinicProfile, ...
                │
        ADAPTERS                 (app/src/adapters/*)         implement the ports
```

The app implements those ports with **pluggable adapters** chosen at runtime by platform
in `src/adapters/repositoryFactory.ts`:

- **Native (iOS/Android/desktop):** `expo-sqlite` adapters (`adapters/sqlite/`)
- **Web (browser):** `localStorage` adapters (`adapters/localStorage/`), because
  `expo-sqlite` is a runtime stub on web

Zustand stores (`src/stores/`) instantiate the core use-cases passing the repository
returned by the factory — screens call the stores and never touch storage directly.

Adding repositories or switching storage later (e.g. for an Electron `.exe` build) only
requires implementing the same port — no changes to use-cases or screens. The same applies
to future mobile packaging (Expo already targets Android/iOS).

> **Data model:** one `ClinicProfile` (single practice). A `Patient` has many `Session`s
> and many `Payment`s; a `Payment` may reference an optional `Session`.
> See the [Database Schema](#database-schema) below.

## Database Schema (ER)

The primary locally-stored tables (PostgreSQL mirror for the API uses the same model):

```
PATIENTS                    SESSIONS                    PAYMENTS
 ─────────                  ─────────                   ─────────
 id PK              ◆──── id PK                 ◆────   id PK
 clinicId FK •───────┘│     patientId FK ────────┘│      patientId FK
 name                │     clinicId FK            │      clinicId FK
 dni                 │     schedule (TIME)        sessionId FK ──► (nullable)
 age                 │     date                   frequency (PER_SESSION | WEEKLY | MONTHLY)
 minorFlag           │     status (SCHEDULED |    amount (int, cents)
 guardian            │            COMPLETED |     status (PAID | PENDING | OVERDUE)
 frequency           │            CANCELLED)
 fee (int, cents)    │     hour / notes
 notes               │
 createdAt           │

CLINIC_PROFILE                    SYNC_QUEUE          (reserved for future sync)
 ─────────────                    ──────────
 id PK                            id PK
 name                             operation (UPSERT|DELETE)
 psychologistName                 entity
 currency                         entityId
 createdAt                        payload JSON, status, attempts, timestamps
```

Relationships:
- `patients` 1 : N `sessions` (FK `patientId`)
- `patients` 1 : N `payments` (FK `patientId`)
- `payments N : 1 sessions` (optional FK `sessionId`)
- all app tables belong to one `ClinicProfile` (FK `clinicId`)

> Note: the app's admin data (patients, sessions, payments, clinic profile) is stored
> locally on-device (localStorage on web, sqlite on native). The API + PostgreSQL are
> used for sync; your data lives on the device and is mirrored to the server when syncing.
> On web the `syncStore` currently no-ops.

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
