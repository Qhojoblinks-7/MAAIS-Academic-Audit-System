# System Freeze — Live Verification Checklist

## Prerequisites
- [ ] Backend running (`npm run dev` in `maais-backend/`)
- [ ] Frontend running (`npm run dev` in `front-end/`)
- [ ] Database seeded with:
  - [ ] 1 ADMIN user
  - [ ] 1 TEACHER user with `staffProfile` + `teachingAssignment`
  - [ ] 1 HOD user with `staffProfile` in same department as teacher
  - [ ] 1 active `Term` (unlocked, endDate in future initially)
  - [ ] 1 `ClassSection` with `StudentProfile` records
  - [ ] 1 `Subject` linked to teacher’s assignments
- [ ] Browser DevTools → Network tab open
- [ ] Two browser windows ready: Admin + Teacher
- [ ] Open `SYSTEM-FLOWS.md` §3.7 for reference

### Pre-Test: Clear Admin Override Suppression
If a previous manual freeze set `lastManualUnfreeze` recently, auto-freeze tests (5, 7, 8) will be **suppressed** for 24h. Run this in DB first:
```sql
UPDATE admin_settings SET "lastManualUnfreeze" = NULL WHERE id = '<settings-id>';
```
You can find the `id` with:
```sql
SELECT id, "lastManualUnfreeze" FROM admin_settings LIMIT 1;
```

---

## Test 1: Manual Admin Freeze

### Steps
1. Log in as ADMIN → `/admin/home`
2. Open **Emergency Freeze** action panel
3. Enter freeze reason: `"Manual test freeze"`
4. Click **Freeze**

### Expected
- [ ] `POST /api/v1/admin/settings/freeze` returns `200`
- [ ] Response: `{ success: true, systemFrozen: true, systemFreezeReason: "Manual test freeze" }`
- [ ] DB: `adminSettings.systemFrozen = true`, `systemFreezeReason = "Manual test freeze"`, `lastManualUnfreeze = null`
- [ ] Admin sees **top banner**: "Emergency System Freeze Active" + reason badge + **X dismiss button**
- [ ] Clicking **X** hides banner for 24h (sets `sessionStorage.freezeAck`)

---

## Test 2: Teacher Sees Freeze Modal

### Steps
1. Log in as TEACHER (second browser / incognito)
2. If you have an old `freezeAck` in sessionStorage, clear it first: DevTools → Application → Session Storage → delete `freezeAck`
3. Wait up to 30s for `useSystemFreeze` poll to detect `systemFrozen: true`

### Expected
- [ ] Full-screen freeze modal appears
- [ ] Shows: Lock icon (rose-600), title "Emergency System Freeze Active"
- [ ] Shows reason badge: `"Manual test freeze"`
- [ ] Shows message: "Immediate administrative intervention activated..."
- [ ] Click **Understood** → modal dismisses
- [ ] `sessionStorage.freezeAck` set to current ISO timestamp
- [ ] Writing grades still blocked with `403 SYSTEM_FROZEN`

---

## Test 3: Grading Writes + Observations Are Blocked

### Steps
1. As TEACHER, navigate to `/grading` or `/teacher/grading`
2. Select a class, edit a grade, click Save / wait for auto-save
3. Also try: open Observation sidebar → save observation
4. Also try: click **Request Grade Revision** → submit

### Expected
- [ ] `POST /grading/entries/bulk` returns `403 SYSTEM_FROZEN`
- [ ] Response body: `{ code: "SYSTEM_FROZEN", message: "Grade entry is suspended.", freezeReason: "Manual test freeze", timestamp: "..." }`
- [ ] Toast: "Auto-save failed: Grade entry is suspended." (or similar)
- [ ] `POST /teacher/observations` returns `403 SYSTEM_FROZEN`
- [ ] `POST /teacher/grade-revisions` returns `403 SYSTEM_FROZEN`
- [ ] Read-only endpoints (GET grading data, GET observations list) still work (`200`)

