import { Bar, FooterBar, Lines, LiveryHeader, ProgressRow, SkeletonPage, type Vars } from '../../../components/Skeleton';

// One module's deck. The card waits on top of the pile, and the top card keeps
// lifting at one corner, as if it were about to be dealt.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-2xl" label="Loading flashcards…">
      <LiveryHeader back={170} label={76} title="62%" lines={['96%', '58%']} />
      <ProgressRow />

      <div className="relative">
        <div className="sk-card sk-stack sk-z absolute inset-0" style={{ '--z': 8 } as Vars} />
        <div
          className="sk-card sk-peel sk-z relative flex min-h-[16rem] flex-col items-center justify-center gap-4 p-8"
          style={{ '--z': 24 } as Vars}
        >
          <div className="flex items-center gap-2">
            <Bar w={52} h={14} className="sk-accent rounded" />
            <Bar w={120} h={9} />
          </div>
          <Lines widths={['72%', '48%']} h={16} gap={10} className="w-full justify-items-center" />
          <Bar w={150} h={9} />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Bar w={130} h={40} z={12} className="rounded-lg" />
      </div>
      <div className="mt-4 flex justify-center">
        <Bar w={180} h={9} />
      </div>
      <FooterBar />
    </SkeletonPage>
  );
}
