// The brand mark: dexmedetomidine, (S)-4-[1-(2,3-dimethylphenyl)ethyl]-1H-
// imidazole, C13H16N2, drawn as a skeletal formula. Carbons and their
// hydrogens are implicit, as chemists draw them; only the nitrogens are
// labelled. Geometry is in bond-length units with y pointing up: regular
// rings and 120° angles at every chain atom. The methyl on the stereocentre
// is a hashed bond (pointing away), which with this layout is the (S)
// enantiomer — dexmedetomidine rather than its mirror image.
//
// Pure data and arithmetic, so the same drawing renders in the page (SVG),
// in the generated icons and in the link preview.

export const COMPOUND = {
  name: 'dexmedetomidine',
  iupac: '(S)-4-[1-(2,3-dimethylphenyl)ethyl]-1H-imidazole',
  formula: 'C₁₃H₁₆N₂',
  // For typesetting with real subscripts (a monospace subscript digit takes a
  // whole character cell, which spaces "₁₃" apart).
  formulaParts: [['C', '13'], ['H', '16'], ['N', '2']] as [string, string][],
  mass: '200.28 g/mol',
  role: 'α₂-adrenergic agonist',
} as const;

type AtomId =
  | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' // benzene, c1 bears the side chain
  | 'me2' | 'me3' // ring methyls on c2 and c3
  | 'ca' | 'mea' // stereocentre and its methyl
  | 'i4' | 'n3' | 'i2' | 'n1' | 'i5'; // imidazole, attached at C4

interface Atom {
  x: number;
  y: number;
  label?: 'N';
  h?: 'below'; // an attached H drawn under the label (N1–H)
}

const ATOMS: Record<AtomId, Atom> = {
  c1: { x: 0.866, y: 0.5 },
  c2: { x: 0.866, y: -0.5 },
  c3: { x: 0, y: -1 },
  c4: { x: -0.866, y: -0.5 },
  c5: { x: -0.866, y: 0.5 },
  c6: { x: 0, y: 1 },
  me2: { x: 1.7321, y: -1 },
  me3: { x: 0, y: -2 },
  ca: { x: 1.7321, y: 1 },
  mea: { x: 1.7321, y: 2 },
  i4: { x: 2.5981, y: 0.5 },
  n3: { x: 3.5118, y: 0.9068, label: 'N' },
  i2: { x: 4.1809, y: 0.1636 },
  n1: { x: 3.6809, y: -0.7024, label: 'N', h: 'below' },
  i5: { x: 2.7027, y: -0.4945 },
};

const RINGS = {
  benzene: { x: 0, y: 0 },
  imidazole: { x: 3.3349, y: 0.0747 },
} as const;

interface Bond {
  a: AtomId;
  b: AtomId;
  order: 1 | 2;
  ring?: keyof typeof RINGS;
  hash?: boolean; // hashed wedge, narrow end at a
}

// Kekulé structures: benzene c1=c2, c3=c4, c5=c6; 1H-imidazole N3=C2, C4=C5.
const BONDS: Bond[] = [
  { a: 'c1', b: 'c2', order: 2, ring: 'benzene' },
  { a: 'c2', b: 'c3', order: 1 },
  { a: 'c3', b: 'c4', order: 2, ring: 'benzene' },
  { a: 'c4', b: 'c5', order: 1 },
  { a: 'c5', b: 'c6', order: 2, ring: 'benzene' },
  { a: 'c6', b: 'c1', order: 1 },
  { a: 'c2', b: 'me2', order: 1 },
  { a: 'c3', b: 'me3', order: 1 },
  { a: 'c1', b: 'ca', order: 1 },
  { a: 'ca', b: 'mea', order: 1, hash: true },
  { a: 'ca', b: 'i4', order: 1 },
  { a: 'i4', b: 'n3', order: 1 },
  { a: 'n3', b: 'i2', order: 2, ring: 'imidazole' },
  { a: 'i2', b: 'n1', order: 1 },
  { a: 'n1', b: 'i5', order: 1 },
  { a: 'i5', b: 'i4', order: 2, ring: 'imidazole' },
];

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MoleculeDrawing {
  width: number;
  height: number;
  stroke: number;
  bonds: Segment[]; // every bond line, double-bond inner lines included
  hashes: Segment[]; // the rungs of the hashed wedge
  labels: { x: number; y: number; text: string; size: number }[]; // centre points
  nitrogens: { x: number; y: number }[]; // atom centres, for label-free glyphs
}

