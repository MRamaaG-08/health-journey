# IBM Bob — Evidence 02: Test Suite Generation

**Date:** 30 August 2026
**Tool:** IBM Bob IDE, **Agent mode** (Bob wrote the file directly into the repository)
**File produced:** `backend/tests/test_bob_engine.py`
**Result:** 80 tests, 80 passing

---

## The prompt sent

> Create a pytest suite for the `local_inference(user_prompt, db)` function in
> @backend/app.py
>
> Write it to `backend/tests/test_bob_engine.py`.
>
> That function classifies a health question by intent and computes the answer
> from the `db` dictionary. Cover:
> - Each intent routing correctly: emergency, focus tasks, medications,
>   documents, doctor visit, trends, family, vitals, and the fallback
> - That the answer changes when the data changes — for example, marking a
>   medication as taken must change the medication answer
> - The empty-prompt case and an unrelated question
>
> Use a small fixture database defined in the test file, not the real
> database.json. Plain pytest, no extra dependencies beyond pytest itself.
>
> After writing the file, tell me how to run it.

---

## IBM Bob's response

> **80/80 passed.** Here's what was written and how to run it.

### Structure of `backend/tests/test_bob_engine.py`

| Class | Tests | What it covers |
|---|---|---|
| `TestEmergencyIntent` | 8 | All entry keywords, contact list, blood group change, branch priority over vitals |
| `TestFocusIntent` | 9 | Today/habits/streak keywords, XP sum, pending task names, medication cross-mention, data-change detection |
| `TestMedicationIntent` | 9 | pill/vitamin/prescription/adherence keywords, taken vs pending split, marking a med taken changes the reply, empty list |
| `TestDocumentIntent` | 9 | report/lab/pdf/vault keywords, parsed count, empty vault, adding a doc changes the count, lab event cross-reference |
| `TestDoctorIntent` | 8 | checkup/visit/appointment keywords, question list driven by pending meds / lab events / family risk, no-appointment path |
| `TestTrendsIntent` | 8 | compare/history/progress keywords, vitals in reply, AI note, oldest event, score reflects db |
| `TestFamilyIntent` | 7 | family/mother/father keywords, warning member highlighted, all-clear, empty, count change |
| `TestVitalsIntent` | 10 | vital/score/steps/SpO2/summary keywords, doc+timeline counts, personalised name, HR change |
| `TestFallbackIntent` | 5 | Unrelated question grounded with name, record counts in fallback, appointment mention, no-appointment path |
| `TestEdgeCases` | 7 | `""`, `None`, whitespace, case-insensitivity, all 9 intents return non-empty strings, empty db, no mutation of the input dict |

**Total: 80 tests.**

### Three fixes Bob made during its own run

Bob reported that all three were test-prompt issues caused by the keyword
router's branch priority, not bugs in `local_inference`:

1. `"Compare my results over time"` → `"results"` fires the document branch
   first; changed to `"Compare my progress over time"`.
2. `"How many steps today?"` → `"today"` fires the focus branch first; changed
   to `"How many steps have I logged?"`.
3. `"Hypertension" in reply.lower()` → `.lower` without `()` compared against
   the method object, not the string; fixed.

### How to run

From the repository root:

```powershell
cd D:\Project_IBMBob\HealthJourney
backend\venv\Scripts\python.exe -m pytest backend/tests/test_bob_engine.py -v
```

Shorter output:

```powershell
venv\Scripts\python.exe -m pytest tests/test_bob_engine.py
```

A single class, to iterate on one intent:

```powershell
venv\Scripts\python.exe -m pytest tests/test_bob_engine.py::TestMedicationIntent -v
```

No additional packages are needed beyond `pytest`.

---

## What we did with this

The file was accepted as written and committed to the repository at
`backend/tests/test_bob_engine.py`. It is the project's only automated test
suite and it was authored entirely by IBM Bob.

### Independent re-verification after later code changes

The suite was re-run after we modified `local_inference` to add a new intent
branch (see evidence 05 — the judge review flagged that the assistant implied
it could read document contents). This is the meaningful test of the suite's
value: it was written against one version of the function and re-run against a
changed one.

```
80 passed in 2.33s
```

Screenshot: `screenshots/bob/03-tests-passing.png`

### The suite caught a real regression risk

While adding the new branch we initially included the keyword phrase
`'what was my'`. Testing showed it hijacked *"What was my health score?"* and
*"What was my blood pressure?"* into the wrong branch — the exact class of
substring collision Bob had already worked around in its own test prompts. The
keyword was replaced with narrower terms before the tests were run, and all 80
then passed.

### Note on the three fixes

Bob's own diagnosis of the substring collisions was independently correct. Two
bugs of the same class had already been found and fixed by hand earlier in the
project: `'xp'` matching inside the word *"explain"*, and `'blood'` in the
documents branch swallowing *"what is my blood group"* before the emergency
branch could see it. Bob rediscovered the weakness without being told about it,
and later proposed a structural fix for it — see evidence 04.
