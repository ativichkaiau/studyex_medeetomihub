// OnePager library — the user's own study one-pagers, hosted in Google Drive and
// organized by Year → Term/Module → Subject (MedCMU's own grouping). studyex_medeetomihub
// SUPPLEMENTS these; the OnePager view links out to the Drive folders.
//
// Drive links are per Term/Module folder (each folder holds several subjects'
// one-pagers). Year-3 module folders were not provided yet → driveUrl omitted.

export interface OnePagerSubject {
  code: string;
  name: string;
}

export interface OnePagerGroup {
  year: number;
  /** e.g. "Term 1", "Module 2" — the sub-label within the year. */
  term: string;
  /** Google Drive folder holding this group's one-pagers (if known). */
  driveUrl?: string;
  subjects: OnePagerSubject[];
}

export const onePagerGroups: OnePagerGroup[] = [
  // ── Year 1 ──
  {
    year: 1,
    term: 'Term 1',
    driveUrl: 'https://drive.google.com/drive/folders/1P7CTRwWOGVGyM7n5nbFDbppoK5P72Pqx',
    subjects: [
      { code: 'MBH', name: 'Molecular Basis of Human Body' },
      { code: 'HGD', name: 'Human Genetics and Developmental Biology' },
    ],
  },
  {
    year: 1,
    term: 'Term 2',
    driveUrl: 'https://drive.google.com/drive/folders/1soEWnZ6YpzaMIWIj6jEo4ZLXeK1buyoB',
    subjects: [
      { code: 'MFN', name: 'Metabolism of Fuel Nutrients in Human' },
      { code: 'ABM', name: 'Applied Biochemistry in Medicine' },
      { code: 'BMR', name: 'Intro to Biomedical Research' },
    ],
  },

  // ── Year 2 ──
  {
    year: 2,
    term: 'Module 1',
    driveUrl: 'https://drive.google.com/drive/folders/1LGag8DnkZLljngHvkhPcL6EmKoFHdkH-',
    subjects: [
      { code: 'BHCB', name: 'Basic Histology and Cell Biology' },
      { code: 'HIM', name: 'Human Immunology' },
      { code: 'EHP', name: 'Essential Human Physiology' },
      { code: 'HGA', name: 'Human Gross Anatomy' },
    ],
  },
  {
    year: 2,
    term: 'Module 2',
    driveUrl: 'https://drive.google.com/drive/folders/1BmrfGiFtl43mOMoVNdmXcyjIa4MCbc3q',
    subjects: [
      { code: 'HMS-1', name: 'Human Musculoskeletal System-1' },
      { code: 'HCVS-1', name: 'Human Cardiovascular System-1' },
      { code: 'HRS-1', name: 'Human Respiratory System-1' },
    ],
  },
  {
    year: 2,
    term: 'Module 3',
    driveUrl: 'https://drive.google.com/drive/folders/1p-2WhF7NCklH9JlUuH0ple3eG2K6Ig2m',
    subjects: [
      { code: 'HGB-1', name: 'Human Gastrointestinal and Biliary Tract System-1' },
      { code: 'HRP-1', name: 'Human Reproductive System and Perinatal Period-1' },
    ],
  },
  {
    year: 2,
    term: 'Module 4',
    driveUrl: 'https://drive.google.com/drive/folders/1I5mz0LQMIHMc8eV4v8Z4vCQ4wldTzIvb',
    subjects: [
      { code: 'HRU-1', name: 'Human Renal and Urinary System-1' },
      { code: 'HNS-1', name: 'Human Nervous and Special Senses System-1' },
    ],
  },
  {
    year: 2,
    term: 'Module 5',
    driveUrl: 'https://drive.google.com/drive/folders/1SqowuBE7bu17JtPVmvriOL4ZpCp1Ak2J',
    subjects: [
      { code: 'MHI', name: 'Microbiology of Human Infectious Diseases' },
      { code: 'PHI', name: 'Parasitology of Human Infectious Diseases' },
      { code: 'BAP', name: 'Basic Human Anatomical Pathology' },
      { code: 'BCP', name: 'Basic Clinical Pharmacology' },
      { code: 'HEN-1', name: 'Human Endocrine System-1' },
    ],
  },

  // ── Year 3 (Drive folders not provided yet) ──
  {
    year: 3,
    term: 'Module 1',
    subjects: [
      { code: 'HEN-2', name: 'Human Endocrine System-2' },
      { code: 'HMS-2', name: 'Human Musculoskeletal System-2' },
      { code: 'HNS-2', name: 'Human Nervous and Special Senses System-2' },
    ],
  },
  {
    year: 3,
    term: 'Module 2',
    subjects: [
      { code: 'HCVS-2', name: 'Human Cardiovascular System-2' },
      { code: 'HRS-2', name: 'Human Respiratory System-2' },
      { code: 'HGB-2', name: 'Human Gastrointestinal and Biliary Tract System-2' },
    ],
  },
  {
    year: 3,
    term: 'Module 3',
    subjects: [
      { code: 'HHL', name: 'Human Hematopoietic and Lymphoreticular System' },
      { code: 'HSC', name: 'Human Skin and Connective Tissue' },
    ],
  },
  {
    year: 3,
    term: 'Module 4',
    subjects: [
      { code: 'HRP-2', name: 'Human Reproductive System and Perinatal Period-2' },
      { code: 'HRU-2', name: 'Human Renal and Urinary System-2' },
      { code: 'ACP', name: 'Applied Clinical Pharmacology' },
    ],
  },
  {
    year: 3,
    term: 'Module 5',
    subjects: [
      { code: 'BEH', name: 'Behavioral Science' },
      { code: 'ERS-1', name: 'Essential Research Skill-1' },
      { code: 'ICH', name: 'Intro to Community Health' },
    ],
  },
  {
    year: 3,
    term: 'Module 6',
    subjects: [
      { code: 'IFH', name: 'Intro to Family Health' },
      { code: 'FCP-1', name: 'Fundamentals of Clinical Practice-1' },
    ],
  },
];

export const onePagerYears = [...new Set(onePagerGroups.map((g) => g.year))].sort();
