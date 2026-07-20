# MAAIS — Headmaster / Administrator Acceptance Checklist
### Plain-Language User Acceptance Testing (UAT) for the Non-Technical School Leader

**What this document is:** A simple, step-by-step checklist you (the Headmaster or
School Administrator) can use to confirm the MAAIS school system works the way you
expect — without needing to understand any computer jargon. Read each step, do it on
the screen, and tick the box if it behaves as described.

**How to use it:**
- Open the live school link (hosted on Vercel) in your normal web browser (Chrome, Edge, or Firefox).
- Use the school admin account you were given.
- For every item, do the action described and check that the screen matches the
  "You should see" note.
- If something does NOT match, write it in the Remarks column and tell the technical team.


---

## PART A — Getting In and the Main Screen

### A1. Sign In
**Do this:** Open the web address, type your email and password, then click the button to sign in.
**You should see:** Your name and a main dashboard (home screen) with charts, numbers, and buttons.
- [ ] Works as described
- [ ] Remarks: ____________________________

### A2. The Main Dashboard (Your "Control Room")
**Do this:** Look at the top of the screen after you sign in.
**You should see:**
- A live clock and a green "System Live" light (means the system is connected).
- A box showing the current school year, term (Term 1/2/3), and student level (SHS 1–4).
- Four summary tiles: total students, teachers active/offline, grading progress, and flagged items.
- A colourful bar chart comparing how each department (Science, Business, etc.) is performing.
- A list of recent system activities at the bottom.
- [ ] All of the above are visible
- [ ] Remarks: ____________________________

### A3. Change the Active Term / Year
**Do this:** Click the box that shows the school year, term, or student level. A small window opens — pick a different term or year and save.
**You should see:** The numbers and charts on the screen update to reflect the term/year you chose.
- [ ] Works as described
- [ ] Remarks: ____________________________

### A4. Sign Out
**Do this:** Click your name / the sign-out option, then close and reopen the page.
**You should see:** You are taken back to the sign-in screen and cannot see the dashboard without logging in again.
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART B — Setting Up the School (One-Time / Each Year)

### B1. Create a New Academic Year (with Terms or Semesters)
**Do this:** Go to the left sidebar **Academic Blueprint** (the "Academic Architect" page). In the "Institutional Blueprint" box, click the **"+ New Academic Year"** button (top-right).
**You should see:** A window titled "New Academic Year" with:
- **Academic Year Name** (e.g. `2026/2027`).
- **Start Date** and **End Date** pickers.
- A choice: **"3 Terms"** or **"2 Semesters"** — pick whichever your school uses.
- A **Create Year** button.
Fill it in and click **Create Year**.
**You should see after saving:** The new academic year is created, its Terms (Term 1/2/3) or Semesters (Semester 1/2) are added automatically and split evenly across the dates, and the new year becomes the active one. The dashboard header (test A3) now shows this year.
- [ ] Works as described
- [ ] Remarks: ____________________________

### B2. Add a Department and a Subject
**Do this:** In the same Academic Architect page, add a new department (e.g. "Automotive") and add a subject under it.
**You should see:** The department and its subject appear in the lists and can be selected later.
- [ ] Works as described
- [ ] Remarks: ____________________________

### B3. Add a Teacher (Staff)
**Do this:** Go to the left sidebar **People → Staff Directory** and register a new teacher: name, email, phone, and assign them to a department.
**You should see:** The teacher appears in the staff list and shows as "active".
- [ ] Works as described
- [ ] Remarks: ____________________________

### B4. Add a Class and Students
**Do this:** In the Academic Architect page, add a classroom under a year group/program. In the "Add Classroom Unit" window you can also pick a **Track** — **None**, **Gold**, or **Green** (your school runs Gold and Green tracks, so choose the one this class belongs to). Then go to **People → Student Records**, add a few students to the class, and link each student to a parent.
**You should see:** The class shows the correct number of students, the chosen Gold/Green track is saved with it, and each student is linked to a parent.
- [ ] Works as described
- [ ] Remarks: ____________________________

