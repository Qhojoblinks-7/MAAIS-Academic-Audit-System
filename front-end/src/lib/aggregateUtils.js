export const GRADE_POINTS = {
  A1: 1,
  B2: 2,
  B3: 3,
  C4: 4,
  C5: 5,
  C6: 6,
  D7: 7,
  E8: 8,
  F9: 9,
};

export function gradeToPoint(grade) {
  return GRADE_POINTS[grade] ?? 9;
}

export function calculateWASSCEAggregate(grades) {
  if (!grades || grades.length === 0) return 0;

  const points = grades
    .filter((g) => g.grade)
    .map((g) => gradeToPoint(g.grade));

  const sorted = points.sort((a, b) => a - b).slice(0, 6);
  const aggregate = sorted.reduce((sum, p) => sum + p, 0);
  return aggregate || 0;
}

export function calculateTermAggregate(grades) {
  if (!grades || grades.length === 0) return 0;

  const points = grades
    .filter((g) => g.grade)
    .map((g) => gradeToPoint(g.grade));

  const sorted = points.sort((a, b) => a - b).slice(0, 6);
  return sorted.reduce((sum, p) => sum + p, 0) || 0;
}

export function aggregateToLetter(aggregate) {
  if (aggregate <= 6) return 'A1';
  if (aggregate <= 12) return 'B2';
  if (aggregate <= 18) return 'B3';
  if (aggregate <= 24) return 'C4';
  if (aggregate <= 30) return 'C5';
  if (aggregate <= 36) return 'C6';
  if (aggregate <= 42) return 'D7';
  if (aggregate <= 48) return 'E8';
  return 'F9';
}

export function getAggregateRemark(aggregate) {
  if (aggregate <= 12) return 'Excellent';
  if (aggregate <= 18) return 'Very Good';
  if (aggregate <= 24) return 'Good';
  if (aggregate <= 30) return 'Credit';
  if (aggregate <= 36) return 'Pass';
  return 'Weak Pass / Fail';
}
