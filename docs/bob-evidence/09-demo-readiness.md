# IBM Bob — Evidence 09: Demo Readiness Audit

**Date:** 30 August 2026
**Tool:** IBM Bob IDE, conversational mode, read-only
**Scope:** `README.md`, `app.py`, `Dashboard.jsx` — walked against the planned demo sequence

---

## The prompt sent

> @README.md @backend/app.py @frontend/src/pages/Dashboard/Dashboard.jsx
>
> I am demoing this project to hackathon judges in a few hours. The demo is:
> show the dashboard, upload a lab report, watch it appear in Documents and the
> Timeline, open it with View, ask IBM Bob four questions, then show that the
> data survives a backend restart.
>
> Walk through that exact sequence against the code and tell me every point
> where it could visibly fail in front of a judge — anything that depends on
> timing, network, file state, or browser behaviour. For each risk, tell me how
> to avoid or recover from it live.
>
> Also: does the README describe anything the code does not actually do?

---

## IBM Bob's risk analysis

| Step | Risk | Likelihood | Issue |
|---|---|---|---|
| 1 | **1A** | **WILL HAPPEN** | The seeded AI conversation is fabricated and contradicts what IBM Bob can do |
| 1 | 1B | Likely | `loadData` runs two sequential awaits — the dashboard loads in two visible stages |
| 1 | 1C | None | CORS regex already handles Vite moving to 5174. *"No risk here — this was already fixed. Good."* |
| 2 | 2A | High | Keyboard-activating the Upload card may not open the file picker — browsers require a direct gesture |
| 2 | 2B | Medium | The display-name sanitiser mutates filenames containing brackets or em dashes |
| 2 | 2C | Medium | `loadData` not stabilised — a stale closure if a toast fires during upload |
| 2 | **2D** | **CERTAIN** | Seeded documents have no `storedAs`, so View is disabled for them — looks like a bug |
| 3 | 3A | Certain when scrolled | The smooth scroll and the refetch race; the list can flash |
| 3 | 3B | Medium | `"Just now"` is a static string that never ages, even after a restart |
| 4 | **4A** | **High** | A popup blocker silently swallows the View link — no error, no toast |
| 4 | 4B | Medium | The CSP on served documents may affect image rendering |
| 5 | **5A** | **CERTAIN** | The first suggestion pill asks Bob to explain a blood report — he will correctly refuse |
| 5 | **5B** | **High** | The chat thread never auto-scrolls; new replies land below the fold |
| 5 | 5C | Medium | The keyword router can misfire on natural phrasing |
| 6 | 6A | Certain | The dashboard does not auto-reload after a backend restart |
| 6 | 6B | Low | A `.tmp` file could survive an interrupted save. *"Not worth worrying about."* |

### The finding Bob rated most dangerous

> **Risk 1A — the seeded AI conversation is fabricated.** *"This fabricated
> exchange shows IBM Bob reporting specific lab values (16 ng/mL, 22 ng/mL) and
> offering to set a reminder. Neither capability exists… If a judge clicks
> 'Explain my blood report' right after seeing this seeded conversation, IBM Bob
> will correctly say it cannot read inside a PDF — directly contradicting the
> conversation already on screen. This is the highest-probability visible
> contradiction in the entire demo."*

### Bob's four tested-safe demo questions

Bob verified these route cleanly through the keyword engine with no risk of
falling to the catch-all:

1. *"What are my medications?"*
2. *"What should I ask my doctor?"*
3. *"How am I doing today?"*
4. *"What's in my emergency card?"*

And advised avoiding *"Explain my results"*, *"What are my trends?"* and
*"How is my blood pressure?"*

### README-versus-code audit

Bob checked every claim in the README against the source. Four claims verified
accurate. Two discrepancies found: the folder-structure comment said **12
endpoints** while the API table lists **13**, and the Team section was still
`*to be completed*`.

---

## What we did with this audit

### Fixed in code

| Risk | Fix |
|---|---|
| **1A / 5A** | The fabricated exchange was replaced with a single opening message from Bob describing only what he can actually do. The four suggestion pills were replaced with Bob's four tested-safe questions |
| 1B | The two sequential awaits in `loadData` became a single `Promise.all` |
| **5B** | A ref on the chat thread and an effect that scrolls to the newest message. Verified: after three exchanges the thread reports `atBottom: true` |
| 3A | A 300 ms head start for the refetch before the scroll to Documents begins |
| 3B | `"Just now"` replaced with a real formatted timestamp, so an uploaded document still reports its actual upload time after a restart |
| 2C | `loadData` wrapped in `useCallback` (also frontend review R-01) |
| README | Corrected to 13 endpoints; the test suite added to the folder structure |

### Handled by demo procedure rather than code

- **2A** — click the Upload card with the mouse, never the keyboard.
- **2B** — the demo file is named `lab_report_aug2026.pdf`, no special
  characters.
- **2D** — the presenter orients the judge before clicking View: the four
  existing records are sample data with no file attached; the uploaded one has a
  file. Bob's alternative, deleting the seed documents so the vault starts
  empty, is available as a fallback.
- **4A** — the View link must be tested on the actual demo machine's browser
  beforehand. Bob called this *"the most environment-sensitive point in the whole
  demo."*
- **6A** — narrate the restart in three beats rather than waiting in silence.

### Not changed

- **6B**, the stale `.tmp` file — Bob's own assessment was that it is invisible
  to a judge and not worth worrying about. Agreed.
- **1C** required no action; Bob confirmed a fix made earlier in the day was
  correct. This is worth recording because it is the one case where the audit
  verified something rather than finding a problem.

### Why 1A is the single most valuable finding of all nine sessions

The seeded conversation had been in the file since the interface was first
built, and it had survived every previous review — including a full architecture
review and a Responsible AI review — because those looked at the backend. It was
a two-line piece of placeholder UI content that would have produced a visible,
on-screen self-contradiction in front of judges within about thirty seconds of
the assistant being demonstrated. It cost two minutes to fix.
