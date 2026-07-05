# Teacher ↔ HOD Manual Testing Checklist

## Prerequisites
- [x ] Backend running on `http://localhost:3000` (or configured `VITE_API_BASE_URL`)
- [ x] Frontend running on `http://localhost:5173`
- [ x] Database seeded with at least:
  - 1 Teacher user with `staffProfile` and `teachingAssignment`
  - 1 HOD user with `staffProfile` in same department
  - 1 active `Term` (unlocked)
  - 1 `ClassSection` with `StudentProfile` records
  - 1 `Subject` linked to HOD's department
- [ x] Browser DevTools → Network tab open (to verify API calls)
- [ x] Two browser profiles/incognito windows ready (Teacher + HOD login)

---

## 1. Teacher Initiates Grade Revision

### Entry Points
- [ ] **TeacherGradingView.jsx**: Click class card → select student → click "Request Grade Revision"
- [ ] **TeacherMissingObservations.jsx**: Click arrow on missing observation → triggers revision modal

### Submission Validation
- [ ] Click "Submit Request" with empty text → button stays disabled
- [ ] Enter issue text → button enables
- [ ] Submit → toast shows **"Grade revision requested successfully"**

### Backend Verification
- [ ] `POST /teacher/grade-revisions` returns `201`
- [ ] Request body: `{ gradeEntryId, issue, severity }`
- [ ] Response includes `status: "AWAITING_APPROVAL"`, `history: []`
- [ ] `grade_revisions` table has new record linked to correct `teacherId`, `studentId`, `subjectId`, `gradeEntryId`

