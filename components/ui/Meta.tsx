import { Fragment, type ReactNode } from 'react';

// key  value — metadata as the system records it.
export default function Meta({ rows, className = '' }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={`kv ${className}`}>
      {rows.map(([k, v], i) => (
        <Fragment key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
