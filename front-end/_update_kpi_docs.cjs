const fs = require('fs');
const p = 'src/pages/hod/HODDashboard.jsx';
let txt = fs.readFileSync(p, 'utf8');

// ── helper ─────────────────────────────────────────────────────────────────────
const has = (s) => txt.includes(s);

// ── 1. KPI Row section comment ─────────────────────────────────────────────────
if (has('-- KPI Row')) {
  txt = txt.replace(
    /\/\* -- KPI Row .*? ------/,
    '{/* -- KPI Row — each card charted to its SRS § / DFD / ERD source ------------'
  );
  console.log('[1] KPI Row comment updated');
}

// ── 2. KPI card comment blocks ─────────────────────────────────────────────────

// KPI 1 — Audit Watch
if (has('HOD-AR-2.1 · Audit & Compliance Watch')) {
  txt = txt.replace(
    /{\/\* HOD-AR-2\.1 · Audit & Compliance Watch[\s\S]*?measure: total entries in audit_logs for this department this term \*\/}/,
    `{
          {/* SRS §1.4 FR3 · Audit & Compliance Watch
              DFD 4.0 (Audit & Validation Engine) writes to ERD Audit_Logs table.
              Every grade edit after initial save is captured here.
              HOD-AR-2.1: mandatory Who/When/Why per SRS §2.4 sequence. */}`
  );
  console.log('[2a] Audit Watch comment updated');
}

// KPI 2 — Submission Progress
if (has('HOD-AR-2.3 · Submission Progress')) {
  txt = txt.replace(
    /{\/\* HOD-AR-2\.3 · Submission Progress[\s\S]*?department average submissionPct[\s\S]*?\*\/}/,
    `{
          {/* SRS §1.4 FR2 · Submission Progress
              Each class under HOD jurisdiction carries a submissionPct.
              Measured as the department-wide average from the Classes table.
              HOD-AR-2.3: "calculate the Submission Completion Percentage for every class". */}`
  );
  console.log('[2b] Submission Progress comment updated');
}

// KPI 3 — Pending Grade Review
if (has('HOD-AR-3.2 · Pending Grade Review')) {
  txt = txt.replace(
    /{\/\* HOD-AR-3\.2 · Pending Grade Review[\s\S]*?blocks HOD-AR-4\.3[\s\S]*?\*\/}/,
    `{
          {/* SRS §1.4 FR5 · Pending Grade Review
              SRS §2.5: "If Status is LOCKED block all Edit/Delete requests."
              PENDING classes have not passed HOD finalization yet.
              HOD-AR-3.2: pending count drives the Reject action.
              PENDING classes block HOD-AR-4.3 WAEC export until resolved. */}`
  );
  console.log('[2c] Pending Reviews comment updated');
}

// KPI 4 — Intervention Flags
if (has("HOD-AR-5.1 · Student Intervention Flags")) {
  txt = txt.replace(
    /{\/\* HOD-AR-5\.1 · Student Intervention Flags[\s\S]*?intervention_alerts requiring counselling action \*\/}/,
    `{
          {/* SRS §1.4 Intervention Engine · SRS §1.3
              Flags students with ≥15% term-to-term performance drop.
              DFD 4.0 writes to ERD Intervention_Alerts table.
              HOD-AR-5.1: auto-aggregates onto the HOD home screen.
              HOD-AR-5.2: each cluster is a counselling action to close. */}`
  );
  console.log('[2d] Intervention Flags comment updated');
}

// ── 3. KPI footer strings ─────────────────────────────────────────────────────
txt = txt.replace(
  'Grade modifications logged — Who/When/Why · HOD-AR-2.1',
  'Grade modifications logged — Who/When/Why · SRS-FR3 · Audit_Logs table · HOD-AR-2.1'
);

txt = txt.replace(
  "classes tracked · HOD-AR-2.3",
  "classes tracked · SRS-FR2 · Classes table · HOD-AR-2.3"
);

txt = txt.replace(
  'Classes awaiting HOD verification · HOD-AR-3.2',
  'Classes awaiting HOD verification · SRS-FR5 · Lock status · HOD-AR-3.2'
);

txt = txt.replace(
  'needs counselling now · HOD-AR-5.1',
  'needs counselling now · SRS-Intervention Engine · HOD-AR-5.1'
);

txt = txt.replace(
  'No unresolved intervention alerts · HOD-AR-5.1',
  'No unresolved intervention alerts · SRS-Intervention Engine · HOD-AR-5.1'
);
// close interpolation backtick
txt = txt.replace(
  "No unresolved intervention alerts · SRS-Intervention Engine · HOD-AR-5.1'}",
  "No unresolved intervention alerts · SRS-Intervention Engine · HOD-AR-5.1'}"
);

console.log('[3] KPI footer strings updated');

// ── write ──────────────────────────────────────────────────────────────────────
fs.writeFileSync(p, txt);

// ── verify ────────────────────────────────────────────────────────────────────
const chk = () => txt.includes;
console.log('Verify SRS-FR3 present:', chk('SRS-FR3'));
console.log('Verify SRS-FR2 present:', chk('SRS-FR2'));
console.log('Verify SRS-FR5 present:', chk('SRS-FR5'));
console.log('Verify SRS-Int Engine present:', chk('SRS-Intervention Engine'));
console.log('Verify audit_logs table ref:', chk('Audit_Logs table'));
console.log('Verify Classes table ref:', chk('Classes table'));
console.log('Verify DFD 4.0 ref:', chk('DFD 4.0'));
console.log('Verify DFD 5.0 ref:', chk('DFD 5.0'));
console.log('Verify ERD ref:', chk('ERD'));
console.log('Verify Intervention_Alerts ref:', chk('Intervention_Alerts'));