### Notification Verification
- [ ] `POST /comms/notifications/hod-action` (or `notification` table) has new record
- [ ] Notification `title` = "Grade Revision Requested"
- [ ] HOD receives notification (check HOD's notification bell/panel)

---

## 2. HOD Reviews Revision

### Feed Load
- [ ] Navigate to `/hod/revisions` (or HOD Dashboard → Revisions)
- [ ] `GET /hod/grade-revisions` returns `200`
- [ ] Revision appears in **"Needs Approval"** tab
- [ ] Status badge shows **"Awaiting Approval"** (amber)
- [ ] Card shows: student name, class, subject, issue description, severity
- [ ] History panel shows empty / "No discussion yet"

### Discussion Message (Pre-Decision)
- [ ] Expand "Grade Discussion" section
- [ ] Type message → click **Send**
- [ ] `PATCH /hod/records/{id}/comment` returns `200`
- [ ] Message appears in discussion thread with role "HOD"
- [ ] Teacher receives notification: `GRADE_REVISION_REQUESTED_BY_HOD` or `DIRECT_MESSAGE`

---

## 3. HOD Makes Decision

### Approve Flow
- [ ] Enter approval comment in "HOD Review Comment" textarea
- [ ] Click **Approve Revision**
- [ ] `POST /hod/records/{id}/approve` returns `200`
- [ ] `PATCH /hod/records/{id}/comment` called first (if separate from approve)
- [ ] Revision status → **"RESOLVED"**
- [ ] History appended with HOD comment (role: "HOD", message: comment text)
- [ ] Teacher notification created: "Grade Revision Approved"
- [ ] UI shows **"Revision Approved & Resolved"** badge (emerald)

### Reject Flow
- [ ] Enter rejection reason in comment textarea
- [ ] Click **Reject Request**
- [ ] `POST /hod/records/{id}/reject` returns `200`
- [ ] Revision status → **"REJECTED"**
- [ ] History appended with HOD reason
- [ ] Teacher notification created: "Grade Revision Rejected"
- [ ] UI shows **"Rejected"** badge (red)

### Security Check
- [ ] Teacher account tries `POST /hod/records/{id}/approve` → `403 Forbidden`
- [ ] Teacher account tries `GET /hod/grade-revisions` → `403 Forbidden`

---

## 4. Teacher Receives HOD Decision

### Feed Refresh
- [ ] Teacher feed auto-refreshes (30s interval) or manual refresh
- [ ] `GET /teacher/grade-revisions` returns updated status
- [ ] Status badge updates:
  - `RESOLVED` → **"Resolved"** (emerald)
  - `REJECTED` → **"Rejected"** (red)
  - `TEACHER_REPLIED` → **"HOD Reviewing"** (sky)

### State-Based UI
- [ ] `RESOLVED`: Shows **"Grade Revision Finalized"** — no action buttons
- [ ] `REJECTED`: Shows **"Rejected — Awaiting Further Action"** + "Open Correction Sheet" + "Submit Response to HOD"
- [ ] `TEACHER_REPLIED`: Shows **"Waiting for HOD Final Decision"** (sky badge)

---

## 5. Teacher Responds to HOD

### Discussion Message
- [ ] Expand "Grade Discussion" in TeacherRevisionsFeed
- [ ] Type message → click **Send**
- [ ] `PATCH /teacher/grade-revisions/{id}` returns `200`
- [ ] Message appears in thread with role "TEACHER"
- [ ] HOD receives notification

### Formal Response (AppendTeacherResponse)
- [ ] For `AWAITING_APPROVAL` or `REJECTED` status:
- [ ] Type response in "Add Teacher Response" textarea
- [ ] Click **Submit Response to HOD**
- [ ] Status changes to **`TEACHER_REPLIED`**
- [ ] History appended with teacher response (role: "TEACHER")
- [ ] HOD notification: "Grade Revision Response"
- [ ] UI updates to **"HOD Reviewing"** badge + "Waiting for HOD Final Decision"

### Re-submit After Rejection
- [ ] HOD rejects revision → Teacher sees `REJECTED`
- [ ] Teacher submits response → status → `TEACHER_REPLIED`
- [ ] HOD sees updated revision in feed with new status

---

## 6. Grading Sheet Workflow

### Auto-Save
- [ ] Open `TeacherGradingView` → select class
- [ ] Enter/edit a grade in the sheet
- [ ] Wait 1 second
- [ ] Toast: **"Saved"**
- [ ] `POST /grading/entries/bulk` called in Network tab
- [ ] Entry appears in HOD's `GET /hod/teachers/submissions` feed

### 5-Minute Bulk Draft Sync
- [ ] Make changes to multiple student grades
- [ ] Wait 5 minutes (or temporarily change interval to 10s for testing)
- [ ] Toast: **"Bulk draft submitted"**
- [ ] `POST /grading/entries/bulk` called with all draft entries

### Manual Draft Save
- [ ] Click **Save Draft** in footer
- [ ] Toast: **"Draft saved successfully"**
- [ ] Data persisted to backend

### Submit to HOD
- [ ] Ensure no missing observations (all students have `hasObservation: true`)
- [ ] Click **Submit to HOD**
- [ ] Toast: **"Bulk draft submitted"**
- [ ] HOD receives notification/alert

### Lock Behavior
- [ ] HOD: `POST /hod/lock-matrix/{termId}` → term locked
- [ ] Teacher: Refresh grading sheet
- [ ] **TermSealBanner** visible: "Term is locked. Database records are locked."
- [ ] All input fields are disabled (`opacity-75 pointer-events-none`)
- [ ] "Locked" badge visible on class cards
- [ ] Auto-save does NOT fire
- [ ] HOD: `POST /hod/unlock-matrix/{termId}` → term unlocked
- [ ] Teacher: Sheet becomes interactive again

---

## 7. Status State Transitions

Verify all transitions in the state machine:

| From | Action | To | Expected |
|------|--------|----|----------|
| `AWAITING_APPROVAL` | HOD approves | `RESOLVED` | Teacher sees "Resolved", no actions |
| `AWAITING_APPROVAL` | HOD rejects | `REJECTED` | Teacher sees "Rejected", can respond |
| `AWAITING_APPROVAL` | Teacher responds | `TEACHER_REPLIED` | HOD sees updated status |
| `TEACHER_REPLIED` | HOD approves | `RESOLVED` | Final state |
| `TEACHER_REPLIED` | HOD rejects | `REJECTED` | Teacher can resubmit |
| `REJECTED` | Teacher responds | `TEACHER_REPLIED` | Back to HOD review |

---

## 8. Notification System

### Teacher → HOD
- [ ] Submit revision → HOD gets notification (APP channel)
- [ ] Teacher sends discussion message → HOD gets notification
- [ ] Teacher submits formal response → HOD gets notification

### HOD → Teacher
- [ ] HOD approves → Teacher gets notification
- [ ] HOD rejects → Teacher gets notification
- [ ] HOD sends discussion message → Teacher gets notification

### Real-Time (WebSocket)
- [ ] Open Teacher + HOD in two windows
- [ ] Teacher submits revision → HOD feed updates without refresh
- [ ] HOD sends message → Teacher sees it appear (within 30s polling or WebSocket event)

---

## 9. Department Isolation

- [ ] HOD can only see revisions for subjects in their `departmentId`
- [ ] Teacher can only see their own revisions
- [ ] Cross-department HOD login → feed is empty or filtered correctly
- [ ] Super Admin / Headmaster can see all department revisions

---

## 10. Edge Cases

- [ ] Teacher submits revision for locked term → backend rejects or frontend disables
- [ ] HOD approves already-resolved revision → backend returns error/handles gracefully
- [ ] Teacher updates revision with empty history → history preserved from DB
- [ ] Network failure during auto-save → toast shows error, retry on next change
- [ ] Very long issue text (>500 chars) → saved and displayed correctly
- [ ] Multiple rapid revisions from same teacher → all appear in feed, ordered by `createdAt desc`
- [ ] Teacher deletes account/soft-delete → revisions orphaned or handled gracefully

---

## 11. UI/UX Polish

- [ ] Tabs: "Pending Reply" / "Resolved" / "All" filter correctly
- [ ] Search filters by student name, revision ID, subject
- [ ] Active tab count badge matches filtered count
- [ ] Selected revision highlight persists across auto-refresh
- [ ] Empty states show appropriate messaging
- [ ] Loading states visible during API calls
- [ ] Toast notifications don't stack excessively

---

## Sign-Off

| Tester | Date | Pass/Fail | Notes |
|--------|------|-----------|-------|
| | | | |
| | | | |
| | | | |
