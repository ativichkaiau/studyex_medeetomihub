import { Bar, FooterBar, LiveryHeader, SkeletonPage, type Vars } from '../../../../components/Skeleton';

// A block's practice menu. The mixed set keeps sliding out on top, and the
// lectures run down the sheet like a ladder going away from you.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl" label="Loading block practice…">
      <LiveryHeader back={90} label={110} title="50%" lines={['92%', '60%']} pill />

      <div className="sk-card sk-pull sk-z mb-6 flex items-center justify-between gap-3 p-4" style={{ '--z': 30 } as Vars}>
        <div className="min-w-0 flex-1">
          <Bar w={150} h={10} className="sk-accent" />
          <Bar w={210} h={13} className="sk-ink mt-2 max-w-full" />
        </div>
        <Bar w={44} h={10} />
      </div>

      <Bar w={90} h={10} className="mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, n) => (
          <div
            key={n}
            className="sk-card sk-z flex items-center justify-between gap-3 rounded-lg p-4"
            style={{ '--z': 22 - n * 7, '--i': n } as Vars}
          >
            <div className="min-w-0 flex-1">
              <Bar w={180 + (n % 3) * 40} h={13} className="sk-ink max-w-full" />
              <Bar w={70} h={9} className="mt-2" />
            </div>
            <Bar w={48} h={10} />
          </div>
        ))}
      </div>

      <FooterBar />
    </SkeletonPage>
  );
}
