# MAAIS Requirements Traceability Matrix

This document maps each Functional Requirement (FR) and Non-Functional Requirement (NFR) from the project specification to its implementation status.

---

## Functional Requirements

### FR1: Role-Based Access Control (RBAC)
**Requirement:** The system shall provide distinct interfaces for System Admins, HODs, Teachers, and Students.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Four distinct role-based dashboards with dedicated sidebars:
  - Admin (`AdminSidebar.jsx`) - system management, user vault, academic architect
  - HOD (`HODSidebar.jsx`) - department oversight, lock/export, archive
  - Teacher (`TeacherSidebar.jsx`) - grading, observations, interventions
  - Student (`StudentSidebar.jsx`) - portal, profile, support
- Route guards (`RequireRole.jsx`) protecting each dashboard
- Backend `@Roles()` decorators on every controller endpoint
- Frontend role checks in `App.jsx` for conditional rendering

**Files:**
- `front-end/src/App.jsx` - role-based routing and drawer/modal visibility
- `front-end/src/components/layout/AdminSidebar.jsx`
- `front-end/src/components/layout/HODSidebar.jsx`
- `front-end/src/components/layout/TeacherSidebar.jsx`
- `front-end/src/components/layout/StudentSidebar.jsx`

**Enhancement implemented:** Role inheritance hierarchy
- `SUPER_ADMIN/HEADMASTER` → inherits all lower roles
- `HOD` → inherits TEACHER, STUDENT, PARENT
- `TEACHER` → inherits STUDENT, PARENT
- Reduces `@Roles()` decorators from 4-5 roles to 1 role per endpoint

---

### FR2: Hybrid Grade Entry
**Requirement:** The system shall support diverse grading models, including milestone-based marks for workshop projects (Marking out, Assembly, Finishing).

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Technical grading sheet with milestone columns (Marking out, Assembly, Finishing)
- Core grading with 30/70 weighting (Class Score 30%, Exam 70%)
- Subject-configurable grading layouts per class section
- Bulk grade entry with atomic persistence
- Auto-calculation of totals and grades
- WAEC Roman grade conversion (A1, B2, B3, C4, C5, C6, D7, E8, F9)

**Files:**
- `front-end/src/pages/shared/GradingSheet.jsx` - main grading interface
- `front-end/src/pages/shared/useGradingSheetLogic.js` - grading business logic
- `front-end/src/components/ui/grading-sheet/GradingSheetTableBody.jsx` - mark input grid
- `maais-backend/src/grading/grading.controller.ts` - bulk upsert endpoint
- `maais-backend/src/teacher/teacher.service.ts` - grading business logic

---

### FR3: Automated Audit Middleware
**Requirement:** Any edit to a saved grade shall trigger a mandatory justification popup; the system shall block the save until a reason is provided.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- `JustificationPopup` component in GradingSheet.jsx
- Triggers on any mark change after initial save
- Blocks submission until justification text is provided
- Backend audit log creation with old value, new value, reason, user, timestamp
- Correction mode deep-linking via `?revision=<id>` query param

**Files:**
- `front-end/src/pages/shared/GradingSheet.jsx` - JustificationPopup component
- `front-end/src/pages/shared/useGradingSheetLogic.js` - justification state handlers
- `maais-backend/src/grading/grading.controller.ts` - `POST /grading/corrections` endpoint
- `maais-backend/src/grading/grading.service.ts` - audit log creation

---

### FR4: Behavioral & Safety Logging
**Requirement:** Teachers shall be able to log workshop safety compliance and attitudinal ratings (1-5).

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Behavioral ratings sidebar in grading sheet
- 5-point scale for attitudinal ratings (respect, punctuality, teamwork, etc.)
- Workshop safety compliance flagging per student
- Backend persistence via `POST /students/:id/behavior`
- Ratings included in WAEC CSV export

**Files:**
- `front-end/src/components/shared/ObservationSidebar.jsx` - behavioral input UI
- `front-end/src/pages/shared/useGradingSheetLogic.js` - behavioral state handlers
- `maais-backend/src/behavior/behavior.controller.ts` - behavior endpoints
- `maais-backend/src/teacher/teacher.service.ts` - `createBehavior` method

---

