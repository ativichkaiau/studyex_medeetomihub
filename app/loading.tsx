import { Bar, Lines, Panel, SkeletonPage, Slashes, type Vars } from '../components/Skeleton';

// Home. The hero lies on the sheet with its livery flash floating high above
// it, and the block grid breathes in a slow wave — the library filing in.
export default function Loading() {
  return (
    <SkeletonPage width="max-w-6xl" className="pb-24 pt-8 sm:pt-10" label="Loading the library…">
      <section className="relative border-b border-[var(--line)]">
        {/* The flash sits behind the featured panel, as on the page, but well
            off the sheet — the panel floats higher still. */}
        <div className="sk-z absolute right-[22px] top-0 sm:right-[42px]" style={{ '--z': 26 } as Vars}>
          <div className="flex h-[50px] -skew-x-[24deg] gap-[5px] sm:h-[93px] sm:gap-[7px]">
            <span className="w-[23px] bg-[var(--stripe-ink)] opacity-50 sm:w-8" />
            <span className="w-[7px] bg-[var(--wm-red)] opacity-50 sm:w-2.5" />
            <span className="w-[7px] bg-[var(--wm-yellow)] opacity-50 sm:w-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Slashes />
          <Bar w={150} h={9} />
        </div>

        <div className="grid gap-9 pb-10 pt-10 lg:grid-cols-[1.45fr_1fr] lg:gap-16 lg:pb-12 lg:pt-12">
          <div>
            <Bar w="80%" h={44} z={10} className="sk-ink" />
            <Bar w="66%" h={44} z={10} className="sk-accent mt-3" />
            <Lines widths={['94%', '72%']} h={11} gap={11} className="mt-6 max-w-md" />
            <div className="mt-7 flex items-center gap-6">
              <Bar w={168} h={44} z={18} className="sk-ink rounded-md" />
              <Bar w={96} h={12} className="sk-accent" />
            </div>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
              {[0, 1, 2].map((n) => (
                <div key={n} className="flex items-baseline gap-2">
                  <Bar w={44} h={20} z={12} i={n} className="sk-ink" />
                  <Bar w={56} h={9} i={n} />
                </div>
              ))}
            </div>
          </div>

          <Panel z={40} className="self-start rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <Bar w={110} h={9} />
              <Bar w={72} h={9} />
            </div>
            <Bar w="74%" h={20} className="sk-ink mt-4" />
            <Bar w="56%" h={10} className="mt-2.5" />
            <div className="my-5 space-y-3">
              {[0, 1, 2].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <Bar w={24} h={24} z={8 + n * 7} className="shrink-0 rounded-full" />
                  <Bar w={`${80 - n * 13}%`} h={10} i={n} />
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-[var(--line)] pt-4">
              <Bar w={100} h={11} className="sk-accent" />
              <Bar w={16} h={11} className="sk-accent" />
            </div>
          </Panel>
        </div>
      </section>

      <section className="pt-9 sm:pt-10">
        <div className="mb-4 flex items-center gap-4">
          <Bar w={130} h={9} />
          <Slashes />
          <span className="h-px flex-1 bg-[var(--line)]" />
        </div>
        <Bar w={230} h={24} z={8} className="sk-ink" />
        <Bar w={420} h={11} className="mb-6 mt-3 max-w-full" />
        <div className="sk-well mb-4 inline-flex gap-1 rounded-lg p-1">
          <Bar w={128} h={38} z={10} className="rounded-[5px] bg-[var(--clay-surface)]" />
          <Bar w={118} h={38} className="rounded-[5px] opacity-60" />
        </div>
        <div className="mb-5 flex gap-6 border-b border-[var(--line)] pb-3.5">
          {[48, 48, 48, 72].map((w, n) => (
            <Bar key={n} w={w} h={11} i={n} className={n === 0 ? 'sk-ink' : ''} />
          ))}
        </div>
        <div className="sk-wave grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, n) => (
            <div
              key={n}
              className="sk-card sk-z flex min-h-[140px] flex-col rounded-lg p-5 sm:min-h-[152px]"
              style={{ '--z': 14, '--i': n } as Vars}
            >
              <div className="flex items-center justify-between">
                <Bar w={34} h={10} className="sk-accent" />
                <Bar w={23} h={9} />
              </div>
              <Bar w={`${72 - (n % 3) * 12}%`} h={14} className="sk-ink mt-4" />
              <div className="mt-auto flex items-center justify-between pt-6">
                <Bar w={120} h={9} />
                <Bar w={14} h={9} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </SkeletonPage>
  );
}
