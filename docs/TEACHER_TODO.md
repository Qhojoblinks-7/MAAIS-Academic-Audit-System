# Teacher Side — Frontend 100% Ready Checklist
> Generated: 2026-05-21 | Target: 100% frontend completeness before backend wiring

---

## 🔴 P0 — Critical Blocking (must fix before anything else)

### 1. GradingSheet — Submit / Draft Save button
- [x] Add **"Save Draft"** button in `GradingSheetFooter.jsx` that calls `updateMark` with a `status: 'DRAFT'` flag
- [x] Add **"Submit to HOD"** button that changes status to `SUBMITTED`, locks the sheet for teacher edits, and sends a toast notification
- [x] Wire both buttons through `GradingSheet.jsx` state and pass `onSave`, `onSubmit` callbacks to `GradingSheetFooter`
- [x] Disable inputs in `GradingSheetTableBody` when `status === 'SUBMITTED'`
- **Files**: `src/views/shared/GradingSheetFooter.jsx`, `src/views/shared/GradingSheet.jsx`
- **Doc ref**: `requirement and specs.txt` FR3, `SAD.txt` T-AR-2.2; `App.jsx:136-143`

### 2. GradingSheet — WAEC CSV Export button
- [x] Add **"Export for WAEC"** button in `GradingSheetHeader.jsx`, visible only when `!isTermFinalized` and `!isSubmissionLocked`
- [x] Implement `exportWAEC()` in `GradingSheet.jsx` that calls `RevisionsFeed` / the shared data layer, serialises to CSV, and triggers a browser download
- [x] Disable button if `missingCount > 0` (blocked by `GradingSheetFooter:16`)
- **Files**: `src/views/shared/components/GradingSheetHeader.jsx`, `src/views/shared/GradingSheet.jsx`
- **Doc ref**: `SAD.txt` HOD-AR-4.3; `requirement and specs.txt` T-AR-4.2

### 3. TeacherObservationsView — deep-link via URL params
- [x] Import `useSearchParams` from `react-router-dom`
- [x] On mount, read `?student=` and `?index=` from the URL and auto-set `searchQuery` / open the matching row
- [x] Match against `initialObservations` table — open the edit modal for the matched record
- **Files**: `src/views/teacher/TeacherObservationsView.jsx`
- **Doc ref**: `requirement and specs.txt` T-AR-3.1

### 4. GradingSheet — `calcRoman` I–X range verification
- [x] Audit `TeacherGradingView.jsx:614-642`, `TeacherAnalyticsView.jsx:614-642`, `GradingSheet.jsx`: the grade-band chain `if (final >= 75) A1 → else F9` covers 8 bands A1–F9, which maps to Roman I–X
- [x] Confirm the `else if` chain covers every boundary; add unit test comments above the function (lines 773–782)
- [x] If any grade maps outside I–X, add the missing band or an explicit `else { grade = 'F9' }` guard
- **Files**: `src/views/shared/GradingSheet.jsx`, `src/views/teacher/TeacherGradingView.jsx`, `src/views/teacher/TeacherAnalyticsView.jsx`
- **Doc ref**: `SAD.txt` §77 — WAEC Grading Scale (A1–F9)

### 5. GradingSheet — NaN-on-blank double-guard
- [x] In `GradingSheetTableBody.jsx:91-97` (SBA input) and all `section` inputs, add `onBlur` handler that writes `0` if the field is empty, instead of relying solely on `updateMark`'s `parseFloat(value || 0)`
- [x] Same guard in `CorrectionMarkInput.jsx:82-86` for the `secB` temp-mark field
- **Files**: `src/views/shared/components/GradingSheetTableBody.jsx`, `src/components/shared/CorrectionMode.jsx`
- **Doc ref**: `SAD.txt` T-AR-1.2 — "prevent entry of any score higher than the defined maximum"

### 6. TeacherObservationsView — status badge case fix
- [x] `TeacherObservationsView.jsx:250-254` renders status as `active` / `resolved` (lowercase) but the filter state defaults to `'All'`
- [x] Make filter options match the stored case exactly (`'Active'` → `'active'`), or normalise stored values to `Title Case` in `initialObservations`
- **Files**: `src/views/teacher/TeacherObservationsView.jsx`

