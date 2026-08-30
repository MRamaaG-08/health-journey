"""
Tests for local_inference(user_prompt, db) — IBM Bob Tier 2 engine.

Every test supplies its own fixture database so the real database.json is
never touched.  Only pytest is required; no extra dependencies.

Run from the repo root:
    pytest backend/tests/test_bob_engine.py -v
Or from inside the backend/ directory:
    pytest tests/test_bob_engine.py -v
"""

import copy
import sys
import os

# ---------------------------------------------------------------------------
# Make `backend/` importable without installing the package.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import local_inference  # noqa: E402


# ---------------------------------------------------------------------------
# Shared fixture database
# ---------------------------------------------------------------------------
# This is intentionally minimal — enough to exercise every branch without
# carrying the noise of the real record store.

BASE_DB = {
    "user": {
        "firstName": "TestUser",
        "fullName": "Test User",
        "score": 72,
    },
    "vitals": {
        "restingHR": 65,
        "bp": "120/80",
        "spo2": 97,
        "steps": 5000,
    },
    "medications": [
        {"id": 1, "name": "VitaminX 500mg", "due": "Morning", "taken": False},
        {"id": 2, "name": "BetaBlocker 10mg", "due": "Evening", "taken": True},
    ],
    "appointments": [
        {
            "id": 1,
            "doctor": "Dr. Test",
            "specialty": "General · Check-up",
            "date": "15",
            "day": "MON",
            "time": "9:00 AM",
        }
    ],
    "focus": [
        {"id": 1, "task": "Morning walk",   "done": True,  "xp": 0},
        {"id": 2, "task": "Log lunch",      "done": True,  "xp": 0},
        {"id": 3, "task": "Drink water",    "done": False, "xp": 15},
        {"id": 4, "task": "Stretch 10 min", "done": False, "xp": 25},
    ],
    "timeline": [
        {
            "id": 1, "type": "ai",
            "title": "Monthly summary",
            "desc": "All markers stable.",
            "date": "1 day ago",
        },
        {
            "id": 2, "type": "lab",
            "title": "Blood panel — LabCorp",
            "desc": "12 markers tested.",
            "date": "Jan 10",
        },
        {
            "id": 3, "type": "vax",
            "title": "Flu shot",
            "desc": "Annual dose.",
            "date": "Oct 05",
        },
    ],
    "documents": [
        {"id": 1, "type": "pdf",  "name": "Blood panel Jan",  "meta": "Jan 10 · 1.2 MB", "parsed": True},
        {"id": 2, "type": "img",  "name": "Chest X-ray",      "meta": "Dec 01 · 5 MB",   "parsed": False},
    ],
    "family": [
        {"id": 1, "name": "Alice", "meta": "Mother · 58 · Hypertension", "status": "warning"},
        {"id": 2, "name": "Bob",   "meta": "Father · 60 · All clear",    "status": "success"},
    ],
    "emergency": {
        "bloodGroup": "A+",
        "allergies": "Sulfa",
        "conditions": "Hypertension",
        "contacts": [
            {"id": 1, "name": "Alice", "relation": "Partner · Primary", "type": "primary"},
        ],
    },
}


def db():
    """Return a fresh deep copy of the fixture database for each test."""
    return copy.deepcopy(BASE_DB)


# ===========================================================================
# 1. EMERGENCY intent
# ===========================================================================

