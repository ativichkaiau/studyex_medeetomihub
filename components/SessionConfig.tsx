import Link from 'next/link';
import PageHeader from './ui/PageHeader';
import Meta from './ui/Meta';

// The readout above a practice run: what scope it draws from, how big the
// pool is, and what one run samples. The session starts immediately below.
export default function SessionConfig({
  scope,
  title,
  pool,
  modules,
  mode,
  back,
}: {
  scope: string;
  title: string;
  pool: number;
  modules: number;
  mode: string;
  back: { href: string; label: string };
}) {
  return (
    <PageHeader
      kicker={
        <>
          <strong>practice session</strong>
          <span>{scope}</span>
        </>
      }
      title={title}
      className="mb-7"
    >
      <Meta
        className="mt-5"
        rows={[
          ['scope', scope],
          ['pool', `${pool.toLocaleString('en-US')} question${pool === 1 ? '' : 's'} · ${modules} module${modules === 1 ? '' : 's'}`],
          ['sample', `${Math.min(20, pool)} per run · reshuffled`],
          ['mode', mode],
        ]}
      />
      <p className="mt-4">
        <Link href={back.href} className="cmd">
          ← {back.label}
        </Link>
      </p>
    </PageHeader>
  );
}
