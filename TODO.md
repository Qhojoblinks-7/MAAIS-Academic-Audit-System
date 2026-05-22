# Mando SHSTS Academic Audit System - Implementation Tracker

This file tracks completion of tasks. Update after each completed step.

---

## High Priority Tasks (HOD/Teacher correctness-critical)

### ✅ Implement mandatory audit justification popup for grade edits — COMPLETED
- **WAEC STP FR3** — every existing-grade edit (not just HOD corrections) is intercepted
- `updateMark` in `GradingSheet.jsx` shows the `JustificationPopup` before any student row is mutated; `save` is guarded by `!justification.trim()`
- `JustificationPopup` (`CorrectionMode.jsx`) now receives `originalMark` / `newValue` — the WAEC STP FR3 delta (old value → new value) is displayed inline above the textarea
- Cancel releases the gate cleanly; "Save & Apply" is pushed through `onSave`
- **Files**: `src/views/shared/GradingSheet.jsx`, `src/components/shared/CorrectionMode.jsx`

---

### ✅ Create behavioral & safety logging interface with 1-5 rating scales — COMPLETED
- WAEC STP §7 mandated four observation groups are rendered as a unified 1–5 circular-rating grid in `ObservationSidebar.jsx`:
  - **Lab Safety** — Follows all workshop safety guidelines and PPE protocols
  - **Behavioral** — Attitudinal: punctuality, punctuality, respect, classroom conduct
- **Resource Economy** — Conserves materials, tools, and consumables
- **Hygienic Practices** — Maintains personal hygiene and workspace cleanliness
- `hasLowRating` gate (`any score < 3`) auto-surfaces an Audit Justification textarea for FR3 compliance
- Unused local-flag state removed; parent state-lifting props used throughout
- **Files**: `src/components/shared/ObservationSidebar.jsx`

---

### ✅ Implement role-specific HOD dashboard with audit trail and intervention alerts — COMPLETED (existing)
- **HODDashboard.jsx** — Audit Trail panel (grade-change log + old→new delta + justification + RESOLVED/FLAGGED/DRAFT/LOCKED status tags), Intervention Alerts panel (at-risk cards, HIGH/MEDIUM severity, "Mark Resolved"), 4 KPI cards (Audit Log Items, Total Alerts, Locked Terms, At-Risk Students), navigate buttons to /grading /certification /identity/students, WAEC export

---

### ✅ Create student portal showing academic trends and counseling notifications — COMPLETED (existing)
- **StudentJourney.jsx** — 3 tabs (Overview / Academic Trends / Notifications), SVG sparkline per subject trend, behavior star-rating history, counseling notifications
- **StudentDashboard.jsx** — `GET /api/student/{id}` on mount, shows CGPA, class rank, attendance, latest terminal results, upcoming events

---

## Medium Priority Tasks

### ✅ Technical subject milestone fields — COMPLETED
- `SUBJECT_CONFIG` (GradingSheet.jsx) — every technical programme subject now uses **three milestone section labels**: `Marking Out (N) · Assembly (N) · Finishing (N)`
  - Auto Mechanics (35+35+35=105), Electrical Engineering (35+35+35=105), and all remaining technical subjects updated to milestone layout
- `getSectionFieldName(label, index)` resolver — regex-based milstone / paper / sec prefix matcher; returns `secA/B/C/D` dynamically, no hardcoded index map
- `DISPLAY_CLASS_INFO` useMemo — `activeSections` + `sectionFieldNames` pre-computed on subject-config change (O(n), n ≤ 4); cached so body re-render comps don't re-derive on every keystroke
- `GradingSheetTableHeader.jsx` — consumes `activeSections` so milestone column headers render automatically
- `GradingSheetTableBody.jsx` — consumes `sectionFieldNames` so the correct input field (`secA/B/C`) is bound to each milestone column
- `calculateScores` — uses dynamic `secFields.reduce()` instead of hardcoded `(s.secA + s.secB + s.secC) / maxMarks * 70`

---

### ⏳ Intervention alert visualization for 15%+ performance drops — PARTIAL
- [x] `StudentJourney.jsx` — `detectInterventionAlerts()` detects ≥ 15 % drop with LOW/MEDIUM/HIGH severity and feeds the counseling notification tab
- [ ] HOD/Teacher view — add a ≥ 15 % drop detection pass on the **current class cohort** below the TeacherAnalyticsView and TeacherGradingView table rows

### ⏳ WAEC STP export workflow with HOD-controlled final lock — PARTIAL
- [x] `GradingSheet.jsx` — `exportWAEC()` double-guards against `isTermFinalized`, `missingCount > 0`, `isSubmissionLocked`; CSV columns: Index, Student Name, SBA, Exam, Final, Grade, Roman
- [x] `GradingRulesView.jsx` — GRS Final Seal opens a confirmation modal; "Finalize Term" writes `isTermFinalized = true` to UI context which propagates to all consumer views
- [ ] `HODCertification.jsx` — "Lock Dept Matrix" button has no handler; hook it to `isTermFinalized = true` via `useUI(…)` so HODs can activate the final seal from the certification page

---

## P1 Completed

- [x] TeacherSettings backend sync (Teacher profile load/save)
  - Implemented `GET /api/teacher/profile` on mount
  - Implemented `PUT /api/teacher/profile` save and refetch on success
  - Added strict client-side validation gate for enabling Save
  - Removed demo fallback values (Staff ID/Role show `—` when missing)
