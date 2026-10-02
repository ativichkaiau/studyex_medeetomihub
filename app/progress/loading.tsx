import LoadingView from '../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'progress' }]} label="reading telemetry…" shape="log" />;
}
