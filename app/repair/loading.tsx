import LoadingView from '../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'repair' }]} label="loading repair queue…" shape="rows" width="w-mid" />;
}
