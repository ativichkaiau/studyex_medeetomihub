'use client';

import { useEffect, useState } from 'react';
import ConceptDepthSelector from './ConceptDepthSelector';
import ConceptModeContentView from './ConceptModeContentView';
import { readConceptPreference, writeConceptPreference } from '../../lib/concept/modes';
import type { ConceptDepth, OnePagerSections } from '../../lib/concept/types';
import type { Lecture } from '../../lib/types';

// Owns the selected concept mode (localStorage-persisted) and swaps the module
// view. 'standard' renders `children` — the SERVER-rendered LectureBody passed as
// a slot — so the default view stays static/SSR; other modes render client-side
// projections. Initial state is 'standard' (matches SSR → no hydration mismatch),
// then the saved preference is applied after mount.
export default function ConceptModeController({
  lecture,
  onePager,
  toc = false,
  children,
}: {
  lecture: Lecture;
  onePager: OnePagerSections;
  toc?: boolean;
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ConceptDepth>('standard');

  useEffect(() => {
    setMode(readConceptPreference());
  }, []);

  const change = (m: ConceptDepth) => {
    setMode(m);
    writeConceptPreference(m);
  };

  return (
    <>
      <ConceptDepthSelector value={mode} onChange={change} />
      {mode === 'standard' ? (
        children
      ) : (
        <ConceptModeContentView lecture={lecture} mode={mode} onePager={onePager} toc={toc} />
      )}
    </>
  );
}