/**
 * Lay the skeleton out in pixels. `bond` is the bond length; `labels: false`
 * gives the compact glyph (no letters: callers mark the nitrogens with dots),
 * and `doubles: false` drops the inner double-bond lines for tiny sizes.
 */
export function drawMolecule({
  bond = 20,
  pad = 0.45,
  stroke = 0.075,
  labels = true,
  doubles = true,
}: { bond?: number; pad?: number; stroke?: number; labels?: boolean; doubles?: boolean } = {}): MoleculeDrawing {
  const xs = Object.values(ATOMS).map((a) => a.x);
  const ys = Object.values(ATOMS).map((a) => a.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const X = (x: number) => (x - minX + pad) * bond;
  const Y = (y: number) => (maxY - y + pad) * bond;

  // Bonds stop short of a letter; label-free glyphs run to the atom.
  const gap = (id: AtomId) => (labels && ATOMS[id].label ? 0.3 : 0);
  const trim = (p: Atom, q: Atom, start: number, end: number): Segment => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    return {
      x1: X(p.x + ux * start),
      y1: Y(p.y + uy * start),
      x2: X(q.x - ux * end),
      y2: Y(q.y - uy * end),
    };
  };

  const bonds: Segment[] = [];
  const hashes: Segment[] = [];
  for (const bd of BONDS) {
    const p = ATOMS[bd.a];
    const q = ATOMS[bd.b];
    if (bd.hash) {
      // Rungs perpendicular to the bond, widening toward the far atom.
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len;
      const ny = dx / len;
      const rungs = 6;
      for (let i = 0; i < rungs; i++) {
        const t = 0.14 + (0.86 * i) / (rungs - 1);
        const half = 0.03 + 0.13 * (i / (rungs - 1));
        const cx = p.x + dx * t;
        const cy = p.y + dy * t;
        hashes.push({ x1: X(cx + nx * half), y1: Y(cy + ny * half), x2: X(cx - nx * half), y2: Y(cy - ny * half) });
      }
      continue;
    }
    bonds.push(trim(p, q, gap(bd.a), gap(bd.b)));
    if (doubles && bd.order === 2 && bd.ring) {
      // The second line sits inside the ring, a little shorter.
      const c = RINGS[bd.ring];
      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      const toward = Math.hypot(c.x - mx, c.y - my);
      const off = 0.2;
      const ox = ((c.x - mx) / toward) * off;
      const oy = ((c.y - my) / toward) * off;
      const pi = { x: p.x + ox, y: p.y + oy };
      const qi = { x: q.x + ox, y: q.y + oy };
      bonds.push(trim(pi, qi, Math.max(0.17, gap(bd.a)), Math.max(0.17, gap(bd.b))));
    }
  }

  const textSize = 0.52 * bond;
  const atomLabels: MoleculeDrawing['labels'] = [];
  const nitrogens: MoleculeDrawing['nitrogens'] = [];
  for (const atom of Object.values(ATOMS)) {
    if (!atom.label) continue;
    nitrogens.push({ x: X(atom.x), y: Y(atom.y) });
    if (!labels) continue;
    atomLabels.push({ x: X(atom.x), y: Y(atom.y), text: atom.label, size: textSize });
    if (atom.h === 'below') atomLabels.push({ x: X(atom.x), y: Y(atom.y - 0.55), text: 'H', size: textSize });
  }

  return {
    width: (maxX - minX + pad * 2) * bond,
    height: (maxY - minY + pad * 2) * bond,
    stroke: stroke * bond,
    bonds,
    hashes,
    labels: atomLabels,
    nitrogens,
  };
}
