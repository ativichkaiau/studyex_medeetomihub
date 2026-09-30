import { Bar, EyebrowHeader, FooterBar, SkeletonPage, type Vars } from '../../components/Skeleton';

// The flashcard shelf. Every block is a deck — a stack of cards with real
// thickness — and the decks drift on a slow wave while the shelf fills.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-4xl" label="Loading flashcard decks…">
      <EyebrowHeader eyebrow={90} title="26%" lines={['96%', '84%', '40%']} className="mb-8" />

      {[3, 2].map((count, y) => (
        <section key={y} className="mb-8">
          <Bar w={52} h={9} className="mb-3" />
          <div className="sk-wave grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }, (_, n) => (
              <div
                key={n}
                className="sk-card sk-stack sk-z flex flex-col gap-2 rounded-lg p-4"
                style={{ '--z': 18, '--i': y * 3 + n, '--amp': 6 } as Vars}
              >
                <div className="flex items-center gap-2">
                  <Bar w={34} h={10} className="sk-accent" />
                  <Bar w={60} h={9} />
                </div>
                <Bar w={`${74 - n * 10}%`} h={14} className="sk-ink" />
              </div>
            ))}
          </div>
        </section>
      ))}

      <FooterBar />
    </SkeletonPage>
  );
}
