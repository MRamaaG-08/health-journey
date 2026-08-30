# Health Journey — API Documentation

Complete reference for the Health Journey backend.

**Base URL:** `http://localhost:5000/api`
**Content type:** `application/json` unless stated otherwise
**Authentication:** none — Health Journey is a single-user local application
**CORS:** restricted to the local frontend origins (`http://localhost:5173`,
`http://localhost:4173` and their `127.0.0.1` equivalents). Override with the
`ALLOWED_ORIGINS` environment variable.

Every example below is a **real captured response** from a running server, not
an illustration.

---

## Endpoint summary

| # | Method | Endpoint | Purpose |
|---|---|---|---|
| 1 | `GET` | `/api/dashboard` | User, vitals, medications, appointments, focus |
| 2 | `GET` | `/api/timeline` | Health timeline events |
| 3 | `GET` | `/api/calendar` | Upcoming appointments |
| 4 | `GET` | `/api/documents` | Document vault |
| 5 | `GET` | `/api/family` | Family profiles |
| 6 | `GET` | `/api/emergency` | Emergency card |
| 7 | `POST` | `/api/ai/chat` | Ask IBM Bob a question |
| 8 | `GET` | `/api/ai/status` | Which IBM Bob engine is active |
| 9 | `POST` | `/api/documents/upload` | Upload a medical document |
| 10 | `DELETE` | `/api/documents/<id>` | Delete a document |
| 11 | `POST` | `/api/medication/toggle` | Toggle medication taken state |
| 12 | `POST` | `/api/focus/update` | Toggle focus task done state |
| 13 | `GET` | `/api/documents/<id>/content` | Serve an uploaded document's file |

---

## 1. GET /api/dashboard

Everything the Hero section needs, in one request.

**Request:** no parameters.

**Response `200 OK`**

