# Health Journey — Architecture

This document describes the system as it is actually built.

---

## 1. High-level view

Health Journey is a two-tier application with local persistence and an optional
external AI service.

```
                        BROWSER
┌─────────────────────────────────────────────────────┐
│  React 19.2.8  ·  Vite 8.2.2  ·  Plain CSS          │
│                                                     │
│  main.jsx → App.jsx → ErrorBoundary → Dashboard     │
│                                                     │
│  Dashboard composes 15 presentational components    │
│  and owns all dashboard state.                      │
│                                                     │
│  services/api.js — the ONLY module that talks HTTP  │
└──────────────────────┬──────────────────────────────┘
                       │
                       │  REST · JSON · multipart
                       │  CORS enabled
                       ▼
                        SERVER
┌─────────────────────────────────────────────────────┐
│  Python 3 · Flask 3.0.3  (backend/app.py)           │
│                                                     │
│  ┌───────────────┐  ┌──────────────────────────┐    │
│  │ Record API    │  │ IBM Bob engine           │    │
│  │ 10 endpoints  │  │ build_health_context()   │    │
│  │ read + mutate │  │ call_watsonx()   Tier 1  │    │
│  │               │  │ local_inference() Tier 2 │    │
│  └───────┬───────┘  └────────┬─────────────────┘    │
│          │                   │                      │
│          │  load_db/save_db  │                      │
└──────────┼───────────────────┼──────────────────────┘
           │                   │
           ▼                   ▼
┌────────────────────┐  ┌──────────────────────────┐
│  LOCAL DISK        │  │  IBM watsonx.ai          │
│  database.json     │  │  Granite text generation │
│  uploads/          │  │  OPTIONAL — Tier 1 only  │
└────────────────────┘  └──────────────────────────┘
```

**Design principle:** the application is fully functional with the dashed box on
the right removed. External AI is an enhancement, never a dependency.

---

## 2. Frontend architecture

### Component model

One folder per component, containing a `.jsx` and its own `.css`. No global
stylesheet owns component styles; no CSS framework is used.

```
src/
├── main.jsx                    React root
├── App.jsx                     Mounts ErrorBoundary + Dashboard
├── index.css                   Design tokens (CSS custom properties)
├── services/api.js             All HTTP calls
├── pages/Dashboard/            Stateful container
└── components/                 15 presentational components
```

### State ownership

`Dashboard.jsx` is the single stateful container. Everything below it is
presentational and receives data and callbacks through props.

| State | Holds |
|---|---|
| `dashboardData` | user, vitals, medications, appointments, focus |
| `extraData` | timeline, calendar, documents, family, emergency |
| `toast` | transient notification message and tone |

Two functions are passed down as the interaction contract:

- `scrollToSection(id)` — in-page navigation used by the navbar and the Quick
  Action cards. Pure browser behaviour: no request, no AI call.
- `showToast(message, tone)` — non-blocking notification, replacing
  `window.alert`.

### Data flow on load

```
Dashboard mounts
   └─ useEffect → loadData()
        ├─ fetchHealthDashboardData()   GET  /api/dashboard
        └─ fetchExtraDashboardData()    GET  /api/timeline, /calendar,
                                             /documents, /family, /emergency
                                             (issued in parallel)
```

### Resilience

- **ErrorBoundary** wraps the dashboard: a render error in one component shows a
  recovery panel instead of a blank page.
- **`api.js` degrades gracefully.** `fetchHealthDashboardData` returns `null` on
  failure and the UI keeps its seeded defaults; `fetchExtraDashboardData`
  returns empty collections; `sendAIBobQuery` returns a safe fallback sentence
  if the backend is unreachable.

---

## 3. Backend architecture

`backend/app.py` is a single Flask module in four clearly separated concerns.

| Concern | Functions |
|---|---|
| Configuration | env loading, `ibm_is_configured()` |
| Persistence | `load_db()`, `save_db()`, `DEFAULT_DB` |
| IBM Bob engine | `build_health_context()`, `call_watsonx()`, `local_inference()`, `get_iam_token()` |
| HTTP routes | 12 endpoints |

### Persistence model

```
Server start
   └─ DB = load_db()
        ├─ database.json exists → parse and use it
        └─ missing or corrupt   → fall back to DEFAULT_DB

Any mutation (upload, delete, medication toggle, focus toggle)
   └─ mutate DB in memory
        └─ save_db(DB)  → write database.json (indent=4, UTF-8)
```

The in-memory `DB` dictionary is the working copy; `database.json` is the
durable copy. Because every mutation writes immediately, a server restart never
loses state.

**Trade-off:** whole-file rewrites are simple and human-readable, and they suit
a single-user local application. They are not safe for concurrent writers,
which is why multi-user support is listed as future work.

