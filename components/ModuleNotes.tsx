'use client';

import { useEffect, useState } from 'react';
import { getNote, setNote } from '../lib/user/bookmarks';
import SectionLabel from './ui/SectionLabel';

// Personal notes for a module (localStorage, this device only). Auto-saves.
export default function ModuleNotes({ moduleId, id }: { moduleId: string; id?: string }) {
  const [text, setText] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setText(getNote(moduleId));
    setReady(true);
  }, [moduleId]);

  const onChange = (v: string) => {
    setText(v);
    setNote(moduleId, v);
  };

  return (
    <section className="doc-section mt-12" aria-labelledby={id}>
      <SectionLabel id={id} toc={id ? 'notes' : undefined} meta={ready && text.trim() ? 'notes.md · saved · this device' : 'notes.md · this device'}>
        notes
      </SectionLabel>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        aria-label="Your notes for this module"
        placeholder="your notes for this module — mnemonics, links, what you keep missing…"
        className="textarea resize-y placeholder:font-mono placeholder:text-[12.5px]"
      />
    </section>
  );
}
