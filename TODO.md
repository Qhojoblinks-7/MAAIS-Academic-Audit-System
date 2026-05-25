# TODO

## Student Portal Redesign (Unified Student Portal)

### Step 1 — Create unified portal UI
- [ ] Implement unified student portal component (merge snapshot + journey)
- [ ] Add tabs: Overview, Academic Journey, Interventions, History
- [ ] Ensure it works under existing `/journey` route for STUDENT role

### Step 2 — ResultsCard + approval status badge (S-AR-2.1 / S-AR-2.3)
- [ ] Create `ResultsCard` layout that combines core + technical subjects
- [ ] Add `StatusBadge` with Draft → Submitted → Verified → Locked color coding
- [ ] Wire `approvalStatus` from API payload (defensive fallbacks if absent)

### Step 3 — Behavioral integration (S-AR-3.1 / 3.2)
- [ ] Add behavior score (1–5 stars) and qualitative remarks
- [ ] Integrate behavior into relevant tabs (Overview/Interventions/History)

### Step 4 — PDF / transcript download export (S-AR-4.1)
- [ ] Replace placeholder “Download Transcript” with functional action
- [ ] Render transcript content using `TranscriptPrintTemplate`
- [ ] Add QR verification section (use provided data if available)

### Step 5 — Data model enhancement
- [ ] Extend student fetch mapping to include: `approvalStatus`, `lastSeen`, `coreResults`, `technicalResults`, `behavioralLogs`
- [ ] Update UI to handle new fields and current payloads

### Step 6 — Route compatibility / rollout
- [ ] Decide behavior for `/student-dashboard` route (redirect to `/journey` or wrap unified portal)
- [ ] Validate navigation from sidebar/mobile nav stays intact

### Step 7 — Testing
- [ ] Run dev/build
- [ ] Verify no console errors
- [ ] Validate each tab renders with expected data
- [ ] Verify transcript action works (print/export/QR rendering)

