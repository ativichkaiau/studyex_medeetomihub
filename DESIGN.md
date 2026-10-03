# studyex_medeetomihub — original design doc (as WilliamsHub, M-8)

> Original pedagogical and product brief. For the current studyex interface and route structure, see [docs/redesign.md](docs/redesign.md) and [README.md](README.md).

A VEStriPPN satellite. Turns **actual MedCMU lectures** into high-yield, mechanism-driven,
exam-focused pages. **Supplements OnePagers, never replaces them.** Studying = building;
building = studying.

## Prime directive (resolve every trade-off in this order)

1. **Correctness** — wrong content is worse than no content.
2. **Lecture alignment** — content comes from the real lecture, not textbook sprawl.
3. **Active recall** — the page makes you retrieve before it tells.
4. **Mechanism clarity** — chains over paragraphs.
5. **Exam usefulness** — every section maps to marks.
6. **UI beauty** — last, and only in service of the above.

> Anti-procrastination test for any feature/section: *"Does this change a behavior that
> earns marks?"* If no → cut it. Beautiful procrastination is the enemy.

---

## 1. Information architecture

```
/                      Dashboard — catalog by system, weak-spot strip, "review now"
/lecture/[id]          The lecture template (the heart of the app)
/quiz                  Mixed active-recall (filter by system/tag/weak)
/review                Error log + spaced re-surfacing of past mistakes
/tag/[kind]/[label]    Browse by system · disease · mechanism · exam · Ix · Tx
```

Navigation is flat. No nested menus. A command-bar (⌘K) for jump-to-lecture is the only
"power" nav and is Phase 2.

---

## 2. Lecture page anatomy

Fixed section order — predictability is a feature (you learn where to look). Each section
is tied to a learning job:

| Section | Job it does | Component |
|---|---|---|
| Title + system badge + source | Anchors to the real lecture | `LectureHeader` |
| **High-yield summary** | Compressed core — *recall-first by default* | `HighYieldList` + `RecallFirstGate` |
| **Mechanism chain** | "Why", as a visual chain not prose | `MechanismChain` |
| **Physical exam findings** | The marks you lost — key signs flagged | `ExamFindingsTable` |
| **Investigations** | Clue → meaning | `InvestigationList` |
| **Treatment logic** | The *reasoning*, not a drug dump | `TreatmentList` |
| **Mnemonic(s)** | Sticky hook | `MnemonicCard` |
| **Exam trap(s)** | Names the question *category* you misread | `TrapCard` |
| **Mini quiz** | Forces retrieval; feeds error log | `Quiz` |

Sections with no lecture basis stay short or absent. **Do not pad.**

### Recall-first interaction
High-yield + answers render **blurred**. A "Test yourself first" toggle reveals them.
This single design choice operationalizes priority #3 — the default state is retrieval,
not reading.

### The trap card — your actual failure mode
Built directly around your aortic-dissection miss. It pins the **question category**
("Physical examination finding"), the **seductive wrong instinct** (tachycardia from
sympathetic activation), the **right answer** (early diastolic murmur), and the **one-line
discriminator**. When you log an error, you can promote it into a trap card here.

---

## 3. Data schema

Lecture **content is code** (typed objects in `content/lectures/*.ts`), version-controlled,
no database. **Personal data** (errors, quiz attempts, progress) lives in **localStorage**.
Full types in [`lib/types.ts`](lib/types.ts); example content in
[`content/lectures/tetralogy-of-fallot.ts`](content/lectures/tetralogy-of-fallot.ts).

Why content-as-code: TypeScript makes a lecture object **fail to compile** until required
sections are filled → completeness is enforced, not hoped for. Zero backend, offline on
iPad/Mac, shareable by git.

Core shape:
```ts
Lecture = {
  id, title, system, source, updated, tags[],
  highYield: string[],
  mechanism: { steps[], branches[] },   // the visualizer
  examFindings: { sign, mechanism, significance }[],
  investigations: { clue, meaning }[],
  treatment: { logic, detail }[],
  mnemonics: { hook, expansion[] }[],
  traps: { questionCategory, wrongInstinct, rightAnswer, why }[],
  quiz: QuizQuestion[],
}
```

