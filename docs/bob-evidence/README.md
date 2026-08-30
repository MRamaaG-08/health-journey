# IBM Bob — Usage Evidence

This folder holds the primary record of how IBM Bob was used on Health Journey.
Each file contains the prompt that was sent, IBM Bob's response, and what the
team actually did with it — including the cases where Bob's advice was declined
or corrected.

`../IBM_Bob_Usage.md` is the narrative summary written from this material. This
folder is the underlying source.

---

## Sessions

| # | File | Mode | What it produced |
|---|---|---|---|
| 01 | [`01-backend-code-review.md`](01-backend-code-review.md) | Conversational, read-only | 11 findings (F-01 to F-11) on `app.py`; 9 implemented, 2 deferred with reasons |
| 02 | [`02-test-suite.md`](02-test-suite.md) | **Agent** | `backend/tests/test_bob_engine.py` — 80 tests across 10 classes, all passing |
| 03 | [`03-upload-security-review.md`](03-upload-security-review.md) | Conversational, read-only | 5 findings (R-01 to R-05) on the upload endpoint; magic-byte validation, UUID storage, a controlled serve route |
| 04 | [`04-intent-router-critique.md`](04-intent-router-critique.md) | Conversational, read-only | A scored-dispatch design for the intent router; accepted as correct, deferred deliberately |
| 05 | [`05-architecture-review.md`](05-architecture-review.md) | Conversational, read-only | Adversarial judge review; W-1 changed the product's core privacy claim |
| 06 | [`06-docstrings.md`](06-docstrings.md) | **Agent** | Google-style docstrings for nine functions |

`00-commit-history.txt` records the commit sequence, showing the order in which
the work was done.

---

## Supporting screenshots

Stored in [`../../screenshots/bob/`](../../screenshots/bob/):

| File | Shows |
|---|---|
| `03-tests-passing.png` | `80 passed in 2.33s` — the Bob-authored suite re-run after later code changes |
| others | The IBM Bob IDE sessions and the Bob Findings panel |

---

## How to read this evidence

Three things are recorded deliberately, because they matter more than a list of
accepted suggestions:

**1. Where Bob was verified.** Before acting on session 01, all 16 line numbers
Bob cited were checked against the source. Every one was correct. This is stated
so the reader knows the review was not taken on trust.

**2. Where Bob was wrong.** Two findings had defective remediations, both caught
by testing rather than by reading:

- **F-09** — Bob proposed a CORS origin of `localhost:3000`, the Create React
  App port. This project uses Vite on 5173. Applying it verbatim would have
  broken the dashboard.
- **R-05** — Bob's regex to sanitise filenames was implemented exactly as given,
  then defeated by a plain-English injection, because an instruction written in
  ordinary words contains no characters for the filter to strip. A structural
  defence was added instead.

**3. Where Bob's advice was declined.** F-05 (authentication), F-10 (splitting
the module), part of R-03 (relocating the uploads folder) and W-3 (replacing the
intent router) were all deferred, each with a stated reason recorded in the
relevant file. Engineering judgement about *when* to apply a correct suggestion
is part of the record.

---

## Cost

All six sessions together consumed **2.86 of 40 available Bobcoins**.