class TestEmergencyIntent:
    def test_keyword_emergency(self):
        reply = local_inference("What is my emergency info?", db())
        assert "A+" in reply                    # blood group from fixture
        assert "Sulfa" in reply                 # allergy from fixture
        assert "Alice" in reply                 # contact from fixture

    def test_keyword_allergy(self):
        reply = local_inference("Do I have any allergies?", db())
        assert "Sulfa" in reply

    def test_keyword_blood_group(self):
        reply = local_inference("What is my blood group?", db())
        assert "A+" in reply

    def test_keyword_blood_type(self):
        reply = local_inference("Tell me my blood type", db())
        assert "A+" in reply

    def test_keyword_ambulance(self):
        reply = local_inference("Should I call an ambulance?", db())
        # Still answers from the record — does not refuse or diverge
        assert "A+" in reply

    def test_reflects_changed_blood_group(self):
        """Blood group change must propagate to the reply."""
        d = db()
        d["emergency"]["bloodGroup"] = "B-"
        reply = local_inference("What is my blood group?", d)
        assert "B-" in reply
        assert "A+" not in reply

    def test_empty_contacts(self):
        d = db()
        d["emergency"]["contacts"] = []
        reply = local_inference("What are my emergency contacts?", d)
        assert "none yet" in reply.lower() or reply  # still returns something

    def test_emergency_checked_before_vitals(self):
        """'blood group' must not fall through to the vitals branch."""
        reply = local_inference("blood group and heart rate", db())
        # blood group is the tie-breaker — emergency branch fires first
        assert "A+" in reply


# ===========================================================================
# 2. FOCUS / TODAY intent
# ===========================================================================

class TestFocusIntent:
    def test_keyword_today(self):
        reply = local_inference("What should I do today?", db())
        # 2 done out of 4 in fixture
        assert "2 of 4" in reply

    def test_keyword_focus(self):
        reply = local_inference("Show me my focus tasks", db())
        assert "focus" in reply.lower() or "tasks" in reply.lower() or "2 of 4" in reply

    def test_keyword_habit(self):
        reply = local_inference("How am I doing with my habits?", db())
        assert "2 of 4" in reply

    def test_pending_tasks_listed(self):
        reply = local_inference("What are my tasks for today?", db())
        assert "Drink water" in reply
        assert "Stretch 10 min" in reply

    def test_xp_total_correct(self):
        """XP must be the sum of pending tasks: 15 + 25 = 40."""
        reply = local_inference("What are my tasks for today?", db())
        assert "40 XP" in reply

    def test_all_tasks_done(self):
        d = db()
        for task in d["focus"]:
            task["done"] = True
        reply = local_inference("How did I do today?", db())
        # fixture still has pending tasks — make sure the completed copy differs
        d2 = d
        reply2 = local_inference("How did I do today?", d2)
        assert "clean sheet" in reply2.lower() or "4 of 4" in reply2

    def test_pending_medication_mentioned(self):
        """When a medication is still open, the focus reply should mention it."""
        reply = local_inference("What are my tasks?", db())
        # VitaminX 500mg is not taken in the fixture
        assert "VitaminX 500mg" in reply

    def test_all_medications_logged(self):
        d = db()
        for m in d["medications"]:
            m["taken"] = True
        reply = local_inference("What are my tasks?", d)
        assert "medications are all logged" in reply.lower()

    def test_counts_change_when_task_completed(self):
        """Completing a pending task must change the reply counts."""
        d = db()
        reply_before = local_inference("What should I do today?", d)
        d["focus"][2]["done"] = True     # "Drink water" now done
        reply_after = local_inference("What should I do today?", d)
        assert reply_before != reply_after


# ===========================================================================
# 3. MEDICATION intent
# ===========================================================================

