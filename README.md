# MAAIS — Mando Academic Audit & Intervention System

**Mando Senior High Technical School (Mando SHTS)**
Academic management platform built for Ghana SHS. Replaces fragmented spreadsheets and paper records with a unified, audit-ready system for grade entry, report generation, promotion cycles, and stakeholder communication.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [What It Does](#what-it-does)
3. [User Roles](#user-roles)
4. [System Modules](#system-modules)
5. [Academic Lifecycle](#academic-lifecycle)
6. [Tech Stack](#tech-stack)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Configuration](#configuration)
10. [Database & Seeding](#database--seeding)
11. [Authentication & Security](#authentication--security)
12. [API Reference](#api-reference)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Environment Variables](#environment-variables)
16. [Key Documents](#key-documents)

---

## System Overview

MAAIS covers the full academic lifecycle of a Ghana Senior High School:

- **Academic setup** — create years (3 Terms or 2 Semesters), departments, subjects, and classes (Gold/Green tracks).
- **Grading** — teachers enter scores; the system auto-calculates totals and WAEC Roman grades (A1–F9).
- **Audit & oversight** — HODs review grade changes, reject corrections, and lock class matrices before reports are released.
- **Reports** — batch-generate report cards with QR codes and SHA256 hashes; build 3-year transcripts for alumni.
- **Promotion & archive** — move students up a level each year; graduated students go into "The Vault" for lifelong retrieval.
- **Communication** — SMS, in-app notifications, and emergency broadcasts to parents, students, and staff.
- **Student portal** — pupils view their results, longitudinal academic journey, and intervention alerts.
- **Safety switch** — emergency system freeze blocks all grade writes during exams or incidents.

The school runs on a **Gold / Green track** model (parallel streams), and every academic year can be split into either **3 Terms** or **2 Semesters**.

---

## What It Does

| Need | How MAAIS solves it |
|------|----------------------|
| Teachers manually calculating grades and totals | Auto-calculates SBA + Exam (30/70) or technical milestone totals; WAEC grades (A1–F9) are assigned automatically |
| HODs chasing teachers for missing data | Audit tray flags missing observations and incomplete submissions before term lock |
| Report cards taking days to compile | One-click batch generation for an entire class; QR code + SHA256 hash per card for verification |
| No record of who changed a grade | Immutable `GradeCorrection` and `AuditLog` entries capture old value, new value, reason, user, timestamp, IP, and user-agent |
| Graduated students' records scattered | "The Vault" archive preserves full grade history; alumni transcripts retrievable by index number |
| Parents calling the office for results | SMS and in-app notifications push report-card readiness and emergency alerts |
| Paper-based promotion errors | Promotion cycle enforces "all terms must be locked" before any student moves up |
| Exam-season grade tampering | Emergency system freeze makes the whole platform read-only for all teachers |

---

## User Roles

| Role | Who | What they can do |
|------|-----|-----------------|
| **Admin** (SUPER_ADMIN / HEADMASTER) | Headmaster / System Admin | Full system access — user management, academic setup, emergency freeze, batch reports, promotion cycle, vault search, all communications |
| **HOD** | Head of Department | Department audit trail, grade rejection, lock class matrix, WAEC export, intervention alerts, teacher password resets, support ticket escalation |
| **Teacher** | Teaching staff | Grade entry (core 30/70 and technical milestones), self-initiated revisions, behavioral logging, safety flags, WAEC CSV preview |
| **Student** | Enrolled learner | View terminal results, longitudinal academic journey, behavior ratings, intervention alerts, support tickets, timetable |
| **Parent** | Guardian | Read-only view of linked student(s) — results, attendance, behavior, notifications |

Role inheritance is enforced on the backend: `SUPER_ADMIN` and `HEADMASTER` inherit all lower roles; `HOD` inherits `TEACHER`, `STUDENT`, `PARENT`; `TEACHER` inherits `STUDENT`, `PARENT`.

---

## System Modules

### 1. Academic Architect
The control room for the school's structure.
- Create academic years with **3 Terms** or **2 Semesters** (auto-generated with date-split boundaries).
- Activate the current year/term.
- Manage **departments** and **subjects** (WAEC code-validated).
- Create **class sections** with levels (SHS 1–3), programs, and **Gold/Green track** assignment.
- Auto-generate Gold (`A`) and Green (`B`) classes per level during year setup.
- Map teachers to subject/class combinations.

### 2. Grading & Assessment
Real-time grade entry with business logic.
- **Core subjects**: Class Score (max 30) + Exam Score (max 70) → auto-total → WAEC Roman grade.
- **Technical subjects**: Milestone columns (Marking out, Assembly, Finishing) + Practical/Theory.
- Bulk upsert for entire class sheets.
- Smart remarks auto-suggested from grade category pools.
- Mandatory justification on every grade edit (popup blocks save until reason is given).

### 3. HOD Oversight & Locking
Department-level quality control.
- **Audit tray**: see every grade change with old/new values and reason.
- **Submission tracking**: monitor teacher completion percentages.
- **Grade rejection**: HOD rejects a grade with a comment → teacher gets a real-time notification.
- **Class matrix lock**: only lockable when 100 % of submissions are complete; makes grades read-only.
- **WAEC STP export**: CSV with Index, Student Name, SBA, Exam, Final, Grade, Roman — only available for locked classes.

### 4. Reports & Transcripts
Official document generation.
- **Report cards**: student name, term, subjects, scores, grades, class position, QR code, SHA256 hash.
- **Transcripts**: 3-year history compiled into a signed PDF.
- **QR verification**: scan any report card to confirm authenticity against the system hash.
- **Batch generation**: generate for an entire class or school in one action.

### 5. Archive & Promotion
End-of-year operations.
- **Promotion cycle**: F1 → F2, F2 → F3, F3 → Alumni (archived). Blocked until all terms are locked.
- **The Vault**: search graduated students by index number; retrieve full grade history and transcripts.
- **Database health**: integrity checks and hash verification.

### 6. Communication & Notifications
Multi-channel outreach.
- In-app notification bell with real-time updates (WebSocket).
- SMS via Twilio for emergency broadcasts and report-card alerts.
- Email via Nodemailer for official correspondence.
- Grade discussion threads between teachers and HODs.
- Support tickets (Teacher → HOD → Admin escalation chain with SLA tracking).

### 7. Student Portal
Learner self-service.
- Terminal results (core and technical separated).
- Academic Journey: 3-year longitudinal trends with charts.
- Intervention alerts (flag if performance drops ≥ 15 % vs previous term).
- Behavior & character traits ratings.
- Timetable and profile management.

### 8. System Freeze (Emergency Lock)
- Admin triggers a global freeze (e.g., "Exam security incident").
- All teachers see a freeze acknowledgment modal; grade saves return 403.
- Admin can lift the freeze, creating a 24-hour override window.
- Department-level freeze also available (freeze only one department, e.g., Automotive).

### 9. Intervention Engine
- Auto-detects students with ≥ 15 % performance drop compared to previous term.
- Alerts visible to HODs and Admins for review and counseling action.
- Resolvable status workflow.

### 10. Timetable & Attendance
- Class and teacher timetables.
- Clash detection for teacher scheduling.
- Attendance recording linked to grading.

---

## Academic Lifecycle

```
New Academic Year Created
  ├─ Choose: 3 Terms OR 2 Semesters
  ├─ Auto-generate term/semester date boundaries
  └─ Auto-create SHS 1/2/3 Gold & Green class sections (optional)

Teachers Enter Grades
  ├─ Core: SBA (30) + Exam (70)
  └─ Technical: Milestones + Practical/Theory

HOD Reviews
  ├─ Audit tray (missing data, corrections)
  ├─ Reject grades with comments
  ├─ Lock class matrix (100 % submissions required)
  └─ WAEC CSV export unlocked

Admin Triggers Batch Reports
  ├─ Report cards (QR + SHA256)
  └─ 3-year transcripts (PDF)

End of Year
  ├─ Lock all terms
  ├─ Promotion cycle (F1→F2, F2→F3, F3→Alumni)
  └─ Vault preserves permanent records
```

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite 6 | Build tool & dev server |
| TypeScript | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router 7 | Client-side routing |
| TanStack Query v5 | Server-state caching |
| Zustand | Client auth state |
| Recharts | Dashboard charts |
| Lucide React | Icon library |
| PapaParse / XLSX | CSV/Excel parsing |
| html2canvas + jsPDF | Report card PDF export |
| Sonner | Toast notifications |
| PWA (vite-plugin-pwa) | Offline-capable installable app |
| Playwright | End-to-end tests |

### Backend
| Tool | Purpose |
|------|---------|
| NestJS 11 | REST API framework |
| Prisma 7 + Neon | Database ORM + serverless Postgres |
| Argon2id | Password hashing |
| JWT + Passport | Authentication & refresh tokens |
| Swagger | API documentation |
| WebSocket (ws) | Real-time notifications |
| Twilio | SMS delivery |
| Nodemailer | Email delivery |
| pdf-lib + qrcode | PDF transcript + QR generation |
| ioredis | Caching / session store |
| class-validator | DTO validation |
| @nestjs/schedule | Cron jobs (intervention scheduler) |

---

## Project Structure

```
MAAIS-Academic-Audit-System/
├── front-end/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/                  # Admin dashboards
│   │   │   │   ├── AdminHome.jsx
│   │   │   │   ├── AdminManagement.jsx
│   │   │   │   ├── AcademicArchitect.jsx
│   │   │   │   ├── ArchiveView.jsx
│   │   │   │   ├── GradingRulesView.jsx
│   │   │   │   ├── StudentRegistry.jsx
│   │   │   │   └── components/
│   │   │   │       ├── BlueprintTreeView.jsx   # Year groups, classrooms, tracks
│   │   │   │       ├── CurriculumMatrixView.jsx
│   │   │   │       └── InsightsPanel.jsx
│   │   │   ├── hod/                    # HOD dashboards
│   │   │   │   ├── HODDashboard.jsx
│   │   │   │   ├── HODStudentRegistry.jsx
│   │   │   │   ├── HODReview.jsx
│   │   │   │   ├── HODAnalytics.jsx
│   │   │   │   ├── HODArchiveView.jsx
│   │   │   │   └── ...
│   │   │   ├── teacher/                # Teacher dashboards
│   │   │   │   ├── TeacherDashboard.jsx
│   │   │   │   ├── TeacherGradingView.jsx
│   │   │   │   ├── TeacherAnalyticsView.jsx
│   │   │   │   ├── TeacherArchiveView.jsx
│   │   │   │   └── ...
│   │   │   ├── student/                # Student portal
│   │   │   │   ├── StudentPortal.jsx
│   │   │   │   ├── StudentResults.jsx
│   │   │   │   ├── StudentJourney.jsx
│   │   │   │   └── ...
│   │   │   └── shared/                 # Shared grading sheets, modals
│   │   ├── components/
│   │   │   ├── layout/                 # Sidebars (AdminSidebar, HODSidebar, etc.)
│   │   │   ├── organisms/              # Discussion threads, grade comparison
│   │   │   ├── molecules/              # Cards, tiles, buttons
│   │   │   └── ui/                     # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── api/                    # Fetch clients (admin, auth, grading, comms, reports, archive)
│   │   │   ├── hooks/                  # TanStack Query hooks per module
│   │   │   ├── stores/                 # Zustand auth store
│   │   │   └── types/                  # JSDoc schemas + constants
│   │   ├── services/                   # Business logic (adminService, authService, etc.)
│   │   └── main.jsx                    # React entry point
│   ├── tests/                          # Playwright E2E tests
│   ├── dist/                           # Production build
│   ├── package.json
│   └── vite.config.js
│
├── maais-backend/                      # NestJS backend
│   ├── src/
│   │   ├── auth/                       # JWT strategy, login, refresh, logout
│   │   ├── users/                      # Staff, students, parents CRUD
│   │   ├── academic-architect/         # Years, terms, departments, subjects, classes
│   │   ├── grading/                    # Grade entry, bulk upsert, corrections, audit tray
│   │   ├── reports/                    # Report cards, transcripts, QR verification
│   │   ├── archive/                    # Promotion cycle, vault search, DB health
│   │   ├── comms/                      # Notifications, SMS, email, analytics pulse
│   │   ├── hod/                        # HOD-specific endpoints (review, lock, export)
│   │   ├── teacher/                    # Teacher-specific endpoints (assignments, observations)
│   │   ├── portal/                     # Student portal data
│   │   ├── common/
│   │   │   ├── guards/                 # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/             # @Public(), @Roles(), @CurrentUser()
│   │   │   ├── prisma/                 # Global PrismaService
│   │   │   └── constants/              # Role hierarchy, grade scales
│   │   ├── dto/                        # Request/response DTOs
│   │   ├── main.ts                     # NestJS bootstrap
│   │   └── app.module.ts
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema (20+ models)
│   │   └── seeds/                      # Data seeders (academic, staff, students, grades, etc.)
│   ├── dist/                           # Compiled JS
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                               # Project documentation
│   ├── ADMIN_UAT_PLAIN_LANGUAGE.md
│   ├── UAT_QUESTIONNAIRE.md
│   ├── HOD_ROLES_SUMMARY.md
│   ├── TEACHER_DASHBOARD_SPEC.md
│   ├── GHANA_SHS_GRADING_SHEET.md
│   ├── REQUIREMENTS_TRACEABILITY.md
│   └── ...
│
└── README.md                           # ← you are here
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (via Neon serverless recommended)
- Twilio account (for SMS) — optional for local dev
- SMTP credentials (for email) — optional for local dev

### Quick Start (Full Stack)

```bash
# 1. Clone the repo
git clone <repository-url>
cd MAAIS-Academic-Audit-System

# 2. Install backend dependencies
cd maais-backend
npm install

# 3. Set up backend environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, etc.

# 4. Push schema and seed data
npm run prisma:generate
npm run prisma:push        # or npm run prisma:migrate
npm run prisma:seed

# 5. Start backend (port 4000)
npm run start:dev

# 6. In a new terminal, install frontend dependencies
cd front-end
npm install

# 7. Set up frontend environment
cp .env.example .env
# Edit .env with VITE_API_BASE_URL=http://localhost:4000

# 8. Start frontend (port 5173)
npm run dev
```

Visit `http://localhost:5173` and log in with the seeded admin account.

---

## Configuration

### Academic Year Setup
1. Log in as Admin.
2. Go to **Curriculum → Subject Curriculum** (Academic Architect).
3. Click **New Academic Year** (top-right of the Institutional Blueprint).
4. Fill in:
   - **Academic Year Name** (e.g. `2026/2027`)
   - **Start Date** and **End Date**
   - **Split into**: **3 Terms** or **2 Semesters** — the system auto-generates evenly date-split terms.
   - **School Levels**: pick SHS 1, SHS 2, SHS 3 (default: all three).
   - **Gold & Green classes**: toggle on to auto-create Gold (`A`) and Green (`B`) classes per level.
5. Click **Create Year** — the year becomes active immediately, and the dashboard header updates.

### Grade Configuration
- Go to **Curriculum → Grading Rules** to configure:
  - WAEC grade boundaries (A1–F9)
  - Smart remark suggestion pools
  - Subject-specific weighting rules

### Track Assignment (Gold / Green)
- When creating a class section, choose **Gold** or **Green** as the track.
- Gold/Green classes mirror each other — same subjects, separate cohorts.

---

## Database & Seeding

### Schema Highlights

| Model | Purpose |
|-------|---------|
| `User` | Polymorphic auth account (staff / student / parent) |
| `AcademicYear` | School year with `termSystem` (`THREE_TERMS` or `TWO_SEMESTERS`) |
| `Term` | Individual term/semester with start/end dates, `isActive`, `isLocked` |
| `ClassSection` | Classroom with `level` (FORM_1/2/3), `program`, `track` (Gold/Green) |
| `TeachingAssignment` | Teacher → subject → class mapping |
| `StudentProfile` | Student details including `isBoarder` (day vs boarding) |
| `GradeEntry` | Score record (classScore + examScore → total + grade) |
| `GradeCorrection` | Immutable audit trail of every grade edit |
| `ReportCard` | Per-student/term card with `hash` + `qrCode` |
| `Transcript` | 3-year compiled document with `hash` |
| `PromotionRecord` | Yearly progression snapshot |
| `AuditLog` | System-wide action log for compliance |
| `InterventionAlert` | At-risk student flags |
| `SupportTicket` | Teacher/HOD/Student escalation chain |
| `Notification` | In-app + SMS + email message log |

### Seed Data

```bash
cd maais-backend
npm run prisma:seed
```

Creates:
- Admin account: `admin@mandoshts.edu.gh` / `Admin@2024!`
- HOD, teacher, student, and parent demo accounts
- Departments, subjects, classes (Gold/Green tracks)
- 2024/2025 academic year with 3 terms
- Sample grades, attendance, behavior, and report cards

---

## Authentication & Security

### Flow
1. **Login** — `POST /auth/login` with email + password.
2. **Response** — `{ accessToken, refreshToken, user }`.
3. **Token storage** — access token in memory/Zustand; refresh token in `localStorage`.
4. **Auto-refresh** — on `401`, the client automatically calls `POST /auth/refresh` and retries once.
5. **Logout** — clears store + localStorage + server-side refresh token.

### Password Hashing
- Argon2id (memory-hard, OWASP recommended).

### Token Lifetimes
- Access token: **15 minutes**
- Refresh token: **7 days**, rotated on every use

### Role-Based Access Control
- Backend: `@Roles()` decorators + `RolesGuard` on every controller.
- Frontend: `RequireRole` wrapper on route components.
- Role inheritance reduces decorator duplication.

---

## API Reference

### Base URL
```
http://localhost:4000/api/v1
```

Swagger docs: `http://localhost:4000/api/docs`

### Key Endpoints

#### Academic Architect
| Method | Endpoint | Roles | Purpose |
|--------|----------|-------|---------|
| `POST` | `/academic/years` | SUPER_ADMIN, HEADMASTER | Create academic year (auto-generates terms/semesters) |
| `PATCH` | `/academic/years/:id/activate` | SUPER_ADMIN, HEADMASTER | Set active year |
| `GET` | `/academic/years/active` | All authenticated | Get current active year |
| `GET` | `/academic/years` | HOD, HEADMASTER, SUPER_ADMIN | List all years |
| `POST` | `/academic/terms` | SUPER_ADMIN, HEADMASTER | Create a term |
| `PATCH` | `/academic/terms/:id/activate` | SUPER_ADMIN, HEADMASTER | Set active term |
| `POST` | `/academic/departments` | HEADMASTER | Create department |
| `GET` | `/academic/departments` | All authenticated | List departments |
| `POST` | `/academic/subjects` | HOD | Create subject (WAEC code validated) |
| `POST` | `/academic/classes` | HEADMASTER | Create class section (with track) |
| `POST` | `/academic/assignments` | HOD | Assign teacher to subject/class |

#### Grading
| Method | Endpoint | Roles | Purpose |
|--------|----------|-------|---------|
| `POST` | `/grading/entries` | TEACHER, HOD, HEADMASTER | Create grade entry |
| `POST` | `/grading/entries/bulk` | TEACHER, HOD, HEADMASTER | Bulk upsert for a class |
| `PATCH` | `/grading/entries/:id/lock` | HOD, HEADMASTER | Lock a grade entry |
| `POST` | `/grading/corrections` | TEACHER, HOD, HEADMASTER | Edit grade with justification |
| `GET` | `/grading/audit-tray` | HOD, HEADMASTER | Get audit trail for term |
| `GET` | `/grading/smart-remarks/:grade` | All authenticated | Get remark suggestions |

#### Reports
| Method | Endpoint | Roles | Purpose |
|--------|----------|-------|---------|
| `POST` | `/reports/report-cards/generate` | HOD, HEADMASTER | Generate single report card |
| `POST` | `/reports/report-cards/batch` | HEADMASTER, SUPER_ADMIN | Batch generate for class |
| `POST` | `/reports/transcripts/generate` | HEADMASTER, SUPER_ADMIN | Build 3-year transcript PDF |
| `GET` | `/reports/verify/:hash` | **Public** | QR scan verification |

#### Archive
| Method | Endpoint | Roles | Purpose |
|--------|----------|-------|---------|
| `POST` | `/archive/promote` | SUPER_ADMIN, HEADMASTER | Run promotion cycle |
| `GET` | `/archive/vault/search` | HOD, HEADMASTER, SUPER_ADMIN | Search archived students |
| `PATCH` | `/archive/terms/:id/lock` | HEADMASTER, SUPER_ADMIN | Lock a term |
| `GET` | `/archive/health` | HEADMASTER, SUPER_ADMIN | Database integrity check |

#### Communication
| Method | Endpoint | Roles | Purpose |
|--------|----------|-------|---------|
| `POST` | `/comms/notify` | HOD, HEADMASTER | Send in-app notification |
| `POST` | `/comms/emergency` | HEADMASTER, SUPER_ADMIN | Emergency SMS broadcast |
| `GET` | `/comms/analytics/pulse` | HOD, HEADMASTER | Dashboard analytics data |
| `POST` | `/comms/tickets` | STUDENT | Raise support ticket |
| `GET` | `/comms/tickets` | All authenticated | List tickets |
| `PATCH` | `/comms/tickets/:id/status` | All authenticated | Update ticket status |

#### Users
| Method | Endpoint | Roles | Purpose |
|--------|----------|-------|---------|
| `POST` | `/users/staff` | SUPER_ADMIN | Create staff/teacher |
| `POST` | `/users/students` | SUPER_ADMIN, HEADMASTER | Register student |
| `POST` | `/users/students/batch` | SUPER_ADMIN, HEADMASTER | Bulk import students |
| `GET` | `/users/students/count` | All authenticated | Total student count |
| `GET` | `/users/staff/count` | All authenticated | Total staff count |
| `PATCH` | `/users/:id/deactivate` | SUPER_ADMIN | Deactivate user |

---

## Deployment

### Vercel (Frontend)
The frontend is configured for Vercel deployment:
```bash
cd front-end
npm run build   # Outputs to dist/
```
Set environment variables in the Vercel dashboard:
- `VITE_API_BASE_URL` — your production backend URL

### Backend (Any Node host)
```bash
cd maais-backend
npm run build
npm run start:prod
```

Ensure these environment variables are set:
- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — signing secret
- `REFRESH_TOKEN_SECRET` — refresh token signing secret
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SENDER_ID` — for SMS
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — for email

---

## Testing

### Frontend (Playwright E2E)
```bash
cd front-end
npm run test:e2e
```

### Backend (Jest)
```bash
cd maais-backend
npm run test
```

### Frontend Type Check
```bash
cd front-end
npm run lint    # tsc --noEmit
```

### Backend Lint
```bash
cd maais-backend
npm run lint
```

### Manual UAT
- Technical UAT: `docs/UAT_QUESTIONNAIRE.md`
- Non-technical (Headmaster) UAT: `docs/ADMIN_UAT_PLAIN_LANGUAGE.md`

---

## Environment Variables

### Backend (`.env`)
| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon Postgres connection |
| `DIRECT_URL` | Yes | Direct DB connection for Prisma |
| `JWT_SECRET` | Yes | Access token signing |
| `REFRESH_TOKEN_SECRET` | Yes | Refresh token signing |
| `PORT` | No | Server port (default 4000) |
| `NODE_ENV` | No | `development` / `production` |
| `TWILIO_ACCOUNT_SID` | No | SMS sending |
| `TWILIO_AUTH_TOKEN` | No | SMS sending |
| `TWILIO_SENDER_ID` | No | SMS sender ID |
| `SMTP_HOST` | No | Email relay host |
| `SMTP_PORT` | No | Email relay port |
| `SMTP_USER` | No | Email auth user |
| `SMTP_PASS` | No | Email auth password |

### Frontend (`.env`)
| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend origin (e.g. `http://localhost:4000`) |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/UAT_QUESTIONNAIRE.md` | Technical UAT test cases per role (QA team) |
| `docs/ADMIN_UAT_PLAIN_LANGUAGE.md` | Plain-language acceptance checklist for the Headmaster |
| `docs/HOD_ROLES_SUMMARY.md` | HOD responsibilities and API endpoints |
| `docs/TEACHER_DASHBOARD_SPEC.md` | Teacher dashboard functional specification |
| `docs/GHANA_SHS_GRADING_SHEET.md` | WAEC grading scale and subject structures |
| `docs/REQUIREMENTS_TRACEABILITY.md` | Requirements → implementation mapping |
| `docs/NOTIFICATION_SYSTEM_SUMMARY.md` | Notification and discussion thread architecture |
| `docs/QA_AUDIT_REPORT.md` | Automated QA audit results |
| `front-end/src/bridge/README.md` | Frontend–backend API bridge documentation |

---

## License

Private — Mando SHTS Academic Audit & Intervention System (MAAIS).
All rights reserved.
