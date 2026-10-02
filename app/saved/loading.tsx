import LoadingView from '../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'saved' }]} label="restoring saved records…" shape="rows" width="w-mid" />;
}
