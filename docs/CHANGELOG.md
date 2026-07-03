# MAAIS-Academic-Audit-System Implementation Changelog

This document records all significant changes made to the MAAIS system during the current implementation session.

---

## 1. Frontend Role Mismatch Fix (CRITICAL)

**Problem:** Backend uses `SUPER_ADMIN` and `HEADMASTER` roles, but frontend was checking for `ADMIN` role, causing broken admin routing, failed conditional UI rendering, and incorrect HOD context calculations.

**Files Changed:**
- `front-end/src/App.jsx:300,482,498,806,824,842,912,928`
- `front-end/src/pages/admin/components/RegistryView.jsx:77`

**Change:**
```javascript
// Before
user?.role === "ADMIN"

// After
user?.role === "SUPER_ADMIN" || user?.role === "HEADMASTER"
```

**Impact:** Admin users now see correct dashboards, drawers, and modals. Route guards in `RequireRole.jsx` already handled this alias, but inline component checks did not.

---

## 2. Admin Service Export

**Problem:** `adminService` was not exported from `services/index.js`, forcing ad-hoc imports.

**File Changed:** `front-end/src/services/index.js`

**Change:**
```javascript
export { adminService } from './adminService';
```

---

## 3. Duplicate Method Removal

**Problem:** `teacherService.js` had a duplicate `getObservationLogs` method definition.

**File Changed:** `front-end/src/services/teacherService.js`

**Change:** Removed the second shadow definition at line ~272.

---

## 4. Grade Revision Data Flow Fix (CRITICAL)

**Problem:** When HOD created a grade revision, the system always recorded the authenticated user as `teacherId`. Since the teacher feed filters by `teacherId`, teachers never saw HOD-initiated revisions — the chain dead-ended at step 1.

**Files Changed:**
- `maais-backend/src/teacher/teacher.service.ts` (submitGradeRevision method)
- `maais-backend/src/teacher/teacher.controller.ts`

**Changes:**
1. `submitGradeRevision` now accepts `requester: { id, role, staffProfile? }` instead of just `teacherId`
2. When HOD creates revision: `teacherId` = `gradeEntry.submittedById` (the actual teacher)
3. When Teacher creates revision: `teacherId` = their own ID (self-revision path)
4. Added `resolveTeacherStaffId` helper to map `submittedById` (user UUID) → staff profile
5. Backend notifications now fire correctly targeting the right recipient

**Grade Revision Chain (now intact):**
1. Teacher submits grades → `POST /grading/entries/bulk`
2. HOD reviews grades in lock/export view
3. HOR requests revision → `POST /teacher/grade-revisions` → correctly assigns `teacherId`
4. Teacher sees revision in `GET /teacher/grade-revisions`
5. Teacher fulfills revision by updating grade entry
6. HOD approves via `POST /hod/records/:id/approve`

---

## 5. HOD Grade Revision UI

**Problem:** HODs had no way to request grade revisions from the lock/export views. Only approve/reject existed.

**Files Changed:**
- `front-end/src/pages/hod/HODLockExport.jsx`
- `front-end/src/services/hodService.js`

**Changes:**
1. Added "Request Revision" button on class cards with failing quality checks
2. Added modal where HOD writes issue/instruction and submits
3. Added `requestGradeRevision()` to `hodService.js` calling `POST /teacher/grade-revisions`

---

## 6. Backend Notifications for Revisions

**Problem:** No notifications were sent when revisions were created or resolved.

**Files Changed:**
- `maais-backend/src/teacher/teacher.service.ts`
- `maais-backend/src/hod/hod-grades.service.ts`

**Changes:**
1. Added `notifyStaff` helper in teacher service
2. Added `notifyTeacher` helper in HOD grades service
3. When HOD creates revision → teacher gets "Grade Revision Requested" notification
4. When teacher self-requests → HOD(s) in department get notified
5. When HOD approves → teacher gets "Grade Revision Approved"
6. When HOD rejects → teacher gets "Grade Revision Rejected"
7. All notifications use `NotificationChannel.APP` and are non-blocking

---

## 7. Comms Notification Text Fix

**Problem:** Comms templates incorrectly said "Teacher Requested Grade Revision" regardless of who initiated it.

**Files Changed:**
- `maais-backend/src/comms/comms.service.ts`
- `front-end/src/services/notificationService.js`

