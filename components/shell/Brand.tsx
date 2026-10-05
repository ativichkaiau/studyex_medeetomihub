import Link from 'next/link';
import MoleculeMark from '../brand/MoleculeMark';
import { BRAND } from '../../lib/brand';
import Formula from '../brand/Formula';

// The lockup: the dexmedetomidine glyph, then studyex_medeetomihub_ — the
// trailing underscore is the cursor — and, in the sidebar, the formula line.
export default function Brand({ sub = true, className = '' }: { sub?: boolean; className?: string }) {
  return (
    <Link href="/" className={`brand ${className}`} aria-label={`${BRAND.name} — overview`}>
      <span className="brand-row">
        <MoleculeMark className="brand-molecule" />
        <span className="brand-mark">
          {BRAND.name}
          <span className="brand-cursor">_</span>
        </span>
      </span>
      {sub ? (
        <span className="brand-sub">
          <Formula /> · {BRAND.namespace} // satellite
        </span>
      ) : null}
    </Link>
  );
}
