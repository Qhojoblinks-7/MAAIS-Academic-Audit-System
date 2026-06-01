const fs = require('fs');
const p = 'src/pages/hod/HODDashboard.jsx';
const lines = fs.readFileSync(p, 'utf8').split('\n');

// ---- find KPI section bounds ----
const kpiOpenIdx  = lines.findIndex(l => l.includes('-- KPI Row'));
const mainGridIdx = lines.findIndex(l => l.includes('-- Main Content Grid'));

console.log('kpiOpenIdx:', kpiOpenIdx + 1, 'mainGridIdx:', mainGridIdx + 1);

// Build replacement lines 0-indexed:
const NEW_KPI = [
  lines[kpiOpenIdx],   // keep the section-header comment line itself
  lines[kpiOpenIdx + 1], // keep <div className="grid..." line
  lines[kpiOpenIdx + 2], // keep blank line

  // ── KPI Card 1 ──
  '          {/* SRS §1.4 FR3 · Audit & Compliance Watch',
  '              DFD 4.0 (Audit & Validation Engine) writes to ERD Audit_Logs table.',
  '              Every grade edit after initial save is captured here.',
  '              HOD-AR-2.1: mandatory Who/When/Why per SRS §2.4 sequence. */}',
  '          <KPICard theme="dark" label="Audit Watch"',
  '            value={auditModifications}',
  '            footer="Grade modifications logged — Who/When/Why · SRS-FR3 · Audit_Logs · HOD-AR-2.1"',
  '          />',

  lines[kpiOpenIdx + 8],  // keep blank line (index between KPI 1 and 2)

  // ── KPI Card 2 ──
  '          {/* SRS §1.4 FR2 · Submission Progress',
  '              Each class under HOD jurisdiction carries a submissionPct.',
  '              Measured as the department-wide average from the Classes table.',
  '              HOD-AR-2.3: "calculate the Submission Completion Percentage for every class". */}',
  '          <KPICard theme="light" label="Submission Progress"',
  '            value={`${submissionProgress}%`}',
  '            footer={`${totalClasses} classes tracked · SRS-FR2 · Classes table · HOD-AR-2.3`}',
  '          />',

  lines[kpiOpenIdx + 16], // keep blank line (between KPI 2 and 3)

  // ── KPI Card 3 ──
  '          {/* SRS §1.4 FR5 · Pending Grade Review',
  '              SRS §2.5: "If Status is LOCKED block all Edit/Delete requests."',
  '              PENDING classes have not passed HOD finalization yet.',
  '              HOD-AR-3.2: pending count drives the Reject action.',
  '              PENDING classes block HOD-AR-4.3 WAEC export until resolved. */}',
  '          <KPICard theme="light" label="Pending Reviews"',
  '            value={pendingClasses}',
  '            footer="Classes awaiting HOD verification · SRS-FR5 · Lock status · HOD-AR-3.2"',
  '          />',

  lines[kpiOpenIdx + 24], // keep blank line (between KPI 3 and 4)

  // ── KPI Card 4 ──
  '          {/* SRS §1.4 Intervention Engine · SRS §1.3',
  '              Flags students with ≥15% term-to-term performance drop.',
  '              DFD 4.0 writes to ERD Intervention_Alerts table.',
  '              HOD-AR-5.1: auto-aggregates onto the HOD home screen.',
  '              HOD-AR-5.2: each cluster is a counselling action to close. */}',
  '          <KPICard theme="light" label="Intervention Flags"',
  '            value={unresolvedAlerts}',
  '            footer={highSeverityAlerts > 0',
  "              ? `${highSeverityAlerts} HIGH priority — needs counselling now · SRS-Intervention Engine · HOD-AR-5.1`",
  "              : 'No unresolved intervention alerts · SRS-Intervention Engine · HOD-AR-5.1'}",
  '          />',

  lines[kpiOpenIdx + 33], // </div> KPI row
  lines[kpiOpenIdx + 34], // blank line
  lines[kpiOpenIdx + 35], // Main Content Grid comment start
];

// ---- apply the replacement ----
const newLines = lines.slice(0, kpiOpenIdx)
  .concat(NEW_KPI)
  .concat(lines.slice(mainGridIdx));

fs.writeFileSync(p, newLines.join('\n') + '\n');

// ── verify ──
const out = newLines.join('\n');
console.log('double-brace fixed:', !out.includes('{{/*'));
console.log('SRS-FR3 footer:', out.includes('SRS-FR3 · Audit_Logs · HOD-AR-2.1'));
console.log('SRS-FR2 footer:', out.includes('SRS-FR2 · Classes table · HOD-AR-2.3'));
console.log('SRS-FR5 footer:', out.includes('SRS-FR5 · Lock status · HOD-AR-3.2'));
console.log('SRS-Int Engine footer:', out.includes('SRS-Intervention Engine · HOD-AR-5.1'));
console.log('KPI1 comment FR3:', out.includes('SRS §1.4 FR3 · Audit & Compliance Watch'));
console.log('KPI2 comment FR2:', out.includes('SRS §1.4 FR2 · Submission Progress'));
console.log('KPI3 comment FR5:', out.includes('SRS §1.4 FR5 · Pending Grade Review'));
console.log('KPI4 comment Int Engine:', out.includes('SRS §1.4 Intervention Engine'));
