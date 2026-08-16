# TODO

- [x] Implement WASSCE aggregate calculation (best 6 subjects)
- [x] REMOVE GPA/CGPA system — GES/WAEC does NOT use GPA. Replaced with WASSCE Aggregate (best 6 subjects, lower is better)
- [x] Remove `gpaUtils.js` and all GPA-related calculations from frontend
- [x] Remove `cgpa`, `gpaPerTerm`, `getGradePoint()`, `scoreToGradePoint()`, `percentageToGpa()` from backend
- [x] Replace GPA displays in UI with WASSCE Aggregate (sum of best 6 grade points: A1=1, B2=2, B3=3, C4=4, C5=5, C6=6, D7=7, E8=8, F9=9)
- [x] Update transcript template to show Aggregate instead of Cumulative GPA
- [x] Update report cards to show Aggregate instead of GPA
- [x] Add certificate qualification check: English + Mathematics + General Science all ≤ C6
- [ ] Implement GES certificate qualification rules (must pass English, Mathematics, General Science with grades ≤ C6)
- [ ] Implement subject combination validation per learning area/programme
- [ ] Add raw score tracking fields (`rawClassScore`, `rawExamScore`, `classMaxScore`, `examMaxScore`) to `GradeEntry` for audit trail
- [ ] Implement normalization logic in `computeGrade()` to handle raw marks out of non-standard totals
- [ ] Apply `AssessmentRules` weights (`caWeight`/`examWeight`) in grade calculation instead of simple sum
- [ ] Add GES-specific validation: reject grades where student fails core subjects for certificate
- [ ] Add practical score separation for technical/vocational subjects (track theory vs practical separately)
- [ ] Implement SBA component breakdown (class score, homework, project) per NaCCA assessment model

