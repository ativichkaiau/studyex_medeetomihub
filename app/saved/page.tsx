import SavedTree from '../../components/SavedTree';
import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';
import { pageMeta } from '../../lib/meta';

export const metadata = pageMeta({
  title: 'saved',
  description: 'Pinned modules and per-module notes, grouped by block and stored on this device.',
  path: '/saved',
});

export default function SavedPage() {
  return (
    <Page crumbs={[{ label: 'saved' }]} width="w-mid" aside={<span>source: this device</span>}>
      <PageHeader
        kicker={
          <>
            <strong>saved</strong>
            <span>pinned records</span>
          </>
        }
        title="Saved"
        lede="Pinned modules and your per-module notes, grouped by block. Stored on this device only."
      />
      <SavedTree />
    </Page>
  );
}
