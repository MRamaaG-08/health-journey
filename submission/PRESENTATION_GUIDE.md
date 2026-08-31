# Health Journey — Presentation Guide

Team NovaTra · New Horizon College of Engineering
Deck: `Health_Journey_NovaTra.pptx` — 16 slides

Every slide already has its speaker notes inside the file (View → Notes Page, or
the Notes pane under the slide in PowerPoint). This document is the summary you
can hold in your hand.

---

## The one sentence to have ready

> *"Health Journey is a privacy-first health record that lives on your own device,
> with an assistant that explains it in plain language — and refuses to guess when
> it doesn't know."*

If you only get one sentence, that is the one. The refusal is the differentiator.

---

## Slide-by-slide, with timings

Total: about 7 minutes at a comfortable pace. Cut slides 3 and 15 first if you
are given 5 minutes.

| # | Slide | Time | The one thing to say |
|---|---|---|---|
| 1 | Title | 0:20 | Open with the problem, not the product name |
| 2 | The problem | 0:40 | It's a continuity problem, not a data problem |
| 3 | Why unsolved | 0:35 | Nothing owns the whole journey *and* explains it *and* keeps it private |
| 4 | Our solution | 0:35 | Land hard on "it tells you what it cannot do" |
| 5 | The product | 0:40 | "Not a mockup — running right now on this laptop" |
| 6 | Architecture | 0:25 | The dashed box can be removed and nothing breaks |
| 7 | Two-tier engine | 0:45 | Tick a medication, ask again, the answer changes |
| 8 | **Responsible AI** | **0:50** | **Read Bob's refusal aloud. This is the slide that wins the room.** |
| 9 | Live workflow | 0:35 | The persistence beat: "that survived a full restart" |
| 10 | Security | 0:30 | Every gate runs before a byte touches disk |
| 11 | Built with IBM Bob | 0:45 | Reviewer and test author, not code generator |
| 12 | **Where Bob was wrong** | **0:40** | **Nobody else will have this slide** |
| 13 | Proof | 0:25 | Clone it and run the tests yourself |
| 14 | What we don't claim | 0:35 | Say it before a judge finds it |
| 15 | Impact & roadmap | 0:30 | The next feature is the one we were honest about |
| 16 | Close | 0:20 | Say the line, then stop talking |

---

## The two slides that matter most

### Slide 8 — Responsible AI

Do not rush this. The screenshot shows IBM Bob being asked *"What was my
HbA1c?"* and answering:

> *"I can see which documents are on file … but I can't read the text inside a
> PDF or scan yet, **so I won't guess a number at you.**"*

Read that last clause out loud. Then say:

> *"Most AI health demos would produce a plausible number here. Ours refuses,
> and tells you exactly why. That rule is enforced in both engines — in the
> watsonx system prompt and in the offline branch."*

### Slide 12 — Where IBM Bob was wrong

Deliver this with confidence, not apology. It is evidence that a human engineer
was making judgements, which is precisely what the organisers asked you to show.

> *"We didn't accept everything IBM Bob told us. It told us to restrict CORS to
> port 3000 — that's the Create React App port, we use Vite on 5173. Applied
> verbatim it would have broken our own dashboard. And it found a real
> prompt-injection vector, then proposed a regex fix that we implemented and
> then defeated in testing with a plain-English filename."*

---

## The three questions you will be asked

These came out of an adversarial review. Have the answers ready — an unrehearsed
pause costs more than the answer itself.

**1. "You say privacy-first. Where is the encryption?"**

> *"There isn't any, and we don't claim any. Our privacy property is locality —
> the record never leaves the device. Encryption at rest is named in our README's
> future work. We deliberately didn't add a key stored next to the data it
> protects, because that's theatre."*

**2. "I uploaded a lab report. What was my fasting glucose?"**

Don't answer. Let the product answer. Type it into IBM Bob and let the judge read
the refusal. Then:

> *"We index the document by name, type and date. We haven't read inside the PDF,
> and it says so instead of inventing a number. OCR is the first item on our
> roadmap."*

**3. "My wife also uses this. How do we separate our records?"**

> *"You can't. It's single user by design — no accounts, no authentication. That's
> an accepted trade-off for a local-first build, and multi-user with real auth is
> named in our future work."*

---

## If you also run the live demo

Order matters. Rehearse this exact sequence at least twice.

1. **Before you start:** backend running (`python app.py`), frontend running
   (`npm run dev`), browser already on the dashboard, page reloaded once.
2. **Show the dashboard.** Let them look before you talk.
3. **Click Upload Report** — with the **mouse**, not the keyboard. Some browsers
   block a file picker opened from a key press.
4. Use a file named `lab_report_aug2026.pdf` — no brackets, commas or dashes,
   because the display name is sanitised and you want the name on screen to match
   the file you picked.
5. **Point out** the toast, the new row in Recent Documents, and the new entry at
   the top of the Journey Timeline.
6. **Click View** on the document you just uploaded — not on a sample record.
   The four seeded documents have no file behind them, so their View buttons are
   correctly greyed out. Say so before anyone asks.
7. **Ask IBM Bob** using these four, which are tested and route cleanly:
   - *What are my medications?*
   - *What should I ask my doctor?*
   - *How am I doing today?*
   - *What's in my emergency card?*
8. **Then ask** *"What was my HbA1c?"* — this is your Responsible AI moment.
9. **Persistence:** narrate the restart in three beats so the silence feels
   deliberate. *"I'm stopping the backend now. It's stopped. Starting it again.
   And reloading the browser."* Everything is still there.

**Test the View button on the actual demo machine beforehand.** A popup blocker
will swallow it silently, and that is the most environment-sensitive point in the
whole demo.

---

## Things not to do

- Don't call IBM Bob "Granite". Granite is the underlying model; IBM Bob is the
  assistant.
- Don't claim the app reads documents. It catalogues them. The distinction is
  the whole point of slide 8.
- Don't claim IBM Bob wrote the application. It reviewed it and wrote the test
  suite. That claim is verifiable; the other one isn't.
- Don't skip slide 14. Volunteering your limitations is what makes the rest of
  the deck credible.