---

## Test 4: Admin Unfreeze + 24h Override Window

### Steps
1. As ADMIN, click **Lift Institutional Freeze**
2. Confirm unfreeze
3. As TEACHER, wait 30s for poll or manually refresh

### Expected
- [ ] `POST /api/v1/admin/settings/freeze { enabled: false }` returns `200`
- [ ] DB: `systemFrozen = false`, `systemFreezeReason = null`, `lastManualUnfreeze = <now>`
- [ ] Teacher: Freeze modal dismissed
- [ ] Teacher: Can save grades (`POST /grading/entries/bulk` returns `200`)
- [ ] Teacher: Can save observations (`POST /teacher/observations` returns `200`)

---

## Test 5: Term Expiry Auto-Freeze

### Pre-check
If a previous manual freeze set `lastManualUnfreeze` within the last 24h, the auto-freeze will be suppressed. To force a clean test, run in DB:
```sql
UPDATE admin_settings SET "lastManualUnfreeze" = NULL WHERE id = '<settings-id>';
```

### Steps
1. In DB or AdminHome, set active term `endDate` to **yesterday**
2. As TEACHER, click Save in GradingSheet

### Expected
- [ ] First grading write after expiry triggers auto-freeze
- [ ] `POST /grading/entries/bulk` returns `403`
- [ ] DB: `adminSettings.systemFrozen = true`, `systemFreezeReason = "Term ended — grade entry automatically frozen"`
- [ ] Teacher sees freeze modal **within seconds** (instant refetch on 403)
- [ ] Teacher sees freeze modal with reason badge: `"Term ended — grade entry automatically frozen"`
- [ ] Admin sees top banner with same reason
- [ ] Observation save also blocked: `POST /teacher/observations` returns `403 SYSTEM_FROZEN`
- [ ] Revision request also blocked: `POST /teacher/grade-revisions` returns `403 SYSTEM_FROZEN`

---

## Test 6: Admin Override Suppresses Term Expiry

### Steps
1. While term is expired (Test 5), admin manually unfreezes
2. As TEACHER, try saving grades

### Expected
- [ ] Admin: `lastManualUnfreeze = now`
- [ ] Teacher: Can save grades within 24h window
- [ ] Term `endDate` is still in the past, but guard skips auto-freeze check
- [ ] DB: `adminSettings.systemFrozen = false` (overridden)

---

## Test 7: Override Expires → Re-Freeze

### Steps
1. In DB, run:
   ```sql
   UPDATE admin_settings SET "lastManualUnfreeze" = NOW() - INTERVAL '25 hours';
   ```
2. As TEACHER, attempt a grading write

### Expected
- [ ] Guard sees `hasAdminOverride = false` (outside 24h window)
- [ ] `activeTerm.endDate < now` → auto-freeze re-triggers
- [ ] Returns `403 SYSTEM_FROZEN` with reason `"Term ended — grade entry automatically frozen"`

---

## Test 8: HOD Term Lock During Admin Override

### Steps
1. Admin unfreezes (24h window active, term still expired)
2. HOD locks term: `POST /api/v1/hod/lock-matrix/{termId}`
3. As TEACHER, attempt grading write

### Expected
- [ ] `term.isLocked = true` in DB
- [ ] Guard evaluates `activeTerm.isLocked = true` even during override
- [ ] Returns `403 SYSTEM_FROZEN` with reason: `"Term is locked — grade entry suspended"`
- [ ] GradingService also catches it as secondary defense
- [ ] Teacher can't save grades despite admin override being active

---

## Test 9: Department Freeze Stacking

### Steps
1. Unfreeze system / unlock term
2. Admin freezes teacher’s department: `POST /api/v1/admin/departments/{deptId}/freeze`
3. As TEACHER (in that department), attempt grading write

