# IBM Bob — Evidence 08: Responsible AI Review

**Date:** 30 August 2026
**Tool:** IBM Bob IDE, conversational mode, read-only
**Framework:** IBM's principles — transparency, explainability, fairness, robustness, privacy, accountability
**Why this session:** Week 2 of the Skillathon was *Building Responsible AI Solutions*. This review assesses the product against that theme directly.

---

## The prompt sent

> @backend/app.py
>
> This is a health application. Act as a Responsible AI reviewer assessing it
> against the principles IBM promotes: transparency, explainability, fairness,
> robustness, privacy, and accountability.
>
> Examine specifically:
> - BOB_SYSTEM_PROMPT and the six rules it imposes on the model
> - local_inference() — the offline engine's answers, including how it refuses
>   to state a value it cannot read from a document
> - The /api/ai/status endpoint and the "source" field on every chat response
> - build_health_context() and the <untrusted> fencing of user-supplied names
>
> Where does this application uphold responsible AI principles, and where does
> it fall short? Be specific about the failure modes that would matter to a
> patient, not just to an engineer. Do not edit any files.

---

## Where IBM Bob judged the application to uphold the principles

**Transparency — strong.** `/api/ai/status` and the `source` field are the
clearest expression of the principle in the codebase. Every chat response
carries `source` (`watsonx` or `local`), `engine` (the exact model ID), and
`groundedOn` (counts of the records that formed the context). A patient or
reviewer can always tell *which system spoke* and *what it was looking at*.
Bob noted that most AI products hide their degraded mode; this one publishes it.

**Explainability — solid for Tier 2.** `local_inference()` is explainable by
construction. *"You've cleared 2 of 4 focus tasks today"* is not inferred, it is
computed from `len(focus_done)` and `len(focus)`. Any answer can be reproduced
by reading the JSON and the function together. No probabilistic components, no
hidden weights.

**Robustness — principled design.** Bob singled out rule 3a as *"the strongest
single safety constraint in the file"*, because it addresses the most dangerous
failure mode in a health AI: a model that appears to have read a document and
confidently states a lab value it hallucinated. On the phrasing of the Tier 2
refusal, Bob observed:

> *"The phrase 'I won't guess a number at you' is precise and patient-facing. It
> does not say 'I don't know' (which could imply the answer exists somewhere
> else in the record). It says the data is present but unreadable by this
> system. That is the honest state of affairs and it is said clearly."*

**Privacy — local by design.** The record never leaves the machine unless the
patient configures watsonx. What is sent is the output of
`build_health_context()` — a compact serialisation, not the raw JSON and not the
uploaded files.

---

## Where IBM Bob judged the application to fall short

| # | Principle | Severity | Finding |
|---|---|---|---|
| P-01 | Transparency / Accountability | **Critical** | Seeded health score presented as a personal assessment, never qualified |
| P-02 | Explainability / Transparency | **High** | `parsed: True` misrepresents what was done to a document; seed timeline shows lab values implying the AI read the report |
| P-03 | Fairness | **High** | Emergency branch returns "none recorded" for a missing allergy — indistinguishable from a confirmed absence |
| P-04 | Accountability | **High** | No conversation history — what IBM Bob said is unauditable and unrecoverable |
| P-05 | Robustness | **Medium** | Tier 1 output is not validated; a model violating the safety rules reaches the patient |
| P-06 | Transparency | **Medium** | Patients cannot see the rules IBM Bob operates under |
| P-07 | Fairness | **Low** | No locale or cultural-context instruction |

Bob's own ranking of what matters most *to a patient rather than an engineer*:
**P-01**, **P-03** and **P-04** — and it noted that all three exist equally in
Tier 2, independent of whether watsonx is running.

### P-01 in Bob's words

> *"A patient reading 'Here's where you stand, Ramaa: health score 87/100' has
> every reason to believe this is a computed assessment of their health. It is
> not. It is a seeded placeholder integer. It cannot go up. It cannot go down…
> Presenting a static number as a personal health assessment is a form of
> confabulation — it creates a false belief in the patient about their own
> health status. A patient who sees 87/100 and is actually pre-diabetic with
> deteriorating HbA1c may find that number reassuring in a way that delays
> care."*

### P-03 in Bob's words

> *"In an emergency context, 'none recorded' and 'no allergies' are meaningfully
> different statements, but IBM Bob presents both the same way: as a statement
> of fact… The emergency card is the section most likely to be consulted under
> stress, by a third party, and with the highest consequence for error. Yet it
> is the section with the least robustness in how it presents uncertain or
> absent data."*

---

## What we did with this review

### P-01 — implemented

Two changes, because the score appears in two places:

1. **In IBM Bob's own answer.** The vitals branch now reads:

   > *"Here's what your record holds, Ramaa: health score 87/100, resting heart
   > rate 62 bpm… **These are sample figures in this build, not readings taken
   > from a device — treat them as placeholders, not as an assessment of your
   > health.** 4 documents and 5 timeline events are on file."*

2. **In the interface.** A persistent line in the footer:
   *"Demo build · vitals and health score are sample values, not device
   readings."*

The wording was chosen deliberately. "Sample values, not device readings" states
what the number **is** and what it **is not**, rather than the vaguer "demo
data", which a patient could read as merely meaning "example patient".

### P-02 — implemented in part

The user-facing language was corrected: "parsed and indexed" became
"catalogued", and the timeline entry written on upload now says *"Catalogued by
IBM Bob and linked to your health record by name, type and date"* rather than
"Securely indexed".

The `parsed` field name itself was **not** renamed to `metadataOnly`. That is a
breaking API change touching the frontend, the seed data and the documentation,
and the misleading implication is carried by the user-facing wording rather than
the field name, which no patient sees. Recorded as future work.

Bob's observation about the *seed* timeline entry claiming *"28 of 31 markers in
range. HbA1c improved to 5.4%"* is correct and is the sharpest remaining
instance of P-02. It is left in place as illustrative sample content, and the
demo script instructs the presenter to identify it as sample data rather than as
AI output.

### P-03 — implemented

The emergency branch now distinguishes an absent field from a negative finding:

> *"Your emergency card reads: blood group O+; **no allergies recorded — this
> means nothing has been entered, not that there are none**; conditions:
> Pre-diabetic."*

Verified by emptying the allergy field and re-asking. When the field is
populated, the answer reads normally.

### P-04, P-05, P-06, P-07 — accepted, deferred, documented

All four are correct and none were implemented, because each adds a new
subsystem hours before a deadline:

- **P-04** an auditable conversation log
- **P-05** post-generation validation of Tier 1 answers
- **P-06** a published statement of IBM Bob's operating rules, visible in-app
- **P-07** locale and cultural-context instruction

P-04, P-05 and P-06 are now named explicitly in the README's Known Limitations
and Future Enhancements. In particular the README now states:

> **Tier 1 output is not validated.** The safety rules are instructions in the
> prompt, not a post-generation check, so a model that violates them would not
> be caught. Tier 2 has no such gap, because its answers are composed from the
> record rather than generated.

That sentence exists because of P-05. Documenting a known weakness precisely is
itself the transparency principle in action, and it is a better answer to a
judge than silence.

### Why this session mattered most

The other reviews found defects. This one found a **claim** — that a seeded
integer was being presented to a patient as an assessment of their health. No
test would have caught it, no linter, and no code review focused on correctness.
It required someone to ask what the output *means to the person reading it*.