**Changes:**
1. Added distinct action keys: `GRADE_REVISION_REQUESTED_BY_HOD` and `GRADE_REVISION_APPROVED`
2. HOD-initiated text now reads "HOD Requested Grade Revision"
3. Student-facing and HOD-facing title/message mappings updated

---

## 8. Real-time Notification Refresh

**Problem:** Notification bell didn't update live when revisions were created/approved.

**Files Changed:**
- `front-end/src/components/shared/NotificationBell.jsx`
- `front-end/src/pages/NotificationsPage.jsx`

**Changes:**
Added `eventBus` listeners for:
- `grade-revision-requested`
- `grade-revision-approved`

---

## 9. Role Inheritance Implementation (RBAC)

**Problem:** Backend used flat equality checks requiring every endpoint to manually list all roles. This caused maintenance burden and permission drift (e.g., `ADMIN` vs `SUPER_ADMIN` mismatch).

**Files Changed:**
- `maais-backend/src/common/constants/role-hierarchy.constant.ts` (NEW)
- `maais-backend/src/common/guards/roles.guard.ts`
- All controller files (16 controllers updated)

**New Hierarchy:**
```
SUPER_ADMIN / HEADMASTER
       ↓
    HOD
       ↓
   TEACHER
       ↓
  STUDENT
       ↓
   PARENT
```

**Implementation:**
1. Created `ROLE_HIERARCHY` constant defining inheritance relationships
2. Updated `RolesGuard` to use `hasInheritedRole()` instead of flat equality
3. Reduced all `@Roles()` decorators to minimal roles:
   - `@Roles(Role.TEACHER, Role.HOD, Role.HEADMASTER, Role.SUPER_ADMIN)` → `@Roles(Role.TEACHER)`
   - `@Roles(Role.HOD, Role.HEADMASTER, Role.SUPER_ADMIN)` → `@Roles(Role.HOD)`
   - `@Roles(Role.SUPER_ADMIN, Role.HEADMASTER)` → `@Roles(Role.HEADMASTER)`

**Controllers Updated:**
- teacher.controller.ts
- grading.controller.ts
- hod.controller.ts
- admin.controller.ts
- users.controller.ts
- comms.controller.ts
- reports.controller.ts
- archive.controller.ts
- behavior.controller.ts
- timetable.controller.ts
- interventions.controller.ts
- portal.controller.ts
- approvals.controller.ts
- academic-architect.controller.ts
- academic-architect/curriculum/curriculum.controller.ts

---

## 10. Teacher GradingSheet Enhancements

**Problem:** Grading sheet lacked autosave, toast feedback, and teacher-initiated revision requests.

**Files Changed:**
- `front-end/src/pages/shared/GradingSheet.jsx`
- `front-end/src/pages/shared/useGradingSheetLogic.js`
- `front-end/src/components/ui/grading-sheet/GradingSheetFooter.jsx`
- `front-end/src/components/ui/grading-sheet/GradingSheetHeader.jsx`

**Changes:**

### Autosave
- Added debounced `persistGradesToBackend` call (1s delay) on every student data change
- Tracks `autosaveStatus` (`idle`/`saving`/`saved`/`error`)
- Stores `lastSavedAt` timestamp

### Toast Feedback
All major actions now show toast notifications:
- Draft save → `toast.success('Draft saved successfully')`
- Submit to HOD → `toast.success` / `toast.error`
- Request Revision → `toast.success('Grade revision requested successfully')`
- STP Validation → `toast.success` (pass) / `toast.error` (fail)
- Export WAEC → `toast.success('WAEC CSV exported successfully')`
- Behavioral ratings → `toast.success('Behavioral ratings saved')`

### Request Revision Button
- Added to `GradingSheetFooter` with `MessageSquare` icon
- Opens modal with textarea for issue description
- Calls `teacherService.submitGradeRevision`
- Notifies HOD via `notification.sendHODAlert`

### STP Validation Button
- Shows spinner + "Validating..." during execution
- Persists grades before validating
- Fires toast with pass/fail result

---

## 11. Teacher Backend API Extension

**Problem:** `getGradingStudents` didn't return `gradeEntry.id`, preventing teachers from requesting revisions for specific entries.

**File Changed:** `maais-backend/src/teacher/teacher.service.ts`

**Change:** Added `gradeEntry.id` to the select query in `getGradingStudents` method.

---

## 12. Ticket System Overhaul

**Problem:** Only students could create tickets. Tickets weren't reliably linked to creators. HOD escalation wasn't preserved.

