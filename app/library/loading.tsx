import LoadingView from '../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'library' }]} label="fetching records…" shape="rows" />;
}
