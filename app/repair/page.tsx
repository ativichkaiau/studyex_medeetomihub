import RepairQueuePanel from '../../components/repair/RepairQueuePanel';
import RepairSyncDemo from '../../components/repair/RepairSyncDemo';
import PodConnectPanel from '../../components/repair/PodConnectPanel';
import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';

export const metadata = { title: 'repair' };

export default function RepairPage() {
  const dev = process.env.NODE_ENV !== 'production';
  return (
    <Page crumbs={[{ label: 'repair' }]} width="w-mid" aside={<span>learning = debugging</span>}>
      <PageHeader
        kicker={
          <>
            <strong>repair</strong>
            <span>debug weak knowledge</span>
          </>
        }
        title="Repair queue"
        lede="Weak knowledge, treated like failing tests. Misses from practice runs and WilliamsPod sessions land here, prioritised by error type; each one names its diagnostic and the fix to run."
      />

      <PodConnectPanel />

      <RepairQueuePanel />

      {dev ? (
        <div className="mt-6 flex items-center gap-3">
          <RepairSyncDemo />
          <span className="font-mono text-[11px] text-fg-3">dev only — seeds sample data</span>
        </div>
      ) : null}
    </Page>
  );
}
