# System Flows: System Freeze & HOD Locks

## 1. System Freeze

### 1.1 Overview
System Freeze is a global write-block that suspends all grade-entry mutations across the platform. It is enforced by a NestJS global guard (`SystemFreezeGuard`) and surfaced in the frontend through a full-screen freeze acknowledgment modal (non-admin roles) or a top banner (admins).

### 1.2 Triggers

| Trigger | Source | Effect |
|---------|--------|--------|
| **Manual Admin Freeze** | `POST /api/v1/admin/settings/freeze` | Sets `adminSettings.systemFrozen = true` with a freeze reason |
| **Term Expiry Auto-Freeze** | `SystemFreezeGuard` detects `term.endDate < now` | Sets `adminSettings.systemFrozen = true` with reason `"Term ended — grade entry automatically frozen"` |
| **Department Freeze** | `POST /api/v1/admin/departments/:id/freeze` | Sets `department.isFrozen = true`; blocks grade writes for users in that department |

### 1.3 Backend Guard Logic

**File:** `maais-backend/src/common/guards/system-freeze.guard.ts`

```
Request → SystemFreezeGuard
  ├─ GET / HEAD / OPTIONS → ALLOW (read-only bypass)
  ├─ Exempt paths → ALLOW
  │   ├─ /api/v1/admin/settings/freeze
  │   ├─ /api/v1/auth/login
  │   ├─ /api/v1/auth/refresh
  │   ├─ /api/v1/auth/me
  │   ├─ /api/v1/auth/logout
  │   └─ /api/v1/grading/rules
  ├─ Non-grading write paths → ALLOW (only grading writes are blocked)
  └─ Grading write paths → CHECK FREEZE STATE
      ├─ Load adminSettings
      ├─ Check admin override window (24h from lastManualUnfreeze)
      │   └─ If override active → ALLOW
      ├─ If no override, check active term expiry
      │   └─ If term.endDate < now → set systemFrozen=true, reason="Term ended..."
      ├─ Check department freeze for user's staffProfile.departmentId
      │   └─ If department.isFrozen → block with department reason
      └─ If systemFrozen OR termExpired OR termLocked OR departmentFrozen
          → THROW ForbiddenException { code: 'SYSTEM_FROZEN', message, freezeReason }
```

**Key behaviors:**
- **Fail-open on DB error:** If the guard's Prisma query fails, it logs the error and allows the request to proceed.
- **Admin override:** When an admin manually unfreezes, `lastManualUnfreeze` is set. For 24 hours afterward, auto-freeze checks are bypassed.
- **Scope-limited:** Only `POST/PATCH/PUT/DELETE` to `/grading/**` are blocked. All other write endpoints (notifications, tickets, etc.) remain functional.

### 1.4 Frontend Behavior

**File:** `front-end/src/App.jsx`

```
App renders
  ├─ Polls useSystemFreeze() every 30s
  ├─ If isSystemFrozen && user.role !== STUDENT
  │   ├─ Check freezeAck in sessionStorage (expires after 24h)
  │   ├─ If no valid ack → SHOW FREEZE MODAL
  │   │   ├─ ADMIN role → top banner (dismissible, no modal blocking UI)
  │   │   └─ Non-admin → centered modal with:
  │   │       ├─ Lock icon
  │   │       ├─ "Emergency System Freeze Active"
  │   │       ├─ Freeze reason badge
  │   │       └─ "Understood" button → sets sessionStorage freezeAck
  │   └─ If valid ack exists → normal UI (but backend still blocks writes)
  └─ STUDENT role → no modal (students cannot ack freeze)
```

**Files:**
- `front-end/src/pages/admin/AdminHome.jsx` — Admin can trigger freeze via "Emergency Freeze" action panel
- `front-end/src/lib/hooks/api/admin.js` — `useSystemFreeze`, `useToggleSystemFreeze`

### 1.5 Admin Freeze/Unfreeze Flow