### Expected
- [ ] `department.isFrozen = true`, `freezeReason = "Department frozen by admin"`
- [ ] `POST /grading/entries/bulk` returns `403`
- [ ] `freezeReason` in response: `"Department frozen by admin"`
- [ ] Department freeze applies independently of system freeze state

---

## Test 10: Layered Priority Matrix

### Steps (table-driven)

| Scenario | System | Term Lock | Dept Freeze | Expected Block | Expected Message |
|----------|--------|-----------|-------------|----------------|------------------|
| 1 | false | false | false | None | — |
| 2 | false | false | true | Yes | Dept freeze reason |
| 3 | false | true | false | Yes | "Term is locked — grade entry suspended" |
| 4 | false | true | true | Yes | Dept freeze reason (dept check runs before term lock in guard) |
| 5 | true | any | any | Yes | System freeze reason |
| 6 | true + override (24h) | true | any | Yes | Term lock (override skips system+expiry, but term lock still enforced) |

- [ ] Verify each row manually by toggling DB flags

---

## Test 11: Frontend State Sync

### Steps
1. Trigger system freeze as admin
2. Watch teacher’s browser (already logged in)

### Expected
- [ ] Freeze modal appears **instantly** after first blocked write (not just after 30s poll)
- [ ] If modal was previously dismissed with `sessionStorage.freezeAck`, it **reappears** when freeze reactivates (stale ack is cleared)
- [ ] Close modal (Understood) → `sessionStorage.freezeAck` persists for 24h
- [ ] Reopen browser in same tab → modal does NOT reappear (ack cached)
- [ ] Open new incognito window → modal reappears (no ack)
- [ ] Admin banner: after click X, banner hides for 24h
- [ ] `SYSTEM-FROZEN` toast/error shown on failed write attempts

---

## Test 12: GradingSheet `isTermFinalized` Propagation

### Steps
1. HOD locks term via HODLockExport
2. Teacher opens `/grading` (standalone route)

### Expected
- [ ] `TermSealBanner` visible: "Term is locked. Database records are locked."
- [ ] All input fields disabled (`opacity-75 pointer-events-none`)
- [ ] Save / Submit buttons do nothing
- [ ] Auto-save does NOT fire (no backend calls)
- [ ] Teacher opens teacher-specific route (`/teacher/grading`) — same behavior

---

## Test 13: Exempt Paths Bypass Guard

### Expected (no action needed, verify by inspection + quick DB check)
- [ ] `/api/v1/admin/settings/freeze` → exempt (admin freeze toggle works during freeze)
- [ ] `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`, `/api/v1/auth/logout` → exempt
- [ ] `/api/v1/grading/rules` → exempt
- [ ] All GET/HEAD/OPTIONS → exempt
- [ ] **Blocked during freeze:** `/teacher/observations`, `/students/*/behavior`, `/teacher/grade-revisions` → `403 SYSTEM_FROZEN`
- [ ] Non-grading write endpoints (notifications, tickets, etc.) → still allowed (not `/grading/`, not observation paths)

---

## Sign-Off

| Checkpoint | Tester | Date | Pass / Fail | Notes |
|------------|--------|------|-------------|-------|
| Test 1: Manual Admin Freeze | | | | |
| Test 2: Teacher Sees Freeze Modal | | | | |
| Test 3: Grading Writes Blocked | | | | |
| Test 4: Unfreeze + 24h Override | | | | |
| Test 5: Term Expiry Auto-Freeze | | | | |
| Test 6: Override Suppresses Expiry | | | | |
| Test 7: Override Expiry Re-Freeze | | | | |
| Test 8: HOD Lock During Override | | | | |
| Test 9: Department Freeze Stacking | | | | |
| Test 10: Layered Priority Matrix | | | | |
| Test 11: Frontend State Sync | | | | |
| Test 12: `isTermFinalized` Propagation | | | | |
| Test 13: Exempt Paths | | | | |