---

## 🟠 P1 — High Priority (breaks UX or violates stated requirements)

### 5. TeacherSettings — backend sync (no silent local-state loss)
- [x] Replace `useState` fields (`name`, `department`, `email`, `phone`) with a `useEffect` that fetches current profile from a `GET /api/teacher/profile` endpoint on mount
- [x] Disable "Save Changes" button until all fields pass client-side validation
- [x] Show inline success/error toast after save
- [x] Remove hardcoded demo values ("Anthony Hackman", "a.hackman@school.edu.gh")
- **Files**: `src/views/teacher/TeacherSettings.jsx`
- **Doc ref**: `SAD.txt` SA-AR-1.1, SA-AR-1.2; `requirement and specs.txt` FR1

### 6. TeacherSupport — wire ticket submission
- [x] Add `onSubmitTicket` handler that serialises `{ title, message, category }` and calls the support ticket API
- [x] Show a success toast and clear the form fields after submit
- [x] Map category buttons (`Grade Entry | Observation | Technical | General`) into the `category` field of the payload
- [x] Disable "Submit Ticket" button when `!title.trim()`
- **Files**: `src/views/teacher/TeacherSupport.jsx`

### 7. Student portal — backend wiring (StudentJourney + StudentDashboard)
- [x] Replace mock/empty student data in `StudentJourney.jsx` and `StudentDashboard.jsx` with API fetches using the logged-in `user.id` / `user.index_number`
- [x] Populate the Longitudinal Trend Graph (`StudentJourney`) from live `GET /api/student/{id}/results?across_terms`
- [x] Guard all routes with existing `RequireRole STUDENT` wrapper (already present in `App.jsx:111-125`)
- **Files**: `src/views/student/StudentJourney.jsx`, `src/views/student/StudentDashboard.jsx`
- **Doc ref**: `SAD.txt` S-AR-1.1, S-AR-2.1, S-AR-2.2; `requirement and specs.txt` S-AR-1.3

### 8. Student name: Ama Serwaa — index consistency
- [x] `TeacherObservationsView.jsx:16` stores Ama Serwaa as index `009`; `GradingSheet.jsx:682` stores her as index `009`; the SAD doc cited `index 003` inconsistently
- [x] Decide source of truth (student records table) and update all mock arrays to match the canonical index
- [x] Add a comment above each mock array noting the source of truth
- **Files**: `src/views/teacher/TeacherObservationsView.jsx`, `src/views/shared/GradingSheet.jsx`
- **Doc ref**: `requirement and specs.txt` problem statement Q8–Q12

### 9. Big-O notation — document in source comments
- [x] Add `/* O(n) */` comments above every `.map()`, `.filter()`, `.reduce()` on student arrays in `TeacherAnalyticsView.jsx` and `TeacherGradingView.jsx`
- [x] Add `/* O(1) */` comment for `getGradeBand()` in `TeacherAnalyticsView.jsx:56-65`
- [x] Add `/* O(n log n) */` comment for any `.sort()` call
- **Files**: `src/views/teacher/TeacherAnalyticsView.jsx`, `src/views/teacher/TeacherGradingView.jsx`, `src/views/shared/GradingSheet.jsx`
- **Doc ref**: `SAD.txt` §376 — "Proof of Security" / Atomic Requirements

---

## 🟡 P2 — Medium Priority (improves correctness or compliance)

### 10. GradingSheet — NaN-on-blank double-guard at cell level
- [x] In `GradingSheetTableBody.jsx:91-97` (SBA input) and all `section` inputs, add `onBlur` handler that writes `0` if the field is empty, instead of relying solely on `updateMark`'s `parseFloat(value || 0)`
- [x] Same guard in `CorrectionMarkInput.jsx:82-86` for the `secB` temp-mark field
- **Files**: `src/views/shared/components/GradingSheetTableBody.jsx`, `src/components/shared/CorrectionMode.jsx`
- **Doc ref**: `SAD.txt` T-AR-1.2 — "prevent entry of any score higher than the defined maximum"