```
AdminHome.jsx
  ├─ User clicks "Emergency Freeze" action
  ├─ Enters freeze reason (required)
  ├─ Calls toggleSystemFreeze({ enabled: true, reason })
  │   └─ admin.service.ts: toggleSystemFreeze()
  │       ├─ Sets systemFrozen = true
  │       ├─ Sets systemFreezeReason = reason
  │       └─ Clears lastManualUnfreeze
  └─ On success:
      ├─ All teachers/HODs see freeze modal within 30s poll interval
      ├─ Grade write endpoints return 403 { code: 'SYSTEM_FROZEN' }
      └─ Admin sees top banner (dismissible)

AdminHome.jsx
  ├─ User clicks "Lift Institutional Freeze"
  ├─ Calls toggleSystemFreeze({ enabled: false, reason?: '' })
  │   └─ admin.service.ts: toggleSystemFreeze()
  │       ├─ Sets systemFrozen = false
  │       ├─ Clears systemFreezeReason
  │       └─ Sets lastManualUnfreeze = now
  └─ On success:
      ├─ Freeze modals dismissed on next poll
      └─ 24h admin override window begins (auto-freeze suppressed)
```

---

## 2. HOD Locks

### 2.1 Overview
HOD Locks are granular write-blocks applied by Heads of Department on specific academic structures. Unlike System Freeze (global), HOD Locks can be scoped to:
- **Term** — locks all grade entries in a term
- **Class Matrix** — locks all grade entries for a specific class section
- **Department Matrix** — locks all grade entries for the HOD's department in a term

### 2.2 Lock Types & Scopes

| Lock Type | Scope | Cascade Effect | Who Can Lock |
|-----------|-------|----------------|--------------|
| **Lock Term** | All grade entries in a term | `term.isLocked = true` + all `gradeEntry.isLocked = true` for that term | HOD, HEADMASTER, SUPER_ADMIN |
| **Lock Class Matrix** | All grade entries for a class section | `gradeEntry.isLocked = true` for all students/subjects in that class | HOD, HEADMASTER, SUPER_ADMIN |
| **Lock Department Matrix** | All grade entries for HOD's department subjects in a term | `gradeEntry.isLocked = true` for dept subjects/students in that term | HOD, HEADMASTER, SUPER_ADMIN |

### 2.3 Lock Preconditions

Before locking, the system performs role-based authorization:

```
lockTerm(termId, userId, role)
  ├─ If role not in [HOD, HEADMASTER, SUPER_ADMIN] → 403
  ├─ If HOD: resolve staffProfile from userId
  │   └─ If no staffProfile → 403
  ├─ If HOD: verify term has grades for HOD's department subjects
  │   └─ If no grades found → 403 "No grades found for this department"
  └─ Proceed with lock

lockClassMatrix(classSectionId, userId, role)
  ├─ If role not in [HOD, HEADMASTER, SUPER_ADMIN] → 403
  ├─ If HOD: resolve staffProfile
  ├─ Load classSection with teachingAssignments (includes subject.departmentId)
  ├─ If HOD: verify at least one teaching assignment belongs to HOD's department
  │   └─ If not → 403 "Class not in your department"
  └─ Proceed with lock

lockDepartmentMatrix(termId, userId, role)
  ├─ If role not in [HOD, HEADMASTER, SUPER_ADMIN] → 403
  ├─ If HOD: resolve staffProfile
  ├─ Load all subjects in HOD's department
  ├─ Load all class sections teaching those subjects
  ├─ Load all active students in those class sections
  └─ Bulk update gradeEntry.isLocked = true for matching student+subject+term
```

### 2.4 Unlock Flows

**Unlock Term:**
```
unlockTerm(termId, userId, role)
  ├─ Role check (HOD+ only)
  └─ term.isLocked = false
      └─ NOTE: Does NOT cascade unlock individual gradeEntry records
```

