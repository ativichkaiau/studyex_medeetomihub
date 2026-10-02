export interface ReferenceFrameworkChapter {
  number: number;
  title: string;
  focus: string;
}

export interface ReferenceFrameworkUnit {
  id: string;
  title: string;
  description: string;
  chapters: number[];
}

export interface ReferenceFramework {
  code: string;
  title: string;
  edition: string;
  source: string;
  description: string;
  units: ReferenceFrameworkUnit[];
  chapters: ReferenceFrameworkChapter[];
}

// Chapters follow the source contents; the five study units are studyex_medeetomihub's
// editorial grouping. Availability is derived from registered study modules.
export const robbinsBasicPathologyFramework: ReferenceFramework = {
  code: 'RBP',
  title: 'Robbins Basic Pathology',
  edition: 'Ninth edition · ©2013',
  source: 'Robbins Basic Pathology, 9th ed. (©2013)',
  description:
    'The book’s 23 chapters, arranged into five studyex_medeetomihub study units. Start with general mechanisms of disease, then follow them into organ-system pathology. These study units are an editorial grouping, not units from the textbook.',
  units: [
    {
      id: 'general-pathology',
      title: 'Unit I · General pathology',
      description: 'The mechanisms that explain how disease begins, spreads, and resolves across tissues.',
      chapters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: 'cardiovascular-hematolymphoid',
      title: 'Unit II · Cardiovascular and hematolymphoid pathology',
      description: 'Vessels, heart, blood, and lymphoid tissues as connected systems of flow, defense, and neoplasia.',
      chapters: [9, 10, 11],
    },
    {
      id: 'thoracoabdominal',
      title: 'Unit III · Thoracoabdominal organs',
      description: 'The lung, kidney, gastrointestinal tract, liver, biliary tract, and pancreas.',
      chapters: [12, 13, 14, 15, 16],
    },
    {
      id: 'reproductive-endocrine',
      title: 'Unit IV · Reproductive and endocrine pathology',
      description: 'The genital tract, breast, lower urinary tract, and hormone-producing organs.',
      chapters: [17, 18, 19],
    },
    {
      id: 'neuro-musculoskeletal-skin',
      title: 'Unit V · Musculoskeletal, nervous system, and skin',
      description: 'Structural support, peripheral and central neural tissue, and the body’s visible interface.',
      chapters: [20, 21, 22, 23],
    },
  ],
  chapters: [
    {
      number: 1,
      title: 'Cell Injury, Cell Death, and Adaptations',
      focus: 'Cellular responses, causes, reversible injury, necrosis, apoptosis, and adaptation.',
    },
    {
      number: 2,
      title: 'Inflammation and Repair',
      focus: 'Acute and chronic inflammation, mediators, leukocyte recruitment, and tissue repair.',
    },
    {
      number: 3,
      title: 'Hemodynamic Disorders, Thromboembolism, and Shock',
      focus: 'Edema, thrombosis, embolism, infarction, and shock.',
    },
    {
      number: 4,
      title: 'Diseases of the Immune System',
      focus: 'Hypersensitivity, autoimmunity, immunodeficiency, and transplant rejection.',
    },
    {
      number: 5,
      title: 'Neoplasia',
      focus: 'Tumor biology, carcinogenesis, classification, and host effects.',
    },
    {
      number: 6,
      title: 'Genetic and Pediatric Diseases',
      focus: 'Genetic mechanisms, syndromes, congenital malformations, and childhood disease.',
    },
    {
      number: 7,
      title: 'Environmental and Nutritional Diseases',
      focus: 'Toxic exposures, environmental injury, and nutritional deficiency or excess.',
    },
    {
      number: 8,
      title: 'General Pathology of Infectious Diseases',
      focus: 'Host-pathogen interactions, patterns of infection, and infectious injury.',
    },
    {
      number: 9,
      title: 'Blood Vessels',
      focus: 'Atherosclerosis, hypertension, aneurysms, vasculitis, and vascular tumors.',
    },
    {
      number: 10,
      title: 'Heart',
      focus: 'Ischemic, hypertensive, valvular, congenital, inflammatory, and cardiomyopathic disease.',
    },
    {
      number: 11,
      title: 'Hematopoietic and Lymphoid Systems',
      focus: 'Anemias, leukocyte disorders, lymphomas, leukemias, and plasma-cell neoplasms.',
    },
    {
      number: 12,
      title: 'Lung',
      focus: 'Obstructive and restrictive disease, infections, vascular disease, and lung tumors.',
    },
    {
      number: 13,
      title: 'Kidney and Its Collecting System',
      focus: 'Glomerular, tubular, interstitial, vascular, and obstructive renal disease.',
    },
    {
      number: 14,
      title: 'Oral Cavity and Gastrointestinal Tract',
      focus: 'Mucosal injury, inflammatory and infectious disease, malabsorption, and GI neoplasia.',
    },
    {
      number: 15,
      title: 'Liver, Gallbladder, and Biliary Tract',
      focus: 'Hepatocellular injury, hepatitis, cirrhosis, cholestasis, and biliary disease.',
    },
    {
      number: 16,
      title: 'Pancreas',
      focus: 'Pancreatitis, cystic lesions, and pancreatic endocrine and exocrine neoplasms.',
    },
    {
      number: 17,
      title: 'Male Genital System and Lower Urinary Tract',
      focus: 'Testis, prostate, penis, and lower urinary tract disease.',
    },
    {
      number: 18,
      title: 'Female Genital System and Breast',
      focus: 'Vulva, vagina, cervix, uterus, ovary, placenta, and breast disease.',
    },
    {
      number: 19,
      title: 'Endocrine System',
      focus: 'Pituitary, thyroid, adrenal, parathyroid, and endocrine neoplasia.',
    },
    {
      number: 20,
      title: 'Bones, Joints, and Soft Tissue Tumors',
      focus: 'Bone remodeling, arthritis, metabolic bone disease, and soft-tissue tumors.',
    },
    {
      number: 21,
      title: 'Peripheral Nerves and Muscles',
      focus: 'Peripheral neuropathy, neuromuscular junction, skeletal muscle, and myopathies.',
    },
    {
      number: 22,
      title: 'Central Nervous System',
      focus: 'CNS injury, infections, demyelination, degenerative disease, and tumors.',
    },
    {
      number: 23,
      title: 'Skin',
      focus: 'Inflammatory, infectious, immune, pigmentary, and neoplastic skin disease.',
    },
  ],
};

export const referenceFrameworkByCode: Record<string, ReferenceFramework> = {
  [robbinsBasicPathologyFramework.code]: robbinsBasicPathologyFramework,
};
