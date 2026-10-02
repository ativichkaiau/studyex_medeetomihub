import Link from 'next/link';
import { LIBRARY_VIEWS } from '../shell/nav';

// view: [ blocks ] [ onepagers ]
export default function LibraryTabs({ current }: { current: string }) {
  return (
    <nav aria-label="Library view" className="modebar">
      {LIBRARY_VIEWS.map((view) => (
        <Link key={view.href} href={view.href} aria-current={current === view.href ? 'page' : undefined}>
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