**Unlock Class Matrix:**
```
unlockClassMatrix(classSectionId, userId, role)
  ├─ Role check (HOD+ only)
  ├─ Load all student IDs in class section
  └─ gradeEntry.updateMany({ studentId: { in: [...] }, isLocked: false })
```

**Unlock Department Matrix:**
```
unlockDepartmentMatrix(termId, userId, role)
  ├─ Role check (HOD+ only)
  ├─ If HOD: resolve staffProfile, load dept subjects + class sections + students
  └─ gradeEntry.updateMany({ termId, subjectId: { in: [...] }, studentId: { in: [...] }, isLocked: false })
```

### 2.5 Backend Enforcement on Grade Writes

**File:** `maais-backend/src/grading/grading.service.ts`

```
bulkUpsertGradeEntries / createGradeEntry
  ├─ Load term by termId
  ├─ If term.isLocked → 403 "Term is locked. Grades cannot be modified."
  ├─ Load existing gradeEntry
  ├─ If existing.isLocked → 403 "Grade entry is locked. Contact HOD to unlock."
  └─ Proceed with upsert
```

### 2.6 Frontend Lock/Unlock UI

**File:** `front-end/src/pages/hod/HODLockExport.jsx`

```
HODLockExport
  ├─ Loads departmentProgress (class matrices with submission %, status, checks)
  ├─ Loads lockedTerms
  ├─ Renders ClassProgressCard per class:
  │   ├─ If status !== 'LOCKED':
  │   │   └─ "Lock Frame" button → confirmLock dialog → doLock
  │   └─ If status === 'LOCKED':
  │       └─ "Unlock" button → confirmUnlock dialog → doUnlock
  ├─ doLock:
  │   ├─ lockMutation.mutateAsync(clsId)
  │   ├─ Audit log: TERM_LOCKED
  │   ├─ EventBus: 'term-locked'
  │   └─ Refetch progress + locked terms
  ├─ doUnlock:
  │   ├─ unlockMutation.mutateAsync(clsId)
  │   ├─ Audit log: TERM_UNLOCKED
  │   ├─ EventBus: 'term-unlocked'
  │   └─ Refetch progress + locked terms
  └─ Term-level buttons (Lock Term / Unlock Term) in header:
      ├─ doLockTerm → POST /hod/lock-matrix/:termId
      └─ doUnlockTerm → POST /hod/unlock-matrix/:termId
```

**File:** `front-end/src/pages/shared/GradingSheet.jsx`

```
GradingSheet
  ├─ If isTermFinalized (term locked):
  │   ├─ TermSealBanner visible: "Term is locked. Database records are locked."
  │   ├─ All input fields disabled (opacity-75, pointer-events-none)
  │   ├─ "Locked" badge on class cards
  │   └─ Auto-save does NOT fire
  └─ If not locked:
      └─ Normal editing + auto-save enabled
```

## 3. Term Expiry Auto-Freeze

### 3.1 Overview
When a term's `endDate` passes, the system automatically activates the global freeze without any manual admin intervention. This is a safety mechanism to prevent grade modifications after a term concludes.

### 3.2 Trigger Mechanism

**File:** `maais-backend/src/common/guards/system-freeze.guard.ts:63-80`

```
SystemFreezeGuard.canActivate()
  └─ On EVERY grading write request
      ├─ Load adminSettings
      ├─ Check: has admin override in last 24h?
      │   └─ YES → skip auto-freeze check
      ├─ Check: !settings.systemFrozen && !hasAdminOverride
      │   └─ YES → proceed with auto-freeze check
      ├─ Load active term (isActive: true)
      │   └─ If term.endDate < new Date()
      │       ├─ Set adminSettings.systemFrozen = true
      │       ├─ Set adminSettings.systemFreezeReason = "Term ended — grade entry automatically frozen"
      │       └─ Clear lastManualUnfreeze (implicitly, because update doesn't set it)
      └─ Continue with normal freeze evaluation
```

