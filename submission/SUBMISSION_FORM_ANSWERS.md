# Submission form — everything to paste

Team NovaTra · Health Journey · IBM SkillsBuild SkillUp Hackathon 2026

Work top to bottom. Each block is ready to copy as-is.

---

## 1. Team information

```
Team Name        : NovaTra
College Name     : New Horizon College of Engineering
Project Name     : Health Journey
Team Leader Name : Mantripragada Ramaa Gayatri

Member 1 : Mantripragada Ramaa Gayatri
Member 2 : Allu Uma Eashanvi
Member 3 : Krupa L P
Member 4 : Madhumitha K
Member 5 : —
```

Phone number and email: enter your own.

---

## 2. GitHub repository

```
https://github.com/MRamaaG-08/health-journey
```

**Before pasting this, confirm the repository is public.** On GitHub:
Settings → General → scroll to Danger Zone → "Change repository visibility".
A private repo means the judges see nothing.

---

## 3. Problem statement & solution statement

**492 words — limit is 500.** Paste the text of `problem_solution.txt`.

If the form has separate Problem and Solution boxes, split it at the
"OUR SOLUTION" heading: everything above goes in Problem, everything from
"OUR SOLUTION" down goes in Solution.

---

## 4. IBM Bob technology used

**965 words — limit is 1000.** Paste the text of `ibm_bob_technology.txt`.

---

## 5. PPT or video

Choose **PPT**. Upload:

```
submission\Health_Journey_NovaTra.pptx
```

16 slides — under the 20-slide limit. If the form requires a link rather than a
file upload, the deck is also in the repository at
`submission/Health_Journey_NovaTra.pptx`, and the PDF version sits beside it so
it can be read in the browser.

---

## 6. Anything asking for a description or summary

If a field asks for a one-line description:

```
A privacy-first AI health companion that keeps your medical record on your own
device and explains it in plain language — and refuses to guess what it has not
read.
```

If a field asks what makes the project different:

```
Health Journey's assistant knows the limit of its own knowledge. Asked for a lab
value it has not read, it says so and refuses to produce a number. The
application also runs completely without external AI: a grounded local engine
computes answers directly from the record, so the product never depends on a
network connection. Every IBM Bob review session, including two where its advice
was wrong, is documented in the repository.
```

---

## Pre-submission checklist

Tick these before you press submit.

**Repository**

- [ ] Repository is **public**
- [ ] Front page reads "# Health Journey" — not "IBM Bob — Usage Evidence"
- [ ] `backend/.env` is **not** in the file list
- [ ] `IBM_Bob_Usage.md` is in the root
- [ ] `docs/bob-evidence/` has 11 files
- [ ] `submission/` has the `.pptx` and the `.pdf`
- [ ] `backend/tests/test_bob_engine.py` is there

**Form**

- [ ] Team information entered, phone and email filled in
- [ ] GitHub link pasted and clicked once to confirm it opens
- [ ] Problem & solution pasted
- [ ] IBM Bob write-up pasted
- [ ] Deck uploaded

---

## If a judge runs it

The README covers this, but for your own reference:

```powershell
git clone https://github.com/MRamaaG-08/health-journey
cd health-journey\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

```powershell
cd health-journey\frontend
npm install
npm run dev
```

Tests:

```powershell
backend\venv\Scripts\python.exe -m pytest backend/tests/test_bob_engine.py
```

---

## The three questions you may be asked

Short answers, in case there is a review call.

**"Where is the encryption?"**
There isn't any, and we don't claim any. The privacy property is locality — the
record never leaves the device. Encryption at rest is named in the README's
future work.

**"What was my glucose?"**
Let IBM Bob answer. It says it can see the document is on file but cannot read
inside a PDF, and refuses to guess.

**"How does a second person use this?"**
They can't. Single user by design, no authentication. Multi-user needs real auth
first, and that is the first item in future work.