Mechanism steps carry `emphasis: 'key' | 'danger'` so the visualizer can highlight the
exam-critical node (★ false lumen, ★ early diastolic murmur) and the lethal branch
(⚠ tamponade).

---

## 4. Component map

```
components/
  LectureHeader.tsx       SystemBadge.tsx
  HighYieldList.tsx       RecallFirstGate.tsx   ← blur-to-reveal
  MechanismChain.tsx      ← see file, already drafted
  ExamFindingsTable.tsx   TrapCard.tsx
  InvestigationList.tsx   TreatmentList.tsx
  MnemonicCard.tsx        Quiz.tsx
  ErrorLogPanel.tsx       TagPill.tsx
lib/
  types.ts   store.ts (localStorage hooks)   tags.ts
content/lectures/*.ts  +  content/index.ts (registry)
```

---

## 5. UI/UX system (PhysioHub-grade)

- **Surfaces**: white cards on a faint canvas, 0.5px borders, 12px radius, soft shadow.
- **Type**: two weights only (400/500). Title 22, section 16. Generous line-height.
- **System colors**: cardiovascular = rose, respiratory = sky, renal = blue,
  endocrine = violet, neuro = amber, GI = emerald (system dot/badge, like PhysioHub).
- **Semantic colors**: key = accent/teal, trap/danger = red, mnemonic = purple,
  caution = amber, confirmed = green. Used as *zones*, never decoration.
- **Icons**: outline set only. No emoji.
- **Responsive**: single-column stack on iPad portrait; two-column (exam|trap,
  mnemonic|Ix-Tx) on Mac. Touch targets ≥40px for iPad.
- **Day/Night** toggle (Phase 2) — all colors via CSS variables so it's free.

---

## 6. Feature prioritization (ship in this order)

**Phase 1 — MVP (the only thing that matters first):**
- One lecture template rendering all sections from a content file.
- `MechanismChain` visualizer with key/danger emphasis.
- Trap cards + mnemonic cards.
- Inline mini quiz (reveal correct + explanation).
- Dashboard catalog by system.
- **Author 5–10 real HCVS lectures.** Content > features.

**Phase 2 — once ≥5 lectures exist and you feel friction:**
- Error log (localStorage) + promote-error-to-trap-card.
- Tag filtering + ⌘K jump.
- Mixed quiz mode across lectures.
- Day/Night.

**Phase 3 — only if data proves the need:**
- Spaced re-surfacing of logged errors (`/review` queue).
- Recall score per lecture; weak-spot strip on dashboard.
- Share-by-URL of a quiz/state (VEStriPPN-style).

**Deliberately NOT building:** accounts, multi-user, cloud DB, a CMS, an editor UI,
custom illustrations, gamification. They cost weeks and earn zero marks.

---

## 7. Authoring workflow (keeps it high-yield)

1. After a lecture, copy `content/lectures/_template.ts`.
2. Fill **from the lecture deck/notes only**. TypeScript flags missing required fields.
3. **Time budget: ≤30–45 min per lecture.** Over budget = you're textbook-expanding. Stop.
4. Add a quiz item for every spot you felt unsure.
5. When you miss a question (TBL/T-test), log it → if it's a category-misread, make a trap card.

Rule of 5: don't build a feature for content that doesn't exist yet. Build the SR engine
when you have ~20 logged errors, not before.

---

## 8. Tech stack

- **Next.js (App Router) + TypeScript + Tailwind.** Static export — runs anywhere, offline.
- Content as TS modules; no DB, no API, no auth.
- localStorage for the personal layer (`lib/store.ts`).
- Deploy: Vercel or a static host. Open on iPad/Mac, no install.

## 9. VEStriPPN integration (future, minimal)

Keep WilliamsHub standalone. The only seam worth reserving now: a stable `id` + `system`
on every lecture and `share-by-URL` state encoding, so a VEStriPPN widget could later deep-link
into a WilliamsHub mechanism or quiz. Do not build the bridge until both sides need it.

---

## Next steps
1. `npx create-next-app williamshub --ts --tailwind --app`
2. Drop in `lib/types.ts`, `components/MechanismChain.tsx`, and the 14 modules in `content/lectures/*.ts` (already authored from L1–L4).
3. Build the `/lecture/[id]` template that maps each schema field to its component.
4. Author your next 5 real HCVS lectures. Then reassess Phase 2.
