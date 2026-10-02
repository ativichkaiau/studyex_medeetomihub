'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PathBar from '../components/ui/PathBar';

// A runtime error inside a page. The shell stays up; the page can be retried
// in place, and nothing stored on this device is touched.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PathBar crumbs={[{ label: 'error' }]} />
      <main id="main" className="page">
        <div className="mx-auto w-doc">
          <p className="label text-danger">RUNTIME_ERROR</p>
          <h1 className="page-title">This view failed to render.</h1>
          <dl className="kv mt-6">
            <dt>message</dt>
            <dd className="break-words">{error.message || 'unknown error'}</dd>
            {error.digest ? (
              <>
                <dt>digest</dt>
                <dd>{error.digest}</dd>
              </>
            ) : null}
            <dt>state</dt>
            <dd>local data preserved</dd>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="btn btn-primary">
              retry →
            </button>
            <Link href="/" className="btn">
              return to overview
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