```json
{
  "user": { "firstName": "Ramaa", "fullName": "Ramaa Iyer", "score": 87 },
  "vitals": { "restingHR": 62, "bp": "118/76", "spo2": 98, "steps": 8412 },
  "medications": [
    { "id": 1, "name": "Vitamin D3 · 60,000 IU", "due": "Due at 9:00 PM with dinner", "taken": false },
    { "id": 2, "name": "Metformin 500mg", "due": "Paused by Dr. Kapoor", "taken": true }
  ],
  "appointments": [
    { "id": 1, "doctor": "Dr. Meera Kapoor", "specialty": "Endocrinology · Follow-up",
      "date": "26", "day": "WED", "time": "10:30 AM · Video consult" }
  ],
  "focus": [
    { "id": 1, "task": "20-min morning walk", "done": true, "xp": 0 },
    { "id": 3, "task": "Drink 2 more glasses of water", "done": false, "xp": 20 }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `user.score` | integer | Health score out of 100 |
| `vitals.bp` | string | Systolic/diastolic |
| `medications[].taken` | boolean | Persisted; survives restart |
| `focus[].xp` | integer | Points awarded for completing the task |

**Frontend:** `fetchHealthDashboardData()` in `services/api.js`.

---

## 2. GET /api/timeline

The health timeline, newest first.

**Response `200 OK`**

```json
[
  {
    "id": 6,
    "type": "lab",
    "title": "Medical Document Uploaded — Lipid_Panel_Sept2026.pdf",
    "desc": "Securely indexed by IBM Bob and linked to your health record. File size: 12 KB.",
    "date": "Just now",
    "badge": "Newly Verified",
    "documentId": 5
  },
  {
    "id": 1,
    "type": "ai",
    "title": "Your August checkup, explained in plain language",
    "desc": "28 of 31 markers in range. HbA1c improved to 5.4%.",
    "date": "2 days ago",
    "badge": "Generated for you"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `type` | string | `ai` · `lab` · `vax` · `med` · `alert` — drives the icon and colour |
| `badge` | string | Optional pill label |
| `documentId` | integer | Optional. Present on upload-generated events; used to remove the event when the document is deleted |

---

## 3. GET /api/calendar

**Response `200 OK`**

```json
[
  { "id": 1, "title": "Endocrinology follow-up", "time": "Wed 26 · 10:30 AM",
    "doctor": "Dr. Meera Kapoor", "color": "blue" },
  { "id": 2, "title": "Dental cleaning", "time": "Sep 07 · 4:00 PM",
    "doctor": "Dr. Arjun Nair", "color": "teal" }
]
```

`color` is `blue` or `teal` and selects the accent on the calendar card.

---

## 4. GET /api/documents

The document vault, newest first.

**Response `200 OK`**

```json
[
  { "id": 5, "type": "pdf", "name": "Lipid_Panel_Sept2026.pdf",
    "meta": "Just now · 12 KB · User Upload", "parsed": true },
  { "id": 1, "type": "pdf", "name": "Full body checkup — Aug 2026",
    "meta": "2 days ago · 1.8 MB · Apollo", "parsed": true },
  { "id": 3, "type": "img", "name": "Chest X-ray — routine screening",
    "meta": "May 11 · 6.2 MB · Fortis Imaging", "parsed": false }
]
```

| Field | Type | Notes |
|---|---|---|
| `type` | string | `pdf` · `img` · `rx` · `ins` — selects the file icon |
| `meta` | string | Pre-formatted "date · size · source" line |
| `parsed` | boolean | Whether IBM Bob has indexed it |

---

## 5. GET /api/family

**Response `200 OK`**

```json
[
  { "id": 1, "initials": "SI", "name": "Suresh Iyer",
    "meta": "Father · 64 · Hypertension", "status": "warning" },
  { "id": 2, "initials": "LI", "name": "Lakshmi Iyer",
    "meta": "Mother · 61 · All clear", "status": "success" },
  { "id": 4, "initials": "AV", "name": "Aarav Venkat",
    "meta": "Son · 4 · Vaccine due Sep 12", "status": "info" }
]
```

`status` is `success` (all clear), `warning` (needs attention) or `info`
(something scheduled). IBM Bob uses this field to decide who to mention.

---

## 6. GET /api/emergency

**Response `200 OK`**

```json
{
  "bloodGroup": "O+",
  "allergies": "Penicillin",
  "conditions": "Pre-diabetic",
  "contacts": [
    { "id": 1, "name": "Karthik Venkat", "relation": "Partner · Primary contact", "type": "primary" },
    { "id": 2, "name": "Dr. Meera Kapoor", "relation": "Primary physician", "type": "doctor" }
  ]
}
```

---

## 7. POST /api/ai/chat

Ask IBM Bob a question about the health record.

**Request body**

```json
{ "prompt": "Explain my blood report" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `prompt` | string | yes | An empty string returns a friendly prompt-for-input. Truncated at 800 characters |

**Response `200 OK`**

```json
{
  "reply": "Your vault holds 5 documents, 2 of them indexed. The most recent is \"Lipid_Panel_Sept2026.pdf\" (Just now · 12 KB · User Upload). Also on file: Full body checkup — Aug 2026, Prescription — Dr. Meera Kapoor, Chest X-ray — routine screening. Your timeline links it to \"Full body checkup — Apollo Diagnostics\" from Aug 22. I can summarise what's in it, but the clinical reading belongs to Dr. Meera Kapoor.",
  "source": "local",
  "engine": "grounded-local-inference",
  "groundedOn": { "documents": 5, "timelineEvents": 6, "medications": 2 },
  "timestamp": "2026-08-30T18:28:16"
}
```

| Field | Type | Notes |
|---|---|---|
| `reply` | string | IBM Bob's answer |
| `source` | string | `watsonx` (Tier 1) or `local` (Tier 2) |
| `engine` | string | Model id when Tier 1, otherwise `grounded-local-inference` |
| `groundedOn` | object | How much of the record informed this answer |
| `timestamp` | string | ISO 8601, second precision |

**Empty prompt**

```json
{
  "reply": "Ask me anything about your health record and I'll take a look.",
  "source": "local",
  "engine": "validation"
}
```

**Behaviour notes**

- The endpoint **never returns an error status** for a reachable server. If
  watsonx is unreachable or misconfigured, the request transparently falls back
  to Tier 2 and returns `200` with `source: "local"`.
- Answers are computed from live state. Toggle a medication, ask the same
  question again, and the reply changes.

---

## 8. GET /api/ai/status

Transparency endpoint — reports which IBM Bob engine is active. Useful in the
demo and for Postman verification.

**Response `200 OK`**

```json
{
  "assistant": "IBM Bob",
  "watsonxConfigured": false,
  "activeEngine": "grounded-local-inference",
  "endpoint": null,
  "fallbackAvailable": true,
  "recordsIndexed": {
    "documents": 5,
    "timelineEvents": 6,
    "medications": 2,
    "familyProfiles": 4
  }
}
```

When watsonx credentials are present, `watsonxConfigured` is `true`,
`activeEngine` becomes the model id (e.g. `ibm/granite-3-8b-instruct`) and
`endpoint` reports the regional URL.

---

## 9. POST /api/documents/upload

Upload a medical document.

**Content type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `file` | file | yes |

Accepted by the UI: `.pdf`, `.png`, `.jpg`, `.jpeg`.

**Response `201 Created`**

```json
{
  "status": "success",
  "document": {
    "id": 6,
    "type": "pdf",
    "name": "Thyroid_Panel.pdf",
    "meta": "Just now · 12 KB · User Upload",
    "parsed": true
  }
}
```

**Side effects — this is the endpoint that makes the dashboard feel alive:**

1. The file is saved to `backend/uploads/` after `secure_filename()` sanitising.
2. A document record is prepended to the vault.
3. A timeline event is prepended, carrying `documentId` to link the two.
4. `database.json` is written, so the upload survives a restart.

**Validation — all checks run *before* anything is written to disk**

| Status | Body | Cause |
|---|---|---|
| `400` | `{ "error": "No file part in the request" }` | No `file` field |
| `400` | `{ "error": "No selected file" }` | Empty filename |
| `400` | `{ "error": "File is empty" }` | Zero-byte file |
| `413` | `{ "error": "File exceeds the 20 MB limit" }` | Over `MAX_UPLOAD_BYTES` |
| `415` | `{ "error": "File type not permitted. Allowed: jpeg, jpg, pdf, png" }` | Extension not in the allowlist |
| `415` | `{ "error": "File content is not a valid PDF, PNG or JPEG" }` | Magic bytes do not match any permitted format |
| `415` | `{ "error": "File extension (.pdf) does not match its actual content (png)" }` | Extension and content disagree |
| `415` | `{ "error": "Image dimensions exceed the permitted size" }` | PNG declares more than 8000px on a side |
| `500` | `{ "error": "Document was received but could not be saved..." }` | Persistence failure |

**Storage.** The file is written under a generated UUID name, never the name
the user supplied, so filenames can never collide or be guessed. The record
carries both:

- `name` — the sanitised display label, capped at 60 characters
- `storedAs` — the opaque filename on disk

Seeded sample documents have no `storedAs`, because no file backs them.

**curl**

```bash
curl -X POST http://localhost:5000/api/documents/upload \
     -F "file=@/path/to/report.pdf"
```

---

## 10. DELETE /api/documents/&lt;id&gt;

Delete a document by id.

**Response `200 OK`**

```json
{ "status": "success", "id": 6 }
```

**Side effects**

1. The file is removed from `backend/uploads/`.
2. The document record is removed.
3. **The timeline event whose `documentId` matches is removed**, so the timeline
   never references a document that no longer exists.
4. `database.json` is written.

**Errors**

| Status | Body | Cause |
|---|---|---|
| `404` | `{ "error": "Document not found" }` | No document with that id |

---

## 11. POST /api/medication/toggle

Invert a medication's `taken` state.

**Request body**

```json
{ "id": 1 }
```

**Response `200 OK`**

```json
{
  "status": "success",
  "medication": {
    "id": 1,
    "name": "Vitamin D3 · 60,000 IU",
    "due": "Due at 9:00 PM with dinner",
    "taken": true
  }
}
```

The response returns the medication in its **new** state. Persisted immediately.

**Errors**

| Status | Body | Cause |
|---|---|---|
| `400` | `{ "error": "'id' must be an integer" }` | `id` missing, null, a string, a boolean or a list |
| `404` | `{ "error": "Medication not found" }` | No medication with that id |
| `500` | `{ "error": "Change could not be saved." }` | Persistence failure |

---

## 12. POST /api/focus/update

Invert a focus task's `done` state.

**Request body**

```json
{ "id": 3 }
```

**Response `200 OK`**

```json
{
  "status": "success",
  "task": { "id": 3, "task": "Drink 2 more glasses of water", "done": true, "xp": 20 }
}
```

**Errors**

| Status | Body | Cause |
|---|---|---|
| `400` | `{ "error": "'id' must be an integer" }` | `id` missing, null, a string, a boolean or a list |
| `404` | `{ "error": "Task not found" }` | No task with that id |
| `500` | `{ "error": "Change could not be saved." }` | Persistence failure |

---

## 13. GET /api/documents/&lt;id&gt;/content

Serve the file behind a document. This is what the **View** button in Recent
Documents opens.

The id is resolved against the record store first and the path is confined to
the uploads folder, so files are never reachable by guessing a filename.

**Response `200 OK`** — the file itself.

| Header | Value |
|---|---|
| `Content-Type` | `application/pdf`, `image/png` or `image/jpeg`, from the stored extension |
| `Content-Disposition` | `inline; filename="<display name>.<ext>"` |
| `X-Content-Type-Options` | `nosniff` |
| `Content-Security-Policy` | `default-src 'none'; img-src 'self'` |

**Errors**

| Status | Body | Cause |
|---|---|---|
| `404` | `{ "error": "Document not found" }` | No document with that id |
| `404` | `{ "error": "This is a sample record with no file attached..." }` | Seeded record, or the file is missing from disk |

---

## Status codes used

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Document created |
| `400` | Malformed request — bad upload, or a non-integer `id` |
| `404` | Referenced id does not exist |
| `413` | Upload exceeds the 20 MB limit |
| `415` | Upload file type not permitted |
| `500` | The record store could not be written |

---

## Verification script

Paste into a terminal with the backend running. Each call should print the
described shape.

```bash
BASE=http://localhost:5000/api

curl -s $BASE/ai/status
curl -s $BASE/dashboard
curl -s $BASE/timeline
curl -s $BASE/calendar
curl -s $BASE/documents
curl -s $BASE/family
curl -s $BASE/emergency

curl -s -X POST $BASE/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Prepare questions for my doctor"}'

curl -s -X POST $BASE/medication/toggle \
     -H "Content-Type: application/json" -d '{"id":1}'

curl -s -X POST $BASE/focus/update \
     -H "Content-Type: application/json" -d '{"id":3}'

curl -s -X POST $BASE/documents/upload -F "file=@report.pdf"
curl -s -X DELETE $BASE/documents/5
```

### Persistence check

1. `POST /api/medication/toggle` with `{"id": 1}`
2. Stop the backend and start it again
3. `GET /api/dashboard` — medication `1` retains its new `taken` value
