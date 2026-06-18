# TODO - Student Portal backend-only data (no mock)

- [ ] Confirm all student-portal UI data flows use real API calls (no JSON mock fallback)
- [ ] Remove/disable any mock-data usage in the student portal data layer
- [x] Fix StudentPortal component: eliminate any "fallback base package" that can mask backend failure
- [x] Ensure error state renders when backend returns null/invalid (no fallback rendering)
- [ ] Align request paths used by studentApi with backend endpoints used by NestJS (portal + auth)
- [ ] Run frontend build/tests and verify no mock JSON imports are used in student portal runtime