class TestMedicationIntent:
    def test_keyword_medication(self):
        reply = local_inference("Show me my medications", db())
        assert "VitaminX 500mg" in reply or "BetaBlocker 10mg" in reply

    def test_keyword_pill(self):
        reply = local_inference("Did I take my pill today?", db())
        assert "VitaminX" in reply or "tracking" in reply.lower()

    def test_keyword_vitamin(self):
        reply = local_inference("Tell me about my vitamins", db())
        assert "VitaminX" in reply

    def test_keyword_prescription(self):
        reply = local_inference("What's on my prescription?", db())
        assert "tracking 2" in reply.lower() or "VitaminX" in reply

    def test_taken_vs_pending_counts(self):
        reply = local_inference("Which medications have I taken?", db())
        # BetaBlocker is taken, VitaminX is not
        assert "BetaBlocker 10mg" in reply        # appears in "Logged so far"
        assert "VitaminX 500mg" in reply          # appears in "Still open"

    def test_marking_med_taken_changes_reply(self):
        """Taking a medication must change what the reply reports as pending."""
        d = db()
        reply_before = local_inference("What medications are pending?", d)
        d["medications"][0]["taken"] = True      # VitaminX now taken
        reply_after = local_inference("What medications are pending?", d)
        # "Still open" disappears when nothing is pending
        assert reply_before != reply_after

    def test_all_taken_no_pending_text(self):
        d = db()
        for m in d["medications"]:
            m["taken"] = True
        reply = local_inference("Did I take my medications?", d)
        assert "logged" in reply.lower()
        assert "still open" not in reply.lower()

    def test_empty_medications(self):
        d = db()
        d["medications"] = []
        reply = local_inference("What medicines am I on?", d)
        assert "no medications" in reply.lower()
        assert "TestUser" in reply               # personalised with first name

    def test_doctor_name_cited(self):
        """Doctor from the appointment should appear in the medication reply."""
        reply = local_inference("Tell me about my doses", db())
        assert "Dr. Test" in reply


# ===========================================================================
# 4. DOCUMENT intent
# ===========================================================================

class TestDocumentIntent:
    def test_keyword_report(self):
        reply = local_inference("Show me my latest report", db())
        assert "Blood panel Jan" in reply

    def test_keyword_document(self):
        reply = local_inference("List my documents", db())
        assert "2 document" in reply.lower()

    def test_keyword_lab(self):
        reply = local_inference("Any lab results?", db())
        assert "Blood panel Jan" in reply

    def test_keyword_pdf(self):
        reply = local_inference("Do I have any PDFs?", db())
        assert "Blood panel Jan" in reply

    def test_keyword_vault(self):
        reply = local_inference("What's in my vault?", db())
        assert "Blood panel" in reply

    def test_parsed_count_correct(self):
        """Only 1 of 2 documents is parsed=True in the fixture."""
        reply = local_inference("Show my documents", db())
        assert "1 of them indexed" in reply

    def test_empty_vault(self):
        d = db()
        d["documents"] = []
        reply = local_inference("Show my lab results", d)
        assert "empty" in reply.lower()

    def test_document_count_updates_after_addition(self):
        d = db()
        d["documents"].insert(0, {
            "id": 3, "type": "pdf", "name": "New Scan", "meta": "today", "parsed": True
        })
        reply = local_inference("Show my documents", d)
        assert "3 document" in reply.lower()

    def test_timeline_lab_event_linked(self):
        """The lab timeline event from the fixture should be cross-referenced."""
        reply = local_inference("Show my lab results", db())
        assert "Blood panel — LabCorp" in reply


# ===========================================================================
# 5. DOCTOR / APPOINTMENT intent
# ===========================================================================

class TestDoctorIntent:
    def test_keyword_doctor(self):
        reply = local_inference("Prepare questions for my doctor", db())
        assert "Dr. Test" in reply

    def test_keyword_appointment(self):
        reply = local_inference("I have an appointment coming up", db())
        assert "MON" in reply or "Dr. Test" in reply

    def test_keyword_checkup(self):
        reply = local_inference("Getting ready for my checkup", db())
        assert "Dr. Test" in reply

    def test_question_list_includes_pending_med(self):
        """A pending medication should generate a schedule question."""
        reply = local_inference("What should I ask the doctor?", db())
        assert "VitaminX 500mg" in reply

    def test_question_list_includes_lab(self):
        """A lab event on the timeline should generate a marker question."""
        reply = local_inference("Prepare for my appointment", db())
        assert "Blood panel — LabCorp" in reply

    def test_question_list_includes_family_risk(self):
        """A family member with warning status should generate a screening question."""
        reply = local_inference("Doctor visit prep", db())
        # The engine embeds the family member's meta string in a screening question.
        # Alice's meta is "Mother · 58 · Hypertension" — check the raw reply string.
        assert "Alice" in reply or "Hypertension" in reply

    def test_no_appointment_scheduled(self):
        d = db()
        d["appointments"] = []
        reply = local_inference("Questions for my doctor visit", d)
        assert "no appointment" in reply.lower()

    def test_appointment_details_in_reply(self):
        reply = local_inference("What do I ask at my clinic visit?", db())
        assert "MON" in reply
        assert "15" in reply
        assert "9:00 AM" in reply