### FR5: Finalization & Locking
**Requirement:** The system shall allow HODs to "Lock" results, making them read-only and enabling the WAEC CSV export.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- HOD Lock/Export view with class matrix validation
- Lock class matrix endpoint (`POST /hod/lock-class/:id`)
- Unlock capability for corrections
- WAEC CSV export with proper formatting
- STP validation checking compliance rules
- Read-only mode after lock

**Files:**
- `front-end/src/pages/hod/HODLockExport.jsx` - HOD lock/export interface
- `front-end/src/pages/hod/HODRevisionsFeed.jsx` - revision approval workflow
- `maais-backend/src/hod/hod.controller.ts` - lock/unlock endpoints
- `maais-backend/src/hod/hod-grades.service.ts` - lock business logic
- `maais-backend/src/grading/grading.controller.ts` - WAEC export endpoint

---

## Non-Functional Requirements

### NFR1: Data Integrity
**Requirement:** The system must utilize ACID-compliant transactions (PostgreSQL) to ensure that result updates and audit logs are saved simultaneously or not at all.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- PostgreSQL database with Prisma ORM
- Atomic transactions for grade updates + audit log creation
- Support ticket creation with creator tracking
- Grade revision creation with history tracking

**Files:**
- `maais-backend/prisma/schema.prisma` - database schema
- All service files use Prisma transactions for multi-record updates

---

### NFR2: Security
**Requirement:** All passwords must be hashed using industry-standard algorithms (Bcrypt), and all data transmission must be encrypted via SSL/TLS.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Bcrypt/Argon2 password hashing in auth service
- JWT access tokens with refresh token rotation
- Bearer authorization on all protected endpoints
- HTTPS enforcement in production
- Role-based guards on every endpoint

**Files:**
- `maais-backend/src/auth/auth.service.ts` - password hashing
- `maais-backend/src/auth/auth.controller.ts` - login/refresh endpoints
- `maais-backend/src/common/guards/jwt-auth.guard.ts` - JWT validation
- `maais-backend/src/common/guards/roles.guard.ts` - role inheritance check

---

### NFR3: Performance
**Requirement:** The system shall generate a departmental broadsheet or WAEC export file in under 5 seconds.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Efficient Prisma queries with selective field inclusion
- Student data eager-loading to prevent N+1 queries
- Client-side CSV generation for WAEC export
- Department progress aggregation at database level

**Files:**
- `maais-backend/src/hod/hod.service.ts` - export optimization
- `maais-backend/src/teacher/teacher.service.ts` - `getGradingStudents` optimization
- `front-end/src/pages/shared/useGradingSheetLogic.js` - `handleExportWAEC`

---

### NFR4: Usability
**Requirement:** The interface must be responsive, allowing teachers to enter marks using tablets or smartphones within the workshop environment.

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Responsive Tailwind CSS layouts
- Touch-friendly input controls
- Auto-save with visual feedback
- Toast notifications for action confirmation
- Modal dialogs for complex inputs

**Files:**
- `front-end/src/index.css` - responsive base styles
- `front-end/src/pages/shared/GradingSheet.jsx` - responsive grid
- `front-end/src/components/ui/toast.tsx` - feedback system

---

## Interview Requirements (from Reqirement.txt)

### Q8: Teacher → HOD Grade Submission Workflow
**Requirement:** Teachers submit grades → HOD reviews and verifies → approval workflow

**Implementation Status:** ✅ COMPLETE

**Flow:**
1. Teacher enters grades in GradingSheet
2. Teacher submits to HOD → `POST /grading/entries/bulk`
3. HOD reviews in Lock/Export view
4. HOD approves/rejects or requests revision
5. Teacher fulfills revision if requested
6. HOD final approval → status becomes RESOLVED

---

### Q9: Lock Marks After HOD Approval
**Requirement:** Lock marks after HOD approval to prevent unauthorized changes

**Implementation Status:** ✅ COMPLETE

**What was built:**
- `POST /hod/lock-class/:id` - locks entire class matrix
- `POST /hod/unlock-class/:id` - unlocks for corrections
- Grade entries become read-only after lock
- WAEC export only available for locked classes

---

### Q10: Audit Log for All Modifications
**Requirement:** Record who, when, and what for every modification

**Implementation Status:** ✅ COMPLETE

**What was built:**
- `audit_logs` table with user, timestamp, old value, new value, reason
- Automatic creation on grade corrections
- Grade revision history tracking
- Support ticket creator tracking (`createdById`)

