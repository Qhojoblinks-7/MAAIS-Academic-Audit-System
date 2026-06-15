# Frontend–Backend Bridge Documentation

## Purpose
The `src/lib/` bridge provides a modular, contract-first connection between the React frontend and the NestJS backend. It replaces prototype-era mock data with typed API calls, server-state caching, and a normalized client-side auth layer.

## Tech Stack
- **HTTP client**: native `fetch` with interceptors (`src/lib/api/client.js`)
- **Client state**: Zustand store (`src/lib/stores/authStore.js`)
- **Server state**: TanStack Query (`@tanstack/react-query`) hooks (`src/lib/hooks/api/`)
- **Contract layer**: JSDoc-typed API modules + constants (`src/lib/types/index.js`)

## Directory Structure

```
front-end/src/
├── lib/
│   ├── api/
│   │   ├── client.js           # Low-level fetch interceptor (auth + refresh)
│   │   ├── auth.js             # authApi  → /auth/*
│   │   ├── users-academic.js  # usersApi + academicApi → /users/*, /academic/*
│   │   ├── grading.js           # gradingApi → /grading/*
│   │   ├── comms.js             # commsApi → /comms/*
│   │   ├── reports.js           # reportsApi → /reports/*
│   │   ├── archive.js           # archiveApi → /archive/*
│   │   └── index.js             # Barrel re-exports
│   ├── types/
│   │   └── index.js             # JSDoc schemas + role/entity constants
│   ├── stores/
│   │   └── authStore.js         # Zustand auth state (user + tokens)
│   └── hooks/
│       └── api/
│           ├── index.js         # Barrel re-exports
│           ├── authAcademics.js   # Login, Me, Year, Dept, Subject, Class
│           ├── grading.js         # Grade CRUD, lock/unlock, approve, performance
│           ├── comms.js           # Notifications, pulse, broadcast
│           ├── reports.js         # ReportCard + Transcript
│           └── archive.js         # Promotion history, archive stats
├── bridge/                      # (this directory; future integration guides)
└── main.jsx                     # React root — mounts app
```

## Backend Mapping

| Frontend API module | NestJS Controller | Key Routes |
|---|---|---|
| `auth.js` | `auth.controller.ts` | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| `users-academic.js` | `users.controller.ts`, `academic-architect.controller.ts` | `/users/*`, `/academic/*` |
| `grading.js` | `grading.controller.ts` | `/grading/entries`, `/grading/correct`, `/grading/*` |
| `comms.js` | `comms.controller.ts` | `/comms/notify`, `/comms/emergency`, `/comms/notifications/*` |
| `reports.js` | `reports.controller.ts` | `/reports/generate`, `/reports/verify/*`, `/reports/*` |
| `archive.js` | `archive.controller.ts` | `/archive/promote`, `/archive/students/*`, `/archive/stats` |

## Auth Flow

1. **Login** — UI calls `useLogin().mutate(dto)` → `authApi.login(dto)` → `POST /auth/login`
2. **Response** — Backend returns `{ accessToken, refreshToken, user }` with Prisma `Role` enum value
3. **Normalization** — Client maps backend roles to frontend roles:
   - `SUPER_ADMIN` → `ADMIN`
   - `HEADMASTER` → `ADMIN`
   - `HOD`, `TEACHER`, `STUDENT` → unchanged
   - `PARENT` → dropped (not in frontend scope)
4. **Persistence** — Zustand writes user + tokens to `localStorage`
5. **Requests** — `client.js` reads stored access token, sends `Authorization: Bearer ...`
6. **Refresh** — On `401`, client attempts single `POST /auth/refresh` then retries once
7. **Logout** — Clears store + localStorage, dispatches `auth:logout` event for root listener

## Role Model

### Frontend Roles (4)
```js
ROLES.ADMIN   // SUPER_ADMIN + HEADMASTER normalized
ROLES.HOD
ROLES.TEACHER
ROLES.STUDENT
```

### Backend Roles (6 — Prisma enum)
```prisma
SUPER_ADMIN, HEADMASTER, HOD, TEACHER, STUDENT, PARENT
```

### Guard Alignment
- Backend: `JwtAuthGuard` + `RolesGuard` enforce role per controller/handler
- Frontend: `RequireRole({ allowedRoles: ['HOD'] })` mirrors backend `@Roles(Role.HOD)`
- Always include `'ADMIN'` in `allowedRoles` when backend uses both `SUPER_ADMIN` and `HEADMASTER`

## TanStack Query Conventions

- **Query keys** are hierarchical nouns: `['academic', 'departments']`, `['grading', 'classes', classId, 'terms', termId, 'performance']`
- **Stale time** defaults: `5 min` for lists, `2 min` for grade data, `30 min` for master data (subjects, classes, departments)
- **Invalidation** — Mutations call `queryClient.invalidateQueries({ queryKey: [...] })` on success using the same prefix hierarchy
- **Enabled gating** — Dependent queries use `enabled: !!parentId` to avoid fetching before params exist

## Zustand Auth Store

```js
const state = useAuthStore();
state.user              // Normalized user object (role = ADMIN|HOD|TEACHER|STUDENT)
state.accessToken       // JWT access token
state.refreshToken      // Rotating refresh token
state.isLoading         // Global auth loading flag
state.setUser(user)     // Persist user (normalizes role automatically)
state.setTokens(at, rt) // Persist tokens
state.logout()          // Full clear
```

Selector helpers:
```js
selectIsAuthenticated(state)          // boolean
selectUserRole(state)                 // 'ADMIN' | 'HOD' | 'TEACHER' | 'STUDENT' | undefined
selectHasRole(state, 'HOD')           // boolean
selectHasAnyRole(state, ['HOD', 'ADMIN']) // boolean
```

## Environment Variables

Required in `front-end/.env` (or `.env.local`):

```
VITE_API_BASE_URL=http://localhost:4000  # NestJS backend origin
VITE_APP_URL=http://localhost:3000       # Frontend origin
```

## Planned Migration Steps

1. **Replace `RoleContext.jsx`** — Derive `user` from `useAuthStore` instead of `mockApiData.json`
2. **Wire `main.jsx`** — Call `authApi.getCurrentUser()` on boot; fall back to stored user if API fails offline
3. **Replace page-level data fetching** — Swap `useEffect` + local `data` state in pages like `TeacherDashboard`, `HODDashboard` for `useAllStudents()`, `useMyAssignments()`, etc.
4. **Retire mock APIs** — Remove `mockApiData.json` imports after all pages consume real APIs
5. **Add React Query Provider** — Wrap app in `<QueryClientProvider>` in `main.jsx` or `App.jsx`

## Error Handling

- `client.js` throws `Error` with `.status` and `.response` attached
- TanStack Query hooks expose `error`, `isError`, `isLoading`, `data`
- All hooks default `retry: false` for auth queries to avoid lock-step loops
- `401` triggers automatic refresh; second `401` dispatches `auth:logout`

## Constraints
- Frontend only; no backend changes
- Must remain JS (`.js`/`.jsx`), no TypeScript in `src/`
- Backend already enforces RBAC — frontend gates are UX-only, not security boundaries