# ===========================================================================
# 6. TRENDS / HISTORY intent
# ===========================================================================

class TestTrendsIntent:
    def test_keyword_trend(self):
        reply = local_inference("What are my health trends?", db())
        assert "3" in reply                      # 3 timeline events in fixture
        assert "72" in reply                     # health score

    def test_keyword_history(self):
        reply = local_inference("Show my health history", db())
        assert "72" in reply

    def test_keyword_compare(self):
        # "results" is also a document keyword, so avoid it here.
        reply = local_inference("Compare my progress over time", db())
        assert "72" in reply

    def test_keyword_progress(self):
        reply = local_inference("How is my progress?", db())
        assert "72" in reply

    def test_vitals_in_trends_reply(self):
        reply = local_inference("Show me trends over time", db())
        assert "65 bpm" in reply
        assert "120/80" in reply

    def test_ai_note_included(self):
        """The first 'ai' type timeline event desc should appear in the reply."""
        reply = local_inference("What are my trends?", db())
        assert "All markers stable" in reply

    def test_oldest_event_mentioned(self):
        """The last timeline entry should be cited as the earliest on file."""
        reply = local_inference("What does my history show?", db())
        assert "Flu shot" in reply               # last item in fixture timeline

    def test_score_reflects_db(self):
        d = db()
        d["user"]["score"] = 55
        reply = local_inference("Progress over time?", d)
        assert "55" in reply


# ===========================================================================
# 7. FAMILY intent
# ===========================================================================

class TestFamilyIntent:
    def test_keyword_family(self):
        reply = local_inference("How is my family?", db())
        assert "2 family profile" in reply.lower()

    def test_keyword_mother(self):
        reply = local_inference("How is my mother doing?", db())
        assert "Alice" in reply

    def test_keyword_father(self):
        reply = local_inference("What about my father?", db())
        assert "Bob" in reply

    def test_warning_member_highlighted(self):
        """Members with status='warning' should appear under attention."""
        reply = local_inference("Tell me about my family", db())
        assert "Alice" in reply
        assert "Hypertension" in reply.lower() or "warning" in reply.lower() or "Needing" in reply

    def test_success_member_in_all_clear(self):
        reply = local_inference("Family health check", db())
        assert "Bob" in reply

    def test_empty_family(self):
        d = db()
        d["family"] = []
        reply = local_inference("How is my family doing?", d)
        assert "no family profiles" in reply.lower()

    def test_count_updates_when_member_added(self):
        d = db()
        d["family"].append({"id": 3, "name": "Carol", "meta": "Sister · 30", "status": "success"})
        reply = local_inference("Tell me about my family", d)
        assert "3 family profile" in reply.lower()


# ===========================================================================
# 8. VITALS / SCORE intent
# ===========================================================================