**Files:**
- `maais-backend/prisma/schema.prisma` - AuditLog model
- `maais-backend/src/grading/grading.service.ts` - audit log creation

---

### Q11: Teacher Assignment Tracking
**Requirement:** Track subjects teachers teach and how assignments change over time

**Implementation Status:** ✅ COMPLETE

**What was built:**
- `teaching_assignments` table linking teachers to class sections
- Assignment history preserved
- Teacher profile shows current assignments
- HOD can view teacher submissions by class

**Files:**
- `maais-backend/prisma/schema.prisma` - TeachingAssignment model
- `maais-backend/src/hod/hod-grades.service.ts` - submission tracking

---

### Q12: Qualitative Assessment & Medical Tracking
**Requirement:** Log qualitative assessment (behavior) and medical updates

**Implementation Status:** ✅ COMPLETE

**What was built:**
- `student_behaviors` table with ratings and comments
- Medical/information alerts via intervention alerts
- Behavioral ratings visible in grading sheet sidebar
- Historical behavior tracking per student

**Files:**
- `maais-backend/prisma/schema.prisma` - StudentBehavior model
- `maais-backend/src/behavior/behavior.controller.ts` - behavior endpoints
- `front-end/src/components/shared/ObservationSidebar.jsx` - behavior input UI

---

### Q13: WAEC STP Compliance
**Requirement:** Internal score conversion, match WAEC assessment groups, generate exportable script

**Implementation Status:** ✅ COMPLETE

**What was built:**
- 30/70 core weighting (Class Score + Exam)
- Technical weighting (Practical + Theory + Coursework)
- WAEC assessment group mapping
- CSV export formatted for WAEC STP upload
- Roman grade conversion (A1-F9)
- STP validation checker
- **NEW: Subject code validation** - Only valid WAEC codes (301-330, 103-114, 202-216, 401-402, 502-512, 608, 702-706) accepted when creating subjects
- **NEW: CSV preview endpoint** - `GET /wae/preview/:termId` allows teachers to preview data before export

**Files:**
- `maais-backend/src/wae-export/waec-validation.service.ts` - validation rules and WAEC codes
- `maais-backend/src/academic-architect/academic-architect.service.ts` - subject code validation
- `maais-backend/src/hod/hod-export.service.ts` - CSV export with validation
- `front-end/src/pages/shared/useGradingSheetLogic.js` - `handleExportWAEC`

---

### Q14: Student Portal
**Requirement:** Students log in to access results and academic information

**Implementation Status:** ✅ COMPLETE

**What was built:**
- Student dashboard with portal data
- Grade history viewing
- Academic trends visualization
- Support ticket creation
- Behavior/incident viewing

**Files:**
- `front-end/src/pages/student/StudentPortal.jsx` - main student dashboard
- `front-end/src/pages/student/StudentProfile.jsx` - individual student view (for other roles)
- `maais-backend/src/portal/portal.controller.ts` - student data endpoints

---

## Additional Features Implemented Beyond Requirements

### Ticket System
- Multi-role ticket creation (Student, Teacher, HOD, Admin)
- Ticket escalation chain (Teacher → HOD → Admin)
- Creator tracking (`createdById` required)
- Status workflow (OPEN → IN_PROGRESS → RESOLVED/ESCALATED)

### Grade Revision Workflow
- HOD-initiated revisions targeting correct teacher
- Teacher self-revision requests
- Revision history tracking
- Notifications on creation and resolution

### Role Inheritance
- RBAC hierarchy reducing maintenance burden
- Eliminates role alias drift
- Self-documenting permission model

### Real-time Notifications
- EventBus-driven live updates
- Notification bell with unread count
- Toast feedback on all major actions

### Autosave
- Debounced backend persistence (1s)
- Visual save status indicator
- Last saved timestamp

---

## Database Schema Changes

### New Models
- InterventionSchedulerService - Scheduled job for automated performance drop checks
- WAEExportService - Direct upload integration with WAEC STP API

### Migration Required
```bash
cd maais-backend
npx prisma migrate dev --name require-ticket-creator
npx prisma generate
```

---

## Document Metadata
- **Project:** Mando SHTS Academic Audit and Intervention System
- **Document:** Requirements Traceability Matrix
- **Version:** 1.1
- **Last Updated:** 2026-07-02 (Added automated intervention scheduler and WAEC STP direct upload)
- **Status:** All FRs and NFRs fully implemented