---

## 4. IBM Bob engine

### Tier selection

```
POST /api/ai/chat
   │
   ├─ build_health_context(DB)     serialise the live record into prompt text
   │
   ├─ ibm_is_configured()?
   │     │
   │     ├─ yes → call_watsonx()
   │     │          ├─ get_iam_token()   IAM token, cached until expiry-60s
   │     │          ├─ POST /ml/v1/text/generation
   │     │          ├─ success → return text        source = "watsonx"
   │     │          └─ any failure → return None ──┐
   │     │                                          │
   │     └─ no ─────────────────────────────────────┤
   │                                                ▼
   └─ local_inference(prompt, DB)              source = "local"
```

`call_watsonx()` never raises into the request handler. Any exception — bad
credentials, timeout, DNS failure, malformed response — is logged and converted
to `None`, which routes the request to Tier 2. The user always gets an answer.

### Grounding

`build_health_context()` reads the live `DB` on every request and produces a
compact plain-text summary: person and score, vitals, medications with their
taken state, completed and pending focus tasks, appointments, the eight most
recent timeline events, up to ten documents, family profiles, and the emergency
card. That text is the model's only source of facts.

### Tier 2 reasoning

`local_inference()` classifies the question by intent, then **computes** the
answer from `DB`:

```
Intent order (most specific first)
  1. Emergency      blood group, allergies, contacts
  2. Focus / today  completed vs pending tasks, XP remaining
  3. Medications    taken vs pending, deferral to the doctor
  4. Documents      vault size, newest upload, linked lab event
  5. Doctor visit   questions assembled from meds, labs, family risk
  6. Trends         event count, score, oldest entry
  7. Family         profiles split by status flag
  8. Vitals         score, HR, BP, SpO2, steps
  9. Fallback       honest "not in your record" + what is on file
```

Ordering matters: specific phrases are matched before general ones, so
*"what is my blood group"* reaches the emergency branch rather than the
documents branch.

### Safety

`BOB_SYSTEM_PROMPT` constrains Tier 1; the same rules are hard-coded into
Tier 2's phrasing. Neither tier diagnoses, prescribes, or invents a value.

---

## 5. Document upload flow

```
User picks a file in Quick Actions
   │
   ├─ POST /api/documents/upload   (multipart/form-data)
   │
   ├─ secure_filename()            sanitise before touching disk
   ├─ save to backend/uploads/
   ├─ infer type from extension    pdf → pdf · png/jpg/jpeg → img · else rx
   ├─ format size                  KB under 1 MB, else MB
   │
   ├─ prepend a document record to DB["documents"]
   ├─ prepend a timeline event to DB["timeline"]
   │     carrying documentId, linking the two
   ├─ save_db(DB)
   │
   └─ 201 { status, document }
         │
         └─ frontend: loadData() → toast → scroll to Recent Documents
```

Deletion is the mirror image: the file is removed from disk, the document
record is removed, **and the timeline event carrying that `documentId` is
removed too**, so the timeline never references a document that no longer
exists.

---

## 6. Request lifecycle example

Ticking a medication:

```
MedicationCard onClick
   └─ Dashboard.handleMedicationToggle(id)
        └─ toggleMedicationAPI(id)          POST /api/medication/toggle {id}
             └─ Flask: find med, invert `taken`, save_db()
                  └─ 200 { status: "success", medication }
                       └─ Dashboard updates local state optimistically
                            └─ MedicationCard re-renders
```

The next `/api/ai/chat` request reflects the change, because
`build_health_context()` re-reads `DB` every time.

---

## 7. Security and privacy posture

| Concern | Handling |
|---|---|
| Secrets | `.env` git-ignored; only `.env.example` committed |
| Uploaded documents | `backend/uploads/*` git-ignored |
| Path traversal | `secure_filename()` on every upload |
| Debug console | `FLASK_DEBUG` defaults to `false` |
| Data egress | None, unless watsonx is explicitly configured |
| Accounts / tracking | None |

---

## 8. Deliberate trade-offs

| Decision | Why | Cost |
|---|---|---|
| JSON file instead of a database | Zero setup for a judge; human-readable; survives restarts | Not concurrent-safe |
| Two-tier AI instead of watsonx-only | Demo cannot fail on venue Wi-Fi | Two code paths to maintain |
| Plain CSS instead of a framework | Full control of the design language; no build weight | More CSS written by hand |
| Single stateful container | One place to reason about state | Prop drilling in deep trees |
| Metadata-level document indexing | Deliverable within the hackathon window | No marker-level comparison yet |

---

## 9. Design principle

> The application organises health information.
> Clinical decisions remain with qualified medical professionals.