**Key characteristics:**
- **Lazy evaluation** — No Cron job. Checks happen on-demand when teachers/HODs attempt to write grades.
- **One-time activation** — Once `systemFrozen` is set to `true`, subsequent requests see it as already frozen and don't re-trigger.
- **Admin override applies** — If an admin manually unfreezes within 24 hours of term expiry, the auto-freeze is suppressed for that window.
- **Does NOT set `term.isLocked`** — Only sets `adminSettings.systemFrozen`. The `term.isLocked` flag remains independent.
- **Does NOT cascade to grade entries** — Grade entries are not individually locked. Only the global system freeze blocks writes.

### 3.3 Frontend Experience

```
Teacher opens grading sheet after term expiry
  └─ 30s poll detects systemFrozen = true
      └─ App.jsx shows freeze modal (non-admin)
          ├─ Icon: Lock (rose-600)
          ├─ Title: "Emergency System Freeze Active"
          ├─ Message: "Immediate administrative intervention activated..."
          ├─ Reason badge: "Term ended — grade entry automatically frozen"
          └─ "Understood" button → sessionStorage freezeAck (24h)
```

**For admins:** Top banner shows instead of modal (dismissible).

### 3.4 Recovery / Lift Flow

```
Admin lifts freeze
  └─ POST /api/v1/admin/settings/freeze { enabled: false }
      ├─ Sets systemFrozen = false
      ├─ Clears systemFreezeReason
      ├─ Sets lastManualUnfreeze = now
      └─ Returns success

Admin override window (24 hours)
  ├─ SystemFreezeGuard skips auto-freeze check
  ├─ Term expiry does NOT re-trigger systemFrozen
  ├─ Department freeze still applies independently
  └─ Teachers can resume grade entry

After 24 hours
  └─ Auto-freeze checks resume
      └─ If active term.endDate still in the past
          → systemFrozen = true (re-freezes)
```

### 3.5 Interaction with HOD Locks

| Term Expired (auto-freeze) | Term Manually Locked (HOD) | Both | Effect |
|----------------------------|---------------------------|------|--------|
| No | No | No | Writes allowed |
| Yes | No | No | 403 SYSTEM_FROZEN ("Term ended...") |
| No | Yes | No | 403 "Term is locked" (from GradingService) |
| Yes | Yes | No | 403 SYSTEM_FROZEN (freeze guard fires first) |

**Important distinction:**
- **Auto-freeze** (`systemFrozen`) is global — blocks ALL grading writes across all departments
- **HOD term lock** (`term.isLocked`) is also global for that term, but enforced at the GradingService layer
- If both are active, the SystemFreezeGuard's 403 is returned first (it runs as a global NestJS guard before the controller)

### 3.6 Data Flow Diagram

```
Term Creation (Academic Architect)
  └─ term.endDate = "2026-07-06"
      term.isActive = true

Time passes...
  └─ endDate < now (detected on first grading write after expiry)

SystemFreezeGuard
  ├─ Reads adminSettings.systemFrozen = false
  ├─ Reads term.endDate < now → TRUE
  ├─ Updates adminSettings:
  │   ├─ systemFrozen = true
  │   └─ systemFreezeReason = "Term ended — grade entry automatically frozen"
  └─ Throws ForbiddenException { code: 'SYSTEM_FROZEN' }

Frontend (next poll)
  └─ useSystemFreeze() returns systemFrozen: true
      └─ Non-admin users see freeze modal
          └─ Stored in sessionStorage freezeAck (24h)

Grading Service
  └─ Never reached (guard blocks first)

Admin Intervention
  └─ Manual unfreeze → 24h override window
      └─ Guard skips endDate check
          └─ Grading writes allowed again
              └─ (But department freeze still enforced if active)
```

### 3.7 Manual Testing Checklist