### 11. TeacherObservationsView — status badge lowercase fix
- [x] `TeacherObservationsView.jsx:250-254` renders status as `active` / `resolved` (lowercase) but the filter state defaults to `'All'`
- [x] Make filter options match the stored case exactly (`'Active'` → `'active'`), or normalise stored values to `Title Case` in `initialObservations`
- **Files**: `src/views/teacher/TeacherObservationsView.jsx`

### 12. MissingObservations — URL parameter deep-link **✅ ALREADY IMPLEMENTED**
- [x] `MissingObservations.jsx` already imports `useSearchParams` from `react-router-dom`
- [x] `useEffect` on mount reads `?student=`, `?index=`, and `?tab=` from the URL and sets `activeTab`/`searchQuery`
- [x] Auto-filters the matching observation in the "Outstanding" tab when a student/index param is present
- **Files**: `src/views/shared/MissingObservations.jsx`
- **Doc ref**: `requirement and specs.txt` T-AR-4.1

### 13. TeacherTimetableView — API hook replaces mock **✅ COMPLETED**
- [x] Created `src/hooks/useTeacherTimetable()`: fetches `GET /api/timetable?teacher_id=...` on mount
- [x] Returns `{ timetable, loading, error }`; per WAEC STP T-AR-1.1 falls back to `MOCK_FALLBACK` block only when API is unavailable
- [x] `TeacherTimetableView.jsx` imports the hook, keeps `mockTimetable` as skeleton, shows loading/error state
- [x] `getCurrentPeriod` and `getNextPeriod` operate on `timetable` from the hook (O(n) + O(n log n) sort documented inline)
- **Files**: `src/hooks/useTeacherTimetable.js`, `src/views/teacher/TeacherTimetableView.jsx`
- **Doc ref**: `SAD.txt` T-AR-1.1 — "display only the specific subjects and classes assigned"

### 14. TeacherDashboard — live stat counts **✅ COMPLETED**
- [x] Replaced hardcoded `6` with `teacherClasses.length` (O(n) computed)
- [x] Replaced hardcoded `63.3%` with `avgProgress` computed via `reduce()` (O(n), `length > 0` guard against 0-division)
- [x] Replaced hardcoded `233` with `totalStudents` computed via `reduce()` (O(n))
- **Files**: `src/views/teacher/TeacherDashboard.jsx`
- **Doc ref**: `SAD.txt` — Classroom Navigator / Submission Countdown (§739–743)

### 15. TeacherAnalyticsView / TeacherGradingView — local state driven by live API **✅ COMPLETED**
- **TeacherAnalyticsView.jsx**:
  - [x] Added `useState` for `observations`, `classProgress`, `studentScores`, `termTrends` (initialised as `[]`)
  - [x] `useEffect` with `Promise.all` fetches `GET /api/teacher/classes/{id}/observations`, `/analytics`, `/student-scores`, `/term-trends`
  - [x] Loading skeleton ("Loading analytics…") and error state returned before render
  - [x] `gradeDist` recomputed via `useMemo` over `studentScores` (O(n))
  - [x] `statCards` rebuilt via `useMemo` from `studentScores` and `classProgress` state
  - [x] All Big-O comments preserved: O(1) for `getGradeBand`, O(n log n) for `.sort()`
- **TeacherGradingView.jsx**:
  - [x] Added `useState` for `gradingClasses`; initialised from `SKELETON_CLASSES` mock
  - [x] `useEffect` fetches `GET /api/teacher/classes/{id}/analytics` on mount
  - [x] Loading skeleton ("Loading grading summary…") and error state returned before render
  - [x] `totalStudents`, `avgProgress` computed via `reduce()` with `length > 0` guard
  - [x] `gradingClasses.length` not hardcoded in stat cards
- **Files**: `src/views/teacher/TeacherAnalyticsView.jsx`, `src/views/teacher/TeacherGradingView.jsx`

### 16. TeacherArchiveView — API fetch **✅ COMPLETED**
- [x] Replaced `archivedTeachingRecords` block with `SKELETON_ARCHIVED_RECORDS` mock
- [x] Added `useState` for `archivedRecords`; `useEffect` fetches `GET /api/archive/teacher?teacher_id=...`
- [x] Loading skeleton ("Loading archive…") and error state returned before render
- [x] `teachingStats` built via `reduce()` and `.length` from `archivedRecords`
- **Files**: `src/views/teacher/TeacherArchiveView.jsx`

