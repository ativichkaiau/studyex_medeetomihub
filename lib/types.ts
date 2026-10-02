// studyex_medeetomihub (formerly WilliamsHub, M-8) — content + personal-layer data model.
//
// Design rule: lecture CONTENT is code (typed objects, version-controlled, no DB).
// PERSONAL data (errors, quiz attempts, progress) lives in localStorage only.
// This keeps the app single-user, offline-first, and zero-backend — matching the
// VEStriPPN "no sign-in, nothing to install" ethos.

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export type SystemId =
  | 'cardiovascular'
  | 'respiratory'
  | 'renal'
  | 'endocrine'
  | 'neuro'
  | 'gi'
  | 'heme'
  | 'msk'
  | 'repro'
  | 'immune'
  | 'molecular' // foundational biochemistry / molecular biology (e.g. MBH)
  | 'research' // research methods / evidence / ethics (e.g. BMR)
  | 'histology' // basic histology / cell biology / tissue microanatomy (e.g. BHCB)
  | 'physiology' // general/cell/neuro physiology (e.g. EHP)
  | 'parasitology' // parasitology, helminthology & medical entomology (e.g. PHI)
  | 'pharmacology' // basic & clinical pharmacology — PK/PD & drug classes (e.g. BCP)
  | 'derm' // skin & connective tissue / dermatology (e.g. HSC)
  | 'microbiology' // medical bacteriology, virology & mycology (e.g. MHI)
  | 'pathology' // general/anatomical pathology — cell injury, inflammation, neoplasia (e.g. BAP)
  | 'community' // family, community & behavioral health / social & preventive medicine (e.g. IFH, ICH, BEH)
  | 'clinical'; // fundamentals of clinical practice — history-taking & approach to symptoms (e.g. FCP)

export type TagKind =
  | 'system'
  | 'lecture'
  | 'disease'
  | 'mechanism'
  | 'exam'          // physical examination finding
  | 'investigation'
  | 'treatment';

export interface Tag {
  kind: TagKind;
  label: string;
}

// ---------------------------------------------------------------------------
// Mechanism chain (the core visualizer)
// ---------------------------------------------------------------------------

export type Emphasis = 'normal' | 'key' | 'danger';

export interface MechanismStep {
  id: string;
  label: string;        // short node text, e.g. "False lumen"
  detail?: string;      // optional reveal-on-hover/tap explanation
  emphasis?: Emphasis;  // 'key' = exam-critical, 'danger' = lethal branch
}

export interface MechanismBranch {
  fromId: string;             // step the branch forks off
  title?: string;             // e.g. "Ascending involvement"
  steps: MechanismStep[];
}

export interface MechanismChain {
  title: string;
  steps: MechanismStep[];     // ordered spine, rendered left→right with arrows
  branches?: MechanismBranch[];
}

// ---------------------------------------------------------------------------
// Lecture page sections
// ---------------------------------------------------------------------------

export interface ExamFinding {
  sign: string;                         // "Early diastolic murmur"
  mechanism: string;                    // why it happens (one line)
  significance?: 'key' | 'supportive';  // 'key' = the discriminating sign
}

export interface Investigation {
  clue: string;        // "Widened mediastinum on CXR"
  meaning: string;     // what it tells you
}

export interface TreatmentLogic {
  logic: string;       // "Impulse control before vasodilation"
  detail?: string;     // why / sequence
}

export interface Mnemonic {
  hook: string;        // "Root Rip = Regurg Murmur"
  expansion: string[]; // ["Aortic root ripped", "→ acute AR", "→ early diastolic murmur"]
}

export interface TrapCard {
  questionCategory: string; // the lens the question is really testing
  wrongInstinct: string;    // the seductive wrong answer
  rightAnswer: string;      // what they actually wanted
  why: string;              // the one-line discriminator
}

export interface QuizQuestion {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  answerId: string;
  explanation: string;
  tests?: TagKind;          // which lens this question drills (often 'exam')
}

export interface Figure {
  title: string;
  caption?: string;
  ecg?: string; // rhythm name → <EcgStrip> (e.g. 'afib', 'mobitz-i', 'stemi')
  svg?: string; // raw inline SVG (physiology / pathology figures)
  murmur?: string; // murmur name → <MurmurStrip> (e.g. 'aortic-stenosis', 'mvp')
}

export interface Lecture {
  id: string;               // 'aortic-dissection'
  title: string;
  system: SystemId;
  source: string;           // 'HCVS — Aortic Diseases (MedCMU, 2026)'
  updated: string;          // ISO date
  tags: Tag[];

  highYield: string[];      // 3–6 bullets, the compressed core
  mechanism: MechanismChain;
  examFindings: ExamFinding[];
  investigations: Investigation[];
  treatment: TreatmentLogic[];
  mnemonics: Mnemonic[];
  traps: TrapCard[];
  quiz: QuizQuestion[];
  figures?: Figure[]; // optional EKG / physiology / pathology diagrams
}

// ---------------------------------------------------------------------------
// Personal layer (localStorage) — never shipped in content files
// ---------------------------------------------------------------------------

export type ErrorCategory =
  | 'question-category-misread' // answered the wrong KIND of question (your dissection miss)
  | 'knowledge-gap'
  | 'mechanism-gap'
  | 'careless';

export interface ErrorLogEntry {
  id: string;
  lectureId: string;
  date: string;
  myAnswer: string;
  correctAnswer: string;
  category: ErrorCategory;
  rootCause: string;   // honest one-liner
  fixCue: string;      // the correction to re-read before next test
  resolved: boolean;
}

export interface QuizAttempt {
  questionId: string;
  lectureId: string;
  chosenId: string;
  correct: boolean;
  date: string;
}

export interface Progress {
  lectureId: string;
  lastReviewed?: string;
  recallScore?: number; // rolling % correct
  starred?: boolean;
}
