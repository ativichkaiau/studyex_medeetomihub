import LoadingView from '../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'overview' }]} label="restoring session…" shape="overview" />;
}
