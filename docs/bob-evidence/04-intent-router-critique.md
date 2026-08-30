# IBM Bob — Evidence 04: Intent Router Design Critique

**Date:** 30 August 2026
**Tool:** IBM Bob IDE, conversational mode, read-only
**Scope:** `local_inference()` and the `_match()` helper in `backend/app.py`
**Outcome:** design accepted as correct, implementation deliberately deferred

---

## The prompt sent

> @backend/app.py
>
> Look at `local_inference` and the `_match` helper. Intent is classified by an
> ordered chain of `if` statements, each testing whether any keyword from a list
> appears as a substring of the lowercased prompt.
>
> Two real bugs came from this design: the keyword 'xp' matched inside the word
> "explain", and 'blood' in the documents branch swallowed "what is my blood
> group" before the emergency branch could see it.
>
> Critique the design. What structure would make intent routing
> order-independent and immune to substring collisions, without adding a machine
> learning dependency? Show me the shape of the alternative, not a full rewrite.

---

## IBM Bob's response

### What the code actually does

`_match()` is a single line:

```python
def _match(prompt, *keywords):
    return any(k in prompt for k in keywords)
```

`k in prompt` is Python's `str.__contains__` — a substring test with no concept
of word boundaries. The nine `if` blocks that call it form a priority queue
encoded purely as *file order*. The reader must mentally simulate the chain
top to bottom to know which intent wins. There is no data structure that makes
that chain visible or testable as a unit.

### The four concrete failure modes

**1. Substring collision — `xp` in `explain`**
`'xp' in 'explain my blood pressure trend'` is `True`. The focus branch fires.
The bug is invisible until you type the word "explain," because nothing signals
that `xp` is a risky two-character fragment.

**2. Prefix collision — `blood` swallowing emergency phrases**
Both `'blood'` and `'blood group'` match *"what is my blood group"*. The outcome
depends entirely on which branch appears first. Move a branch for an unrelated
reason and you silently rewire intent routing. The more-specific match should
always beat the less-specific one, but the design has no mechanism for
specificity — only position.

**3. Ordering is load-bearing but invisible**
The comment *"checked first: highly specific phrases"* is correct, but it is the
only mechanism. Reorder two `if` blocks during a refactor and the routing
changes without any test failing.

**4. Every new keyword is a global side effect**
Adding `'result'` to the documents list makes *"show my test results"* hit
documents rather than trends. The branches are not independent; they form a
coupled chain.

### The structural diagnosis

The design conflates two separate concerns:

- **Recognition:** does this prompt belong to this intent?
- **Priority:** if it matches several, which one wins?

Both are handled by a single mechanism — file order — which makes neither
explicit, testable, or maintainable.

### The alternative: scored intent dispatch

**1. Word-boundary matching instead of substring matching**

```python
def _score(prompt: str, *terms: str) -> int:
    """Count how many terms match as whole words or exact phrases."""
    total = 0
    for term in terms:
        pattern = r'\b' + re.escape(term) + r'\b'
        if re.search(pattern, prompt):
            total += 1
    return total
```

`_score(p, 'xp')` on *"explain my blood pressure"* returns `0`, because `xp` is
not a standalone word. The collision is resolved by the matching function, not
by file order.

**2. An intent table instead of chained if-blocks**

```python
INTENT_TABLE = [
    ('emergency', _handle_emergency,
        'emergency', 'allergy', 'allergies', 'blood group', 'blood type',
        'ambulance', 'emergency contact', 'next of kin'),
    ('focus', _handle_focus,
        'today', 'focus', 'task', 'habit', 'streak', 'goal',
        'this week', 'this month', 'what next'),
    ('documents', _handle_documents,
        'report', 'document', 'upload', 'blood test', 'blood work',
        'lab', 'scan', 'x-ray', 'pdf', 'vault'),
    # ... one row per intent
]
```

`'blood'` is gone from the documents list entirely, replaced by the precise
phrases `'blood test'` and `'blood work'`. `'xp'` is gone from focus — `'task'`,
`'streak'` and `'goal'` carry the intent without the collision risk.

**3. A dispatcher that picks by score, with explicit tie-breaking**

```python
def _dispatch(prompt: str, db: dict) -> str:
    p = prompt.lower().strip()
    best_intent, best_score = None, 0
    for intent_name, handler, *terms in INTENT_TABLE:
        s = _score(p, *terms)
        if s > best_score:
            best_score, best_intent = s, (handler, db)
    if best_score == 0:
        return _handle_fallback(p, db)
    handler, db = best_intent
    return handler(p, db)
```

On a tie you have an explicit choice: prefer the first table entry, or prefer
the intent whose matching terms are longer on average. Either policy is one line
and visible at the call site.

### What this buys you

| Property | Current design | Scored dispatch |
|---|---|---|
| `xp` collision | Breaks if `xp` appears in any word | Impossible — `\b` requires a word boundary |
| `blood` vs `blood group` | Depends on branch order | `blood group` always scores higher |
| Adding a keyword | Side effect on all branches below | Scoped to one intent entry |
| Priority mechanism | Implicit file position | Explicit score plus a stated tie-break |
| Testable in isolation | Needs an integration test per branch | `_score` is a pure function, unit-testable |
| New intent | Insert an `if` at the right position | Append a row; the dispatcher finds it |

### The one thing this still cannot do

Scored dispatch with word-boundary matching eliminates both reported bugs and
the structural fragility. What it cannot do is understand paraphrase.
*"How are my vitals holding up?"* scores 0 for every intent and the fallback
fires. That is still better than the current design firing the *wrong* handler —
a correct fallback is more honest than a wrong answer — but it is the ceiling of
any keyword system without the language model.

Bob's closing framing: *"Tier 2 handles the well-formed queries; ambiguous
paraphrase is exactly why Tier 1 exists."*

---

## What we did with this critique

### Decision: accepted as correct, implementation deferred

The diagnosis is right, and the proposed structure is a genuine improvement.
It was **not** implemented, for a specific and defensible reason: at the time of
this review the existing ordered chain was covered by 80 passing tests
(evidence 02) which pin its exact behaviour. Replacing the router hours before a
submission deadline would have invalidated that safety net and risked the demo,
in exchange for a refactor that changes no user-visible behaviour.

The design is recorded as future work in both `README.md` and
`docs/architecture.md`:

> Scored intent dispatch with word-boundary matching, replacing the ordered
> keyword chain in the offline engine.

### The critique changed how the product is described

Bob's closing sentence became the project's honest framing of the two-tier
design. `README.md` now states, under Known Limitations:

> **Tier 2 uses keyword routing, not language understanding.** The offline
> engine classifies a question by matching keywords in a fixed priority order.
> It answers well-formed questions accurately, but an unusual paraphrase can
> fall through to the grounded fallback. Handling free-form paraphrase is
> precisely what Tier 1 (watsonx) is for.

This converts a weakness into an explicit statement of why the architecture has
two tiers, rather than leaving a judge to discover the seam unaided.

### The critique was immediately useful in practice

Shortly after this review we added a new intent branch, and initially included
the phrase `'what was my'` in its keyword list. It hijacked *"What was my health
score?"* and *"What was my blood pressure?"* — precisely failure mode 4 from
Bob's analysis, "every new keyword is a global side effect." Having the failure
mode named in advance made it obvious what had gone wrong, and the keyword was
narrowed before the change was committed.
