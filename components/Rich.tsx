import Link from 'next/link';

// Inline renderer for content bullets. Handles three inline syntaxes:
//   **bold**        → a quiet highlighter mark (.hl in globals.css)
//   *italic*        → emphasis (e.g. species / Latin names, book titles)
//   [[module-id]]   → internal cross-link to /lecture/module-id (shown de-kebabed)
// The *italic* delimiters are markdown-flanked — the opening * may not be
// preceded by an alphanumeric and the closing * may not be followed by one — so
// intra-token stars like "HLA-B*57:01" or "T2*" stay literal and never italicise.
// Anything else (lone *, _italic_, [[id|alias]], **[[id]]**) is rejected at build
// time by content:verify, so only these three shapes ever reach the page.
// Server-safe (no client JS).
export function Rich({ text }: { text: string }) {
  const parts = text.split(
    /(\*\*[^*]+\*\*|(?<![A-Za-z0-9])\*(?!\s)[^*]+?(?<!\s)\*(?![A-Za-z0-9])|\[\[[a-z0-9-]+\]\])/g,
  );
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <mark key={i} className="hl">
              {p.slice(2, -2)}
            </mark>
          );
        }
        if (p.length > 2 && p.startsWith('*') && p.endsWith('*')) {
          return (
            <em key={i} className="italic">
              {p.slice(1, -1)}
            </em>
          );
        }
        if (p.startsWith('[[') && p.endsWith(']]')) {
          const id = p.slice(2, -2);
          return (
            <Link key={i} href={`/lecture/${id}`} className="xref">
              {id.replace(/-/g, ' ')}
            </Link>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
