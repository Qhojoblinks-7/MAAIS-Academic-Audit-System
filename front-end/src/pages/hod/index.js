// HOD context re-exports only. Page components are lazy-loaded per route
// (see src/router/lazyPages.js) — do NOT re-export them here, otherwise the
// barrel gets pulled into the initial bundle via Dashboard.jsx.
export { HODProvider, useHOD } from '../../context/HODContext';
