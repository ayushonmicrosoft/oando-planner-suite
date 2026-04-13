# Folder Overview

A quick-reference guide to every project folder and its importance.

| Folder | Importance | Description |
|---|---|---|
| **`artifacts/`** | **Core** | Contains all the deployable applications |
| `artifacts/planner-suite/` | **Critical** | The main web app (Next.js) — the Office Planner Suite that users interact with |
| `artifacts/planner-suite/src/` | Critical | Frontend source code — components, features, hooks, views, styles |
| `artifacts/planner-suite/src/features/planner/` | Critical | Core planner feature logic |
| `artifacts/planner-suite/src/components/` | Critical | Reusable UI components |
| `artifacts/planner-suite/src/views/` | Critical | Page-level view components |
| `artifacts/planner-suite/public/` | Medium | Static assets (images, fonts, etc.) |
| `artifacts/planner-suite/e2e/` | Medium | End-to-end test files |
| `artifacts/planner-suite/docs/` | Low | Frontend-specific documentation |
| `artifacts/api-server/` | **Critical** | The backend API server (Express) |
| `artifacts/api-server/src/` | Critical | Server source — routes, middleware, types |
| `artifacts/api-server/src/routes/` | Critical | API endpoints (plans, projects, clients, AI, subscriptions, uploads, etc.) |
| `artifacts/api-server/src/middlewares/` | Critical | Auth, validation, and request processing middleware |
| `artifacts/api-server/src/lib/` | High | Shared server utilities and helpers |
| `artifacts/mockup-sandbox/` | Low | Canvas/design mockup preview server — used for prototyping, not production |
| **`lib/`** | **Core** | Shared libraries used by both frontend and backend |
| `lib/db/` | **Critical** | Database layer — Drizzle ORM schema, migrations, and queries |
| `lib/db/drizzle/` | Critical | Database migration files |
| `lib/api-spec/` | High | OpenAPI specification — the single source of truth for the API contract |
| `lib/api-zod/` | High | Auto-generated Zod validation schemas from the API spec |
| `lib/api-client-react/` | High | Auto-generated React hooks/client for calling the API from the frontend |
| **`docs/`** | Medium | Project documentation |
| `docs/research/` | Low | Research notes and references |
| **`scripts/`** | Medium | Utility/maintenance scripts (auditing, tooling) |
| **Root config files** | High | `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, etc. — project-wide configuration |

## Key Takeaways

- The most important folders are `artifacts/planner-suite/src/`, `artifacts/api-server/src/`, and `lib/db/` — the app's frontend, backend, and database.
- The `lib/` folder acts as the glue — it defines the API contract and generates type-safe code shared between frontend and backend.
- The mockup-sandbox is only used for design prototyping and doesn't affect production.
- The `scripts/` and `docs/` folders are supporting — useful but not part of the running application.