### B5. Assign a Teacher to a Subject/Class
**Do this:** In the Academic Architect page, use the curriculum mapping to choose a subject, a class, and a teacher, then save.
**You should see:** The assignment is saved; later the teacher will see that class on their own screen.
- [ ] Works as described
- [ ] Remarks: ____________________________

### B6. Move Students Up (Promotion / Rollover)
**Do this:** In the "Institutional Blueprint" box, click the **three-dot menu** (⋮) next to a year group and choose **"Level Promotion / Rollover"**.
**You should see:** Students in that level are moved up to the next level. (This is how a new academic year's classes get populated — it is done by rolling students forward, not by creating a new year.)
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART C — Starting a Term (The "Final Seal" Flow)

> **Important:** This is the new, correct flow. Before teachers can enter any grades, you MUST complete these steps in order.

### C1. Open the Grading Rules Page
**Do this:** Go to the left sidebar **Curriculum → Grading Rules**.
**You should see:** The Grading Rules page with sections for Weighting Toggle, WAEC Scale Calibration, and the Terminal Validation Lock panel on the right.
- [ ] Works as described
- [ ] Remarks: ____________________________

### C2. Set the Grading Rules
**Do this:** On the Grading Rules page, set the CA/Exam split (default is 30% CA / 70% Exam). Adjust the WAEC grade boundaries if needed. Click **Commit Changes**.
**You should see:** A success message confirming the rules are saved. The settings are now stored for the active term.
- [ ] Works as described
- [ ] Remarks: ____________________________

### C3. Set the Submission Deadline
**Do this:** In the "Terminal Validation Lock" panel on the right, pick a **date** and **time** for the submission deadline. The countdown timer should show the time remaining.
**You should see:** The date and time are displayed, and the countdown updates.
- [ ] Works as described
- [ ] Remarks: ____________________________

### C4. Click "Apply Final Seal"
**Do this:** In the same Terminal Validation Lock panel, click the button that says **"Apply Final Seal (Lock Term X)"**.
**You should see:** A confirmation window opens showing:
- **Target Term** — the term you are about to begin.
- **Impact Radius** — how many students and grade entries are in the system.
- The message: *"This is the setup for Term X. Are you sure you want the semester to begin?"*
- Two buttons: **Cancel** and **Begin Semester**.
- [ ] Modal opens with correct term info
- [ ] Remarks: ____________________________

### C5. Confirm and Begin the Semester
**Do this:** Click **Begin Semester** in the confirmation window.
**You should see:**
- The modal closes.
- The button in the Terminal Validation Lock panel now reads **"Emergency Unlock Portal"**.
- A status badge shows **"TERM ACTIVE"** (green).
- A message appears: *"Semester is Active — Teachers can enter grades"*.
- The deadline countdown continues running.
- [ ] Term is activated successfully
- [ ] Remarks: ____________________________

### C6. Verify Teachers Can Now Enter Grades
**Do this:** Log in as a teacher (or ask a teacher to try). Go to the grading page.
**You should see:** The teacher can select their classes and start entering marks. The grading sheet is NOT locked.
- [ ] Teachers can enter grades
- [ ] Remarks: ____________________________

---

## PART D — Managing an Active Term

### D1. Update the Deadline While Term is Active
**Do this:** Go back to **Curriculum → Grading Rules**. Change the deadline date or time and click **Commit Changes**.
**You should see:** The new deadline is saved, and the countdown timer updates to show the new time remaining.
- [ ] Deadline can be updated
- [ ] Remarks: ____________________________

### D2. Emergency Unlock (Pause the Term)
**Do this:** In the Terminal Validation Lock panel, click **"Emergency Unlock Portal"**. Confirm the action.
**You should see:**
- The button changes back to **"Apply Final Seal"**.
- The status badge changes to **"TERM UNSEALED"**.
- Teachers are now unable to save or change grades (the system blocks them).
- The deadline countdown continues running in the background.
- [ ] Term is deactivated / paused
- [ ] Remarks: ____________________________

### D3. Resume the Term (Re-Seal)
**Do this:** Click **"Apply Final Seal"** again and confirm **Begin Semester**.
**You should see:** The term is reactivated. Teachers can enter grades again. The countdown continues from where it left off.
- [ ] Term reactivates successfully
- [ ] Remarks: ____________________________

### D4. Run the Compliance Suite
**Do this:** In the Terminal Validation Lock panel, click **Run Compliance Suite**.
**You should see:** A list of system warnings (if any) showing things like missing observations, incomplete grade entries, or low attendance. Each warning has a severity level (high/low/info).
- [ ] Compliance warnings appear correctly
- [ ] Remarks: ____________________________

---

## PART E — Daily Monitoring (No Setup Needed)

### E1. Student and Teacher Counts
**Do this:** On the dashboard, look at the "Student Census" and "Faculty" tiles.
**You should see:** The total number of students (and boarders vs day students) and which teachers are active or offline.
- [ ] Works as described
- [ ] Remarks: ____________________________

### E2. Grading Progress
**Do this:** Look at the "Grading Progress" tile.
**You should see:** A coloured gauge showing how much grading is done school-wide (red = low, amber = halfway, green = nearly done).
- [ ] Works as described
- [ ] Remarks: ____________________________

### E3. Department Performance Chart
**Do this:** Hover your mouse over the bars in the department chart.
**You should see:** A small popup shows the department name and its average score; strong departments show an upward arrow.
- [ ] Works as described
- [ ] Remarks: ____________________________

### E4. Pending Approvals
**Do this:** Look at the "Pending Approvals" list on the right side.
**You should see:** A list of items waiting for your decision, each with an "Approve" (green) and "Reject" (red) button when you hover over it.
- [ ] Works as described
- [ ] Remarks: ____________________________

### E5. Activity Feed (Who Did What)
**Do this:** Scroll to the bottom and look at the activity list.
**You should see:** A running list of things happening in the system (grades finalised, messages sent, students added) with the time each happened.
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART F — Communications (Messages to Staff, Students, Parents)

### F1. Send a Broadcast Message
**Do this:** Click the round floating button at the bottom-right, choose "Broadcast / Send Message", write a short message, pick who should receive it (app, SMS, or email), and send.
**You should see:** A confirmation that the message was sent, and the chosen people receive it.
- [ ] Works as described
- [ ] Remarks: ____________________________

### F2. Emergency Message to All Parents
**Do this:** Use the same broadcast tool but choose "All Parents / Emergency SMS".
**You should see:** The message is sent to all parents' phones.
- [ ] Works as described
- [ ] Remarks: ____________________________

### F3. Read and Reply to Support Tickets
**Do this:** Open the support/tickets area.
**You should see:** A list of problems reported by teachers or students; you can open one, write a reply, and change its status (Open → In Progress → Resolved).
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART G — Safety Switch (Emergency Freeze)

### G1. Freeze the Whole System
**Do this:** Click the floating button, choose "Emergency Freeze", type a reason (e.g. "Exam in progress"), and confirm.
**You should see:** The button turns into a red pulsing lock, and a warning banner appears. Nobody can enter or change grades anywhere.
- [ ] Works as described
- [ ] Remarks: ____________________________

### G2. Check Teachers Are Blocked
**Do this:** (Ask a teacher, or log in as one) try to save a grade while the freeze is on.
**You should see:** The teacher gets a popup explaining the system is frozen and cannot save.
- [ ] Works as described
- [ ] Remarks: ____________________________

### G3. Unfreeze the System
**Do this:** Lift the freeze using the same control.
**You should see:** The red lock goes away, the banner disappears, and teachers can save grades again.
- [ ] Works as described
- [ ] Remarks: ____________________________

### G4. Freeze One Department Only
**Do this:** Freeze a single department (e.g. "Automotive") instead of the whole school.
**You should see:** Teachers in THAT department cannot save grades, but teachers in other departments can.
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART H — End of Term: Reports, Locking, and Moving Students Up

### H1. Final Lock a Term (Close the Books)
**Do this:** When the term is fully complete and all grades are final, use the term locking control (in the Archive / Vault area) to lock the term. This makes all grades permanent and prevents any further changes.
**You should see:** The term is marked as locked. Teachers can no longer edit grades. The system is ready for report generation.
- [ ] Works as described
- [ ] Remarks: ____________________________

### H2. Generate Report Cards for a Class
**Do this:** Choose a class and generate report cards in bulk.
**You should see:** Each student gets a report with their name, subjects, scores, grades (A1–F9), a position in class, and a QR code you can scan to verify it is genuine.
- [ ] Works as described
- [ ] Remarks: ____________________________

### H3. Move Students to the Next Class (Promotion)
**Do this:** In the Academic Architect "Institutional Blueprint", use the three-dot menu → "Level Promotion / Rollover" for a level (only possible after terms are locked).
**You should see:** Students in that level move up to the next level, and final-year students are archived (graduated).
- [ ] Works as described
- [ ] Remarks: ____________________________

### H4. Find a Graduated (Archived) Student
**Do this:** Search "The Vault" using a graduated student's index number.
**You should see:** Their full record and grade history appear, even though they have left the school.
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART I — Oversight: Checking the Audit Trail

### I1. View the Change History
**Do this:** Open the Audit Logs / Activity area.
**You should see:** A list showing who changed what grade, the old value, the new value, the reason they gave, and the time — for the whole school.
- [ ] Works as described
- [ ] Remarks: ____________________________

### I2. Confirm Records Cannot Be Deleted
**Do this:** Look for any option to delete or edit a past log entry.
**You should see:** There is NO way to delete or change a past entry — the history is permanent and safe.
- [ ] Works as described
- [ ] Remarks: ____________________________

### I3. Check Intervention (At-Risk) Alerts
**Do this:** Open the Intervention Alerts area.
**You should see:** A list of students whose performance dropped compared to last term, with their previous and current averages, and an option to mark each as handled.
- [ ] Works as described
- [ ] Remarks: ____________________________

---

## PART J — Quick Sign-Off

| # | Check | Pass? (✓/✗) | Remarks |
|---|-------|-------------|---------|
| A1 | Can sign in | | |
| A2 | Dashboard shows all tiles/charts | | |
| A3 | Can change term/year | | |
| B1–B6 | School setup works | | |
| C1–C6 | Starting a term works (Final Seal flow) | | |
| D1–D4 | Managing an active term works | | |
| E1–E5 | Monitoring screens correct | | |
| F1–F3 | Can send messages & tickets | | |
| G1–G4 | Freeze / unfreeze works | | |
| H1–H4 | Lock, reports, promotion, vault | | |
| I1–I3 | Audit & alerts visible | | |

**Tested by:** _________________  **Date:** ____________  **Role:** Headmaster / Administrator

**Overall verdict:**
- [ ] Everything works — I accept the system
- [ ] Some items failed — listed above, needs fixing first

---

### Plain Glossary (for reference)
- **Dashboard:** The main home screen with all the summary numbers and charts.
- **Term:** One part of the school year (Term 1, 2, or 3).
- **Semester:** One half of the school year (Semester 1 or 2), if your school uses semesters instead of terms.
- **Apply Final Seal:** The button you click to officially begin a term or semester. After this, teachers can enter grades.
- **Emergency Unlock:** The button to pause a term if you need to make changes. Teachers cannot enter grades while the term is unsealed.
- **Final Lock:** The end-of-term action that freezes all grades so report cards can be generated.
- **Department:** A subject group, e.g. Science, Business, Visual Arts.
- **Freeze:** A safety switch that locks the whole system so no grades can be changed.
- **Promotion:** Moving students up to the next class at the end of the year.
- **Vault / Archive:** A safe store of records for students who have left.
- **Audit log:** A permanent diary of every grade change made in the system.
- **Intervention alert:** A flag raised when a student's grades drop sharply.
- **Report card:** The official term result sheet for a student, with a QR code for verification.
