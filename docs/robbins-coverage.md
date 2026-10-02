# Robbins Basic Pathology study layer

The reading spine follows the 23 chapters of *Robbins Basic Pathology*, ninth edition, by Kumar, Abbas and Aster. The supplied PDF filename includes 2012; its copyright page states ©2013, which is the year shown in the app. The five study units are studyex_medeetomihub editorial groupings, not textbook units.

## Current scope

Chapters 1–8 have 16 original introductory study modules and 48 original core questions. Each module includes a mechanism chain, findings, interpretation prompts, recall cues and exam traps. The existing practice bank also derives reinforcement questions from these notes, so practice totals can exceed the core question count. These modules cover selected core concepts; they do not claim exhaustive chapter coverage or replace the source text. Chapters 9–23 retain their outlines and have no reading or practice links until modules are registered.

| Source chapter | Printed pages | Study modules |
| --- | --- | --- |
| 1. Cell Injury, Cell Death, and Adaptations | 1–28 | Reversible/irreversible injury; cell death and adaptation |
| 2. Inflammation and Repair | 29–74 | Acute inflammation; chronic inflammation and repair |
| 3. Hemodynamic Disorders, Thromboembolism, and Shock | 75–98 | Oedema and thrombosis; embolism, infarction and shock |
| 4. Diseases of the Immune System | 99–160 | Hypersensitivity and autoimmunity; immunodeficiency, transplantation and amyloid |
| 5. Neoplasia | 161–214 | Nomenclature and behaviour; carcinogenesis and spread |
| 6. Genetic and Pediatric Diseases | 215–268 | Genetic mechanisms; developmental and paediatric pathology |
| 7. Environmental and Nutritional Diseases | 269–308 | Toxic/environmental injury; nutritional disease and obesity |
| 8. General Pathology of Infectious Diseases | 309–326 | Microbial mechanisms; host-response patterns |

The PDF stays outside the repository. No textbook figures, page images or copied chapter passages are distributed.

## Editorial corrections and cross-checks

The source supplies the chapter structure and foundational pathology. These notes deliberately avoid fixed clinical timelines or treatment algorithms. Specific corrections to the unpublished drafts include:

- Troponin denotes myocardial injury rather than a precise cell-death clock or proof of infarction. The [universal-definition statement](https://www.ahajournals.org/jaha/doi/pdf/10.1161/CIR.0000000000000617) distinguishes injury from infarction. No infarction subtype scheme or diagnostic timing algorithm is reproduced here; clinical definitions have subsequently been updated.
- Metaplasia is distinct from dysplasia and cancer, but Barrett oesophagus still carries risk without dysplasia. Treatment does not guarantee elimination of risk; see [NIDDK’s Barrett treatment overview](https://www.niddk.nih.gov/health-information/digestive-diseases/barretts-esophagus/treatment).
- The pleural-fluid example includes all three Light criteria and does not equate an exudate with proven infection; see the [British Thoracic Society pleural guideline](https://www.brit-thoracic.org.uk/document-library/guidelines/pleural-disease/pleural-disease-full-supplement/).
- Grade and anatomical stage are distinct and tumour-specific; see [NCI tumour grade](https://www.cancer.gov/about-cancer/diagnosis-staging/diagnosis/tumor-grade) and [NCI staging](https://www.cancer.gov/about-cancer/diagnosis-staging/staging).
- Normal ordinary pulse oximetry does not exclude carbon monoxide poisoning; see [CDC clinical guidance](https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html).
- Nutritional oedema is not reduced to an isolated dietary protein calculation, and historical weight-percentage cutoffs are not presented as current assessment criteria. See [WHO’s wasting and nutritional oedema guideline](https://www.who.int/publications/i/item/9789240082830).

Other corrections remove absolute ATP-based definitions of all cell death, guaranteed outcomes after saddle emboli, a fixed safe volume of gas embolism, timing-only transplant rejection diagnoses, and the conflation of skin-suture removal with fascial dehiscence.

## Registration and verification

`content/index.ts` registers the modules; `content/curriculum.ts` maps chapter sources to RBP and its study units. Availability is derived from registered modules, so homepage counts, chapter links, search, flashcards and practice share the same content. Search indexes available chapters as reading sets and retains framework anchors only for chapters without modules.

`npm run content:verify` checks registration, exact source titles, unit placement, released chapter presence, usable quizzes and cross-links. `npm run build` also regenerates search and checks static routes. Automated checks establish structural integrity, not medical peer review.
