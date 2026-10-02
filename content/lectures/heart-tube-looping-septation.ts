import type { Lecture } from '../../lib/types';
import { HEART_DEVELOPMENT } from '../../lib/figures';

export const heartTubeLoopingSeptation: Lecture = {
  id: 'heart-tube-looping-septation',
  title: 'Heart Development: Tube, Looping & Septation',
  system: 'cardiovascular',
  source: 'L3 — Development of the Cardiovascular System',
  updated: '2026-07-02',
  tags: [
    { kind: 'system', label: 'Cardiovascular' },
    { kind: 'lecture', label: 'L3 CVS Development' },
    { kind: 'mechanism', label: 'Tube → loop → septate' },
    { kind: 'exam', label: 'AP septum · VSD/ASD' },
  ],

  highYield: [
    '**The heart is the first functioning organ** — it begins beating ~week 3–4. A **primary heart tube** forms from **cardiogenic (splanchnic) mesoderm** and has five regions (cranial→caudal): **truncus arteriosus → bulbus cordis → primitive ventricle → primitive atrium → sinus venosus**.',
    '**Cardiac looping (week 4):** the straight tube bends to the **RIGHT (D-loop)**, positioning the future chambers correctly (atrium moves up/behind, ventricle down/front). **Looping the wrong way (L-loop) → dextrocardia/situs abnormalities.**',
    '**Atrial septation** uses TWO septa: the **septum primum** grows down (leaving the **ostium primum**, then the **ostium secundum** as it perforates), and the **septum secundum** grows beside it, leaving the **foramen ovale** — a flap valve that lets blood shunt **right → left** in the fetus. **Failure → atrial septal defect (ASD)**.',
    '**Ventricular septation:** a **muscular** interventricular septum grows up + a **membranous** part completes it. The **membranous ventricular septal defect (VSD) is the commonest congenital heart defect.**',
    '**Outflow-tract septation:** the **truncus arteriosus is divided by a SPIRAL aorticopulmonary (AP) septum** (from **neural-crest cells**) into the **aorta + pulmonary trunk**. Errors: **persistent truncus arteriosus** (failure to divide), **transposition of the great arteries** (AP septum doesn\'t spiral), and **Tetralogy of Fallot** (unequal division → overriding aorta, pulmonary stenosis, VSD, RV hypertrophy).',
  ],

  mechanism: {
    title: 'Form tube → loop right → build the septa',
    steps: [
      { id: 's1', label: 'Heart tube (5 regions) from cardiogenic mesoderm; beats ~wk 3–4', emphasis: 'key' },
      { id: 's2', label: 'D-looping (rightward) positions the chambers', emphasis: 'key' },
      { id: 's3', label: 'Atrial: septum primum + secundum → foramen ovale (ASD if fails)', emphasis: 'key' },
      { id: 's4', label: 'Ventricular: muscular + membranous septum (VSD commonest)', emphasis: 'key' },
      { id: 's5', label: 'Outflow: spiral AP septum (neural crest) → aorta + pulmonary trunk' },
    ],
  },

  examFindings: [
    { sign: 'Membranous ventricular septal defect', mechanism: 'Commonest congenital heart defect (septation failure)', significance: 'key' },
    { sign: 'Patent foramen ovale / ASD', mechanism: 'Atrial septa fail to fuse', significance: 'key' },
    { sign: 'Tetralogy of Fallot', mechanism: 'Unequal (skewed) division by the AP septum', significance: 'key' },
    { sign: 'Transposition of the great arteries', mechanism: 'AP septum fails to spiral', significance: 'supportive' },
    { sign: 'Dextrocardia', mechanism: 'Abnormal (leftward) cardiac looping', significance: 'supportive' },
  ],

  investigations: [
    { clue: 'Commonest congenital heart defect', meaning: 'Ventricular septal defect (membranous)' },
    { clue: 'Cells forming the aorticopulmonary septum', meaning: 'Neural crest cells' },
    { clue: 'Direction of normal cardiac looping', meaning: 'Rightward (D-loop)' },
    { clue: 'Fetal flap valve in the interatrial septum', meaning: 'Foramen ovale (from septum primum/secundum)' },
  ],

  treatment: [
    { logic: 'Why it matters', detail: 'Septation errors cause the congenital heart diseases (VSD, ASD, ToF, TGA) — several of which studyex_medeetomihub covers in HCVS-2 ([[vsd]], [[asd]], [[tetralogy-of-fallot]]). Neural-crest involvement links to DiGeorge (22q11). The fetal shunts and their closure: [[fetal-circulation-shunts]].' },
  ],

  mnemonics: [
    { hook: 'Development: "Tube → Turn (D-loop, right) → Tie (septation)"', expansion: ['First organ to function'] },
    { hook: 'VSD = commonest; ASD = atrial; ToF/TGA = AP-septum (spiral) errors', expansion: ['Membranous VSD most common'] },
  ],

  traps: [
    {
      questionCategory: 'Commonest congenital heart defect',
      wrongInstinct: 'The atrial septal defect is the most common congenital heart defect',
      rightAnswer: 'The (membranous) VENTRICULAR septal defect (VSD) is the commonest congenital heart defect',
      why: 'VSD (usually the membranous part) is the single most common; ASD and others are less frequent.',
    },
  ],

  quiz: [
    {
      id: 'q1',
      stem: 'During normal cardiac development, the heart tube loops:',
      options: [
        { id: 'a', text: 'To the left (L-loop)' },
        { id: 'b', text: 'To the right (D-loop)' },
        { id: 'c', text: 'Straight down' },
        { id: 'd', text: 'It does not loop' },
      ],
      answerId: 'b',
      explanation: 'The heart tube undergoes rightward (D-) looping to position the chambers correctly. Abnormal (leftward) looping can cause dextrocardia and situs abnormalities.',
      tests: 'exam',
    },
    {
      id: 'q2',
      stem: 'The truncus arteriosus is divided into the aorta and pulmonary trunk by the spiral aorticopulmonary septum, which is derived from:',
      options: [
        { id: 'a', text: 'Endoderm' },
        { id: 'b', text: 'Neural crest cells' },
        { id: 'c', text: 'Notochord' },
        { id: 'd', text: 'Paraxial mesoderm' },
      ],
      answerId: 'b',
      explanation: 'Neural-crest cells form the spiral aorticopulmonary septum. Failure to spiral → transposition; unequal division → Tetralogy of Fallot; failure to divide → persistent truncus arteriosus.',
      tests: 'mechanism',
    },
  ],

  figures: [
    { title: 'Heart development', svg: HEART_DEVELOPMENT, caption: 'Heart tube → D-looping (rightward) → septation (atrial/ventricular/outflow); spiral AP septum splits the outflow; VSD/ASD/ToF/TGA.' },
  ],
};

export default heartTubeLoopingSeptation;
