import SavedTree from '../../components/SavedTree';
import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';

export const metadata = { title: 'saved' };

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
