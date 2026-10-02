import type { ReactNode } from 'react';

// A quiet surface with an optional mono header: LABEL ··· meta.
export default function Panel({
  label,
  title,
  meta,
  children,
  className = '',
  bodyClassName = 'panel-body',
  id,
  as: Tag = 'section',
}: {
  label?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
  as?: 'section' | 'div' | 'aside';
}) {
  return (
    <Tag id={id} className={`panel ${className}`}>
      {label || title || meta ? (
        <div className="panel-head">
          <span className="flex min-w-0 items-center gap-2">
            {label ? <span>{label}</span> : null}
            {title ? <span className="panel-title truncate">{title}</span> : null}
          </span>
          {meta ? <span className="panel-meta">{meta}</span> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}
