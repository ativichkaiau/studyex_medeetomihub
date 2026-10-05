import { COMPOUND } from '../../lib/molecule';

// C₁₃H₁₆N₂ set with real subscripts: small digits on a lowered baseline, so a
// monospace line does not space them a full character apart.
export default function Formula({ className = '' }: { className?: string }) {
  return (
    <span className={`formula ${className}`} aria-label={COMPOUND.formulaParts.map(([el, n]) => `${el}${n}`).join('')}>
      {COMPOUND.formulaParts.map(([el, n]) => (
        <span key={el} aria-hidden="true">
          {el}
          <sub>{n}</sub>
        </span>
      ))}
    </span>
  );
}
