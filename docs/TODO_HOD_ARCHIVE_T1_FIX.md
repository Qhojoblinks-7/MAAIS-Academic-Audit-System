# HOD Archive /hod/archive/t1 shows no data — fix tracking

## Step 1 (analysis)

- Confirm mock skeletonArchivedRecords already includes id `t1`.

## Step 2 (fix)

- Update `src/pages/hod/HODArchiveDetailView.jsx` so that when `fetch('/api/archive/hod/review/:id')` fails OR returns no `record`, it falls back deterministically to the local skeleton record AND ensures the UI has a `record` even if API returns `{}`.

## Step 3 (optional hardening)

- Make `getMockStudents(record)` deterministic (no Math.random) when `record.id === 't1'`, to avoid confusing “empty”/inconsistent rendering during debugging.

## Step 4 (verification)

- Run app and open `/hod/archive/t1`; confirm grading sheet renders.
\- Optionally, add a test case to confirm the fallback logic works as expected when API returns no data for `t1`.