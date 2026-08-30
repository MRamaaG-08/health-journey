# IBM Bob — Evidence 07: React Frontend Review

**Date:** 30 August 2026
**Tool:** IBM Bob IDE, conversational mode, read-only
**Scope:** `Dashboard.jsx`, `Navbar.jsx`, `QuickActions.jsx`, `services/api.js`
**Why this session:** the first five reviews covered only the Python backend. The React half had never been reviewed.

---

## The prompt sent

> @frontend/src/pages/Dashboard/Dashboard.jsx
> @frontend/src/components/Navbar/Navbar.jsx
> @frontend/src/components/QuickActions/QuickActions.jsx
> @frontend/src/services/api.js
>
> Act as a senior React engineer reviewing this dashboard before a demo. It is
> React 19 with Vite and plain CSS. Dashboard.jsx is the only stateful
> container; everything else is presentational.
>
> Review for:
> 1. Unnecessary re-renders or missing memoisation that would show as lag
> 2. Race conditions between the optimistic local state updates and loadData()
> 3. Memory leaks — listeners, timers or requestAnimationFrame not cleaned up
> 4. Error handling gaps if the backend is unreachable mid-interaction
> 5. Accessibility problems a judge using a keyboard would hit
>
> Give severity, why it matters, and the change. Do not edit any files.

---

## IBM Bob's findings

| # | Severity | Category | Finding |
|---|---|---|---|
| R-01 | **High** | Re-renders | `loadData` needs `useCallback` — stale references passed to children |
| R-02 | **High** | Race condition | Two overlapping `loadData` calls; a later response can overwrite newer state |
| R-03 | **High** | Error handling | Toggle API helpers don't check `response.ok`; HTTP errors swallowed silently |
| R-04 | **Medium** | Memory leak | `scrollToSection` and `handleAskAI` timeouts not cleared on unmount |
| R-05 | **Medium** | Re-renders | `counts` literal re-created every render; defeats any future `memo` |
| R-06 | **Medium** | Error handling | `Promise.all` in `fetchExtraDashboardData` blanks all sections on one failure |
| R-07 | **Medium** | Accessibility | Action cards are `div[role=button]` — no native disabled, no guaranteed focus ring |
| R-08 | **Low** | Accessibility | Search input has no accessible name; `placeholder` is not a label |
| R-09 | **Low** | Accessibility | `aria-current="true"` should be `aria-current="location"` |

Bob's own priority: **R-03** (silent toggle failures will visibly confuse the
judge), **R-07** (a keyboard user tabbing through the cards sees no focus ring),
and **R-02** (uploading then immediately deleting can leave the list stale with
no indication).

### Selected detail

**R-01** — `loadData` is a plain async arrow function in the component body, so
it gets a new identity on every render. It is passed as `onDocumentUploaded` to
`QuickActions` and `onDocumentDeleted` to `RecentDocuments`. Any child adopting
`React.memo` would gain nothing, and a child holding a stale reference calls an
older closure.

**R-03** — neither `toggleMedicationAPI` nor `toggleFocusTaskAPI` checked
`response.ok`, so a 400, 404 or 500 resolved normally and the caller treated the
failure as success. The UI then displayed a state the server had rejected.

**R-06** — `Promise.all` rejects as soon as any one request fails, so a single
failing endpoint blanked the timeline, calendar, documents, family **and**
emergency cards simultaneously.

---

## What we did with this review

**All nine findings implemented.** This was the highest accept-rate session of
the seven, which is itself informative: the backend reviews produced findings we
argued with, while the frontend review produced findings that were simply
correct.

| Finding | Implementation |
|---|---|
| R-01 | `loadData` wrapped in `useCallback`; `handleMedicationToggle` and `handleFocusToggle` likewise |
| R-02 | A monotonic ticket counter in a ref. Each call takes a ticket; a response whose ticket is no longer current is discarded before it can write state |
| R-03 | A shared `postJSON` helper that checks `response.ok` and throws with the server's error message. The Dashboard already had `catch` blocks showing an error toast, which were dead code until this fix |
| R-04 | The highlight timeout is stored in a ref, cleared before each new one, and cleared again in an unmount effect |
| R-05 | `counts` wrapped in `useMemo`, keyed on the three lengths it derives from |
| R-06 | `Promise.allSettled`, with a per-section fallback. One failing endpoint now blanks only its own card |
| R-07 | The six cards are native `<button>` elements. `QuickActions.css` gained a button reset so the appearance is unchanged, plus a real `:disabled` state during upload |
| R-08 | `aria-label` on the search input |
| R-09 | `aria-current="location"` |

### Verification

Confirmed in a headless browser against the built application:

- `.qa-card` elements report tag name `BUTTON`, and the first `Tab` press lands
  on a focusable navigation control.
- **Fault injection for R-03:** the `/api/medication/toggle` route was
  intercepted and forced to return HTTP 500. Before the fix the UI showed the
  medication as toggled. After the fix an error toast appears reading *"Could
  not update that medication. Please try again."* A normal toggle produces no
  toast.
- Zero JavaScript errors after the full change set.

### Note on R-02

Bob described the failure mode as edge-case and unlikely to appear in a
controlled demo, which is fair. It was implemented anyway because the fix is
four lines and the failure it prevents — a stale document list after a rapid
upload-then-delete — is exactly the kind of thing that happens when someone else
is driving the keyboard.