### 12.1 Prisma Schema Changes

**File Changed:** `maais-backend/prisma/schema.prisma`

**Changes:**
```prisma
model SupportTicket {
  id          String    @id @default(uuid())
  studentId   String?   // Now optional - staff can create tickets without student
  student     StudentProfile? @relation(...)
  
  title       String
  description String
  category    String
  priority    String
  
  status      String @default("OPEN") // Now includes ESCALATED
  
  createdById String    // NOW REQUIRED (was optional)
  createdBy   User      @relation("CreatedTickets", fields: [createdById], references: [id])
  assignedTo  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  resolvedAt  DateTime?
}
```

Also added to `User` model:
```prisma
createdTickets SupportTicket[] @relation("CreatedTickets")
```

### 12.2 Backend Service Changes

**File Changed:** `maais-backend/src/comms/comms.service.ts`

**Changes:**
1. `createTicket()` - No longer rejects non-students. Any authenticated user can create a ticket. `createdById` is always set to requester.
2. `listTickets()` - Returns tickets created by requester + tickets for their students/classes
3. `getTicketById()` - Includes `createdBy` relation in response

**File Changed:** `maais-backend/src/hod/hod-settings.service.ts`

**Changes:**
1. `escalateTicket()` - Now appends HOD's escalation reason to ticket description:
   ```
   [Escalation note: <reason>]
   ```

### 12.3 Seed Update

**File Changed:** `maais-backend/prisma/seeds/supportTicket.seed.ts`

**Changes:**
1. Fallback to `student.userId` when no teachers available
2. Includes `createdBy` relation in seed output

### 12.4 Controller Permission Updates

**Files Changed:**
- `maais-backend/src/comms/comms.controller.ts`
- `maais-backend/src/hod/hod.controller.ts`

**Changes:** Already had proper `@Roles()` decorators. With role inheritance, HOD and Teacher endpoints now work correctly with minimal role declarations.

---

## 13. Lint/Typecheck Fixes

Fixed numerous prettier and TypeScript errors across:
- `teacher.service.ts` - removed unused `students` destructure, removed unused `teacherId` param
- `teacher.controller.ts` - removed unused `@CurrentUser() user` from `updateGradeRevision`
- `comms.service.ts` - formatting fixes
- `hod-grades.service.ts` - formatting fixes
- `archive.controller.ts` - removed unused imports (`Delete`, `ClassLevel`, `Public`), removed unused `userId` param
- `admin.controller.ts` - removed unused `@CurrentUser() user` params
- `behavior.controller.ts` - removed unused `ApiBearerAuth` import
- `grading.controller.ts` - removed unused `role` param, formatting fixes
- `users.controller.ts` - removed unused `UseGuards` import, removed unused `role` param, formatting fixes
- `reports.controller.ts` - removed unused `Patch` import
- `approvals.controller.ts` - removed unused `IsInt` import

---

## Summary of Data Flow Integrity

### Grade Flow (Complete)
```
Teacher submits → HOD reviews → HOD requests revision OR fixes directly → 
Teacher fulfills revision → HOD approves → Notifications fire
```

### Ticket Flow (Complete)
```
Student/Teacher/HOD creates ticket → createdById tracked → 
HOD/Admin can update status → HOD can escalate to Admin with reason preserved
```

### Communication Flow (Complete)
```
Grade events → comms service → notifications with correct role attribution → 
real-time bell refresh via eventBus
```

---

## Database Migration Required

Run the following before deploying schema changes:

```bash
cd maais-backend
npx prisma migrate dev --name require-ticket-creator
npx prisma generate
```

---

## Testing Checklist

- [ ] Verify admin dashboard loads correctly for SUPER_ADMIN and HEADMASTER
- [ ] Verify HOD can create grade revision from lock/export view
- [ ] Verify teacher receives revision notification and can fulfill it
- [ ] Verify HOD receives and can approve/reject revisions
- [ ] Verify toast notifications appear for all grading sheet actions
- [ ] Verify autosave triggers after 1s of inactivity during grading
- [ ] Verify STP Validation button shows loading state and fires toast
- [ ] Verify Teacher can create support ticket
- [ ] Verify HOD can create support ticket
- [ ] Verify Student can create support ticket
- [ ] Verify all tickets show correct creator info
- [ ] Verify HOD can escalate ticket with reason preserved
- [ ] Verify role inheritance: HOD can access teacher endpoints, Admin can access HOD endpoints
