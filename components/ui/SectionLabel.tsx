import type { ReactNode } from 'react';

// EXAM_TRAPS ──────────────── meta
// The label of a document section, with an optional ordinal and a rule.
export default function SectionLabel({
  children,
  no,
  meta,
  tone,
  id,
  toc,
  as: Tag = 'h2',
}: {
  children: ReactNode;
  no?: string;
  meta?: ReactNode;
  tone?: 'danger' | 'accent';
  id?: string;
  toc?: string;
  as?: 'h2' | 'h3' | 'h4' | 'div';
}) {
  return (
    <Tag id={id} className="sec-label" data-tone={tone} data-toc={toc}>
      {no ? <span className="sec-no">{no}</span> : null}
      <span>{children}</span>
      {meta ? <span className="sec-meta">{meta}</span> : null}
    </Tag>
  );
}
