# Interview Track

[![CI](https://github.com/Ochis27/interview-track/actions/workflows/ci.yml/badge.svg)](https://github.com/Ochis27/interview-track/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Ochis27/interview-track/actions/workflows/codeql.yml/badge.svg)](https://github.com/Ochis27/interview-track/actions/workflows/codeql.yml)

Interview Track is a full-stack interview workflow application developed for
the Magna Electronics technical assignment.

It provides a central workspace for managing candidates, scheduling and
completing interviews, submitting structured feedback, reviewing reports, and
inspecting persistent business activity.

- **Live application:** [interview-track-ten.vercel.app](https://interview-track-ten.vercel.app/)
- **Source code:** [github.com/Ochis27/interview-track](https://github.com/Ochis27/interview-track)
- **Architecture documentation:** [docs/architecture.md](docs/architecture.md)
- **Health check:** [interview-track-ten.vercel.app/api/health](https://interview-track-ten.vercel.app/api/health)

## Table of contents

- [Product scope](#product-scope)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Architecture overview](#architecture-overview)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Available commands](#available-commands)
- [Data model](#data-model)
- [Application flows](#application-flows)
- [Validation and error handling](#validation-and-error-handling)
- [Logging and auditing](#logging-and-auditing)
- [Testing strategy](#testing-strategy)
- [Continuous integration](#continuous-integration)
- [Deployment](#deployment)
- [Design decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)
- [Project structure](#project-structure)

## Product scope

The application implements the complete interview lifecycle:

1. Create and browse candidate profiles.
2. Search, sort, and paginate candidates.
3. Schedule an interview for an existing candidate.
4. Search, filter, sort, and paginate interviews.
5. Open an interview details page.
6. Review the candidate and interview context.
7. Mark an interview as completed.
8. Submit structured feedback.
9. Review interview and feedback metrics.
10. Inspect persistent business activity.

## Features

### Dashboard

The dashboard provides a concise overview of current interview activity.

It includes:

- candidate summary information;
- interview summary information;
- upcoming interview sessions;
- explicit empty states;
- server-rendered data loaded directly from PostgreSQL.

### Candidate management

Candidate functionality includes:

- candidate creation;
- first and last name;
- unique email address;
- optional phone number;
- current and target role;
- seniority level;
- optional years of experience;
- optional notes;
- server-side search;
- server-side sorting;
- server-side pagination;
- client and server validation;
- safe persistence error handling.

Optional form values are normalized before persistence. Empty optional values
are stored as `null` rather than arbitrary empty strings where appropriate.

### Interview management

Interview functionality includes:

- scheduling an interview for an existing candidate;
- interview title;
- interview type;
- scheduled date and time;
- duration;
- preparation notes;
- status filtering;
- search by interview or candidate information;
- server-side sorting;
- pagination;
- interview details;
- candidate context;
- completion workflow;
- feedback status.

Supported interview types:

- Technical;
- Coding;
- System design;
- Behavioral;
- Other.

Supported interview states:

- Scheduled;
- In progress;
- Completed;
- Cancelled.

### Interview completion

A scheduled or in-progress interview can be marked as completed.

The completion flow:

1. displays a confirmation dialog;
2. validates that the interview still exists;
3. rejects cancelled interviews;
4. handles already completed interviews idempotently;
5. records the completion timestamp;
6. creates a persistent audit event;
7. revalidates affected application routes.

### Structured feedback

Structured feedback is available after an interview is completed.

A feedback record contains:

- strengths;
- improvement areas;
- final recommendation;
- overall score;
- optional technical score;
- optional communication score;
- optional additional notes.

Supported recommendations:

- Strong hire;
- Hire;
- Continue practice;
- No hire.

The database enforces a one-to-one relationship between an interview and its
feedback. An interview can therefore receive at most one structured feedback
record.

### Reports

The Reports page provides:

- total interview count;
- completed interview count;
- interview completion rate;
- feedback coverage;
- average overall score;
- average technical score;
- average communication score;
- interview distribution by status;
- interview distribution by type;
- recommendation distribution.

The report components include explicit empty states when the database does not
contain enough information to calculate a metric.

### Activity logs

The Activity Logs page displays persistent business events stored in
PostgreSQL.

It supports:

- search;
- level filtering;
- sorting;
- pagination;
- empty states.

Each event can contain:

- event level;
- human-readable message;
- action identifier;
- entity type;
- entity identifier;
- actor information;
- IP address;
- metadata;
- creation timestamp.

Audit recording is best effort. A failure to create an audit record is reported
through operational logging but does not incorrectly report an already
successful business operation as failed.

## Technology stack

| Area | Technology |
| --- | --- |
| Application framework | Next.js 16 App Router |
| UI library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI components | shadcn/ui and Base UI |
| Forms | React Hook Form |
| Validation | Zod |
| Tables | TanStack Table |
| Charts | Recharts |
| Database | Neon PostgreSQL |
| ORM | Prisma 7 |
| Database adapter | Neon serverless adapter |
| Logging | Pino |
| Unit and component testing | Vitest |
| DOM testing | React Testing Library |
| Coverage | V8 coverage |
| Continuous integration | GitHub Actions |
| Static security analysis | CodeQL |
| Hosting | Vercel |
| Package manager | pnpm 11 |
| Runtime | Node.js 24 |

## Architecture overview

```mermaid
flowchart LR
    B["Browser"] --> N["Next.js App Router"]
    N --> S["Server Components and Server Actions"]
    S --> P["Prisma Client"]
    P --> D[("Neon PostgreSQL")]
    S --> L["Pino operational logs"]
    S --> A["Business audit recorder"]
    A --> D
```

The application follows a server-first architecture:

- React Server Components load page-level data.
- Client Components are used only where browser interaction is required.
- Next.js server actions handle mutations.
- Zod validates every external input on the server.
- Prisma provides typed database access.
- Neon PostgreSQL stores application and audit data.
- Pino records structured operational logs.
- GitHub Actions validates every change.
- Vercel hosts the production application.

See [docs/architecture.md](docs/architecture.md) for the complete architecture,
data model, data flows, deployment topology, and security boundaries.

## Requirements

Before running the project locally, install:

- [Node.js 24](https://nodejs.org/);
- [pnpm 11](https://pnpm.io/);
- Git;
- access to a PostgreSQL database.

The repository contains an `.nvmrc` file with the supported Node.js version.

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/Ochis27/interview-track.git
cd interview-track
```

### 2. Select the supported Node.js version

With `nvm`:

```bash
nvm use
```

Alternatively, install Node.js 24 manually.

### 3. Enable Corepack

```bash
corepack enable
corepack prepare pnpm@11.15.1 --activate
```

Verify the versions:

```bash
node --version
pnpm --version
```

### 4. Install dependencies

```bash
pnpm install
```

The project runs `prisma generate` through its `postinstall` script.

### 5. Create the local environment file

On Linux or macOS:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Replace the placeholders with credentials for your own Neon or PostgreSQL
database.

## Environment variables

Create `.env.example` with:

```env
# Pooled database connection used by the application runtime.
DATABASE_URL="postgresql://USER:PASSWORD@POOLED_HOST/DATABASE?sslmode=require"

# Direct database connection used by Prisma migrations and seed operations.
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require"

# Optional operational configuration.
LOG_LEVEL="debug"
NEXT_TELEMETRY_DISABLED="1"
```

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection used by the application |
| `DIRECT_URL` | Yes | Direct connection used by Prisma migrations and seed operations |
| `LOG_LEVEL` | No | Pino log level, such as `debug`, `info`, `warn`, or `error` |
| `NEXT_TELEMETRY_DISABLED` | No | Disables Next.js telemetry when set to `1` |

Do not commit `.env` or production credentials.

Because `.gitignore` ignores `.env*`, it must explicitly allow the example
file:

```gitignore
# env files
.env*
!.env.example
```

## Database setup

### Validate the Prisma schema

```bash
pnpm exec prisma validate
```

### Generate the Prisma client

This normally runs automatically after dependency installation:

```bash
pnpm exec prisma generate
```

### Apply committed migrations

```bash
pnpm exec prisma migrate deploy
```

For local schema development:

```bash
pnpm exec prisma migrate dev
```

### Load representative demo data

```bash
pnpm exec prisma db seed
```

The seed creates representative:

- users;
- candidates;
- interview sessions;
- feedback records;
- audit events.

The seed uses repeatable identifiers and upsert operations so it can safely be
executed more than once.

### Inspect database records

```bash
pnpm exec prisma studio
```

## Start the application

Start the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Create an optimized production build:

```bash
pnpm build
```

Run the production build:

```bash
pnpm start
```

## Available commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with V8 coverage |
| `pnpm exec prisma validate` | Validate the Prisma schema |
| `pnpm exec prisma generate` | Generate the Prisma client |
| `pnpm exec prisma migrate deploy` | Apply committed migrations |
| `pnpm exec prisma migrate dev` | Create and apply a development migration |
| `pnpm exec prisma db seed` | Load representative demo data |
| `pnpm exec prisma studio` | Open Prisma Studio |

## Data model

```mermaid
erDiagram
    USER ||--o{ CANDIDATE : creates
    USER ||--o{ INTERVIEW_SESSION : conducts
    USER ||--o{ FEEDBACK : authors
    USER ||--o{ AUDIT_LOG : produces
    CANDIDATE ||--o{ INTERVIEW_SESSION : attends
    INTERVIEW_SESSION ||--o| FEEDBACK : receives
```

### User

The user model represents an interviewer or administrator.

It contains:

- profile information;
- email;
- role;
- ban state;
- session and account relationships;
- created candidates;
- conducted interviews;
- authored feedback;
- audit events.

The user, account, session, and verification models make the database
authentication-ready. Authentication is not enabled in the assignment version.

### Candidate

A candidate contains:

- unique email;
- first and last name;
- optional phone;
- optional current role;
- optional target role;
- seniority;
- optional years of experience;
- optional notes;
- optional creator;
- timestamps.

### InterviewSession

An interview contains:

- title;
- interview type;
- status;
- scheduled date;
- duration;
- optional notes;
- optional completion date;
- required candidate;
- optional interviewer;
- optional feedback;
- timestamps.

### Feedback

Feedback contains:

- strengths;
- improvement areas;
- recommendation;
- overall score;
- optional technical score;
- optional communication score;
- optional additional notes;
- required and unique interview reference;
- optional author;
- timestamps.

### AuditLog

An audit record contains:

- event level;
- action;
- entity type;
- optional entity identifier;
- message;
- optional JSON metadata;
- optional IP address;
- optional user;
- creation timestamp.

### Important database invariants

- Candidate email addresses are unique.
- An interview belongs to exactly one candidate.
- A candidate referenced by an interview cannot be deleted.
- An interview can contain at most one feedback record.
- Feedback is deleted when its interview is deleted.
- Optional user references become `null` if the user is removed.
- Interview completion time is stored separately from interview status.
- Important list and reporting fields are indexed.

## Application flows

### Read flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant P as Server page
    participant Z as Zod parser
    participant Q as Server query
    participant D as PostgreSQL

    B->>P: GET route with search parameters
    P->>Z: Parse filters, sorting and pagination
    Z-->>P: Typed parameters
    P->>Q: Request constrained data
    Q->>D: Prisma query and count
    D-->>Q: Database results
    Q-->>P: Normalized feature model
    P-->>B: Server-rendered response
```

List pages use URL parameters for:

- search queries;
- filters;
- sorting fields;
- sorting direction;
- page number.

This makes collection views:

- refresh-safe;
- linkable;
- compatible with browser history;
- independent of hidden client state.

### Mutation flow

```mermaid
sequenceDiagram
    participant B as Client form
    participant A as Server action
    participant Z as Zod schema
    participant D as PostgreSQL
    participant U as Audit recorder
    participant N as Next.js cache

    B->>A: Submit untrusted input
    A->>Z: Parse and normalize
    alt Invalid input
        Z-->>B: Safe field errors
    else Valid input
        A->>D: Check preconditions and write
        D-->>A: Persisted entity
        A->>U: Attempt audit event
        U-->>A: Recorded or internally logged
        A->>N: Revalidate affected routes
        A-->>B: Typed result
    end
```

React Hook Form provides immediate client feedback, but the server never trusts
client-side validation. Every server action accepts untrusted data and parses it
again with Zod.

## Validation and error handling

The project uses several layers of validation and protection.

### Client validation

React Hook Form and Zod provide:

- required field validation;
- string length validation;
- score range validation;
- integer validation;
- date validation;
- accessible error messages;
- invalid control states.

### Server validation

Every server action:

1. accepts an untrusted value;
2. parses it using Zod;
3. normalizes optional values;
4. returns field errors in a stable shape;
5. verifies business preconditions;
6. performs the database operation.

### Business validation

Examples include:

- the candidate must still exist before scheduling an interview;
- cancelled interviews cannot be completed;
- completing an already completed interview is idempotent;
- feedback requires a completed interview;
- duplicate feedback is rejected.

### Safe error handling

Unexpected database or infrastructure errors:

- are recorded through Pino;
- are not exposed directly to the browser;
- are converted into stable user-facing messages;
- do not expose SQL, credentials, stack traces, or internal implementation
  details.

### Health endpoint

`GET /api/health` verifies database connectivity.

Successful response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

If PostgreSQL is unavailable, the endpoint returns HTTP `503` with a safe error
response.

## Logging and auditing

The application separates operational logging from business auditing.

### Operational logs

Pino is used for:

- operation failures;
- query duration;
- mutation duration;
- entity identifiers;
- result counts;
- environment context;
- structured error serialization.

Configured sensitive fields are redacted, including:

- passwords;
- tokens;
- authorization values;
- cookies;
- email addresses;
- phone numbers.

### Business audit events

Important domain actions create persistent audit records.

Examples:

- candidate creation;
- interview scheduling;
- interview completion;
- feedback submission.

Audit records are displayed in the Activity Logs page.

### Best-effort audit behavior

The primary business operation and the audit write serve different purposes.

If the main operation succeeds but audit persistence fails:

- the main operation remains successful;
- the audit failure is recorded through Pino;
- the user is not incorrectly told that the completed operation failed.

A production system requiring guaranteed audit delivery could introduce a
transactional outbox.

## Testing strategy

The application uses:

- Vitest;
- React Testing Library;
- `user-event`;
- jsdom;
- V8 coverage.

Tests cover:

- schema parsing;
- data normalization;
- Prisma server queries;
- server mutations;
- successful operations;
- validation failures;
- missing entities;
- duplicate feedback;
- persistence failures;
- client forms;
- field error mapping;
- pending states;
- navigation;
- table rendering;
- filtering;
- sorting;
- pagination;
- empty states;
- detail components;
- completion dialogs;
- reports;
- charts;
- activity logs;
- audit integration;
- logger behavior;
- Prisma client behavior.

Generic UI primitives, generated Prisma code, tests, and type-only files are
excluded from application coverage.

Global coverage thresholds are enforced for:

- statements;
- branches;
- functions;
- lines.

The minimum configured threshold is 80% for every category.

Run the complete test suite:

```bash
pnpm test
```

Run with coverage:

```bash
pnpm test:coverage
```

## Continuous integration

The CI workflow runs on:

- pushes to `main`;
- pull requests targeting `main`;
- manual workflow execution.

The workflow performs:

1. repository checkout;
2. pnpm setup;
3. Node.js setup from `.nvmrc`;
4. frozen dependency installation;
5. Prisma schema validation;
6. ESLint;
7. TypeScript checking;
8. Vitest with coverage;
9. coverage artifact upload;
10. optimized production build.

CodeQL runs separately for JavaScript and TypeScript on:

- pushes;
- pull requests;
- manual runs;
- a weekly schedule.

## Deployment

The production system uses:

- Vercel for the Next.js application;
- Neon for PostgreSQL;
- GitHub for source control;
- GitHub Actions for validation;
- CodeQL for static security analysis.

```mermaid
flowchart TB
    G["GitHub main branch"] --> C["GitHub Actions"]
    C --> Q["Lint, typecheck, tests and build"]
    G --> V["Vercel deployment"]
    V --> N["Next.js runtime"]
    N --> D[("Neon PostgreSQL")]
    C --> S["CodeQL and coverage artifacts"]
```

Production environment variables are configured in Vercel.

Required production variables:

```text
DATABASE_URL
DIRECT_URL
```

Database migrations should be applied deliberately:

```bash
pnpm exec prisma migrate deploy
```

They are not executed automatically whenever the application starts.

## Design decisions

### Feature-oriented organization

Each domain feature owns its:

- components;
- schemas;
- server functions;
- tests;
- domain types.

This keeps related behavior together and limits coupling between pages.

### Server-first rendering

Page-level data is loaded through React Server Components.

Client Components are used only for:

- forms;
- search controls;
- filters;
- sorting;
- pagination;
- dialogs;
- interactive charts and tables.

This reduces unnecessary client-side data-fetching code and keeps database
credentials on the server.

### URL-driven table state

Search, filtering, sorting, and pagination are represented in the URL.

Benefits include:

- browser history support;
- refresh-safe state;
- shareable views;
- predictable server rendering.

### Shared validation contracts

Zod defines accepted input and normalization behavior.

React Hook Form uses the schemas for immediate client feedback, while server
actions validate the input again before performing any operation.

### Relational integrity

Important rules are enforced at the database level through:

- unique constraints;
- required relations;
- foreign keys;
- deletion behavior;
- indexes.

### Typed content modules

Static UI text and enum labels are stored in typed TypeScript content objects
rather than scattered through TSX components.

This provides:

- consistent wording;
- easier maintenance;
- stronger typing;
- simpler future localization.

### Explicit audit boundary

Business audit events are recorded from server mutation functions, where the
application knows:

- which action occurred;
- which entity was affected;
- the relevant metadata;
- whether the primary operation succeeded.

## Assumptions

- The assignment is evaluated as a single-workspace interviewer application.
- Authentication and authorization were not required for the MVP.
- The seeded user represents the current interviewer in demo records.
- New events use a system actor until authenticated session context is
  connected.
- An interview must be completed before feedback can be submitted.
- An interview can receive one structured feedback record.
- Reports represent the current database state.
- Dates are persisted as PostgreSQL timestamps and formatted by the
  application.
- Database credentials are provided through environment variables.
- The deployed application is intended for evaluation and demonstration.

The schema contains user, session, account, and verification models, and the
project includes Better Auth as a dependency. Authentication is intentionally
not enabled in this assignment version.

## Known limitations

- Dashboard routes are not currently protected by authentication.
- Activity Logs are not restricted to an administrator role.
- Audit events created without authentication do not contain an authenticated
  actor.
- IP address capture is not currently connected to request context.
- Interview rescheduling and cancellation actions are not exposed in the UI.
- Candidate profiles cannot currently be edited or archived.
- Submitted feedback is not editable.
- Reports do not provide date range filters.
- Reports are calculated directly from current source tables.
- Email or calendar notifications are not implemented.
- The test suite focuses on unit and component integration tests rather than
  full browser E2E tests.

## Future improvements

1. Integrate Better Auth.
2. Protect the dashboard route group.
3. Add administrator, interviewer, and reviewer permissions.
4. Restrict Activity Logs to administrators.
5. Derive actor identifiers from authenticated sessions.
6. Add request IP and correlation IDs.
7. Add candidate editing and archiving.
8. Add candidate detail pages with complete interview history.
9. Add interview rescheduling and cancellation.
10. Introduce a guarded interview state machine.
11. Add controlled feedback editing with revision history.
12. Add report date ranges and candidate filters.
13. Add CSV and PDF report exports.
14. Add interview reminder notifications.
15. Add Playwright end-to-end testing.
16. Add automated accessibility testing.
17. Add production error monitoring and distributed tracing.
18. Use a transactional outbox for guaranteed audit delivery.
19. Add tenant isolation for multiple organizations.
20. Add configurable workspace time zones.

## Project structure

```text
app/
  (dashboard)/
    activity/
    candidates/
    interviews/
    reports/
  api/
    health/

components/
  layout/
  ui/

content/
  activity.ts
  application.ts
  candidates.ts
  dashboard.ts
  interviews.ts
  navigation.ts
  pages.ts
  reports.ts

features/
  activity/
    components/
    schemas/
    server/
    types/

  candidates/
    components/
    schemas/
    server/
    types/

  dashboard/
    components/
    server/

  interviews/
    components/
    schemas/
    server/
    types/

  reports/
    components/
    server/
    types/

generated/
  prisma/

lib/
  audit/
  db/
  logging/

prisma/
  migrations/
  schema/
  seed.ts

docs/
  architecture.md

tests/
  setup.ts
```

## Author

## Author

Developed by [Paul-Catalin Ochis](https://github.com/Ochis27) as part of the Magna Electronics Full Stack Engineer practical assignment.
