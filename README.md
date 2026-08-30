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

- Upload a report and it is **parsed, indexed and placed on your timeline** in
  one step.
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
│   ├── app.py                  # Flask app: 12 endpoints + IBM Bob engine
│   ├── database.json           # Local persistence (JSON)
│   ├── requirements.txt        # Python dependencies
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
==============================================================
```

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

Full request and response bodies: **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**

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
- **No accounts, no tracking, no analytics.**
- **Secrets stay out of the repo.** `.env` is git-ignored; uploaded documents
  are git-ignored.
- **Filenames are sanitised** with Werkzeug's `secure_filename` before any file
  touches disk.
- **IBM Bob never diagnoses.** Both engines are bound by the same safety rules
  and defer clinical judgement to a qualified professional.

---

## Known limitations

Stated plainly, because they are the honest boundary of what was built in a
hackathon:

- **Single user.** There is no authentication or multi-tenancy; the record store
  is one JSON file.
- **Document parsing is metadata-level.** Uploads are indexed by filename, type
  and size. IBM Bob reasons about *which* documents exist, not the text inside
  a PDF. Full OCR and marker extraction is future work.
- **Concurrency.** `database.json` is rewritten on each mutation. That is fine
  for one user; it is not safe for simultaneous writers.
- **Vitals and the health score are seeded values**, not readings from a device.
- **No test suite yet.** Verification so far has been manual and browser-driven.

---

## Future enhancements

- OCR and lab-marker extraction so IBM Bob can compare panels value by value
- Real device integration (Apple Health / Google Fit) for live vitals
- Multi-user accounts with encryption at rest
- Multilingual responses from IBM Bob
- Reminder notifications for medications and appointments
- Migration from JSON persistence to PostgreSQL for concurrent access

---

## Team

| Field | Value |
|---|---|
| Team name | *to be completed* |
| College | *to be completed* |
| Team leader | *to be completed* |
| Members | *to be completed* |
| Contact | *to be completed* |

---

## Licence

See [LICENSE](LICENSE).