| Test | Steps | Expected Result |
|------|-------|----------------|
| Term expiry triggers freeze | Set term endDate to past. Click Save in GradingSheet. | 403 error. Admin sees `systemFrozen = true` in DB. `systemFreezeReason` = "Term ended — grade entry automatically frozen" |
| Freeze modal appears | After expiry, reload app as teacher. | Freeze modal with "Term ended — grade entry automatically frozen" badge |
| Admin override works | Admin unfreezes manually within 24h of expiry. | Teachers can save grades again |
| Override expires | Wait 24h after admin unfreeze, try to save. | 403 auto-freeze re-triggers (if term still expired) |
| Department freeze stacks | Term expired + department frozen. | 403 with department freeze reason (department checked after auto-freeze) |


## 4. Interaction: System Freeze + HOD Locks

### 4.1 Layering Model

```
System Freeze (Global)     ← Highest priority
    ↓
Term Lock (HOD)            ← Mid priority
    ↓
Grade Entry Lock (HOD)     ← Lowest priority
```

### 4.2 Decision Matrix

| System Frozen | Term Locked | Grade Entry Locked | Write Allowed? | Blocking Message |
|---------------|-------------|-------------------|----------------|------------------|
| **false** | **false** | **false** | ✅ Yes | — |
| **false** | **false** | **true** | ❌ No | "Grade entry is locked. Contact HOD to unlock." |
| **false** | **true** | **false** | ❌ No | "Term is locked. Grades cannot be modified." |
| **false** | **true** | **true** | ❌ No | Term lock checked first; grade entry lock not reached |
| **true** | **any** | **any** | ❌ No | "Grade entry is suspended." (with freezeReason) |
| **true** + admin override (24h) | **any** | **any** | ✅ Yes | Override bypasses freeze guard |

### 4.3 Admin Override & Auto-Freeze Suppression

```
Admin manually unfreezes
  └─ lastManualUnfreeze = now
      └─ For 24 hours:
          ├─ System freeze guard skips auto-freeze checks
          ├─ Term expiry does NOT trigger systemFrozen
          └─ Department freeze still applies independently
      └─ After 24 hours:
          └─ Auto-freeze checks resume
              └─ If active term is expired → systemFrozen = true
```

### 4.4 End-to-End Write Block Flow

```
Teacher clicks "Save" in GradingSheet
  └─ POST /grading/entries/bulk
      ├─ SystemFreezeGuard (global middleware)
      │   ├─ Is grading write? YES
      │   ├─ Is exempt path? NO
      │   ├─ Load adminSettings
      │   ├─ Check admin override (24h window)
      │   ├─ Check systemFrozen → TRUE?
      │   │   └─ → 403 SYSTEM_FROZEN → Frontend: "Failed to save observation"
      │   ├─ Check term expiry → auto-frozen?
      │   │   └─ → 403 SYSTEM_FROZEN
      │   ├─ Check department freeze
      │   │   └─ → 403 SYSTEM_FROZEN
      │   └─ Check term.isLocked
      │       └─ → 403 "Term is locked"
      └─ GradingService (application logic)
          ├─ Load term → isLocked?
          │   └─ → 403 "Term is locked. Grades cannot be modified."
          ├─ Load existing gradeEntry → isLocked?
          │   └─ → 403 "Grade entry is locked. Contact HOD to unlock."
          └─ Proceed with upsert + audit log
```

### 4.5 Sequence Diagram: HOD Locks Term → Teacher Tries to Edit

```
Teacher          Frontend          Backend Guard        GradingService        Database
  |                  |                  |                     |                   |
  |-- Save click --->|                  |                     |                   |
  |                  |-- POST /bulk --->|                     |                   |
  |                  |                  |-- term.isLocked? --->|                   |
  |                  |                  |<-- true -------------|                   |
  |                  |                  |----- 403 ------------|                   |
  |<-- 403 error ----|<-----------------|<--------------------|<------------------|
  |                  |                  |                     |                   |
  |-- Toast error -->|                  |                     |                   |
```

### 4.6 Sequence Diagram: System Freeze → All Writes Blocked