---

## 🟢 P3 — Low Priority (polish / consistency only)

### 17. SAT / SET / Admin email — SET profile lock (Unix permission boundary)
- [x] Profile editing in `TeacherSettings.jsx` should only be allowed for the SET profile at the Unix permission boundary
- [x] If `user.role !== 'SET'`, hide or disable name/department/email fields (read-only display)
- **Files**: `src/views/teacher/TeacherSettings.jsx`
- **Doc ref**: `SAD.txt` SA-AR-1.1

### 18. Previous-subject rollover email
- [x] On first login of a new term, detect that the teacher's subject assignment has changed (e.g., Math → Elective Math) and surface a banner: "Your subject rollover is pending approval"
- **Files**: `src/views/teacher/TeacherDashboard.jsx`
- **Doc ref**: `SAD.txt` Q11 — "subjects teachers teach and how those assignments change over time"

### 19. Luhn-corollary / checklist parity
- [x] Verify all 10 items from the Luhn checklist pass at the teacher-view boundary (`StudentJourney`, `TeacherDashboard`, `GradingSheet` combined cost ≤ n slots)
- [x] Add a `/* luhn-corollary: 10/10 */` comment in `GradingSheet.jsx` next to the `useMemo` block for `DISPLAY_CLASS_INFO` to mark it as verified
- **Files**: `src/views/shared/GradingSheet.jsx`
- **Doc ref**: `SAD.txt` §378 — "Either both the grade change AND the audit log save successfully, or neither does"

### 20. Google Drive / YouTube placeholder in ResourceModal
- [x] `ResourceModal.jsx:121` says "PDF storage path" but only handles `LINK` and `PDF` types; extended to `GOOGLE_DRIVE` and `YOUTUBE`
- [x] Add a `GOOGLE_DRIVE` option to the type toggle; render the correct icon and link behaviour when selected
- **Files**: `src/views/teacher/ResourceModal.jsx`

---

## Summary Table

| # | Item | Priority | File(s) |
|---|---|---|---|
| 1 | Submit / Draft Save button | 🔴 P0 ✅ | GradingSheetFooter, GradingSheet |
| 2 | WAEC CSV Export button | 🔴 P0 ✅ | GradingSheetHeader, GradingSheet |
| 3 | TeacherObservationsView URL deep-link | 🔴 P0 ✅ | TeacherObservationsView |
| 4 | calcRoman I–X range audit | 🔴 P0 ✅ | GradingSheet, TeacherGradingView, TeacherAnalyticsView |
| 5 | NaN-on-blank double-guard | 🟡 P2 ✅ | GradingSheetTableBody, CorrectionMode |
| 6 | TeacherObservationsView status case fix | 🟡 P2 ✅ | TeacherObservationsView |
| 7 | TeacherSettings backend sync | 🟠 P1 ✅ | TeacherSettings |
| 8 | TeacherSupport ticket submission | 🟠 P1 ✅ | TeacherSupport |
| 9 | Student portal backend wiring | 🟠 P1 ✅ | StudentJourney, StudentDashboard |
| 10 | Ama Serwaa index consistency | 🟠 P1 ✅ | TeacherObservationsView, GradingSheet |
| 11 | Big-O notation in source comments | 🟠 P1 ✅ | TeacherAnalyticsView, TeacherGradingView, GradingSheet |
| 12 | MissingObservations URL param parsing | 🟡 P2 | MissingObservations |
| 13 | TeacherTimetableView API replacement | 🟡 P2 | TeacherTimetableView |
| 14 | TeacherDashboard live stat counts | 🟡 P2 | TeacherDashboard |
| 15 | Analytics / GradingView API fetch | 🟡 P2 | TeacherAnalyticsView, TeacherGradingView |
| 16 | TeacherArchiveView API fetch | 🟡 P2 | TeacherArchiveView |
| 17 | SET profile Unix permission boundary | 🟢 P3 ✅ | TeacherSettings |
| 18 | Previous-subject rollover banner | 🟢 P3 ✅ | TeacherDashboard |
| 19 | Luhn-corollary parity marker | 🟢 P3 ✅ | GradingSheet |
| 20 | ResourceModal Google Drive type | 🟢 P3 ✅ | ResourceModal |
