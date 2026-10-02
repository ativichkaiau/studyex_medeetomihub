import Page, { type PageWidth } from './Page';
import type { Crumb } from '../../lib/paths';

// Route loading states: the real path, one line saying what is being fetched,
// and the outline of what is coming. Pages are static, so this shows only for
// the moment a navigation takes — nothing is held back for effect.

type Shape = 'overview' | 'rows' | 'doc' | 'session' | 'log';

function Bar({ w, h = 10, className = '' }: { w: string | number; h?: number; className?: string }) {
  return <span className={`sk ${className}`} style={{ width: w, height: h }} />;
}

function Rows({ n = 8 }: { n?: number }) {
  return (
    <div className="rows">
      <div className="row row-head" style={{ ['--cols' as string]: '72px 1fr 64px' }}>
        <Bar w={28} h={8} />
        <Bar w={60} h={8} />
        <Bar w={40} h={8} className="ml-auto" />
      </div>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="row" style={{ ['--cols' as string]: '72px 1fr 64px' }}>
          <Bar w={48} />
          <Bar w={`${68 - ((i * 13) % 30)}%`} h={12} />
          <Bar w={32} className="ml-auto" />
        </div>
      ))}
    </div>
  );
}

function Doc() {
  return (
    <div className="grid gap-9">
      {[0, 1, 2].map((s) => (
        <div key={s} className="grid gap-3">
          <Bar w={120} h={9} />
          {[92, 84, 96, 61].map((w, i) => (
            <Bar key={i} w={`${w - s * 4}%`} h={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Session() {
  return (
    <div className="panel">
      <div className="panel-head">
        <Bar w={120} h={8} />
        <Bar w={60} h={8} />
      </div>
      <div className="panel-body grid gap-3">
        <Bar w="88%" h={14} />
        <Bar w="64%" h={14} />
        <div className="mt-3 grid gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="sk" style={{ height: 40 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Log() {
  return (
    <div className="grid gap-6">
      <div className="gridlines grid-cols-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-2 p-4">
            <Bar w={70} h={8} />
            <Bar w={48} h={18} />
          </div>
        ))}
      </div>
      <Rows n={6} />
    </div>
  );
}

function Overview() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Bar w={260} h={26} />
        <Bar w={200} h={10} />
      </div>
      <div className="gridlines md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid content-start gap-3 p-5">
            <Bar w={110} h={8} />
            {[80, 64, 72, 56].map((w, j) => (
              <Bar key={j} w={`${w}%`} h={11} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingView({
  crumbs,
  label,
  shape = 'rows',
  width = 'w-wide',
}: {
  crumbs: Crumb[];
  label: string;
  shape?: Shape;
  width?: PageWidth;
}) {
  return (
    <Page crumbs={crumbs} width={width}>
      <div aria-busy="true">
        <p role="status" className="label">
          {label}
        </p>
        <div className="scanline mb-8 mt-3 max-w-[200px]" aria-hidden="true" />
        <div aria-hidden="true">
          {shape === 'overview' ? <Overview /> : null}
          {shape === 'rows' ? (
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Bar w={90} h={8} />
                <Bar w={280} h={24} />
                <Bar w="56%" h={10} />
              </div>
              <Rows />
            </div>
          ) : null}
          {shape === 'doc' ? (
            <div className="grid gap-8">
              <div className="grid gap-3">
                <Bar w={140} h={8} />
                <Bar w="70%" h={26} />
                <Bar w={220} h={10} />
              </div>
              <Doc />
            </div>
          ) : null}
          {shape === 'session' ? (
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Bar w={110} h={8} />
                <Bar w="60%" h={24} />
              </div>
              <Session />
            </div>
          ) : null}
          {shape === 'log' ? <Log /> : null}
        </div>
      </div>
    </Page>
  );
}
