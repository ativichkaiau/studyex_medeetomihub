# studyex interface

The redesign replaces the previous 3D/livery interface with a restrained study workspace. Product identity lives in `lib/brand.ts`; the repository and deployment URL are managed separately.

## Shared structure

- `components/shell/`: sidebar, mobile drawer, status line, preference controls, shortcuts and reading progress.
- `components/ui/`: page layout, breadcrumbs, headers, panels, loading states and native modal dialogs.
- `components/library/`: curriculum index with remembered, shareable year filters.
- `components/overview/`: device-local counts and the most recently opened module.
- `components/LectureSections.tsx`: shared lesson presentation across full and focused views.
- `components/SavedTree.tsx` and `components/ProgressTelemetry.tsx`: local saved records and study activity.

All surfaces use RGB design tokens from `app/globals.css`; Tailwind opacity modifiers resolve through `tailwind.config.ts`. Dark and light palettes are explicit. Motion is restricted to short state transitions and honors both the system setting and the reader's choice.

## Behavior preserved

The redesign keeps lecture content, recall before reveal, mechanism chains, quizzes, flashcards, repair queues, concept views, OnePager links and the optional tutor/Pod integrations. Existing local data keys and module URLs remain stable. The renamed saved/progress destinations have permanent HTTP redirects from their previous routes.

Search fetches one shared index lazily. Metadata needed by saved records and telemetry comes from that index, keeping the full medical content graph out of shell client bundles. Build counts and the commit/date readout are derived from actual content and build state.

## Interaction requirements

- Search, the tutor, keyboard help and mobile navigation use the shared native `Dialog`; only one shell overlay remains open.
- An overlay blocks background interaction and scrolling, accepts Escape, and restores keyboard focus.
- Blurred recall answers are inert and hidden from assistive technology until revealed.
- Year selections update the URL hash and respond to browser navigation.
- Motion settings update across tabs and remain usable for the current visit when storage is blocked.
- Reading progress updates after navigation and changes in document height.

No domain rename is part of this migration.
