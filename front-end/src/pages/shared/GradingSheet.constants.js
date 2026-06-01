// ── GradingSheet module-level constants ──────────────────────────────────────
// These are the authoritative defaults used when callers do not supply overrides.
// They are co-located here so they can be safely imported by containers and tests
// without triggering circular dependency warnings from the component itself.

/** WAEC WASSCE Grade Scale — per SAD.txt §77 */
export const GRADE_SCALE = {
  'A1': { min: 75, max: 100, label: 'Excellent', points: 1 },
  'B2': { min: 70, max: 74, label: 'Very Good', points: 2 },
  'B3': { min: 65, max: 69, label: 'Good', points: 3 },
  'C4': { min: 60, max: 64, label: 'Credit', points: 4 },
  'C5': { min: 55, max: 59, label: 'Credit', points: 5 },
  'C6': { min: 50, max: 54, label: 'Credit', points: 6 },
  'D7': { min: 45, max: 49, label: 'Pass', points: 7 },
  'E8': { min: 40, max: 44, label: 'Pass', points: 8 },
  'F9': { min: 0, max: 39, label: 'Fail', points: 9 }
};

/** Fallback subject config when none supplied */
export const DEFAULT_SUBJECT_CONFIG = {
  sections: ['Sec A (40)', 'Sec B (60)'],
  maxRaw: 100,
  sectionCount: 2,
  hasPractical: false,
  practicalMarks: 0,
  sbaLabel: 'SBA (30%)',
  examLabel: 'Exam (70%)',
};

/** Fallback class info for standalone /grading route */
export const DEFAULT_CLASS_INFO = {
  id: 'DEFAULT-CLASS',
  subject: 'General Agriculture',
  className: 'SHS 1 Agric B',
  programme: 'AGRICULTURE',
  studentCount: 42,
  form: 'SHS 1',
  academicYear: '2025/2026',
};

/** Default STP validation rules */
export const DEFAULT_STP_RULES = [
  { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
  { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
  { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
  { check: (s) => s.auditStatus === 'MISSING', message: 'Missing behavioral observations' },
];

/**
 * WAEC STP grade → Roman numeral mapping per SAD.txt §77.
 * A1→I, B2→II, B3→III, C4→IV, C5→V, C6→VI, D7→VII, E8→VIII, F9→IX
 */
export const calcRoman = (grade) => {
  const romanMap = {
    'A1': 'I', 'B2': 'II', 'B3': 'III', 'C4': 'IV',
    'C5': 'V', 'C6': 'VI', 'D7': 'VII', 'E8': 'VIII', 'F9': 'IX'
  };
  return romanMap[grade] || 'IX';
};

/**
 * Maps a section label string to a stable field-key name.
 * WAEC STP §6 — handles paper-numbered, sec-letter, and plain-English formats
 * used across WASSCE core and technical programmes.
 */
export const getSectionFieldName = (label, index) => {
  const l = (label || '').toLowerCase().trim();
  if (/^marking[\s\-]?out?/.test(l))  return 'secA';
  if (/^assembly/.test(l))             return 'secB';
  if (/^finishing/.test(l))            return 'secC';
  if (/^paper\s+1\b/.test(l))         return 'secA';
  if (/^paper\s+2/.test(l))           return 'secB';
  if (/^paper\s+3/.test(l))           return 'secC';
  if (/^sec\s+a\b/.test(l))           return 'secA';
  if (/^sec\s+b\b/.test(l))           return 'secB';
  if (/^sec\s+c\b/.test(l))           return 'secC';
  if (/^obj/.test(l))                  return 'secA';
  if (/^essay|theory|pract\b/.test(l)) return 'secB';
  return ['secA', 'secB', 'secC', 'secD'][index] || `sec_${index}`;
};