# IBM Bob — Evidence 05: Adversarial Architecture Review

**Date:** 30 August 2026
**Tool:** IBM Bob IDE, conversational mode, read-only
**Scope:** `docs/architecture.md`, `README.md`, and the full backend source
**Outcome:** the highest-impact session of the six — one finding changed the product's core claim

---

## The prompt sent

> @docs/architecture.md @README.md
>
> Act as a technical judge at an IBM hackathon. You are about to watch a live
> demo of this project.
>
> What are the three strongest and three weakest aspects of this architecture?
> What would you press the team to defend on stage? Be blunt — I would rather
> hear the hard questions now than in front of the judges.

---

## IBM Bob's response

> I've read the architecture document, the README, and every line of `app.py`.
> Here's what I'd say on stage.

### The three strongest aspects

**S-1 — The two-tier AI engine is a genuine architectural decision, not a
workaround.** Most hackathon teams wire up an API key and pray the venue Wi-Fi
holds. You made offline capability a first-class design constraint and built a
second reasoning engine that produces live, computed answers — not canned
strings. The medication toggle example is airtight: tick a medication, ask the
same question, and the answer changes because `local_inference()` reads the live
record on every call. The 80-test suite covering all nine intent branches
demonstrates that Tier 2 is a real system, not a demo safety net. The
`/api/ai/status` transparency endpoint and the `source` field on every chat
response show you thought about explainability too. That is unusual at this
level and judges will notice it.

**S-2 — The defence against the hardest upload attack is in the code, not just
the docs.** The upload pipeline layers five gates — extension allowlist, size
limit, magic-byte sniff, extension-versus-content match, and PNG dimension check
— all before a single byte touches disk. The file is stored under an opaque
UUID, served only through a controlled route that resolves the document ID
first, and the display name is fenced in `<untrusted>` tags in the AI prompt
with an explicit system-prompt rule. That is a coherent defence-in-depth story
that most professional teams wouldn't ship to production. For a hackathon it is
exceptional.

**S-3 — The architecture document is honest about what was not built.**
Section 8 lists every trade-off explicitly: JSON file, not a database;
metadata-level parsing, not OCR; mutex, not multi-user. Judges at IBM hackathons
are senior engineers. Nothing annoys them more than a team claiming their demo
is production-ready. You've pre-answered every obvious objection, which makes
those questions boring for the judge and puts you in control of the narrative.

---

### The three weakest aspects

**W-1 — "Privacy-first" is the headline claim and the data model directly
contradicts it.**

The README leads with *"A privacy-first AI health companion"* and states *"The
record never leaves the machine unless watsonx is explicitly configured."* Both
are only true if the team controls the machine. The actual storage model is a
plaintext JSON file at a predictable path containing blood group, allergies,
diagnosed conditions, named medications with dosages, and emergency contacts.
There is no encryption at rest, no encryption of uploads, and no authentication
on any of the 13 endpoints.

> **The question a judge will ask:** *"You use the word 'encrypted' twice in your
> documentation — 'encrypted record store' in the architecture doc, 'encrypted
> health record' in the system prompt. Where is the encryption?"*

If the answer is "it's aspirational," the privacy-first framing collapses.
Either drop the encryption language, add a disclaimer, or implement at-rest
encryption for the demo.

**W-2 — IBM Bob reads metadata, but the demo implies it reads documents.**

The README says *"Upload a report and it is parsed, indexed and placed on your
timeline."* The architecture doc says *"Document parsing is metadata-level."*
The system prompt says *"Never invent lab values."* These three create a direct
contradiction the moment a judge uploads a real lab report and asks "what was my
HbA1c?" IBM Bob will either say it doesn't have that information — correct, but
the demo just implied it would — or hallucinate a value, which is catastrophic
for a health app.

> **The question a judge will ask:** *"You said it parses uploaded documents. I
> uploaded a lab report. Why doesn't IBM Bob know what's in it?"*

This is the single biggest gap between what the product appears to promise and
what it delivers.

**W-3 — The `local_inference` keyword router has visible seams that break under
natural language.**

Ordering matters — `blood group` must beat `score`, `results` beats `trends` —
and the tests found this immediately. During a live demo, a judge who phrases a
question slightly differently from the happy path will get an off-topic answer,
and they will absolutely do this.

> **The question a judge will ask:** *"I asked about my blood pressure trends
> over time and got information about my documents. Why?"*

Architecturally defensible for a hackathon, but only if you name it honestly.
Either control the questions via suggestion pills, or say in the pitch: *"Tier 2
uses keyword routing; Tier 1 uses the full language model, which is why watsonx
gives better answers to ambiguous questions."* That turns a weakness into a
feature comparison.

