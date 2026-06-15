After reading the whole system, here are the **shadcn/ui components** you'd need, grouped by usage frequency:

## Critical (used everywhere)

| shadcn Component | Where Used | Replaces |
|---|---|---|
| `Dialog` | AdminHome modals, StudentRegistry drawers, HODTeachers panels, StaffRegistry forms | 20+ custom modal patterns (`fixed inset-0 z-[100-600]`) |
| `Sheet` | AdminSidebar, HODSidebar, StudentSidebar, TeacherSidebar drawers | Custom sidebar slide-overs |
| `Button` | Every page — primary, secondary, ghost, danger variants | `components/atoms/Button.jsx` |
| `Input` | Every form — text, email, search, textarea | `components/atoms/Input.jsx` |
| `Table` | StaffRegistry, StudentRegistry, ParentRegistry, HODReview, HODArchiveView | Custom table grids |
| `Badge` | StatusBadge, AlertSeverityChip, grade badges | `components/molecules/StatusBadge.jsx` |

## High (used in 5+ places)

| shadcn Component | Where Used |
|---|---|
| `Tabs` | AdminManagement, ArchiveView, HODInterventions, HODAnalytics, TeacherAnalyticsView |
| `Select` | All filter dropdowns, category pickers |
| `Checkbox` | Notification preferences, observation filters |
| `Card` | All dashboard KPIs, stat cards, class cards |
| `Skeleton` | Loading states across all pages |
| `Tooltip` | Sidebar icon tooltips, info icons |
| `DropdownMenu` | Action menus (MoreVertical, export menus) |
| `ScrollArea` | Timeline feeds, log viewers, observation lists |

## Medium (used in 3-4 places)

| shadcn Component | Where Used |
|---|---|
| `Toast` | NotificationBell, success/error toasts |
| `Alert` | CounselingFlag, StpErrorBanner, validation errors |
| `Popover` | Date pickers, filter calenders |
| `Command` | Search/command palette (if needed for global search) |
| `Progress` | Grading progress bars, submission bars |
| `Switch` | Two-factor toggle, draft mode toggle |
| `Avatar` | Student/teacher profile avatars |
| `Separator` | Section dividers |

## Low (used 1-2 places, but would clean up code)

| shadcn Component | Where Used |
|---|---|
| `Calendar` | EventCalendarView, date range filters |
| `Combobox` | Student/teacher search selects |
| `Slider` | Grading scale input, threshold sliders |
| `Textarea` | Could replace Input for multi-line |
| `RadioGroup` | Category selection, report type picker |

## What shadcn would **replace** in your current structure

```
current structure                → shadcn equivalent
─────────────────────────────────────────────────
components/atoms/Button.jsx      → Button (shadcn)
components/atoms/Input.jsx       → Input + Textarea (shadcn)
components/molecules/StatusBadge → Badge (shadcn)
components/molecules/ConfirmationDialog → Dialog (shadcn)
components/molecules/LoadingSpinner → Skeleton (shadcn)
components/molecules/EmptyState  → Empty (shadcn)
components/molecules/AlertSeverityChip → Badge variant (shadcn)
components/shared/MobileDrawer  → Sheet (shadcn)
components/shared/ObservationSidebar → Sheet (shadcn)
```

## What shadcn **cannot** replace

- **Framer Motion** — all animations (`AnimatePresence`, `motion.div`) stay
- **Recharts** — all charts stay
- **Lucide icons** — stay (shadcn uses lucide under the hood)
- **GradingSheet** — the complex grading table is custom enough to keep
- **Print templates** — `TranscriptPrintTemplate`, `TerminalPrintTemplate` stay custom

## Recommendation

**Install in phases:**

1. **Phase 1:** `Dialog`, `Button`, `Input`, `Badge`, `Sheet` — these eliminate 80% of your custom component duplication
2. **Phase 2:** `Table`, `Tabs`, `Select`, `Card`, `Skeleton` — standardize data-heavy pages
3. **Phase 3:** Everything else as you encounter the need

The biggest wins are `Dialog` (replaces ~15 custom modal patterns) and `Sheet` (replaces all sidebar drawers).