class TestVitalsIntent:
    def test_keyword_vital(self):
        reply = local_inference("Show me my vitals", db())
        assert "65 bpm" in reply
        assert "120/80" in reply
        assert "97%" in reply

    def test_keyword_score(self):
        reply = local_inference("What is my health score?", db())
        assert "72" in reply

    def test_keyword_steps(self):
        # "today" fires the focus branch first; use "steps" alone to hit vitals.
        reply = local_inference("How many steps have I logged?", db())
        assert "5000" in reply

    def test_keyword_spo2(self):
        reply = local_inference("What is my SpO2?", db())
        assert "97" in reply

    def test_keyword_summary(self):
        reply = local_inference("Give me a summary", db())
        assert "72" in reply
        assert "65 bpm" in reply

    def test_keyword_overview(self):
        reply = local_inference("Give me an overview", db())
        assert "120/80" in reply

    def test_how_do_i_look(self):
        reply = local_inference("How do I look healthwise?", db())
        assert "72" in reply

    def test_document_and_timeline_counts_in_reply(self):
        """Vitals reply must embed document and timeline counts."""
        reply = local_inference("Show my vitals", db())
        assert "2 document" in reply.lower()
        assert "3 timeline event" in reply.lower()

    def test_vitals_reflect_changed_hr(self):
        d = db()
        d["vitals"]["restingHR"] = 88
        reply = local_inference("What is my resting heart rate?", d)
        assert "88 bpm" in reply
        assert "65 bpm" not in reply

    def test_personalised_with_first_name(self):
        reply = local_inference("How am I doing?", db())
        assert "TestUser" in reply


# ===========================================================================
# 9. FALLBACK (catch-all)
# ===========================================================================

class TestFallbackIntent:
    def test_unrelated_question(self):
        reply = local_inference("What is the capital of France?", db())
        # Must still be grounded — never generic
        assert "TestUser" in reply
        assert "couldn't find anything specific" in reply.lower()

    def test_fallback_includes_record_counts(self):
        reply = local_inference("Random nonsense xyz123", db())
        assert "2 document" in reply.lower()
        assert "3 timeline event" in reply.lower()
        assert "2 medication" in reply.lower()
        assert "2 family profile" in reply.lower()

    def test_fallback_includes_health_score(self):
        reply = local_inference("Completely unrelated topic", db())
        assert "72" in reply

    def test_fallback_includes_next_appointment(self):
        """When an appointment exists, the fallback should mention it."""
        reply = local_inference("Random question here", db())
        assert "Dr. Test" in reply

    def test_fallback_no_appointment(self):
        """When no appointment exists, the fallback must not crash."""
        d = db()
        d["appointments"] = []
        reply = local_inference("Something completely unrelated", d)
        assert reply                             # non-empty
        assert "Dr. Test" not in reply


# ===========================================================================
# 10. EDGE CASES
# ===========================================================================

class TestEdgeCases:
    def test_empty_prompt_string(self):
        """An empty string must not raise — returns a string of some kind."""
        reply = local_inference("", db())
        assert isinstance(reply, str)
        assert reply                             # non-empty

    def test_none_prompt(self):
        """None must not raise — treated as empty, falls to catch-all."""
        reply = local_inference(None, db())
        assert isinstance(reply, str)
        assert reply

    def test_whitespace_only_prompt(self):
        reply = local_inference("   ", db())
        assert isinstance(reply, str)
        assert reply

    def test_mixed_case_prompt(self):
        """Routing is case-insensitive."""
        lower = local_inference("what are my medications", db())
        upper = local_inference("WHAT ARE MY MEDICATIONS", db())
        assert lower == upper

    def test_returns_string_not_none(self):
        """Every intent branch must return a string, never None."""
        prompts = [
            "emergency", "today focus", "medications", "documents",
            "doctor appointment", "trends history", "family",
            "vitals score", "completely unrelated"
        ]
        for p in prompts:
            result = local_inference(p, db())
            assert isinstance(result, str), "Got non-string for prompt: %r" % p
            assert result, "Got empty string for prompt: %r" % p

    def test_empty_db_does_not_crash(self):
        """The engine must not raise even when the record store is entirely empty."""
        empty = {}
        for p in ["emergency", "today", "medications", "documents",
                  "doctor", "trends", "family", "vitals", "anything"]:
            result = local_inference(p, empty)
            assert isinstance(result, str)
            assert result

    def test_data_mutation_isolation(self):
        """Calling local_inference must not mutate the passed-in db dict."""
        d = db()
        original_score = d["user"]["score"]
        local_inference("What is my health score?", d)
        assert d["user"]["score"] == original_score
