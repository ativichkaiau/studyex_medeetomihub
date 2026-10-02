import Link from 'next/link';
import { BRAND } from '../../lib/brand';

// studyex_medeetomihub_ — the trailing underscore is the cursor.
export default function Brand({ sub = true, className = '' }: { sub?: boolean; className?: string }) {
  return (
    <Link href="/" className={`brand ${className}`} aria-label={`${BRAND.name} — overview`}>
      <span className="brand-mark">
        {BRAND.name}
        <span className="brand-cursor">_</span>
      </span>
      {sub ? <span className="brand-sub">{BRAND.namespace} // satellite</span> : null}
    </Link>
  );
}
