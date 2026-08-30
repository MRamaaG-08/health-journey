# Health Journey Architecture

## Overview

Health Journey follows a modern client-server architecture.

```
Frontend (React)
        │
        │
        ▼
Backend (Node.js + Express)
        │
        │
        ▼
Supabase Database
        │
        │
        ▼
IBM Bob AI Services
```

---

## Frontend

Responsible for:

- User Interface
- Navigation
- Forms
- Dashboard
- Timeline
- AI Chat

---

## Backend

Responsible for:

- Authentication
- Business Logic
- API Endpoints
- AI Requests
- Database Communication

---

## Database

Stores:

- Users
- Family Members
- Appointments
- Timeline Events
- Documents
- Reminder Data

---

## IBM Bob

Used for:

- AI Journey Snapshot
- Appointment Preparation
- AI Conversation Notes
- Healthcare Navigation
- Document Organization

---

## Design Principle

AI assists healthcare organization.

Healthcare decisions remain with qualified medical professionals.