---

### The three questions Bob would ask on stage

1. *"Your README says 'privacy-first' and your code says 'encrypted record
   store.' Open the database.json file on screen right now and tell me what the
   patient's blood group and allergy are."* — a gotcha question; the answer will
   be on screen in two seconds.
2. *"Upload this PDF of a blood test I've prepared. Now ask IBM Bob what my
   fasting glucose was."* — a prepared judge will bring a real document.
3. *"If I'm a second patient — my wife also uses this app — how do I separate my
   record from hers?"* — the answer is "you can't, it's single-user." That's
   defensible, but an unrehearsed pause will cost you.

### Bob's closing recommendation

> Close the gap between the word "encrypted" in your docs and the reality of a
> plaintext JSON file before the presentation. Every other weakness in this
> build is either already documented or architecturally justified. That one
> word, asked under pressure by a judge who knows what it means, is the only
> thing that turns an impressive build into a credibility problem.

---

## What we did with this review

### W-1 — fixed by removing the claim, not by adding theatre

A grep found the word "encrypted" in **seven** places: the footer component, the
assistant's status line, the API offline-fallback message, the `app.py` module
docstring, `BOB_SYSTEM_PROMPT`, one `local_inference` answer string, and
`docs/architecture.md`. All seven were rewritten.

We deliberately chose **not** to add encryption. Encrypting `database.json` with
a key stored in the same folder is security theatre: the obvious follow-up
question — *"where is the key?"* — leaves the team worse off than before. The
project's genuine privacy property is **locality**: the record never leaves the
device. That claim is true and defensible, and is now stated in exactly those
terms:

> Health Journey's privacy claim is *locality* — your record stays on your
> device and is not sent to a server, sold, or tracked — not cryptography.
> Encryption at rest is named in Future Enhancements, and nothing in this
> project claims to implement it.

`docs/architecture.md` gained a new section, **"What this system does not
claim"**, stating plainly that the system is not encrypted at rest, does not read
documents, is not multi-user, and does not give medical advice.

**A worse problem was found while fixing this one.** The offline fallback in
`services/api.js` returned, whenever the backend was unreachable:

> *"I've analyzed your encrypted health records locally. Everything remains
> stable, but please consult Dr. Meera Kapoor..."*

It had analysed nothing. It fabricated a clinical reassurance in the one
situation where it had no data at all. It now reports honestly that it cannot
reach the backend and cannot read the record.

### W-2 — fixed in the product, not just in the pitch

Rather than rehearsing an answer to Bob's question 2, we made the assistant
answer it. A new intent branch ahead of the documents branch catches questions
asking for a value that would live inside a file — HbA1c, glucose, cholesterol,
creatinine, TSH, "what does the report say", and similar. The live answer:

> *"I can see which documents are on file — "Full body checkup — Aug 2026",
> "Prescription — Dr. Meera Kapoor" — with their type, size and date, but I
> can't read the text inside a PDF or scan yet, so I won't guess a number at
> you. For a specific value, open the document itself or ask Dr. Meera Kapoor at
> your appointment. Reading markers out of reports is the next thing I'm being
> taught."*

`BOB_SYSTEM_PROMPT` gained rule 3a imposing the same constraint on Tier 1, so
both engines behave identically. The word "parsed" was replaced with
"catalogued" throughout the UI and documentation.

A health assistant that visibly **refuses to guess a clinical number** is a
stronger demo moment than one that answers, and it maps directly onto the
Responsible AI theme of the Skillathon.

### W-3 — deferred, and reframed

Not implemented, for the reason given in evidence 04: the ordered chain is under
80 passing tests and replacing it hours before the deadline is an unnecessary
risk. Bob's own suggested framing was adopted verbatim into the README and the
demo script.

### The three stage questions — prepared answers

1. **"Where's the encryption?"** — *"There isn't any, and we don't claim any.
   Our privacy property is locality: the record never leaves the device.
   Encryption at rest is in future work — you'll find it named in the README's
   limitations."*
2. **"What was my glucose?"** — hand it to the product. IBM Bob answers this
   correctly and refuses to guess.
3. **"How does my wife use this?"** — *"She can't. Single user by design, no
   authentication. Multi-user needs real auth first, and that's the first item
   in future work."*

### One further change prompted by this review

W-1 drew attention to network exposure. The server had been binding to
`0.0.0.0`, publishing the unauthenticated record store to every device on the
local network — a real risk on venue Wi-Fi. The default is now `127.0.0.1`, with
a printed warning if it is ever overridden. This turns the answer to stage
question 3 from a bare admission into a mitigation: loopback-only binding plus
origin-restricted CORS.
