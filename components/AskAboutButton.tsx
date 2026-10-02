'use client';

import { openAsk } from '../lib/events';

// Opens the global tutor (components/AskAI.tsx). The tutor grounds itself in
// the current module from the pathname, so this only has to open it.
export default function AskAboutButton() {
  return (
    <button type="button" onClick={openAsk} aria-label="Ask the tutor about this module" className="btn">
      ask <span className="btn-key">⌘J</span>
    </button>
  );
}
