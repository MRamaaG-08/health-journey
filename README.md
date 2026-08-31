# Health Journey

A privacy-first AI health companion. Health Journey brings a person's scattered
medical life — lab reports, prescriptions, appointments, medications and family
health — into one dashboard, and puts an assistant called **IBM Bob** on top of
it that explains the record in plain language.

Built for the **IBM SkillsBuild SkillUp Hackathon (Skillathon) 2026**.

> Health Journey helps people **organise and understand** their health record.
> It does not diagnose, prescribe, or replace a clinician.

---

## Table of contents

- [What it does](#what-it-does)
- [Screens and features](#screens-and-features)
- [How IBM Bob works](#how-ibm-bob-works)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [API reference](#api-reference)
- [Architecture](#architecture)
- [Privacy and safety](#privacy-and-safety)
- [Known limitations](#known-limitations)
- [Future enhancements](#future-enhancements)
- [Team](#team)

---

## What it does

Managing your health means juggling appointments, prescriptions, lab panels,
specialist visits and follow-ups — usually across paper folders, WhatsApp
forwards and half a dozen hospital portals. Things get missed.

Health Journey gives you one place for all of it:

- Upload a report and it is **catalogued and placed on your timeline** in one
  step, indexed by name, type, size and date. IBM Bob does not read the text
  inside a PDF yet, and says so when asked.
- Your medications and daily focus tasks **persist** — tick one, restart the
  server, it is still ticked.
- **IBM Bob** reads the record and answers questions about it in everyday
  language, and prepares the questions worth asking your doctor.
- One card holds the **emergency information** someone would need if you
  could not speak for yourself.

---

## Screens and features

| Area | What it does |
|---|---|
| **Hero** | Health score, vitals, today's medications and focus tasks — all interactive and persistent |
| **Quick Actions** | Upload a report, jump to IBM Bob, or navigate to any section. Counts read from live API data |
| **Journey Timeline** | Chronological health history. New uploads appear here instantly |
| **Calendar** | Upcoming appointments with doctor and specialty |
| **IBM Bob** | Chat assistant grounded on your own record, with suggestion pills and offline fallback |
| **Insights** | Monthly health trend and vitals summary |
| **Recent Documents** | Your document vault, with upload and delete |
| **Family Profiles** | Health status for the people you care for |
| **Emergency Card** | Blood group, allergies, conditions and contacts |

Everything is wrapped in a React **Error Boundary**, so a failure in one
component never blanks the whole dashboard.

---

## How IBM Bob works

IBM Bob is the assistant built into the product. He runs on a **two-tier
engine**, and the tier is chosen automatically at request time.

### Tier 1 — IBM watsonx.ai (live model)

When `IBM_API_KEY` and `IBM_PROJECT_ID` are set in `backend/.env`, the backend
exchanges the API key for an IBM Cloud IAM bearer token (cached until shortly
before it expires) and calls the watsonx.ai text-generation endpoint with a
Granite model. The user's health record is serialised into the prompt so the
model answers from that record and nothing else.

### Tier 2 — Grounded local inference (offline)

If no credentials are configured, or the network is down, or watsonx returns an
error, IBM Bob falls back to a local reasoning layer that reads
`database.json` directly and **computes** its answer: how many documents are in
the vault, which medications are still unlogged, how much XP today's remaining
focus tasks are worth, which family members are flagged, which lab event the
newest upload links to.

This is not a set of canned replies. Tick a medication and ask the same
question again and the answer changes, because the numbers are read from live
state on every request.

**Which tier is running right now?**

```
GET /api/ai/status
```

```json
{
  "assistant": "IBM Bob",
  "watsonxConfigured": false,
  "activeEngine": "grounded-local-inference",
  "fallbackAvailable": true,
  "recordsIndexed": { "documents": 4, "timelineEvents": 5, "medications": 2, "familyProfiles": 4 }
}
```

Every `/api/ai/chat` response also reports its `source` (`"watsonx"` or
`"local"`), so the engine in use is never ambiguous.

### Safety rules

Both tiers are constrained by the same rules: answer only from the record,
never invent a lab value or a medicine, never diagnose or prescribe, never tell
the user to change a dose, and defer clinical judgement to their doctor. If the
record does not contain the answer, IBM Bob says so.

---

## Tech stack

**Frontend**

- React 19.2.8
- Vite 8.2.2
- Plain CSS with CSS custom properties — no Tailwind, no component library
- Modular architecture: one folder per component, paired `.jsx` and `.css`

**Backend**

- Python 3 + Flask 3.0.3
- flask-cors 4.0.1
- python-dotenv 1.0.1
- Werkzeug 3.0.3
- requests 2.32.3

**Persistence**

- `backend/database.json` — a single JSON document, written on every mutation
- `backend/uploads/` — uploaded medical documents on local disk

No external database, no cloud storage, no user account. The record lives on
the machine the backend runs on.

---

## Folder structure

```
HealthJourney/
├── backend/
│   ├── app.py                  # Flask app: 13 endpoints + IBM Bob engine
│   ├── database.json           # Local persistence (JSON)
│   ├── requirements.txt        # Python dependencies
│   ├── tests/
│   │   └── test_bob_engine.py  # 80 tests, generated by IBM Bob
│   ├── .env.example            # Template for environment variables
│   └── uploads/                # Uploaded documents (git-ignored)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── public/                 # favicon.svg, icons.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css           # Design tokens and global styles
│       ├── services/
│       │   └── api.js          # Every backend call lives here
│       ├── pages/
│       │   └── Dashboard/
│       └── components/
│           ├── Navbar/         ├── Hero/           ├── QuickActions/
│           ├── JourneyTimeline/├── Calendar/       ├── AIAssistant/
│           ├── Insights/       ├── RecentDocuments/├── FamilyMembers/
│           ├── EmergencyCard/  ├── MedicationCard/ ├── FocusCard/
│           ├── AppointmentCard/├── Footer/         └── ErrorBoundary/
│
└── docs/
    ├── architecture.md
    ├── API_DOCUMENTATION.md
    ├── product_vision.md
    ├── design_bible.md
    ├── user_journey.md
    └── user_personas.md
```

---

## Installation

**Requirements:** Python 3.10 or newer, Node.js 18 or newer.

```bash
git clone https://github.com/YOUR_USERNAME/health-journey.git
cd health-journey
```

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux
```

### Frontend

```bash
cd frontend
npm install
```

The frontend runs against `http://localhost:5000/api` by default, so no
frontend `.env` file is required for local development.

---

## Environment variables

### `backend/.env`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `IBM_API_KEY` | No | — | IBM Cloud API key. Without it, IBM Bob uses the local engine |
| `IBM_PROJECT_ID` | No | — | watsonx.ai project ID |
| `IBM_URL` | No | `https://us-south.ml.cloud.ibm.com` | watsonx.ai regional endpoint |
| `IBM_MODEL_ID` | No | `ibm/granite-3-8b-instruct` | Granite model powering IBM Bob |
| `ALLOWED_ORIGINS` | No | localhost 5173/4173 | Comma-separated CORS allowlist |
| `HOST` | No | `127.0.0.1` | Network interface. Loopback only by default — set `0.0.0.0` only if you deliberately need access from another device |
| `PORT` | No | `5000` | Flask port |
| `FLASK_DEBUG` | No | `false` | Keep `false` for demos |

### `frontend/.env`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |

`.env` is git-ignored. Only `.env.example` is committed — no key ever enters
the repository.

---

## Running locally

Two terminals.

**Terminal 1 — backend**

```bash
cd backend
venv\Scripts\activate
python app.py
```

```
==============================================================
 Health Journey — Backend API
 IBM Bob engine : Grounded local inference (watsonx key not set)
 Records loaded : 4 documents, 5 timeline events
 Debug mode    : OFF (demo safe)
 Bound to      : 127.0.0.1:5000 (this machine only)
==============================================================
```

Flask prints a red *"This is a development server"* warning after the banner.
That is expected and harmless for a local demo.

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Verifying persistence

1. Tick a medication in the Hero card.
2. Stop the backend (`Ctrl+C`) and start it again.
3. Reload the dashboard — it is still ticked.

The same holds for focus tasks and uploaded documents.

---

## API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/dashboard` | User, vitals, medications, appointments, focus tasks |
| `GET` | `/timeline` | Health timeline events |
| `GET` | `/calendar` | Upcoming appointments |
| `GET` | `/documents` | Document vault |
| `GET` | `/family` | Family profiles |
| `GET` | `/emergency` | Emergency card |
| `POST` | `/ai/chat` | Ask IBM Bob a question |
| `GET` | `/ai/status` | Which IBM Bob engine is active |
| `POST` | `/documents/upload` | Upload a document (multipart) |
| `DELETE` | `/documents/<id>` | Delete a document and its timeline event |
| `POST` | `/medication/toggle` | Toggle a medication as taken |
| `POST` | `/focus/update` | Toggle a focus task as done |
| `GET` | `/documents/<id>/content` | Serve an uploaded document's file |
| `GET` | `/documents/<id>/content` | Serve an uploaded document's file |

Full request and response bodies: **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**

---

## How IBM Bob was used

IBM Bob was used as a code reviewer and test author across nine documented
sessions. Every session — the prompt, the response, and what we accepted,
modified or declined — is recorded in **[docs/bob-evidence/](docs/bob-evidence/)**.

| Session | Outcome |
|---|---|
| Backend code review | 11 findings; 9 implemented, 2 deferred with stated reasons |
| Test suite (Agent mode) | `backend/tests/test_bob_engine.py` — 80 tests, all passing |
| Upload security review | Magic-byte validation, UUID storage, a controlled serve route |
| Intent router critique | A scored-dispatch design; accepted as correct, deferred deliberately |
| Architecture review | Changed how we state the product's privacy claim |
| Docstrings (Agent mode) | Google-style docstrings for nine functions |
| React frontend review | 9 findings, all implemented |
| Responsible AI review | 7 findings against IBM's six principles |
| Demo readiness audit | 16 risks; found a fabricated on-screen conversation |

Two of Bob's recommendations were **wrong**, and both are documented: a CORS
origin that would have broken our own frontend, and a sanitiser regex we
implemented and then defeated in testing. Four more were correct but declined,
each with a reason.

### Running the tests

```bash
backend\venv\Scripts\python.exe -m pytest backend/tests/test_bob_engine.py -v
```

```
80 passed
```

---

## Architecture

```
┌───────────────────────────────────────────┐
│  React 19 + Vite  (browser)               │
│  Dashboard → 15 components                │
│  services/api.js — single API boundary    │
└───────────────────┬───────────────────────┘
                    │  REST / JSON over HTTP
                    ▼
┌───────────────────────────────────────────┐
│  Flask backend  (app.py)                  │
│  12 endpoints · CORS · file upload        │
│  IBM Bob engine (two tiers)               │
└──────┬─────────────────────────┬──────────┘
       │                         │
       ▼                         ▼
┌──────────────┐        ┌────────────────────┐
│ database.json│        │ IBM watsonx.ai     │
│ uploads/     │        │ (Granite) —        │
│ local disk   │        │ optional Tier 1    │
└──────────────┘        └────────────────────┘
```

Detail: **[docs/architecture.md](docs/architecture.md)**

---

## Privacy and safety

- **Local by default.** The record never leaves the machine unless watsonx is
  explicitly configured, and even then only the prompt context is sent.
- **No encryption at rest — stated plainly.** `database.json` and the uploads
  folder are stored unencrypted on the local disk. Health Journey's privacy
  claim is *locality* — your record stays on your device and is not sent to a
  server, sold, or tracked — not cryptography. Encryption at rest is named in
  Future Enhancements, and nothing in this project claims to implement it.
- **No accounts, no tracking, no analytics.**
- **Secrets stay out of the repo.** `.env` is git-ignored; uploaded documents
  are git-ignored.
- **Uploads are validated before they touch disk** — extension allowlist
  (`pdf`, `png`, `jpg`, `jpeg`), a 20 MB cap, rejection of empty files, a
  **magic-byte check** so a renamed executable cannot pass as a PDF, a
  content-versus-extension match, and a dimension sanity check on PNGs.
- **Files are stored under generated UUID names**, never the name the user
  supplied, and are reachable only through a controlled route that resolves
  the document id first — never by guessing a path. Deletion is confined to
  the uploads folder, so a tampered record store cannot reach a source file.
- **Document names are treated as untrusted data by the AI engine.** They are
  fenced in `<untrusted>` tags in the prompt context, and IBM Bob is instructed
  that such text is a label to read back, never an instruction to follow.
- **CORS is restricted** to the local frontend origins rather than `*`, so a
  page on another site cannot read the health record.
- **Writes are atomic.** `database.json` is written to a temporary file and
  moved into place, so an interrupted write cannot corrupt the record store,
  and a failed write returns `500` instead of silently pretending to succeed.
- **IBM Bob never diagnoses.** Both engines are bound by the same safety rules
  and defer clinical judgement to a qualified professional.

---

## Known limitations

Stated plainly, because they are the honest boundary of what was built in a
hackathon:

- **No authentication.** Health Journey is designed as a single-user local
  application: there are no accounts, and every endpoint is open to whoever can
  reach the port. This is an accepted trade-off for a locally-run hackathon
  build, mitigated two ways: the server binds to loopback only by default, so
  it is not reachable from the network at all, and CORS is restricted to local
  origins. Multi-user support would require real authentication first.
- **Document indexing is metadata-level.** Uploads are catalogued by filename,
  type, size and date. IBM Bob reasons about *which* documents exist, not the
  text inside a PDF — and if you ask it for a value that would live inside a
  report, it tells you plainly that it cannot read the file and refuses to
  guess a number. Full OCR and marker extraction is future work.
- **No conversation history.** What IBM Bob said to you is not stored or
  retrievable. In a health context that is an accountability gap: a patient
  cannot go back and check what they were told. An auditable conversation log
  is named in Future Enhancements.
- **Tier 1 output is not validated.** When watsonx is configured, the model's
  answer is returned to the user as generated. The safety rules are instructions
  in the prompt, not a post-generation check, so a model that violates them
  would not be caught. Tier 2 has no such gap, because its answers are composed
  from the record rather than generated.
- **Tier 2 uses keyword routing, not language understanding.** The offline
  engine classifies a question by matching keywords in a fixed priority order.
  It answers well-formed questions accurately, but an unusual paraphrase can
  fall through to the grounded fallback. Handling free-form paraphrase is
  precisely what Tier 1 (watsonx) is for. A scored, word-boundary dispatch
  table is designed and logged as future work.
- **Concurrency is guarded, not solved.** Every read-modify-write of the record
  store is held under a mutex, and the AI engine reasons over an immutable
  snapshot, so simultaneous requests cannot produce duplicate ids or a
  half-mutated context. The store is still a single JSON file rewritten in
  full, which does not scale beyond one user.
- **Vitals and the health score are seeded values**, not readings from a device.

---

## Future enhancements

- OCR and lab-marker extraction so IBM Bob can compare panels value by value
- Real device integration (Apple Health / Google Fit) for live vitals
- An auditable conversation log, so a patient can retrieve what IBM Bob told them
- Post-generation validation of Tier 1 answers against the safety rules
- A published statement of the rules IBM Bob operates under, visible in the app
- Encryption at rest for the record store and uploads
- Multi-user accounts with real authentication
- Scored intent dispatch with word-boundary matching, replacing the ordered
  keyword chain in the offline engine
- Multilingual responses from IBM Bob
- Reminder notifications for medications and appointments
- Migration from JSON persistence to PostgreSQL for concurrent access

---

## Team

**Team NovaTra** — New Horizon College of Engineering

| Field | Value |
|---|---|
| Team name | NovaTra |
| College | New Horizon College of Engineering |
| Team leader | Mantripragada Ramaa Gayatri |
| Members | Mantripragada Ramaa Gayatri · Allu Uma Eashanvi · Krupa L P · Madhumitha K |

Built for the IBM SkillsBuild SkillUp Hackathon 2026.

---

## Licence

See [LICENSE](LICENSE).