```
Admin             Frontend           Backend Guard        Any Write Service    Database
  |                  |                  |                     |                   |
  |-- Toggle freeze >|                  |                     |                   |
  |                  |-- POST /freeze ->|                     |                   |
  |                  |                  |-- systemFrozen=true->|                   |
  |                  |                  |<-------------------- |                   |
  |<-- success ------|<-----------------|<-------------------- |<------------------|
  |                  |                  |                     |                   |
  |                  |                  |                     |                   |
Teacher            Frontend           Backend Guard        GradingService       Database
  |                  |                  |                     |                   |
  |-- Save click --->|                  |                     |                   |
  |                  |-- POST /bulk --->|                     |                   |
  |                  |                  |-- systemFrozen? ---->|                   |
  |                  |                  |<-- true -------------|                   |
  |                  |                  |----- 403 SYSTEM_FROZE|N -----------------|
  |                  |<-----------------|<--------------------|<------------------|
  |<-- Toast error --|                  |                     |                   |
```

### 4.7 Frontend Polling & State Sync

| Component | Poll Interval | Data Source | Effect on Freeze/Lock State |
|-----------|--------------|-------------|----------------------------|
| `App.jsx` | 30s | `useSystemFreeze()` | Shows/hides freeze modal/banner |
| `TeacherSidebar.jsx` | 30s | `getGradeRevisions()`, `getMissingObservations()` | Updates badge counts |
| `HODSidebar.jsx` | 30s | `useHOD()` via HODContext | Updates revision/alerts/sessions counts |
| `HODLockExport.jsx` | 30s | `useDepartmentProgress()`, `useLockedTerms()` | Shows updated lock status |
| `TeacherRevisionsFeed.jsx` | 30s | `getGradeRevisions()` | Refreshes revision list |
| `HODRevisionsFeed.jsx` | 30s | `refreshRevisions()` | Refreshes revision list |

---

## 5. Key Files

### Backend
| File | Responsibility |
|------|----------------|
| `maais-backend/src/common/guards/system-freeze.guard.ts` | Global guard blocking grade writes during freeze/term-expiry/department-freeze |
| `maais-backend/src/admin/admin.service.ts` | `toggleSystemFreeze()`, `getSystemFreeze()`, `freezeDepartment()` |
| `maais-backend/src/admin/admin.controller.ts` | `GET/POST /admin/settings/freeze`, `POST /admin/departments/:id/freeze` |
| `maais-backend/src/hod/hod-grades.service.ts` | `lockTerm()`, `lockClassMatrix()`, `lockDepartmentMatrix()`, `unlockTerm()`, `unlockClassMatrix()`, `unlockDepartmentMatrix()` |
| `maais-backend/src/hod/hod.service.ts` | Thin wrapper delegating to `hod-grades.service.ts` |
| `maais-backend/src/hod/hod.controller.ts` | `POST /hod/lock-matrix/:termId`, `POST /hod/lock-class/:classId`, `POST /hod/unlock-class/:classId`, `POST /hod/unlock-matrix/:termId` |
| `maais-backend/src/grading/grading.service.ts` | Term lock + grade-entry lock enforcement on upsert |
| `maais-backend/src/app.module.ts` | Registers `SystemFreezeGuard` as APP_GUARD (global) |

### Frontend
| File | Responsibility |
|------|----------------|
| `front-end/src/App.jsx` | Global freeze modal/banner rendering, 24h ack via sessionStorage |
| `front-end/src/pages/admin/AdminHome.jsx` | Admin freeze/unfreeze trigger UI |
| `front-end/src/pages/hod/HODLockExport.jsx` | HOD term/class/department lock/unlock UI |
| `front-end/src/pages/shared/GradingSheet.jsx` | `isTermFinalized` check disabling inputs, `TermSealBanner` |
| `front-end/src/components/layout/TeacherSidebar.jsx` | Freeze-aware logout handling |
| `front-end/src/lib/hooks/api/admin.js` | `useSystemFreeze`, `useToggleSystemFreeze` |
| `front-end/src/lib/hooks/api/hod.js` | `useLockedTerms`, `useDepartmentProgress` |
